import SwiftUI

/// Large widget — "The Daily Companion".
/// Sky band on top with celestial glyph. Below: NOW label + active prayer +
/// countdown to next. Strip of 5 prayers (active highlighted). Stats row.
/// Verse of the day in Arabic at the bottom.
public struct DailyCompanionLarge: View {
    public struct PrayerTime: Identifiable {
        public let id = UUID()
        public let prayer: Prayer
        public let timeHM: String       // "16:55"
        public let isPast: Bool
        public let isActive: Bool       // currently in progress (now between this and next)
        public init(prayer: Prayer, timeHM: String, isPast: Bool, isActive: Bool) {
            self.prayer = prayer; self.timeHM = timeHM
            self.isPast = isPast; self.isActive = isActive
        }
    }

    public let activePrayer: Prayer        // currently in progress (drives "NOW" row text)
    public let nextPrayer: Prayer          // upcoming prayer (drives sky band — matches Medium widget)
    public let state: NuurState            // countdown bucket (drives sky blend toward upcoming)
    public let nextPrayerEn: String        // upcoming prayer name (for "UNTIL X")
    public let countdownH: String
    public let countdownM: String
    public let location: String
    public let hijri: String
    public let times: [PrayerTime]         // 5 entries, Fajr..Isha
    public let verseAr: String
    public let verseRef: String
    /// Window the current verse belongs to ("FAJR" / "DHUHR" / …). Drives the
    /// "VERSE FOR {WINDOW}" header on the bottom verse block. Empty string
    /// renders the old "VERSE OF THE DAY" wording (preview / fallback only).
    public let verseWindow: String
    public let todayDone: Int
    public let todayTotal: Int
    public let streakDays: Int
    public let weekPct: Int
    public let width: CGFloat
    public let height: CGFloat
    /// When set, the "until next" countdown ticks live with seconds.
    public let targetDate: Date?
    /// True only for the first ~15 min of the active prayer's window.
    /// Drives whether the "● NOW · IN PROGRESS" pill renders.
    public let activeIsFresh: Bool

    public init(activePrayer: Prayer, nextPrayer: Prayer, state: NuurState, nextPrayerEn: String,
                countdownH: String, countdownM: String,
                location: String, hijri: String,
                times: [PrayerTime],
                verseAr: String, verseRef: String,
                verseWindow: String = "",
                todayDone: Int, todayTotal: Int,
                streakDays: Int, weekPct: Int,
                width: CGFloat, height: CGFloat,
                targetDate: Date? = nil,
                activeIsFresh: Bool = true) {
        self.activePrayer = activePrayer; self.nextPrayer = nextPrayer
        self.state = state
        self.nextPrayerEn = nextPrayerEn
        self.countdownH = countdownH; self.countdownM = countdownM
        self.location = location; self.hijri = hijri
        self.times = times; self.verseAr = verseAr; self.verseRef = verseRef
        self.verseWindow = verseWindow
        self.todayDone = todayDone; self.todayTotal = todayTotal
        self.streakDays = streakDays; self.weekPct = weekPct
        self.width = width; self.height = height
        self.targetDate = targetDate
        self.activeIsFresh = activeIsFresh
    }

    private var skyHeight: CGFloat { height * 0.34 }
    private var skin: Skin { nextPrayer.skin }
    private var glyph: GlyphParams { glyphParams(for: .normal) }

    public var body: some View {
        ZStack(alignment: .top) {
            // 1. Sky background band (top ~34%)
            VStack(spacing: 0) {
                ZStack(alignment: .topTrailing) {
                    SkyBand(prayer: nextPrayer, state: state,
                            height: skyHeight, cornerRadius: 0)
                    Group {
                        if skin == .day {
                            SunGlyph(size: glyph.size * 0.95, intensity: glyph.intensity)
                        } else {
                            MoonGlyph(size: glyph.size * 0.95, intensity: glyph.intensity,
                                      cutColor: skyHorizonFor(prayer: nextPrayer, state: state))
                        }
                    }
                    .padding(.top, 18)
                    .padding(.trailing, 22)
                }
                .frame(height: skyHeight)

                // Card body fills the rest
                Color.clear
            }
            .background(NuurTheme.surface)

            // 2. Foreground content
            VStack(spacing: 0) {
                header
                Spacer().frame(height: skyHeight - 50)
                nowRow
                Spacer().frame(height: 14)
                prayerStrip
                Spacer().frame(height: 18)
                statsRow
                Spacer(minLength: 10)
                verseBlock
            }
            .padding(.horizontal, 16)
            .padding(.top, 14)
            .padding(.bottom, 14)
        }
        .frame(width: width, height: height)
    }

