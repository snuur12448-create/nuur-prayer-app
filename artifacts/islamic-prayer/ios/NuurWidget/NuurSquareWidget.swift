import SwiftUI
import WidgetKit

// MARK: - Theme accent
// User-selected theme name (from JS THEMES) → small-widget accent + bottom tint.
// Sky band stays true to the actual prayer; only the chrome (NOW dot, UNTIL
// label, h/m markers, bottom card tint) follows the theme.
private struct SquareAccent {
    let dot: Color           // NOW indicator
    let eyebrow: Color       // "UNTIL ASR" label
    let unit: Color          // small "h" / "m" markers
    let bgTop: Color         // top of bottom-half card tint
    let bgBot: Color         // bottom of bottom-half card tint
}

private func squareAccent(for themeName: String?) -> SquareAccent {
    switch themeName ?? "" {
    case "midnight":
        return SquareAccent(
            dot:     Color(hex: 0x9CC2F5),
            eyebrow: Color(hex: 0x9CC2F5).opacity(0.85),
            unit:    Color(hex: 0xE8F0FF).opacity(0.78),
            bgTop:   Color(hex: 0x0E1828),
            bgBot:   Color(hex: 0x08101E)
        )
    case "slate":
        return SquareAccent(
            dot:     Color(hex: 0xB5C5D6),
            eyebrow: Color(hex: 0xB5C5D6).opacity(0.85),
            unit:    Color(hex: 0xE6ECF3).opacity(0.85),
            bgTop:   Color(hex: 0x1B2733),
            bgBot:   Color(hex: 0x131C26)
        )
    case "burgundy":
        return SquareAccent(
            dot:     Color(hex: 0xF26FA8),
            eyebrow: Color(hex: 0xE881B0).opacity(0.90),
            unit:    Color(hex: 0xF49AC0),
            bgTop:   Color(hex: 0x2B1219),
            bgBot:   Color(hex: 0x1A0A10)
        )
    case "gold":
        return SquareAccent(
            dot:     NuurTheme.gold,
            eyebrow: NuurTheme.gold.opacity(0.90),
            unit:    NuurTheme.gold,
            bgTop:   Color(hex: 0x1C1505),
            bgBot:   Color(hex: 0x120E03)
        )
    default: // "emerald" + unknown
        return SquareAccent(
            dot:     NuurTheme.gold,
            eyebrow: NuurTheme.gold.opacity(0.90),
            unit:    NuurTheme.gold,
            bgTop:   Color(hex: 0x111F14),
            bgBot:   Color(hex: 0x0A1A0E)
        )
    }
}

// MARK: - Square card view
// Two-band layout:
//   • Top ~46%: gentle SkyBand (no arch), small sun/moon glyph + NOW pill
//   • Bottom ~54%: themed surface with active prayer name + UNTIL countdown
struct NuurSquareCard: View {
    let entry: NuurEntry
    let width: CGFloat
    let height: CGFloat

    var body: some View {
        let accent = squareAccent(for: entry.themeName)
        let skyHeight = height * 0.46
        let active = entry.activePrayer
        let next = entry.nextPrayer

        ZStack(alignment: .topLeading) {
            // Bottom themed surface fills the whole card; sky overlays the top.
            LinearGradient(
                colors: [accent.bgTop, accent.bgBot],
                startPoint: .top, endPoint: .bottom
            )

            // Sky band — uses NEXT prayer so the sky matches what's coming
            // (matches the larger widgets).
            SkyBand(prayer: next, state: .normal,
                    height: skyHeight, cornerRadius: 0)

            // Small celestial glyph, top-left
            Group {
                if next.skin == .day {
                    SunGlyph(size: 18, intensity: 1)
                } else {
                    MoonGlyph(size: 18, intensity: 1,
                              cutColor: accent.bgTop)
                }
            }
            .position(x: 22, y: skyHeight * 0.42)

            // NOW pill, top-right
            HStack(spacing: 4) {
                Circle()
                    .fill(accent.dot)
                    .frame(width: 5, height: 5)
                    .shadow(color: accent.dot.opacity(0.7), radius: 3)
                Text("NOW")
                    .font(.system(size: 9.5, weight: .bold))
                    .tracking(1.4)
                    .foregroundColor(accent.dot)
            }
            .padding(.horizontal, 7)
            .padding(.vertical, 3.5)
            .background(
                Capsule().fill(Color.black.opacity(0.28))
            )
            .position(x: width - 32, y: 16)

            // Foreground content — active prayer + UNTIL countdown
            VStack(alignment: .leading, spacing: 0) {
                Spacer(minLength: 0)

                // Active prayer name (big serif)
                Text(active.en)
                    .font(.system(size: 26, weight: .regular, design: .serif))
                    .foregroundColor(NuurTheme.text)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                    .padding(.bottom, 6)

                // UNTIL [next] eyebrow
                Text("UNTIL \(next.en.uppercased())")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(1.8)
                    .foregroundColor(accent.eyebrow)
                    .padding(.bottom, 1)

                // Countdown row: number serif, themed h/m markers
                squareCountdown(
                    h: entry.countdownH, m: entry.countdownM,
                    target: entry.targetDate, unitColor: accent.unit
                )
            }
            .padding(.horizontal, 14)
            .padding(.bottom, 12)
            .frame(width: width, height: height, alignment: .bottomLeading)
        }
        .frame(width: width, height: height)
    }
}

// Live H:MM:SS countdown — uses the system timer so it ticks every second
// (widgets can't refresh that fast otherwise). `unitColor` kept for signature
// parity but unused: the system timer renders as a single styled string.
@ViewBuilder
private func squareCountdown(h: String, m: String,
                             target: Date, unitColor: Color) -> some View {
    let size: CGFloat = 28
    Text(timerInterval: Date()...target, countsDown: true)
        .font(.system(size: size, weight: .regular, design: .serif))
        .foregroundColor(NuurTheme.text)
        .monospacedDigit()
        .multilineTextAlignment(.leading)
        .lineLimit(1)
        .minimumScaleFactor(0.78)
}

// MARK: - Widget body
struct NuurSquareWidgetView: View {
    var entry: NuurEntry
    var body: some View {
        GeometryReader { geo in
            NuurSquareCard(entry: entry,
                           width: geo.size.width,
                           height: geo.size.height)
        }
        .containerBackground(NuurTheme.surface, for: .widget)
    }
}

// MARK: - Widget
// Reuses the existing NuurProvider (medium/large) so it inherits all the
// snapshot-decoding + per-minute timeline scheduling for free. Just renders
// a different view for the systemSmall family.
struct NuurSquareWidget: Widget {
    let kind: String = "NuurSquareWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self,
                               provider: NuurProvider()) { entry in
            NuurSquareWidgetView(entry: entry)
        }
        .configurationDisplayName("Nuur Prayer · Square")
        .description("Active prayer with a themed countdown to the next.")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

#Preview(as: .systemSmall) {
    NuurSquareWidget()
} timeline: {
    NuurProvider.sample(.dhuhr, state: .normal)
    NuurProvider.sample(.asr,   state: .normal)
    NuurProvider.sample(.isha,  state: .normal)
}
