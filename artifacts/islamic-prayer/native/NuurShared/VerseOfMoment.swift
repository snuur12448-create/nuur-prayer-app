import Foundation
#if canImport(WeatherKit)
import WeatherKit
#endif
#if canImport(CoreLocation)
import CoreLocation
#endif

/// Verse of the Moment — rotates with the user's current prayer window AND
/// swaps to a thematically-matched verse when a contextual trigger fires
/// (rain, thunderstorm, Friday, late night; more triggers added later).
///
/// Mirror of the canonical content in `assets/data/verses-of-the-moment.json`.
/// Hardcoded here (rather than bundled as a resource) so the widget extension
/// has zero I/O dependency at render time; the JSON is the source of truth
/// for the JS side and for Sadaq's content-editing workflow.

// MARK: - Model

public struct MomentVerse {
    public let id: String
    public let windows: [String]      // empty = window-agnostic
    public let triggers: [String]     // empty = base verse (no contextual trigger)
    public let weekIndex: Int         // 1–7
    public let priority: Int          // higher wins
    public let reference: String      // "Al-Isra · 17:78"
    public let referenceShort: String // "17:78"
    public let arabic: String
}

// MARK: - Trigger registry

public enum VerseTrigger {
    public static let rain         = "rain"
    public static let thunderstorm = "thunderstorm"
    public static let snow         = "snow"
    public static let friday       = "friday"
    public static let lateNight    = "late_night"
    public static let ramadan      = "ramadan"
    public static let ramadanLast10 = "ramadan_last_10"
    public static let eidFitr      = "eid_fitr"
    public static let eidAdha      = "eid_adha"
    public static let traveling    = "traveling"
    public static let newMoon      = "new_moon"

    /// Display label rendered in the widget header ("VERSE FOR {label}").
    public static func label(for trigger: String) -> String {
        switch trigger {
        case rain:          return "RAIN"
        case thunderstorm:  return "STORM"
        case snow:          return "SNOW"
        case friday:        return "JUMU'AH"
        case lateNight:     return "NIGHT"
        case ramadan:       return "RAMADAN"
        case ramadanLast10: return "LAST 10 NIGHTS"
        case eidFitr:       return "EID"
        case eidAdha:       return "EID"
        case traveling:     return "TRAVEL"
        case newMoon:       return "NEW MOON"
        default:            return trigger.uppercased()
        }
    }
}

// MARK: - Trigger detection

public enum TriggerDetector {
    /// Active triggers at `date`. Reads cached weather from the App Group
    /// shared defaults — the widget never fetches WeatherKit itself (rate
    /// limit). Stubbed triggers (snow / ramadan / traveling / etc.) return
    /// false until their detectors are wired up in a later prompt.
    public static func activeTriggers(at date: Date, appGroupId: String,
                                      timeZone: TimeZone = .current) -> Set<String> {
        var active = Set<String>()

        // friday: weekday == 6 in iOS (Sunday = 1).
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        if cal.component(.weekday, from: date) == 6 {
            active.insert(VerseTrigger.friday)
        }

        // late_night: 00:00–04:00 local time.
        let hour = cal.component(.hour, from: date)
        if hour < 4 {
            active.insert(VerseTrigger.lateNight)
        }

        // Weather: read cached condition from shared defaults.
        if let weather = WeatherCache.current(appGroupId: appGroupId, at: date) {
            switch weather.lowercased() {
            case "rain", "drizzle", "heavyrain", "freezingrain", "freezingdrizzle":
                active.insert(VerseTrigger.rain)
            case "thunderstorms", "strongstorms", "hurricane", "tropicalstorm":
                active.insert(VerseTrigger.thunderstorm)
            case "snow", "heavysnow", "flurries", "blizzard", "blowingsnow", "sleet", "wintrymix":
                active.insert(VerseTrigger.snow)
            default:
                break
            }
        }

        return active
    }
}

// MARK: - Weather cache (shared between main app + widget)

public enum WeatherCache {
    public static let conditionKey = "currentWeatherCondition"
    public static let fetchedAtKey = "weatherFetchedAt"
    /// Stale-after window. If the cached weather is older than this, the
    /// widget treats it as missing (no rain/storm trigger fires).
    public static let maxAge: TimeInterval = 2 * 60 * 60 // 2 hours

    public static func current(appGroupId: String, at now: Date) -> String? {
        guard let d = UserDefaults(suiteName: appGroupId),
              let cond = d.string(forKey: conditionKey),
              let ts = d.object(forKey: fetchedAtKey) as? Date,
              now.timeIntervalSince(ts) < maxAge
        else { return nil }
        return cond
    }

