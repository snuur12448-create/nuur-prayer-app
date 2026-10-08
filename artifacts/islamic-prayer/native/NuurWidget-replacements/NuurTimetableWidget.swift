import SwiftUI
import WidgetKit

// MARK: - Shared snapshot (mirror of NuurWidget's, kept private here so both
// widgets can be built independently without exposing internals).
private struct TTPrayerDay: Decodable {
    let dateKey: String
    let fajr: String
    let sunrise: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
    let hijri: String
}

private struct TTSnapshot: Decodable {
    let fajr: String
    let sunrise: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
    let location: String
    let hijri: String
    let fajrTomorrow: String?
    /// "12h" or "24h" — when missing, default to 12h with AM/PM (US-friendly).
    let timeFormat: String?
    let prayerDays: [TTPrayerDay]?
    let timeZone: String?
    let generatedAt: String?
    let validThrough: String?
}

private enum TTReader {
    static let suiteName = "group.com.nuur.shared"
    static let key = "nuur.prayerSnapshot"
    static func read() -> TTSnapshot? {
        guard let defaults = UserDefaults(suiteName: suiteName),
              let json = defaults.string(forKey: key),
              let data = json.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(TTSnapshot.self, from: data)
    }
}

private func ttParseISO(_ s: String) -> Date? {
    let iso = ISO8601DateFormatter()
    iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let d = iso.date(from: s) { return d }
    iso.formatOptions = [.withInternetDateTime]
    return iso.date(from: s)
}

private func ttTimeZone(_ snap: TTSnapshot) -> TimeZone {
    snap.timeZone.flatMap(TimeZone.init(identifier:)) ?? .current
}

private func ttCalendar(_ snap: TTSnapshot) -> Calendar {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = ttTimeZone(snap)
    return calendar
}

private func ttValidThrough(_ snap: TTSnapshot) -> Date? {
    if let raw = snap.validThrough, let explicit = ttParseISO(raw) { return explicit }
    if let raw = snap.prayerDays?.last?.isha, let date = ttParseISO(raw) {
        return date.addingTimeInterval(5 * 60)
    }
    if let raw = snap.fajrTomorrow, let date = ttParseISO(raw) {
        return date.addingTimeInterval(5 * 60)
    }
    return ttParseISO(snap.isha)?.addingTimeInterval(5 * 60)
}

private func ttHasExpired(_ snap: TTSnapshot, at date: Date) -> Bool {
    nuurSnapshotHasExpired(validThrough: ttValidThrough(snap), at: date)
}

private struct TTSlot {
    let prayer: Prayer
    let date: Date
}

private func ttSlots(from snap: TTSnapshot) -> [TTSlot] {
    if let days = snap.prayerDays, !days.isEmpty {
        return days.flatMap { day -> [TTSlot] in
            let pairs: [(Prayer, String)] = [
                (.fajr, day.fajr), (.dhuhr, day.dhuhr), (.asr, day.asr),
                (.maghrib, day.maghrib), (.isha, day.isha)
            ]
            return pairs.compactMap { (p, s) in
                ttParseISO(s).map { TTSlot(prayer: p, date: $0) }
            }
        }.sorted { $0.date < $1.date }
    }

    let pairs: [(Prayer, String)] = [
        (.fajr, snap.fajr), (.dhuhr, snap.dhuhr),
        (.asr, snap.asr), (.maghrib, snap.maghrib), (.isha, snap.isha)
    ]
    var result = pairs.compactMap { (p, s) in ttParseISO(s).map { TTSlot(prayer: p, date: $0) } }
    if let raw = snap.fajrTomorrow, let d = ttParseISO(raw) {
        result.append(TTSlot(prayer: .fajr, date: d))
    } else if let fajrToday = result.first(where: { $0.prayer == .fajr })?.date,
              let fajrTomorrow = ttCalendar(snap).date(byAdding: .day, value: 1, to: fajrToday) {
        result.append(TTSlot(prayer: .fajr, date: fajrTomorrow))
    }
    return result
}

