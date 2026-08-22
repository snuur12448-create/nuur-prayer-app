import SwiftUI
import WidgetKit

// MARK: - Shared snapshot decoding
private struct SharedPrayerDay: Decodable {
    let dateKey: String
    let fajr: String
    let sunrise: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
    let hijri: String
    let verseAr: String
    let verseRef: String
}

private struct SharedSnapshot: Decodable {
    let fajr: String
    let sunrise: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
    let location: String
    let hijri: String
    // Tomorrow's Fajr (optional — older snapshots without it fall back to
    // today's Fajr + 24h, which drifts only 1–2 minutes).
    let fajrTomorrow: String?
    // Large widget extras (optional so older snapshots still decode).
    let streakDays: Int?
    let weekPct: Int?
    let verseAr: String?
    let verseRef: String?
    // App-level time format preference ("12h" / "24h"). Used as a fallback when
    // the per-widget `use24Hour` toggle is off so the widget still mirrors
    // whatever the user picked in Settings.
    let timeFormat: String?
    // App-level theme name ("emerald" / "midnight" / "gold" / "slate" /
    // "burgundy"). Drives the small Square widget's chrome accent.
    let themeName: String?
    // Rolling prayer cache. Optional so snapshots written by older app builds
    // remain decodable during an upgrade.
    let prayerDays: [SharedPrayerDay]?
}

private struct PrayerSlot {
    let prayer: Prayer
    let date: Date
}

private enum SnapshotReader {
    static let suiteName = "group.com.nuur.shared"
    static let key = "nuur.prayerSnapshot"

    static func read() -> SharedSnapshot? {
        guard let defaults = UserDefaults(suiteName: suiteName),
              let json = defaults.string(forKey: key),
              let data = json.data(using: .utf8) else { return nil }
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return try? JSONDecoder().decode(SharedSnapshot.self, from: data)
    }
}

private func parseISO(_ s: String) -> Date? {
    let iso = ISO8601DateFormatter()
    iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let d = iso.date(from: s) { return d }
    iso.formatOptions = [.withInternetDateTime]
    return iso.date(from: s)
}

private func slots(from snap: SharedSnapshot) -> [PrayerSlot] {
    if let days = snap.prayerDays, !days.isEmpty {
        let result = days.flatMap { day -> [PrayerSlot] in
            let pairs: [(Prayer, String)] = [
                (.fajr, day.fajr), (.sunrise, day.sunrise), (.dhuhr, day.dhuhr),
                (.asr, day.asr), (.maghrib, day.maghrib), (.isha, day.isha)
            ]
            return pairs.compactMap { (p, s) in
                parseISO(s).map { PrayerSlot(prayer: p, date: $0) }
            }
        }
        return result.sorted { $0.date < $1.date }
    }

    let pairs: [(Prayer, String)] = [
        (.fajr, snap.fajr), (.sunrise, snap.sunrise), (.dhuhr, snap.dhuhr),
        (.asr, snap.asr), (.maghrib, snap.maghrib), (.isha, snap.isha)
    ]
    var result = pairs.compactMap { (p, s) in parseISO(s).map { PrayerSlot(prayer: p, date: $0) } }
    // Append tomorrow's Fajr so the timeline keeps counting down through the
    // night after Isha passes (instead of getting stuck on "Time for Isha
    // 0h 0m"). Prefer the real value sent by the JS app; fall back to today's
    // Fajr + 24h (drift is 1–2 minutes — fine for an overnight placeholder).
    if let raw = snap.fajrTomorrow, let d = parseISO(raw) {
        result.append(PrayerSlot(prayer: .fajr, date: d))
    } else if let fajrToday = result.first(where: { $0.prayer == .fajr })?.date,
              let fajrTomorrow = Calendar.current.date(byAdding: .day, value: 1, to: fajrToday) {
        result.append(PrayerSlot(prayer: .fajr, date: fajrTomorrow))
    }
    return result
}

private func metadata(from snap: SharedSnapshot, at date: Date)
    -> (hijri: String, verseAr: String, verseRef: String) {
    if let day = snap.prayerDays?.first(where: {
        guard let fajr = parseISO($0.fajr) else { return false }
        return Calendar.current.isDate(fajr, inSameDayAs: date)
    }) {
        return (day.hijri, day.verseAr, day.verseRef)
    }
    return (
        snap.hijri,
        snap.verseAr ?? "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا",
        snap.verseRef ?? "94:5"
    )
}