    public static func write(condition: String, appGroupId: String, expectedEpoch: String? = nil) {
        try? SharedDataGate.withGroupLock { gate in
            guard !gate.active, expectedEpoch == nil || gate.epoch == expectedEpoch,
                  let d = UserDefaults(suiteName: appGroupId) else { return }
            d.set(condition, forKey: conditionKey)
            d.set(Date(), forKey: fetchedAtKey)
            d.synchronize()
        }
    }
}

// MARK: - WeatherKit fetcher (main app only; widget reads cache)

#if canImport(WeatherKit) && canImport(CoreLocation)
@available(iOS 16.0, *)
public enum WeatherFetcher {
    /// Fetches current weather via WeatherKit, writes the condition string
    /// into the App Group's shared defaults. Fails silently (no exceptions
    /// surfaced to JS) — if the entitlement isn't enabled yet, the cache
    /// stays empty and the widget skips weather triggers.
    public static func refresh(latitude: Double, longitude: Double,
                               appGroupId: String) async {
        guard let epoch = try? SharedDataGate.withGroupLock({ gate in
            guard !gate.active else { throw CocoaError(.userCancelled) }
            return gate.epoch
        }) else { return }
        do {
            let location = CLLocation(latitude: latitude, longitude: longitude)
            let weather = try await WeatherService.shared.weather(for: location)
            let cond = String(describing: weather.currentWeather.condition)
            WeatherCache.write(condition: cond, appGroupId: appGroupId, expectedEpoch: epoch)
        } catch {
            // No entitlement, no network, or rate-limited — leave the cache
            // alone; existing cached value (if any) stays valid until it
            // ages out of the maxAge window.
        }
    }
}
#endif

// MARK: - Verse library (mirror of verses-of-the-moment.json)

public enum VerseLibrary {
    public static let all: [MomentVerse] = [
        // Base verses — one per prayer window, weekIndex 1
        MomentVerse(
            id: "base-fajr-w1", windows: ["fajr"], triggers: [],
            weekIndex: 1, priority: 0,
            reference: "Al-Isra · 17:78", referenceShort: "17:78",
            arabic: "أَقِمِ ٱلصَّلَوٰةَ لِدُلُوكِ ٱلشَّمْسِ إِلَىٰ غَسَقِ ٱلَّيْلِ وَقُرْءَانَ ٱلْفَجْرِ ۖ إِنَّ قُرْءَانَ ٱلْفَجْرِ كَانَ مَشْهُودًا"
        ),
        MomentVerse(
            id: "base-dhuhr-w1", windows: ["dhuhr"], triggers: [],
            weekIndex: 1, priority: 0,
            reference: "Ibrahim · 14:7", referenceShort: "14:7",
            arabic: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِى لَشَدِيدٌ"
        ),
        MomentVerse(
            id: "base-asr-w1", windows: ["asr"], triggers: [],
            weekIndex: 1, priority: 0,
            reference: "Al-Asr · 103:1–3", referenceShort: "103:1–3",
            arabic: "وَٱلْعَصْرِ ۝ إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ ۝ إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ"
        ),
        MomentVerse(
            id: "base-maghrib-w1", windows: ["maghrib"], triggers: [],
            weekIndex: 1, priority: 0,
            reference: "Az-Zumar · 39:53", referenceShort: "39:53",
            arabic: "قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ"
        ),
        MomentVerse(
            id: "base-isha-w1", windows: ["isha"], triggers: [],
            weekIndex: 1, priority: 0,
            reference: "Al-Furqan · 25:47", referenceShort: "25:47",
            arabic: "وَهُوَ ٱلَّذِى جَعَلَ لَكُمُ ٱلَّيْلَ لِبَاسًا وَٱلنَّوْمَ سُبَاتًا وَجَعَلَ ٱلنَّهَارَ نُشُورًا"
        ),
        // Contextual verses
        MomentVerse(
            id: "rain-w1", windows: [], triggers: ["rain", "thunderstorm"],
            weekIndex: 1, priority: 10,
            reference: "Ar-Rum · 30:24", referenceShort: "30:24",
            arabic: "وَمِنْ ءَايَـٰتِهِۦ يُرِيكُمُ ٱلْبَرْقَ خَوْفًا وَطَمَعًا وَيُنَزِّلُ مِنَ ٱلسَّمَآءِ مَآءً فَيُحْىِۦ بِهِ ٱلْأَرْضَ بَعْدَ مَوْتِهَآ ۚ إِنَّ فِى ذَٰلِكَ لَـَٔايَـٰتٍ لِّقَوْمٍ يَعْقِلُونَ"
        ),
        MomentVerse(
            id: "friday-w1", windows: [], triggers: ["friday"],
            weekIndex: 1, priority: 20,
            reference: "Al-Jumu'ah · 62:9", referenceShort: "62:9",
            arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا نُودِىَ لِلصَّلَوٰةِ مِن يَوْمِ ٱلْجُمُعَةِ فَٱسْعَوْا۟ إِلَىٰ ذِكْرِ ٱللَّهِ وَذَرُوا۟ ٱلْبَيْعَ ۚ ذَٰلِكُمْ خَيْرٌ لَّكُمْ إِن كُنتُمْ تَعْلَمُونَ"
        ),
        MomentVerse(
            id: "late-night-w1", windows: [], triggers: ["late_night"],
            weekIndex: 1, priority: 15,
            reference: "Adh-Dhariyat · 51:17", referenceShort: "51:17",
            arabic: "كَانُوا۟ قَلِيلًا مِّنَ ٱلَّيْلِ مَا يَهْجَعُونَ"
        ),
    ]
}

