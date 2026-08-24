import SwiftUI
import WidgetKit

// MARK: - Brand tokens
private extension Color {
    static let nuurGold      = Color(red: 0xF5/255, green: 0xC5/255, blue: 0x42/255)
    static let nuurCream     = Color(red: 0xF4/255, green: 0xEA/255, blue: 0xD4/255)
    static let nuurCreamDim  = Color(red: 0xF4/255, green: 0xEA/255, blue: 0xD4/255).opacity(0.60)
    static let nuurCreamFain = Color(red: 0xF4/255, green: 0xEA/255, blue: 0xD4/255).opacity(0.35)
}

/// No-op placeholder — iOS Lock Screen widgets are always rendered in vibrant
/// mode and cannot opt out via a public API. Kept as a hook in case Apple
/// adds one in a future SDK; for now explicit foregroundStyle colors are the
/// best we can do.
private extension View {
    @ViewBuilder
    func nuurFullColor() -> some View { self }
}

// MARK: - Shared snapshot decoding (mirrors NuurWidget.swift)
private struct LockPrayerDay: Decodable {
    let dateKey: String
    let fajr: String
    let sunrise: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
    let hijri: String
}

private struct LockSnapshot: Decodable {
    let fajr: String
    let sunrise: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
    let location: String
    let hijri: String
    let fajrTomorrow: String?
    let prayerDays: [LockPrayerDay]?
    let timeZone: String?
}

private enum LockSnapshotReader {
    static let suiteName = "group.com.nuur.shared"
    static let key = "nuur.prayerSnapshot"

    static func read() -> LockSnapshot? {
        guard let defaults = UserDefaults(suiteName: suiteName),
              let json = defaults.string(forKey: key),
              let data = json.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(LockSnapshot.self, from: data)
    }
}

private func parseLockISO(_ s: String) -> Date? {
    let iso = ISO8601DateFormatter()
    iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let d = iso.date(from: s) { return d }
    iso.formatOptions = [.withInternetDateTime]
    return iso.date(from: s)
}

private func lockTimeZone(_ snap: LockSnapshot) -> TimeZone {
    snap.timeZone.flatMap(TimeZone.init(identifier:)) ?? .current
}

private func lockCalendar(_ snap: LockSnapshot) -> Calendar {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = lockTimeZone(snap)
    return calendar
}

private struct LockSlot {
    let prayer: Prayer
    let date: Date
    let label: String
}

private func lockSlots(from snap: LockSnapshot) -> [LockSlot] {
    if let days = snap.prayerDays, !days.isEmpty {
        return days.flatMap { day -> [LockSlot] in
            let pairs: [(Prayer, String, String)] = [
                (.fajr, day.fajr, "Fajr"), (.sunrise, day.sunrise, "Sunrise"),
                (.dhuhr, day.dhuhr, "Dhuhr"), (.asr, day.asr, "Asr"),
                (.maghrib, day.maghrib, "Maghrib"), (.isha, day.isha, "Isha"),
            ]
            return pairs.compactMap { (p, s, n) in
                parseLockISO(s).map { LockSlot(prayer: p, date: $0, label: n) }
            }
        }.sorted { $0.date < $1.date }
    }

    let pairs: [(Prayer, String, String)] = [
        (.fajr,    snap.fajr,    "Fajr"),
        (.sunrise, snap.sunrise, "Sunrise"),
        (.dhuhr,   snap.dhuhr,   "Dhuhr"),
        (.asr,     snap.asr,     "Asr"),
        (.maghrib, snap.maghrib, "Maghrib"),
        (.isha,    snap.isha,    "Isha"),
    ]
    var out = pairs.compactMap { (p, s, n) in parseLockISO(s).map { LockSlot(prayer: p, date: $0, label: n) } }
    if let raw = snap.fajrTomorrow, let d = parseLockISO(raw) {
        out.append(LockSlot(prayer: .fajr, date: d, label: "Fajr"))
    } else if let fajrToday = out.first(where: { $0.prayer == .fajr })?.date,
              let fajrTomorrow = lockCalendar(snap).date(byAdding: .day, value: 1, to: fajrToday) {
        out.append(LockSlot(prayer: .fajr, date: fajrTomorrow, label: "Fajr"))
    }
    return out
}