private func stateFor(minutesUntil m: Int) -> NuurState {
    if m <= 0 { return .t0 }
    if m <= 1 { return .t1 }
    if m <= 10 { return .t10 }
    if m <= 30 { return .t30 }
    return .normal
}

private func formatHM(_ date: Date, is24h: Bool) -> String {
    let f = DateFormatter()
    if is24h {
        f.dateFormat = "HH:mm"
    } else {
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "h:mm a"
    }
    return f.string(from: date)
}

private func countdown(from now: Date, to target: Date) -> (h: String, m: String) {
    let secs = max(0, Int(target.timeIntervalSince(now)))
    let h = secs / 3600
    let m = (secs % 3600) / 60
    return (String(h), String(m))
}

/// Look up today's prayer dates (Fajr/Dhuhr/Asr/Maghrib/Isha) from a slot
/// list. Used to drive Verse of the Moment window selection. Returns nil if
/// any of the five are missing.
private func todaysFiveDates(from slots: [PrayerSlot], now: Date)
    -> (fajr: Date, sunrise: Date, dhuhr: Date, asr: Date, maghrib: Date, isha: Date)? {
    let cal = Calendar.current
    let today = cal.startOfDay(for: now)
    func first(_ p: Prayer) -> Date? {
        slots.first { s in s.prayer == p && cal.isDate(s.date, inSameDayAs: today) }?.date
    }
    guard let f = first(.fajr), let s = first(.sunrise),
          let d = first(.dhuhr), let a = first(.asr),
          let m = first(.maghrib), let i = first(.isha) else { return nil }
    return (f, s, d, a, m, i)
}

/// Build a single entry for `now`, picking the next upcoming prayer from `slots`.
private func makeEntry(now: Date, slots: [PrayerSlot], location: String, hijri: String,
                       streakDays: Int, weekPct: Int,
                       verseAr fallbackVerseAr: String, verseRef fallbackVerseRef: String,
                       is24h: Bool, themeName: String?,
                       config: ConfigurationAppIntent) -> NuurEntry {
    // Verse of the Moment: resolver picks the highest-priority match across
    // (a) base verses for the current prayer window and (b) contextual verses
    // for any active triggers (rain/storm from cached WeatherKit; Friday;
    // late_night). Falls back to the snapshot-supplied verse if today's
    // prayer times are incomplete.
    let verseAr: String
    let verseRef: String
    let verseWindow: String
    if let t = todaysFiveDates(from: slots, now: now) {
        let resolved = VerseResolver.resolve(
            at: now, fajr: t.fajr, sunrise: t.sunrise, dhuhr: t.dhuhr,
            asr: t.asr, maghrib: t.maghrib, isha: t.isha,
            appGroupId: SnapshotReader.suiteName
        )
        verseAr = resolved.verse.arabic
        verseRef = resolved.verse.referenceShort
        verseWindow = resolved.label
    } else {
        verseAr = fallbackVerseAr
        verseRef = fallbackVerseRef
        verseWindow = ""
    }

    // Pick first slot whose time is in the future; if none today, fall back to last (post-Isha shows Isha at t0).
    let upcoming = slots.first { $0.date > now } ?? slots.last!
    let mins = max(0, Int(upcoming.date.timeIntervalSince(now) / 60))
    let st = stateFor(minutesUntil: mins)
    let cd = countdown(from: now, to: upcoming.date)

    // Active prayer = most recent slot whose date <= now (the one currently in progress).
    // Fallback: pre-Fajr → yesterday's Isha is still the active prayer (NOT tomorrow's synthetic Fajr).
    let activePrayerSlot = slots.last(where: { $0.date <= now })
        ?? slots.first(where: { $0.prayer == .isha })
        ?? slots.last!

    // "NOW · IN PROGRESS" pill stays for the full prayer window (until the
    // next prayer starts). Sunrise is excluded — it's not a prayer, just the
    // end of Fajr's window — so the widget never claims you're "in" Sunrise.
    let activeIsFresh = activePrayerSlot.prayer != .sunrise

    // 5 prayers (exclude Sunrise) for the strip.
    let mainPrayers: [Prayer] = [.fajr, .dhuhr, .asr, .maghrib, .isha]
    let cal = Calendar.current
    let times: [DailyCompanionLarge.PrayerTime] = mainPrayers.compactMap { p in
        guard let slot = slots.first(where: {
            $0.prayer == p && cal.isDate($0.date, inSameDayAs: now)
        }) else { return nil }
        return DailyCompanionLarge.PrayerTime(
            prayer: p,
            timeHM: formatHM(slot.date, is24h: is24h),
            isPast: slot.date <= now,
            isActive: slot.prayer == activePrayerSlot.prayer
        )
    }

    return NuurEntry(
        date: now,
        configuration: config,
        state: st,
        skin: upcoming.prayer.skin,
        prayerEn: upcoming.prayer.en,
        prayerAr: upcoming.prayer.ar,
        nextAt: formatHM(upcoming.date, is24h: is24h),
        countdownH: cd.h,
        countdownM: cd.m,
        countdownLabel: "UNTIL \(upcoming.prayer.en.uppercased())",
        location: location,
        hijri: hijri,
        activePrayer: activePrayerSlot.prayer,
        nextPrayer: upcoming.prayer,
        targetDate: upcoming.date,
        allTimes: times,
        streakDays: streakDays,
        weekPct: weekPct,
        verseAr: verseAr,
        verseRef: verseRef,
        verseWindow: verseWindow,
        themeName: themeName,
        activeIsFresh: activeIsFresh
    )
}

