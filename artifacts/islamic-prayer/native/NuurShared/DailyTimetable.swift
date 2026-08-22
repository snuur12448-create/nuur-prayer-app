import SwiftUI

/// Medium widget — "The Daily Timetable" (calm variant).
/// A quiet 5-column board of today's prayer times. Typography mirrors the
/// Lock Screen family: SF Pro Rounded throughout. Only the active (next)
/// prayer carries a small celestial glyph; the inactive columns hold the
/// same vertical space so the row never jitters.
public struct DailyTimetable: View {
    public struct Row: Identifiable {
        public let id = UUID()
        public let prayer: Prayer
        public let timeHM: String       // "16:55"
        public let timeAmPm: String     // "PM" or "" (24h)
        public let isPast: Bool
        public let isActive: Bool       // currently the "next" / in-progress prayer
        public init(prayer: Prayer, timeHM: String, timeAmPm: String,
                    isPast: Bool, isActive: Bool) {
            self.prayer = prayer; self.timeHM = timeHM; self.timeAmPm = timeAmPm
            self.isPast = isPast; self.isActive = isActive
        }
    }

    public let location: String
    public let hijri: String
    public let rows: [Row]              // 5 entries, Fajr..Isha
    public let width: CGFloat
    public let height: CGFloat

    public init(location: String, hijri: String, rows: [Row],
                width: CGFloat, height: CGFloat) {
        self.location = location; self.hijri = hijri; self.rows = rows
        self.width = width; self.height = height
    }

    public var body: some View {
        VStack(spacing: 0) {
            caption
                .padding(.top, 14)
                .padding(.horizontal, 16)
            Spacer(minLength: 8)
            timetable
                .padding(.horizontal, 10)
            Spacer(minLength: 14)
        }
        .frame(width: width, height: height)
        .background(NuurTheme.surface)
    }

    // MARK: - Caption (single quiet line, top)
    private var caption: some View {
        HStack {
            Text("\(location.uppercased()) · \(hijri.uppercased())")
                .font(.system(size: 9, weight: .medium, design: .rounded))
                .tracking(1.4)
                .foregroundColor(NuurTheme.text.opacity(0.60))
                .lineLimit(1)
                .minimumScaleFactor(0.85)
            Spacer()
        }
    }

    // MARK: - 5-column timetable
    private var timetable: some View {
        HStack(spacing: 4) {
            ForEach(rows) { r in
                cell(r)
            }
        }
    }

    private func cell(_ r: Row) -> some View {
        let active = r.isActive
        let dim = r.isPast && !active
        let nameColor: Color = active ? NuurTheme.gold
                              : dim ? NuurTheme.text.opacity(0.40)
                              : NuurTheme.text.opacity(0.70)
        let timeColor: Color = active ? NuurTheme.gold
                              : dim ? NuurTheme.text.opacity(0.50)
                              : NuurTheme.text.opacity(0.92)
        let ampmColor: Color = active ? NuurTheme.gold.opacity(0.90)
                              : NuurTheme.textSecondary.opacity(0.80)

        return VStack(spacing: 4) {
            // Glyph slot — same height for every column to keep baselines aligned.
            ZStack {
                if active {
                    Image(systemName: glyphName(r.prayer))
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(NuurTheme.gold)
                }
            }
            .frame(height: 14)

            Text(r.prayer.en.uppercased())
                .font(.system(size: 10, weight: .semibold, design: .rounded))
                .tracking(1.4)
                .foregroundColor(nameColor)

            Text(r.timeHM)
                .font(.system(size: r.timeAmPm.isEmpty ? 18 : 22,
                              weight: .semibold, design: .rounded))
                .monospacedDigit()
                .foregroundColor(timeColor)
                .lineLimit(1)
                .minimumScaleFactor(0.6)

            // AM/PM slot — always reserve height so rows align (24h mode keeps it blank).
            Text(r.timeAmPm.isEmpty ? " " : r.timeAmPm)
                .font(.system(size: 9, weight: .regular, design: .rounded))
                .tracking(1.0)
                .foregroundColor(ampmColor)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(active ? NuurTheme.surfaceElevated : Color.clear)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(active ? NuurTheme.gold.opacity(0.55) : Color.clear,
                        lineWidth: 1)
        )
    }

    private func glyphName(_ p: Prayer) -> String {
        switch p {
        case .fajr:    return "sunrise.fill"
        case .sunrise: return "sunrise.fill"
        case .dhuhr:   return "sun.max.fill"
        case .asr:     return "sun.max.fill"
        case .maghrib: return "sunset.fill"
        case .isha:    return "moon.fill"
        }
    }
}
