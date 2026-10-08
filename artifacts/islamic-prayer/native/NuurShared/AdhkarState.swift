import Foundation
import WidgetKit
import Darwin

/// App and widget are separate processes. A UserDefaults check alone cannot
/// prevent a widget intent that already passed the check from writing after
/// a reset. Every shared-data writer and maintenance transition uses this lock.
public enum SharedDataGate {
    public struct State {
        let directory: URL
        private var marker: URL { directory.appendingPathComponent("nuur-maintenance-active") }
        private var epochFile: URL { directory.appendingPathComponent("nuur-maintenance-epoch") }
        public var active: Bool { FileManager.default.fileExists(atPath: marker.path) }
        public var epoch: String { (try? String(contentsOf: epochFile, encoding: .utf8)) ?? "" }
        public func begin() throws {
            try Data(UUID().uuidString.utf8).write(to: epochFile, options: .atomic)
            try Data("1".utf8).write(to: marker, options: .atomic)
        }
        public func end() throws {
            if active { try FileManager.default.removeItem(at: marker) }
        }
    }

    public static func withLock<T>(directory: URL, _ operation: (State) throws -> T) throws -> T {
        let path = directory.appendingPathComponent("nuur-data.lock").path
        let descriptor = Darwin.open(path, O_CREAT | O_RDWR, S_IRUSR | S_IWUSR)
        guard descriptor >= 0 else { throw CocoaError(.fileWriteUnknown) }
        defer { Darwin.close(descriptor) }
        var locked: Int32
        repeat { locked = flock(descriptor, LOCK_EX) } while locked != 0 && errno == EINTR
        guard locked == 0 else { throw CocoaError(.fileWriteUnknown) }
        defer { flock(descriptor, LOCK_UN) }
        return try operation(State(directory: directory))
    }

    public static func withGroupLock<T>(_ operation: (State) throws -> T) throws -> T {
        guard let directory = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.nuur.shared") else {
            throw CocoaError(.fileNoSuchFile)
        }
        return try withLock(directory: directory, operation)
    }
}

/// Persistence contract shared by the main app bridge and widget extension.
/// IDs mirror `utils/adhkarSequence.ts` and the widget's Adhkar library.
struct AdhkarState: Codable {
    var dateISO: String
    var recitedIds: [String]
    var inProgressId: String?
    var inProgressCount: Int
    var morningCompleted: Bool
    var eveningCompleted: Bool
    var maintenanceEpoch: String? = nil

    static let empty = AdhkarState(
        dateISO: "", recitedIds: [], inProgressId: nil, inProgressCount: 0,
        morningCompleted: false, eveningCompleted: false
    )
}

enum AdhkarStore {
    static let suiteName = "group.com.nuur.shared"
    static let key = "nuur.adhkarState"
    static let darwinNotification = "com.nuur.adhkar.didUpdate"

    static func read() -> AdhkarState {
        return (try? SharedDataGate.withGroupLock { gate in
            guard !gate.active else { return AdhkarState.empty }
            let defaults = UserDefaults(suiteName: suiteName)
            defaults?.synchronize()
            var state = defaults?.string(forKey: key)?.data(using: .utf8)
                .flatMap { try? JSONDecoder().decode(AdhkarState.self, from: $0) } ?? .empty
            state.maintenanceEpoch = gate.epoch
            return state
        }) ?? .empty
    }

    static func write(_ state: AdhkarState) {
        try? SharedDataGate.withGroupLock { gate in
            guard !gate.active, (state.maintenanceEpoch ?? "") == gate.epoch,
                  let defaults = UserDefaults(suiteName: suiteName),
                  let data = try? JSONEncoder().encode(state),
                  let json = String(data: data, encoding: .utf8)
            else { return }
            defaults.set(json, forKey: key)
            defaults.synchronize()
        }
    }

    static func postDidUpdate() {
        let name = CFNotificationName(darwinNotification as CFString)
        CFNotificationCenterPostNotification(
            CFNotificationCenterGetDarwinNotifyCenter(),
            name, nil, nil, true
        )
    }

    @discardableResult
    static func markRecited(id: String) -> AdhkarState {
        var state = freshenForToday(read())
        if !state.recitedIds.contains(id) {
            state.recitedIds.append(id)
        }
        if state.inProgressId == id {
            state.inProgressId = nil
            state.inProgressCount = 0
        }
        recomputeCompletion(&state)
        write(state)
        WidgetCenter.shared.reloadAllTimelines()
        postDidUpdate()
        return state
    }
}

private let morningAdhkarIds: Set<String> = [
    "ayat-al-kursi-morning", "surah-ikhlas-morning", "surah-falaq-morning",
    "surah-nas-morning", "asbahna", "sayyid-al-istighfar-morning",
    "radeetu-billah-morning", "hasbi-allah-morning", "al-afiyah-morning",
    "subhanallah-bihamdihi-morning", "la-ilaha-illa-allah-wahdahu",
    "astaghfirullah-morning",
]

private let eveningAdhkarIds: Set<String> = [
    "ayat-al-kursi-evening", "surah-ikhlas-evening", "surah-falaq-evening",
    "surah-nas-evening", "amsayna", "sayyid-al-istighfar-evening",
    "radeetu-billah-evening", "hasbi-allah-evening", "al-afiyah-evening",
    "subhanallah-bihamdihi-evening", "audhu-bi-kalimat-allah",
    "astaghfirullah-evening",
]

func todayISO() -> String {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: Date())
}

func freshenForToday(_ state: AdhkarState) -> AdhkarState {
    let today = todayISO()
    if state.dateISO == today { return state }
    return AdhkarState(
        dateISO: today, recitedIds: [], inProgressId: nil, inProgressCount: 0,
        morningCompleted: false, eveningCompleted: false, maintenanceEpoch: state.maintenanceEpoch
    )
}

func recomputeCompletion(_ state: inout AdhkarState) {
    let recited = Set(state.recitedIds)
    state.morningCompleted = morningAdhkarIds.isSubset(of: recited)
    state.eveningCompleted = eveningAdhkarIds.isSubset(of: recited)
}