private func lockHijri(from snap: LockSnapshot, at date: Date) -> String {
    if let day = snap.prayerDays?.first(where: {
        guard let fajr = parseLockISO($0.fajr) else { return false }
        return lockCalendar(snap).isDate(fajr, inSameDayAs: date)
    }) {
        return day.hijri
    }
    return snap.hijri
}

private func nextSlot(after now: Date, slots: [LockSlot]) -> LockSlot? {
    slots.first(where: { $0.date > now }) ?? slots.last
}

private func activeSlot(at now: Date, slots: [LockSlot], windowSec: TimeInterval = 30 * 60) -> LockSlot? {
    let recent = slots
        .filter { $0.prayer != .sunrise }
        .filter { $0.date <= now && now.timeIntervalSince($0.date) <= windowSec }
        .sorted { $0.date > $1.date }
    return recent.first
}

private func formatLockHM(_ date: Date) -> String {
    let f = DateFormatter()
    if let snap = LockSnapshotReader.read() { f.timeZone = lockTimeZone(snap) }
    f.dateFormat = "HH:mm"
    return f.string(from: date)
}

private func formatGap(_ seconds: TimeInterval) -> String {
    let s = max(0, Int(seconds))
    let h = s / 3600
    let m = (s % 3600) / 60
    if h > 0 { return "\(h)h \(m)m" }
    if m > 0 { return "\(m)m" }
    return "\(s)s"
}

private func stripHijriYear(_ s: String) -> String {
    let trimmed = s.trimmingCharacters(in: .whitespaces)
    let parts = trimmed.split(separator: " ")
    if let last = parts.last, last.count == 4, last.allSatisfy(\.isNumber) {
        return parts.dropLast().joined(separator: " ")
    }
    return trimmed
}

private func sfSymbol(for prayer: Prayer) -> String {
    switch prayer {
    case .fajr:    return "sunrise.fill"
    case .sunrise: return "sun.horizon.fill"
    case .dhuhr:   return "sun.max.fill"
    case .asr:     return "sun.max.fill"
    case .maghrib: return "sunset.fill"
    case .isha:    return "moon.stars.fill"
    }
}

// MARK: - Timeline provider

private struct LockEntry: TimelineEntry {
    let date: Date
    let slot: LockSlot?
    let active: LockSlot?
    let hijri: String
    let doneToday: Int
    let totalToday: Int
}

private struct LockProvider: TimelineProvider {
    func placeholder(in context: Context) -> LockEntry {
        LockEntry(date: Date(),
                  slot: LockSlot(prayer: .maghrib, date: Date().addingTimeInterval(4620), label: "Maghrib"),
                  active: nil,
                  hijri: "23 Dhū al-Qa'dah",
                  doneToday: 2, totalToday: 5)
    }
    func getSnapshot(in context: Context, completion: @escaping (LockEntry) -> Void) {
        completion(makeEntry(now: Date()))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<LockEntry>) -> Void) {
        let now = Date()
        var entries: [LockEntry] = []
        for i in 0..<60 {
            let t = now.addingTimeInterval(Double(i) * 60)
            entries.append(makeEntry(now: t))
        }
        let refreshAt = now.addingTimeInterval(60 * 60)
        completion(Timeline(entries: entries, policy: .after(refreshAt)))
    }
    private func makeEntry(now: Date) -> LockEntry {
        guard let snap = LockSnapshotReader.read() else {
            return LockEntry(date: now, slot: nil, active: nil, hijri: "", doneToday: 0, totalToday: 5)
        }
        let slots = lockSlots(from: snap)
        var seen = Set<Prayer>()
        let today = slots.filter { s in
            guard lockCalendar(snap).isDate(s.date, inSameDayAs: now),
                  s.prayer != .sunrise, !seen.contains(s.prayer) else { return false }
            seen.insert(s.prayer); return true
        }
        let done = today.filter { $0.date <= now }.count
        return LockEntry(
            date: now,
            slot: nextSlot(after: now, slots: slots),
            active: activeSlot(at: now, slots: slots),
            hijri: stripHijriYear(lockHijri(from: snap, at: now)),
            doneToday: done,
            totalToday: max(today.count, 5)
        )
    }
}