    // MARK: - Header (city + Hijri, top-left)
    private var header: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 3) {
                Text(location)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(NuurTheme.text.opacity(0.95))
                Text(hijri.uppercased())
                    .font(.system(size: 9, weight: .bold))
                    .tracking(1.2)
                    .foregroundColor(NuurTheme.text.opacity(0.75))
            }
            Spacer()
        }
    }

    // MARK: - NOW · IN PROGRESS row
    private var nowRow: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Pill auto-hides 15 min after the active prayer's start time so
            // the widget doesn't claim you're "in" Sunrise at 2pm.
            if activeIsFresh {
                HStack(spacing: 6) {
                    Circle()
                        .fill(NuurTheme.gold)
                        .frame(width: 6, height: 6)
                    Text("NOW · IN PROGRESS")
                        .font(.system(size: 9, weight: .bold))
                        .tracking(1.4)
                        .foregroundColor(NuurTheme.gold)
                }
            }
            HStack(alignment: .firstTextBaseline) {
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text(activePrayer.en)
                        .font(.system(size: 26, weight: .semibold, design: .serif))
                        .foregroundColor(NuurTheme.text)
                        .lineLimit(1)
                        .minimumScaleFactor(0.55)
                    Text(activePrayer.ar)
                        .font(.system(size: 22, weight: .regular))
                        .foregroundColor(NuurTheme.text.opacity(0.85))
                        .lineLimit(1)
                        .minimumScaleFactor(0.55)
                }
                .layoutPriority(1)
                Spacer(minLength: 6)
                VStack(alignment: .trailing, spacing: 2) {
                    if let target = targetDate {
                        // Live ticking H:MM:SS — system-managed, no per-second
                        // timeline refresh required.
                        Text(timerInterval: Date()...target, countsDown: true)
                            .font(.system(size: 22, weight: .light, design: .serif))
                            .foregroundColor(NuurTheme.text)
                            .monospacedDigit()
                            .multilineTextAlignment(.trailing)
                    } else {
                        HStack(alignment: .firstTextBaseline, spacing: 2) {
                            Text(countdownH).font(.system(size: 22, weight: .light, design: .serif))
                                .foregroundColor(NuurTheme.text)
                            Text("h").font(.system(size: 12, weight: .semibold))
                                .foregroundColor(NuurTheme.gold)
                            Text(countdownM).font(.system(size: 22, weight: .light, design: .serif))
                                .foregroundColor(NuurTheme.text)
                                .padding(.leading, 4)
                            Text("m").font(.system(size: 12, weight: .semibold))
                                .foregroundColor(NuurTheme.gold)
                        }
                    }
                    Text("UNTIL \(nextPrayerEn.uppercased())")
                        .font(.system(size: 8, weight: .bold))
                        .tracking(1.2)
                        .foregroundColor(NuurTheme.textSecondary)
                }
            }
        }
    }

    // MARK: - 5-prayer strip
    private var prayerStrip: some View {
        HStack(spacing: 6) {
            ForEach(times) { pt in
                prayerPill(pt)
            }
        }
    }

    private func prayerPill(_ pt: DailyCompanionLarge.PrayerTime) -> some View {
        let active = pt.isActive
        let dim = pt.isPast && !active
        return VStack(spacing: 4) {
            Text(pt.prayer.en)
                .font(.system(size: 9, weight: .bold))
                .tracking(1.0)
                .foregroundColor(active ? NuurTheme.gold
                                 : dim ? NuurTheme.text.opacity(0.4)
                                 : NuurTheme.text.opacity(0.7))
            Text(pt.timeHM)
                .font(.system(size: 13, weight: .semibold, design: .serif))
                .foregroundColor(active ? NuurTheme.text
                                 : dim ? NuurTheme.text.opacity(0.4)
                                 : NuurTheme.text.opacity(0.9))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(active ? NuurTheme.surfaceElevated : Color.clear)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .stroke(active ? NuurTheme.gold.opacity(0.7) : Color.clear,
                        lineWidth: 1)
        )
    }

    // MARK: - Stats row (3 columns)
    private var statsRow: some View {
        HStack(spacing: 0) {
            statCell(value: "\(todayDone) of \(todayTotal)", label: "TODAY")
            divider
            statCell(value: "\(streakDays)d", label: "STREAK")
            divider
            statCell(value: "\(weekPct)%", label: "THIS WEEK")
        }
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(NuurTheme.surfaceElevated.opacity(0.55))
        )
    }

    private var divider: some View {
        Rectangle()
            .fill(NuurTheme.border)
            .frame(width: 1, height: 22)
    }

    private func statCell(value: String, label: String) -> some View {
        VStack(spacing: 3) {
            Text(value)
                .font(.system(size: 15, weight: .semibold, design: .serif))
                .foregroundColor(NuurTheme.text)
            Text(label)
                .font(.system(size: 8, weight: .bold))
                .tracking(1.2)
                .foregroundColor(NuurTheme.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Verse of the day (Arabic, centered)
    private var verseBlock: some View {
        VStack(spacing: 4) {
            Text("VERSE OF THE MOMENT · \(verseRef)")
                .font(.system(size: 7.5, weight: .bold))
                .tracking(1.4)
                .foregroundColor(NuurTheme.gold.opacity(0.85))
            Text(verseAr)
                .font(.system(size: 15, weight: .regular))
                .foregroundColor(NuurTheme.text.opacity(0.92))
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 4)
    }
}