private func ttHijri(from snap: TTSnapshot, at date: Date) -> String {
    if let day = snap.prayerDays?.first(where: {
        guard let fajr = ttParseISO($0.fajr) else { return false }
        return ttCalendar(snap).isDate(fajr, inSameDayAs: date)
    }) {
        return day.hijri
    }
    return snap.hijri
}

private func ttFormat(_ date: Date, is24h: Bool, timeZone: TimeZone) -> (hm: String, ampm: String) {
    let f = DateFormatter()
    f.timeZone = timeZone
    if is24h {
        f.dateFormat = "HH:mm"
        return (f.string(from: date), "")
    }
    f.dateFormat = "h:mm"
    let hm = f.string(from: date)
    f.dateFormat = "a"
    return (hm, f.string(from: date).uppercased())
}

// MARK: - Entry
struct TimetableEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let location: String
    let hijri: String
    let rows: [DailyTimetable.Row]
    let requiresRefresh: Bool
}

// MARK: - Provider
struct TimetableProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> TimetableEntry { Self.sample() }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> TimetableEntry {
        if let snap = TTReader.read() {
            return Self.buildEntry(now: Date(), snap: snap, config: configuration)
                ?? Self.sample(config: configuration)
        }
        return Self.sample(config: configuration)
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<TimetableEntry> {
        guard let snap = TTReader.read() else {
            let entry = Self.sample(config: configuration)
            let next = Calendar.current.date(byAdding: .minute, value: 15, to: entry.date) ?? entry.date
            return Timeline(entries: [entry], policy: .after(next))
        }
        let now = Date()
        if ttHasExpired(snap, at: now) {
            let entry = Self.refreshRequired(now: now, config: configuration)
            return Timeline(entries: [entry], policy: .after(now.addingTimeInterval(6 * 60 * 60)))
        }
        let calendar = ttCalendar(snap)
        let horizon = calendar.date(byAdding: .day, value: 7, to: now)
            ?? now.addingTimeInterval(7 * 24 * 60 * 60)
        let expiryBoundary = ttValidThrough(snap)?.addingTimeInterval(1)
        let timelineEnd = expiryBoundary.map { min(horizon, $0) } ?? horizon

        // Preload a full week. Prayer boundaries move the active row; local
        // midnight rolls the table, Hijri date, and location-day metadata.
        let slots = ttSlots(from: snap)
        var moments = Set<Date>([now, timelineEnd])
        for slot in slots where slot.date > now && slot.date <= timelineEnd {
            moments.insert(slot.date)
        }

        var midnight = calendar.nextDate(
            after: now,
            matching: DateComponents(hour: 0, minute: 0, second: 0),
            matchingPolicy: .nextTime
        )
        while let boundary = midnight, boundary <= timelineEnd {
            moments.insert(boundary)
            midnight = calendar.date(byAdding: .day, value: 1, to: boundary)
        }

        let entries = moments.sorted().compactMap {
            Self.buildEntry(now: $0, snap: snap, config: configuration)
        }
        let refreshAt = entries.last?.requiresRefresh == true
            ? timelineEnd.addingTimeInterval(6 * 60 * 60)
            : timelineEnd
        return Timeline(entries: entries, policy: .after(refreshAt))
    }