// MARK: - Timeline entry
struct NuurEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let state: NuurState
    let skin: Skin
    let prayerEn: String
    let prayerAr: String
    let nextAt: String
    let countdownH: String
    let countdownM: String
    let countdownLabel: String
    let location: String
    let hijri: String
    // Large widget extras
    let activePrayer: Prayer                    // currently in progress (last past prayer)
    let nextPrayer: Prayer                      // upcoming prayer (drives Large widget sky)
    let targetDate: Date                        // upcoming prayer time (drives live ticker)
    let allTimes: [DailyCompanionLarge.PrayerTime]  // 5 prayers, Fajr..Isha
    let streakDays: Int
    let weekPct: Int
    let verseAr: String
    let verseRef: String
    /// Window the verse belongs to, uppercased ("FAJR" / "DHUHR" / …). Empty
    /// string falls back to the legacy "VERSE OF THE DAY" header.
    let verseWindow: String
    // App theme name (drives the Square widget's chrome accent).
    let themeName: String?
    // True only for the first ~15 min of the active prayer's window. Controls
    // the "● NOW · IN PROGRESS" pill on Square + Large widgets.
    let activeIsFresh: Bool
}

// MARK: - Provider
struct NuurProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> NuurEntry { Self.sample(.normal, .day) }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> NuurEntry {
        if let snap = SnapshotReader.read() {
            let entries = buildEntries(from: snap, config: configuration)
            return entries.first ?? Self.sample(.normal, .day, config: configuration)
        }
        return Self.sample(.normal, .day, config: configuration)
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<NuurEntry> {
        guard let snap = SnapshotReader.read() else {
            // No shared data yet — show placeholder, refresh in 15 min.
            let entry = Self.sample(.normal, .day, config: configuration)
            let next = Calendar.current.date(byAdding: .minute, value: 15, to: entry.date) ?? entry.date
            return Timeline(entries: [entry], policy: .after(next))
        }
        let entries = buildEntries(from: snap, config: configuration)
        // Refresh after the last scheduled entry (or in 1h if empty).
        let refreshAt = entries.last.map {
            Calendar.current.date(byAdding: .minute, value: 5, to: $0.date) ?? $0.date
        } ?? Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        return Timeline(entries: entries, policy: .after(refreshAt))
    }

