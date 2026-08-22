import Foundation
import React
import WidgetKit

/// Bridges JS → native for:
///   1. Writing today's prayer-time snapshot into the App Group so the widget
///      extension can read it; asking WidgetKit to refresh timelines.
///   2. Fetching WeatherKit data for the Large widget's contextual triggers.
///   3. Reading + mutating the shared Adhkar state used by both the app
///      counter and the home-screen widget — so a tap in either surface
///      reflects in the other immediately via a Darwin notification.
///
/// Requires App Group `group.com.nuur.shared` to be enabled on BOTH the main
/// app target and the NuurWidgetExtension target in Signing & Capabilities.
@objc(NuurBridge)
class NuurBridge: RCTEventEmitter {
    static let appGroupId = "group.com.nuur.shared"
    static let prayerKey  = "nuur.prayerSnapshot"

    // MARK: - RCTEventEmitter plumbing

    private var hasListeners = false

    override func supportedEvents() -> [String]! {
        return ["NuurAdhkarDidUpdate"]
    }

    override func startObserving() {
        hasListeners = true
        // Listen for the Darwin notification posted by the widget extension
        // (or by markAdhkarRecited below) and forward it to JS as an RN event.
        let observer = Unmanaged.passUnretained(self).toOpaque()
        CFNotificationCenterAddObserver(
            CFNotificationCenterGetDarwinNotifyCenter(),
            observer,
            { (_, observerPtr, _, _, _) in
                guard let observerPtr = observerPtr else { return }
                let me = Unmanaged<NuurBridge>.fromOpaque(observerPtr).takeUnretainedValue()
                me.emitAdhkarDidUpdate()
            },
            AdhkarStore.darwinNotification as CFString,
            nil,
            .deliverImmediately
        )
    }

    override func stopObserving() {
        hasListeners = false
        let observer = Unmanaged.passUnretained(self).toOpaque()
        CFNotificationCenterRemoveEveryObserver(
            CFNotificationCenterGetDarwinNotifyCenter(),
            observer
        )
    }

    private func emitAdhkarDidUpdate() {
        guard hasListeners else { return }
        // Send the fresh state along with the event so JS doesn't have to
        // make a second round-trip to read it.
        sendEvent(withName: "NuurAdhkarDidUpdate", body: Self.encodeState(AdhkarStore.read()))
    }

    override class func requiresMainQueueSetup() -> Bool { return false }

    // MARK: - Prayer snapshot (existing)

    @objc(writeWidgetData:resolver:rejecter:)
    func writeWidgetData(_ json: String,
                         resolver: @escaping RCTPromiseResolveBlock,
                         rejecter: @escaping RCTPromiseRejectBlock) {
        guard let defaults = UserDefaults(suiteName: Self.appGroupId) else {
            rejecter("no_app_group",
                     "Could not access App Group \(Self.appGroupId). " +
                     "Enable the capability on the main app target.",
                     nil)
            return
        }
        defaults.set(json, forKey: Self.prayerKey)
        resolver(nil)
    }

    @objc(reloadWidget:rejecter:)
    func reloadWidget(_ resolver: @escaping RCTPromiseResolveBlock,
                      rejecter: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
            resolver(nil)
        } else {
            rejecter("unavailable", "WidgetCenter requires iOS 14+", nil)
        }
    }

    // MARK: - Weather (existing)

    @objc(refreshWeather:longitude:resolver:rejecter:)
    func refreshWeather(_ latitude: NSNumber, longitude: NSNumber,
                        resolver: @escaping RCTPromiseResolveBlock,
                        rejecter: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.0, *) {
            Task {
                await WeatherFetcher.refresh(
                    latitude: latitude.doubleValue,
                    longitude: longitude.doubleValue,
                    appGroupId: Self.appGroupId
                )
                if #available(iOS 14.0, *) {
                    WidgetCenter.shared.reloadAllTimelines()
                }
                resolver(nil)
            }
        } else {
            resolver(nil)
        }
    }

    // MARK: - Adhkar state (new — Phase 4)

    /// Returns the current AdhkarState as a JS-friendly dictionary.
    @objc(readAdhkarState:rejecter:)
    func readAdhkarState(_ resolver: @escaping RCTPromiseResolveBlock,
                         rejecter: @escaping RCTPromiseRejectBlock) {
        resolver(Self.encodeState(AdhkarStore.read()))
    }

    /// Mark a dhikr as fully recited. Idempotent. Updates completion flags,
    /// clears any matching in-progress entry, reloads widgets, and posts the
    /// Darwin notification so other observers (including this bridge's own
    /// event emitter) refresh. Resolves with the updated state.
    @objc(markAdhkarRecited:resolver:rejecter:)
    func markAdhkarRecited(_ id: String,
                           resolver: @escaping RCTPromiseResolveBlock,
                           rejecter: @escaping RCTPromiseRejectBlock) {
        let state = AdhkarStore.markRecited(id: id)
        resolver(Self.encodeState(state))
    }

    private static func encodeState(_ state: AdhkarState) -> [String: Any] {
        return [
            "dateISO": state.dateISO,
            "recitedIds": state.recitedIds,
            "inProgressId": state.inProgressId as Any,
            "inProgressCount": state.inProgressCount,
            "morningCompleted": state.morningCompleted,
            "eveningCompleted": state.eveningCompleted,
        ]
    }
}