    private static func buildEntry(now: Date, snap: TTSnapshot,
                                   config: ConfigurationAppIntent) -> TimetableEntry? {
        if ttHasExpired(snap, at: now) {
            return refreshRequired(now: now, config: config)
        }
        let slots = ttSlots(from: snap)
        guard !slots.isEmpty else { return refreshRequired(now: now, config: config) }
        // Widget toggle wins; otherwise fall back to the app's stored preference.
        let is24h = config.use24Hour || (snap.timeFormat ?? "12h") == "24h"
        let calendar = ttCalendar(snap)
        let timeZone = ttTimeZone(snap)

        let upcoming = slots.first { $0.date > now } ?? slots.last!
        let active = slots.last(where: { $0.date <= now && $0.prayer != upcoming.prayer })
            ?? slots.first(where: { $0.prayer == .isha })

        // 5 rows (today only — exclude the synthetic tomorrow Fajr).
        let main: [Prayer] = [.fajr, .dhuhr, .asr, .maghrib, .isha]
        let rows: [DailyTimetable.Row] = main.compactMap { p in
            guard let slot = slots.first(where: {
                $0.prayer == p && calendar.isDate($0.date, inSameDayAs: now)
            }) else { return nil }
            let fmt = ttFormat(slot.date, is24h: is24h, timeZone: timeZone)
            return DailyTimetable.Row(
                prayer: p, timeHM: fmt.hm, timeAmPm: fmt.ampm,
                isPast: slot.date <= now,
                isActive: active?.prayer == p
            )
        }

        _ = upcoming // (kept for clarity; no longer rendered)
        return TimetableEntry(
            date: now, configuration: config,
            location: snap.location, hijri: ttHijri(from: snap, at: now),
            rows: rows, requiresRefresh: false
        )
    }

    static func sample(config: ConfigurationAppIntent = ConfigurationAppIntent()) -> TimetableEntry {
        let now = Date()
        let main: [Prayer] = [.fajr, .dhuhr, .asr, .maghrib, .isha]
        let activeIdx = 2 // Asr
        let rows: [DailyTimetable.Row] = main.enumerated().map { (i, p) in
            DailyTimetable.Row(
                prayer: p, timeHM: p.sampleNextAt, timeAmPm: i < 1 ? "AM" : "PM",
                isPast: i <= activeIdx, isActive: i == activeIdx
            )
        }
        return TimetableEntry(
            date: now, configuration: config,
            location: "London, UK", hijri: "18 DHŪ AL-QAʿDAH 1446",
            rows: rows, requiresRefresh: false
        )
    }

    private static func refreshRequired(now: Date,
                                        config: ConfigurationAppIntent) -> TimetableEntry {
        TimetableEntry(
            date: now, configuration: config, location: "Open Nuur",
            hijri: "", rows: [], requiresRefresh: true
        )
    }
}

private struct TimetableRefreshView: View {
    var body: some View {
        VStack(spacing: 9) {
            Image(systemName: "arrow.clockwise.circle.fill")
                .font(.system(size: 25, weight: .semibold))
                .foregroundColor(NuurTheme.gold)
            Text("Prayer times need refreshing")
                .font(.system(size: 17, weight: .semibold, design: .serif))
                .foregroundColor(NuurTheme.text)
            Text("Open Nuur to update today's timetable.")
                .font(.system(size: 11))
                .foregroundColor(NuurTheme.textSecondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(NuurTheme.surface)
        .widgetURL(URL(string: "nuur://"))
    }
}

// MARK: - Widget body
struct TimetableEntryView: View {
    var entry: TimetableEntry
    var body: some View {
        GeometryReader { geo in
            if entry.requiresRefresh {
                TimetableRefreshView()
            } else {
                DailyTimetable(
                    location: entry.location,
                    hijri: entry.hijri,
                    rows: entry.rows,
                    width: geo.size.width,
                    height: geo.size.height
                )
            }
        }
        .containerBackground(NuurTheme.surface, for: .widget)
    }
}

// MARK: - Widget configuration
struct NuurTimetableWidget: Widget {
    let kind: String = "NuurTimetableWidget"
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self,
                               provider: TimetableProvider()) { entry in
            TimetableEntryView(entry: entry)
        }
        .configurationDisplayName("Today's Prayer Times")
        .description("All five prayer times at a glance, with the next one highlighted.")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

// MARK: - Preview
#Preview(as: .systemMedium) {
    NuurTimetableWidget()
} timeline: {
    TimetableProvider.sample()
}
