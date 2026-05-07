import ActivityKit
import Foundation

/// The Expo ↔ Live Activity contract. Expo writes a `ContentState` snapshot
/// every state transition (normal → t30 → t10 → t1 → t0), Swift renders it.
public struct NuurAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var prayerEn: String        // "Asr"
        public var prayerAr: String        // "العصر"
        public var nextAt: String          // "16:34"
        public var countdownH: String      // "3"
        public var countdownM: String      // "22"
        public var countdownLabel: String  // "TO ASR"
        public var skin: String            // "day" | "night"
        public var state: String           // "normal" | "t30" | "t10" | "t1" | "t0"

        public init(prayerEn: String, prayerAr: String, nextAt: String,
                    countdownH: String, countdownM: String, countdownLabel: String,
                    skin: String, state: String) {
            self.prayerEn = prayerEn
            self.prayerAr = prayerAr
            self.nextAt = nextAt
            self.countdownH = countdownH
            self.countdownM = countdownM
            self.countdownLabel = countdownLabel
            self.skin = skin
            self.state = state
        }

        public var skinEnum: Skin { Skin(rawValue: skin) ?? .day }
        public var stateEnum: NuurState { NuurState(rawValue: state) ?? .normal }
    }

    public var location: String   // "London, UK"
    public var hijri: String      // "18 Dhū al-Qaʿdah 1446"

    public init(location: String, hijri: String) {
        self.location = location
        self.hijri = hijri
    }
}

/// Sample payload for SwiftUI previews + first-run smoke test.
public extension NuurAttributes {
    static var sampleDay: NuurAttributes {
        .init(location: "London, UK", hijri: "18 Dhū al-Qaʿdah 1446")
    }
    static var sampleDayState: ContentState {
        .init(prayerEn: "Asr", prayerAr: "العصر", nextAt: "16:34",
              countdownH: "3", countdownM: "22", countdownLabel: "TO ASR",
              skin: "day", state: "normal")
    }
    static var sampleNightState: ContentState {
        .init(prayerEn: "Fajr", prayerAr: "الفجر", nextAt: "03:15",
              countdownH: "5", countdownM: "15", countdownLabel: "TO FAJR",
              skin: "night", state: "normal")
    }
}
