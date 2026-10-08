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
    // Snapshot lifecycle metadata. Optional for upgrades from older builds.
    let generatedAt: String?
    let validThrough: String?
    // IANA timezone for the selected prayer location. Optional for snapshots
    // written by older app versions, which fall back to the device timezone.
    let timeZone: String?
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

private func snapshotValidThrough(_ snap: SharedSnapshot) -> Date? {
    if let raw = snap.validThrough, let explicit = parseISO(raw) { return explicit }
    if let finalIsha = snap.prayerDays?.last?.isha, let date = parseISO(finalIsha) {
        return date.addingTimeInterval(5 * 60)
    }
    if let raw = snap.fajrTomorrow, let date = parseISO(raw) {
        return date.addingTimeInterval(5 * 60)
    }
    return parseISO(snap.isha)?.addingTimeInterval(5 * 60)
}

private func snapshotHasExpired(_ snap: SharedSnapshot, at date: Date) -> Bool {
    nuurSnapshotHasExpired(validThrough: snapshotValidThrough(snap), at: date)
}

private func prayerTimeZone(_ identifier: String?) -> TimeZone {
    identifier.flatMap(TimeZone.init(identifier:)) ?? .current
}

private func prayerCalendar(_ identifier: String?) -> Calendar {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = prayerTimeZone(identifier)
    return calendar
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
              let fajrTomorrow = prayerCalendar(snap.timeZone).date(byAdding: .day, value: 1, to: fajrToday) {
        result.append(PrayerSlot(prayer: .fajr, date: fajrTomorrow))
    }
    return result
}