// MARK: - Inline widget

private struct LockInlineView: View {
    let entry: LockEntry
    var body: some View {
        if let active = entry.active {
            Label("\(active.label) · NOW",
                  systemImage: sfSymbol(for: active.prayer))
        } else if let slot = entry.slot {
            let gap = slot.date.timeIntervalSince(entry.date)
            if gap > 3600 {
                Label("\(slot.label) in \(formatGap(gap))",
                      systemImage: sfSymbol(for: slot.prayer))
            } else {
                Label("\(slot.label) at \(formatLockHM(slot.date))",
                      systemImage: sfSymbol(for: slot.prayer))
            }
        } else {
            Text("Nuur — open app")
        }
    }
}

struct NuurLockInlineWidget: Widget {
    let kind = "NuurLockInline"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LockProvider()) { entry in
            LockInlineView(entry: entry)
        }
        .configurationDisplayName("Next Prayer · Inline")
        .description("Shows the next prayer in the date row above the lock screen clock.")
        .supportedFamilies([.accessoryInline])
    }
}

// MARK: - Rectangular widget

private struct LockRectView: View {
    let entry: LockEntry
    var body: some View {
        if let slot = entry.slot {
            VStack(alignment: .leading, spacing: 2) {
                Text("UNTIL \(slot.label.uppercased())")
                    .font(.system(size: 10, weight: .semibold, design: .rounded))
                    .tracking(1.6)
                    .foregroundStyle(Color.nuurGold)
                    .nuurFullColor()
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Image(systemName: sfSymbol(for: slot.prayer))
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Color.nuurGold)
                        .nuurFullColor()
                    Text(slot.label)
                        .font(.system(.headline, design: .rounded).weight(.semibold))
                        .foregroundStyle(Color.nuurGold)
                        .nuurFullColor()
                    Spacer(minLength: 4)
                    Text(formatGap(slot.date.timeIntervalSince(entry.date)))
                        .font(.system(size: 17, weight: .medium, design: .rounded))
                        .monospacedDigit()
                        .foregroundStyle(Color.nuurGold)
                        .nuurFullColor()
                }
                Text("at \(formatLockHM(slot.date))\(entry.hijri.isEmpty ? "" : " · \(entry.hijri)")")
                    .font(.system(size: 11, design: .rounded))
                    .foregroundStyle(Color.nuurCreamDim)
                    .lineLimit(1)
                    .minimumScaleFactor(0.75)
            }
        } else {
            VStack(alignment: .leading, spacing: 2) {
                Text("NUUR")
                    .font(.system(size: 9, weight: .semibold, design: .rounded))
                    .tracking(1.6)
                    .foregroundStyle(Color.nuurGold)
                    .nuurFullColor()
                Text("Open app to set up")
                    .font(.system(.footnote, design: .rounded))
            }
        }
    }
}

struct NuurLockRectWidget: Widget {
    let kind = "NuurLockRect"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LockProvider()) { entry in
            LockRectView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Detailed Countdown")
        .description("Next prayer with countdown, exact time, and Hijri date.")
        .supportedFamilies([.accessoryRectangular])
    }
}

// MARK: - Circular widgets

private struct LockCircularCountdownView: View {
    let entry: LockEntry
    var body: some View {
        if let slot = entry.slot {
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 0) {
                    Image(systemName: sfSymbol(for: slot.prayer))
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(Color.nuurCream)
                    Text("IN")
                        .font(.system(size: 9, weight: .semibold, design: .rounded))
                        .tracking(1.2)
                        .foregroundStyle(Color.nuurCreamDim)
                    Text(formatGap(slot.date.timeIntervalSince(entry.date)))
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .monospacedDigit()
                        .foregroundStyle(Color.nuurGold)
                        .nuurFullColor()
                        .minimumScaleFactor(0.8)
                        .lineLimit(1)
                }
            }
        } else {
            Image(systemName: "moon.stars.fill")
        }
    }
}