    /// Build a sequence of entries: "now" + every state-transition boundary
    /// (T-30, T-10, T-1, T-0) for the next upcoming prayer, plus the first
    /// entry of the prayer after that.
    private func buildEntries(from snap: SharedSnapshot,
                              config: ConfigurationAppIntent) -> [NuurEntry] {
        let now = Date()
        let allSlots = slots(from: snap)
        guard !allSlots.isEmpty else { return [] }

        let streak = snap.streakDays ?? 0
        let week = snap.weekPct ?? 0
        // Per-widget toggle wins; otherwise fall back to the app-level
        // Settings preference embedded in the snapshot.
        let is24h = config.use24Hour || (snap.timeFormat == "24h")
        let themeName = snap.themeName

        func mk(_ t: Date) -> NuurEntry {
            let dayMetadata = metadata(from: snap, at: t)
            return makeEntry(now: t, slots: allSlots,
                             location: snap.location, hijri: dayMetadata.hijri,
                             streakDays: streak, weekPct: week,
                             verseAr: dayMetadata.verseAr, verseRef: dayMetadata.verseRef,
                             is24h: is24h, themeName: themeName, config: config)
        }

        var entries: [NuurEntry] = []
        // Always include "now" first.
        entries.append(mk(now))

        // For the next upcoming prayer, schedule one entry per minute for the
        // final 30 minutes so the widget actually counts down 30 → 29 → 28 …
        // instead of jumping at the state boundaries. iOS treats all entries
        // returned from a single getTimeline() call as one budget unit, so 30
        // pre-scheduled entries cost the same as 4. Ordered chronologically;
        // the system picks the right one for entry.date <= currentTime.
        if let upcoming = allSlots.first(where: { $0.date > now }) {
            let target = upcoming.date
            for minsBefore in stride(from: 30, through: 1, by: -1) {
                guard let t = Calendar.current.date(byAdding: .minute, value: -minsBefore, to: target) else { continue }
                if t > now { entries.append(mk(t)) }
            }
            // T-0 (the prayer time itself).
            if target > now { entries.append(mk(target)) }
            // After the prayer, surface the next one in normal state.
            if let after = Calendar.current.date(byAdding: .minute, value: 1, to: target) {
                entries.append(mk(after))
            }
        }

        // Verse of the Moment refresh entries:
        //  • Each of today's 5 prayer times → base window rotation
        //  • Midnight local (00:00) → clears the late_night trigger window
        //  • 04:00 local → clears late_night when it ends
        //  • Friday transitions are covered by the midnight entries above
        // Adds at most ~7 extra entries — well under the per-timeline budget.
        // Duplicates that overlap the per-minute T-30 ramp are harmless
        // (iOS picks the latest entry whose date <= now).
        let mainPrayers: [Prayer] = [.fajr, .dhuhr, .asr, .maghrib, .isha]
        for p in mainPrayers {
            if let slot = allSlots.first(where: { $0.prayer == p && $0.date > now }) {
                entries.append(mk(slot.date))
            }
        }
        let cal = Calendar.current
        // Midnight = start of tomorrow (Friday/weekday flip + late_night start)
        if let tomorrowMidnight = cal.date(byAdding: .day, value: 1, to: cal.startOfDay(for: now)) {
            entries.append(mk(tomorrowMidnight))
        }
        // 04:00 today (if still future) — clears late_night trigger
        if let fourAM = cal.date(bySettingHour: 4, minute: 0, second: 0, of: now),
           fourAM > now {
            entries.append(mk(fourAM))
        }
        // 04:00 tomorrow — clears late_night after the overnight window
        if let fourAMTomorrow = cal.date(bySettingHour: 4, minute: 0, second: 0,
                                         of: cal.date(byAdding: .day, value: 1, to: now) ?? now) {
            entries.append(mk(fourAMTomorrow))
        }
        // Keep ordered for the system scheduler.
        entries.sort { $0.date < $1.date }
        return entries
    }

    static func sample(_ state: NuurState, _ skin: Skin,
                       config: ConfigurationAppIntent = ConfigurationAppIntent()) -> NuurEntry {
        sample(.asr, state: state, config: config)
    }