// MARK: - Window helpers

public enum VerseWindow: String, CaseIterable {
    case fajr, dhuhr, asr, maghrib, isha
}

public enum VerseOfMoment {
    /// Determine which window `date` falls into based on today's prayer times.
    /// Current prayer window — defined as "which prayer should I be reflecting
    /// on right now". Fajr is only the active window until Sunrise; the
    /// post-sunrise morning rolls into the Dhuhr verse (closest approximation
    /// to Duha) since we don't ship a dedicated Duha verse yet.
    public static func window(at date: Date,
                              fajr: Date, sunrise: Date, dhuhr: Date,
                              asr: Date, maghrib: Date, isha: Date) -> VerseWindow {
        if date < fajr     { return .isha }
        if date < sunrise  { return .fajr }
        if date < dhuhr    { return .dhuhr }   // post-sunrise → dhuhr
        if date < asr      { return .dhuhr }
        if date < maghrib  { return .asr }
        if date < isha     { return .maghrib }
        return .isha
    }
}

// MARK: - Resolver

public struct ResolvedVerse {
    public let verse: MomentVerse
    /// Label rendered in widget header — either a trigger label ("RAIN",
    /// "JUMU'AH") or the window name ("FAJR", "DHUHR" …).
    public let label: String
}

public enum VerseResolver {
    /// Resolve the verse to show at `date`, given today's prayer times and
    /// the active triggers. Deterministic: same inputs → same output. Ties
    /// at equal priority are broken by a stable hash of (dayOfYear, verse.id).
    public static func resolve(at date: Date,
                               fajr: Date, sunrise: Date, dhuhr: Date,
                               asr: Date, maghrib: Date, isha: Date,
                               appGroupId: String,
                               timeZone: TimeZone = .current,
                               library: [MomentVerse] = VerseLibrary.all) -> ResolvedVerse {
        let window = VerseOfMoment.window(at: date,
                                          fajr: fajr, sunrise: sunrise, dhuhr: dhuhr,
                                          asr: asr, maghrib: maghrib, isha: isha)
        let active = TriggerDetector.activeTriggers(
            at: date, appGroupId: appGroupId, timeZone: timeZone
        )

        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        let dayOfYear = cal.ordinality(of: .day, in: .year, for: date) ?? 1
        let weekIndex = ((dayOfYear - 1) % 7) + 1

        // Candidate set:
        //  • verses whose triggers ∩ active is non-empty (contextual matches)
        //  • PLUS base verses (empty triggers) whose windows contain `window`
        let candidates = library.filter { v in
            if !v.triggers.isEmpty {
                return !Set(v.triggers).isDisjoint(with: active)
            }
            return v.windows.contains(window.rawValue)
        }

        // Pick highest priority. Tie-break by weekIndex match, then by stable
        // hash over (dayOfYear, verse.id) so equal-priority ties don't flicker.
        let winner = candidates.max { a, b in
            if a.priority != b.priority { return a.priority < b.priority }
            let aMatch = a.weekIndex == weekIndex ? 1 : 0
            let bMatch = b.weekIndex == weekIndex ? 1 : 0
            if aMatch != bMatch { return aMatch < bMatch }
            let aHash = ("\(dayOfYear)-\(a.id)").hashValue
            let bHash = ("\(dayOfYear)-\(b.id)").hashValue
            return aHash < bHash
        }

        // Fallback: should never happen if base verses exist for every window,
        // but guard anyway — return the first base verse matching the window
        // or the first verse in the library.
        let resolved = winner
            ?? library.first { $0.triggers.isEmpty && $0.windows.contains(window.rawValue) }
            ?? library.first!

        // Header label: highest-priority active trigger that this verse
        // actually matches; fall back to the window name.
        let triggerLabel: String? = resolved.triggers
            .filter { active.contains($0) }
            .sorted()
            .first
            .map { VerseTrigger.label(for: $0) }
        let label = triggerLabel ?? window.rawValue.uppercased()

        return ResolvedVerse(verse: resolved, label: label)
    }
}