private func metadata(from snap: SharedSnapshot, at date: Date)
    -> (hijri: String, verseAr: String, verseRef: String) {
    if let day = snap.prayerDays?.first(where: {
        guard let fajr = parseISO($0.fajr) else { return false }
        return prayerCalendar(snap.timeZone).isDate(fajr, inSameDayAs: date)
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

private func formatHM(_ date: Date, is24h: Bool, timeZone: TimeZone) -> String {
    let f = DateFormatter()
    f.timeZone = timeZone
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
private func todaysFiveDates(from slots: [PrayerSlot], now: Date, calendar: Calendar)
    -> (fajr: Date, sunrise: Date, dhuhr: Date, asr: Date, maghrib: Date, isha: Date)? {
    let cal = calendar
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
                       timeZone: TimeZone,
                       config: ConfigurationAppIntent) -> NuurEntry {
    // Verse of the Moment: resolver picks the highest-priority match across
    // (a) base verses for the current prayer window and (b) contextual verses
    // for any active triggers (rain/storm from cached WeatherKit; Friday;
    // late_night). Falls back to the snapshot-supplied verse if today's
    // prayer times are incomplete.
    let verseAr: String
    let verseRef: String
    let verseWindow: String
    var cal = Calendar(identifier: .gregorian)
    cal.timeZone = timeZone
    if let t = todaysFiveDates(from: slots, now: now, calendar: cal) {
        let resolved = VerseResolver.resolve(
            at: now, fajr: t.fajr, sunrise: t.sunrise, dhuhr: t.dhuhr,
            asr: t.asr, maghrib: t.maghrib, isha: t.isha,
            appGroupId: SnapshotReader.suiteName,
            timeZone: timeZone
        )
        verseAr = resolved.verse.arabic
        verseRef = resolved.verse.referenceShort
        verseWindow = resolved.label
    } else {
        verseAr = fallbackVerseAr
        verseRef = fallbackVerseRef
        verseWindow = ""
    }

    // Keep the prayer whose boundary is exactly `now` for one timeline entry so
    // the T-0 "time for prayer" state is actually reachable. A later entry
    // advances to the following slot.
    let upcoming = slots.first { $0.date >= now } ?? slots.last!
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
    let times: [DailyCompanionLarge.PrayerTime] = mainPrayers.compactMap { p in
        guard let slot = slots.first(where: {
            $0.prayer == p && cal.isDate($0.date, inSameDayAs: now)
        }) else { return nil }
        return DailyCompanionLarge.PrayerTime(
            prayer: p,
            timeHM: formatHM(slot.date, is24h: is24h, timeZone: timeZone),
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
        nextAt: formatHM(upcoming.date, is24h: is24h, timeZone: timeZone),
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
        activeIsFresh: activeIsFresh,
        requiresRefresh: false
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
    /// True once the rolling prayer cache has no authoritative future data.
    let requiresRefresh: Bool
}

// MARK: - Provider
struct NuurProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> NuurEntry { Self.sample(.normal, .day) }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> NuurEntry {
        if let snap = SnapshotReader.read() {
            if snapshotHasExpired(snap, at: Date()) {
                return Self.refreshRequired(config: configuration)
            }
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
        // The timeline is self-contained for seven days. Asking for the next
        // reload only after its final entry avoids depending on WidgetKit's
        // discretionary background budget for daily correctness.
        let refreshAt = entries.last.map {
            $0.requiresRefresh
                ? max($0.date, Date()).addingTimeInterval(6 * 60 * 60)
                : $0.date
        }
            ?? Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        return Timeline(entries: entries, policy: .after(refreshAt))
    }

    /// Preload seven days of predictable transitions. SwiftUI's `.timer`
    /// countdown advances between entries, while these sparse entries rotate
    /// prayers, urgency styling, daily rows, Hijri metadata, and verse windows.
    private func buildEntries(from snap: SharedSnapshot,
                              config: ConfigurationAppIntent) -> [NuurEntry] {
        let now = Date()
        let allSlots = slots(from: snap)
        guard !allSlots.isEmpty else { return [] }

        if snapshotHasExpired(snap, at: now) {
            return [Self.refreshRequired(date: now, config: config)]
        }

        let streak = snap.streakDays ?? 0
        let week = snap.weekPct ?? 0
        // Per-widget toggle wins; otherwise fall back to the app-level
        // Settings preference embedded in the snapshot.
        let is24h = config.use24Hour || (snap.timeFormat == "24h")
        let themeName = snap.themeName
        let timeZone = prayerTimeZone(snap.timeZone)

        func mk(_ t: Date) -> NuurEntry {
            if snapshotHasExpired(snap, at: t) {
                return Self.refreshRequired(date: t, config: config)
            }
            let dayMetadata = metadata(from: snap, at: t)
            return makeEntry(now: t, slots: allSlots,
                             location: snap.location, hijri: dayMetadata.hijri,
                             streakDays: streak, weekPct: week,
                             verseAr: dayMetadata.verseAr, verseRef: dayMetadata.verseRef,
                             is24h: is24h, themeName: themeName,
                             timeZone: timeZone, config: config)
        }

        let horizon = now.addingTimeInterval(7 * 24 * 60 * 60)
        let expiryBoundary = snapshotValidThrough(snap)?.addingTimeInterval(1)
        let timelineEnd = expiryBoundary.map { min(horizon, $0) } ?? horizon
        var moments = Set<Date>([now, timelineEnd])

        // T-30 and T-10 change the card's urgency treatment. The exact prayer
        // boundary produces T-0, and +5 minutes advances to the next prayer.
        // Countdown digits themselves remain live via SwiftUI's timer style.
        for slot in allSlots where slot.date > now && slot.date <= timelineEnd {
            for offset in [-30, -10, 0, 5] {
                let moment = slot.date.addingTimeInterval(TimeInterval(offset * 60))
                if moment > now && moment <= timelineEnd { moments.insert(moment) }
            }
        }

        // Verse of the Moment also changes at local midnight and 04:00. Add
        // those boundaries for every covered day (including DST transitions).
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        var day = cal.startOfDay(for: now)
        while day <= timelineEnd {
            if day > now { moments.insert(day) }
            if let fourAM = cal.date(bySettingHour: 4, minute: 0, second: 0, of: day),
               fourAM > now && fourAM <= timelineEnd {
                moments.insert(fourAM)
            }
            guard let nextDay = cal.date(byAdding: .day, value: 1, to: day) else { break }
            day = nextDay
        }

        return moments.sorted().map(mk)
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
            activeIsFresh: true,
            requiresRefresh: false
        )
    }

    static func refreshRequired(date: Date = Date(),
                                config: ConfigurationAppIntent = ConfigurationAppIntent()) -> NuurEntry {
        NuurEntry(
            date: date, configuration: config, state: .normal, skin: .night,
            prayerEn: "Prayer times", prayerAr: "", nextAt: "--:--",
            countdownH: "0", countdownM: "00", countdownLabel: "REFRESH REQUIRED",
            location: "Open Nuur", hijri: "", activePrayer: .isha, nextPrayer: .fajr,
            targetDate: date, allTimes: [], streakDays: 0, weekPct: 0,
            verseAr: "", verseRef: "", verseWindow: "", themeName: "emerald",
            activeIsFresh: false, requiresRefresh: true
        )
    }
}

struct NuurRefreshRequiredCard: View {
    let compact: Bool

    var body: some View {
        VStack(spacing: compact ? 7 : 10) {
            Image(systemName: "arrow.clockwise.circle.fill")
                .font(.system(size: compact ? 22 : 28, weight: .semibold))
                .foregroundColor(NuurTheme.gold)
            Text(compact ? "Open Nuur" : "Prayer times need refreshing")
                .font(.system(size: compact ? 15 : 18, weight: .semibold, design: .serif))
                .foregroundColor(NuurTheme.text)
                .multilineTextAlignment(.center)
            if !compact {
                Text("Open the app to refresh your location and prayer schedule.")
                    .font(.system(size: 11, weight: .regular))
                    .foregroundColor(NuurTheme.textSecondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(NuurTheme.surface)
        .widgetURL(URL(string: "nuur://"))
    }
}

// MARK: - Widget body
struct NuurWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    var entry: NuurEntry

    var body: some View {
        GeometryReader { geo in
            Group {
                if entry.requiresRefresh {
                    NuurRefreshRequiredCard(compact: false)
                } else if family == .systemLarge {
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

#Preview("Daily Companion", as: .systemLarge) {
    NuurWidget()
} timeline: {
    NuurProvider.sample(.maghrib, state: .normal)
    NuurProvider.sample(.isha, state: .normal)
}