    /// Build a preview entry for any prayer. Skin is derived from the prayer
    /// (Fajr + Isha → night, others → day). Pass any `NuurState` to test the
    /// urgency ramp.
    static func sample(_ prayer: Prayer, state: NuurState = .normal,
                       config: ConfigurationAppIntent = ConfigurationAppIntent()) -> NuurEntry {
        let payload = prayer.sampleState(state: state.rawValue)
        let attrs = NuurAttributes.sampleDay
        // Sample 5-prayer strip with `prayer` marked active.
        let mainPrayers: [Prayer] = [.fajr, .dhuhr, .asr, .maghrib, .isha]
        let active = mainPrayers.contains(prayer) ? prayer : .asr
        let activeIdx = mainPrayers.firstIndex(of: active) ?? 2
        let times: [DailyCompanionLarge.PrayerTime] = mainPrayers.enumerated().map { (i, p) in
            DailyCompanionLarge.PrayerTime(
                prayer: p, timeHM: p.sampleNextAt,
                isPast: i <= activeIdx, isActive: p == active
            )
        }
        // Sample target date derived from the H/M strings for live-timer previews.
        let h = Int(payload.countdownH) ?? 0
        let m = Int(payload.countdownM) ?? 30
        let sampleTarget = Date().addingTimeInterval(TimeInterval(h * 3600 + m * 60))
        return NuurEntry(
            date: Date(),
            configuration: config,
            state: state,
            skin: prayer.skin,
            prayerEn: payload.prayerEn,
            prayerAr: payload.prayerAr,
            nextAt: payload.nextAt,
            countdownH: payload.countdownH,
            countdownM: payload.countdownM,
            countdownLabel: payload.countdownLabel,
            location: attrs.location,
            hijri: attrs.hijri,
            activePrayer: active,
            nextPrayer: prayer,
            targetDate: sampleTarget,
            allTimes: times,
            streakDays: 12,
            weekPct: 94,
            verseAr: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا",
            verseRef: "94:5",
            verseWindow: "",
            themeName: "emerald",
            activeIsFresh: true
        )
    }
}

// MARK: - Widget body
struct NuurWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    var entry: NuurEntry

    var body: some View {
        GeometryReader { geo in
            Group {
                if family == .systemLarge {
                    DailyCompanionLarge(
                        activePrayer: entry.activePrayer,
                        nextPrayer: entry.nextPrayer,
                        state: entry.state,
                        nextPrayerEn: entry.prayerEn,
                        countdownH: entry.countdownH,
                        countdownM: entry.countdownM,
                        location: entry.location,
                        hijri: entry.hijri,
                        times: entry.allTimes,
                        verseAr: entry.verseAr,
                        verseRef: entry.verseRef,
                        verseWindow: entry.verseWindow,
                        todayDone: entry.allTimes.filter { $0.isPast }.count,
                        todayTotal: 5,
                        streakDays: entry.streakDays,
                        weekPct: entry.weekPct,
                        width: geo.size.width,
                        height: geo.size.height,
                        targetDate: entry.targetDate,
                        activeIsFresh: entry.activeIsFresh
                    )
                } else {
                    LiveActivityCard(
                        state: entry.state,
                        skin: entry.skin,
                        prayerEn: entry.prayerEn,
                        prayerAr: entry.prayerAr,
                        nextAt: entry.nextAt,
                        countdownH: entry.countdownH,
                        countdownM: entry.countdownM,
                        countdownLabel: entry.countdownLabel,
                        location: entry.location,
                        hijri: entry.hijri,
                        width: geo.size.width,
                        height: geo.size.height,
                        chromeless: true,
                        targetDate: entry.targetDate
                    )
                }
            }
        }
        .containerBackground(NuurTheme.surface, for: .widget)
    }
}

// MARK: - Widget configuration
struct NuurWidget: Widget {
    let kind: String = "NuurWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self,
                               provider: NuurProvider()) { entry in
            NuurWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Nuur Prayer")
        .description("Next prayer at a glance.")
        .supportedFamilies([.systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

// MARK: - Preview
#Preview(as: .systemMedium) {
    NuurWidget()
} timeline: {
    NuurProvider.sample(.fajr,    state: .normal)
    NuurProvider.sample(.sunrise, state: .normal)
    NuurProvider.sample(.dhuhr,   state: .normal)
    NuurProvider.sample(.asr,     state: .normal)
    NuurProvider.sample(.maghrib, state: .normal)
    NuurProvider.sample(.isha,    state: .normal)

    NuurProvider.sample(.asr, state: .t30)
    NuurProvider.sample(.asr, state: .t10)
    NuurProvider.sample(.asr, state: .t1)
    NuurProvider.sample(.asr, state: .t0)
}