struct NuurLockCircularCountdownWidget: Widget {
    let kind = "NuurLockCircCountdown"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LockProvider()) { entry in
            LockCircularCountdownView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Countdown · Circle")
        .description("Time remaining until the next prayer.")
        .supportedFamilies([.accessoryCircular])
    }
}

private struct LockCircularTimeView: View {
    let entry: LockEntry
    var body: some View {
        if let slot = entry.slot {
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 0) {
                    Image(systemName: sfSymbol(for: slot.prayer))
                        .font(.system(size: 9, weight: .semibold))
                        .foregroundStyle(Color.nuurCream)
                    Text(formatLockHM(slot.date))
                        .font(.system(size: 14, weight: .medium, design: .rounded))
                        .monospacedDigit()
                        .foregroundStyle(Color.nuurGold)
                        .nuurFullColor()
                        .minimumScaleFactor(0.8)
                        .lineLimit(1)
                    Text(slot.label.uppercased())
                        .font(.system(size: 9, weight: .semibold, design: .rounded))
                        .tracking(0.7)
                        .foregroundStyle(Color.nuurCream.opacity(0.80))
                        .minimumScaleFactor(0.8)
                        .lineLimit(1)
                }
                .padding(.horizontal, 4)
            }
        } else {
            Image(systemName: "moon.stars.fill")
        }
    }
}

struct NuurLockCircularTimeWidget: Widget {
    let kind = "NuurLockCircTime"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LockProvider()) { entry in
            LockCircularTimeView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Next Time · Circle")
        .description("Exact time of the next prayer.")
        .supportedFamilies([.accessoryCircular])
    }
}

private struct LockCircularProgressView: View {
    let entry: LockEntry
    var body: some View {
        let done = entry.doneToday
        let total = entry.totalToday
        let frac = total > 0 ? CGFloat(done) / CGFloat(total) : 0
        ZStack {
            AccessoryWidgetBackground()
            Circle()
                .trim(from: 0, to: frac)
                .stroke(Color.nuurGold,
                        style: StrokeStyle(lineWidth: 3, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .padding(2)
                .nuurFullColor()
            VStack(spacing: 1) {
                Text("\(done)")
                    .font(.system(size: 18, weight: .medium, design: .rounded))
                    .foregroundStyle(Color.nuurGold)
                    .nuurFullColor()
                HStack(spacing: 2) {
                    ForEach(0..<total, id: \.self) { i in
                        Circle()
                            .fill(i < done ? Color.nuurGold : Color.clear)
                            .overlay(
                                Circle()
                                    .stroke(Color.nuurCreamFain, lineWidth: 0.7)
                            )
                            .frame(width: 4, height: 4)
                    }
                }
                .nuurFullColor()
            }
        }
    }
}

struct NuurLockCircularProgressWidget: Widget {
    let kind = "NuurLockCircProgress"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LockProvider()) { entry in
            LockCircularProgressView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Today's Prayers · Ring")
        .description("Progress ring showing prayers completed today out of 5.")
        .supportedFamilies([.accessoryCircular])
    }
}

// MARK: - Lock Screen previews

private extension LockEntry {
    static var preview: LockEntry {
        let now = Date()
        return LockEntry(
            date: now,
            slot: LockSlot(
                prayer: .maghrib,
                date: now.addingTimeInterval(4_620),
                label: "Maghrib"
            ),
            active: nil,
            hijri: "10 Rabi al-Awwal 1448",
            doneToday: 3,
            totalToday: 5
        )
    }
}

#Preview("Inline", as: .accessoryInline) {
    NuurLockInlineWidget()
} timeline: {
    LockEntry.preview
}

#Preview("Detailed Countdown", as: .accessoryRectangular) {
    NuurLockRectWidget()
} timeline: {
    LockEntry.preview
}

#Preview("Countdown Circle", as: .accessoryCircular) {
    NuurLockCircularCountdownWidget()
} timeline: {
    LockEntry.preview
}

#Preview("Prayer Time Circle", as: .accessoryCircular) {
    NuurLockCircularTimeWidget()
} timeline: {
    LockEntry.preview
}

#Preview("Prayer Progress Ring", as: .accessoryCircular) {
    NuurLockCircularProgressWidget()
} timeline: {
    LockEntry.preview
}
