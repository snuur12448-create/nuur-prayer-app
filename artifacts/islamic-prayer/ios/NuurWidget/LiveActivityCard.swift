import SwiftUI

/// Lock-screen Live Activity card. Sky fills the entire card edge-to-edge.
/// Mirrors the latest `nuur-v1-widgets.html` Lock Screen spec:
///   - Top-left: Nuur brand
///   - Top-right: LOCATION + hijri
///   - Bottom-left: UNTIL X eyebrow + serif countdown
///   - Bottom-right: Prayer name (serif) + Arabic + AT HH:MM
public struct LiveActivityCard: View {
    public let state: NuurState
    public let skin: Skin
    public let prayerEn: String
    public let prayerAr: String
    public let nextAt: String
    public let countdownH: String
    public let countdownM: String
    public let countdownLabel: String
    public let location: String
    public let hijri: String
    public let width: CGFloat
    public let height: CGFloat
    public let chromeless: Bool
    /// Optional — when set, the card renders a live ticking H:MM:SS countdown
    /// instead of static "Hh Mm" text.
    public let targetDate: Date?

    public init(state: NuurState, skin: Skin,
                prayerEn: String, prayerAr: String, nextAt: String,
                countdownH: String, countdownM: String, countdownLabel: String,
                location: String, hijri: String,
                width: CGFloat = 358, height: CGFloat = 160,
                chromeless: Bool = false,
                targetDate: Date? = nil) {
        self.state = state
        self.skin = skin
        self.prayerEn = prayerEn
        self.prayerAr = prayerAr
        self.nextAt = nextAt
        self.countdownH = countdownH
        self.countdownM = countdownM
        self.countdownLabel = countdownLabel
        self.location = location
        self.hijri = hijri
        self.width = width
        self.height = height
        self.chromeless = chromeless
        self.targetDate = targetDate
    }

    public var body: some View {
        let isT0 = state == .t0
        let cardHeight: CGFloat = isT0 ? max(height, 178) : height
        let ring = ringed(state: state)
        let accentColor = accent(for: state)
        let g = glyphParams(for: state)
        let cardCorner: CGFloat = chromeless ? 0 : 22
        // Derive the upcoming prayer from `prayerEn` so the sky picks the
        // right per-prayer palette. Falls back to .asr if the string is
        // unrecognised (shouldn't happen in production payloads).
        let prayer = Prayer(rawValue: prayerEn.lowercased()) ?? .asr

        return ZStack(alignment: .topLeading) {
            // 1. Full-bleed sky gradient (covers entire card)
            SkyBand(prayer: prayer, state: state, height: cardHeight, cornerRadius: cardCorner)

            // 2. Bottom vignette for text legibility
            LinearGradient(
                stops: [
                    .init(color: .black.opacity(0.0),  location: 0.35),
                    .init(color: .black.opacity(0.30), location: 0.75),
                    .init(color: .black.opacity(0.55), location: 1.00),
                ],
                startPoint: .top, endPoint: .bottom
            )
            .allowsHitTesting(false)

            // 3. Celestial glyph — right side, upper-mid area
            Group {
                if skin == .day {
                    SunGlyph(size: g.size, intensity: g.intensity)
                } else {
                    MoonGlyph(size: g.size, intensity: g.intensity,
                              cutColor: skyHorizonFor(prayer: prayer, state: state))
                }
            }
            .position(x: width - g.size * 0.55 - 18,
                      y: cardHeight * g.arcT)

            // 4. Soft glow ring on T-1 / T-30 only
            if ring && !chromeless {
                RoundedRectangle(cornerRadius: cardCorner, style: .continuous)
                    .stroke(accentColor.opacity(0.42), lineWidth: 1.2)
                    .shadow(color: accentColor.opacity(0.40), radius: 10)
            }

            // 5. Foreground content
            if isT0 {
                ceremonialContent(accent: accentColor)
            } else {
                standardContent(accent: accentColor)
            }
        }
        .frame(width: width, height: cardHeight)
        .clipShape(RoundedRectangle(cornerRadius: cardCorner, style: .continuous))
    }

    // MARK: - Standard content (Normal / T-30 / T-10 / T-1)
    @ViewBuilder
    private func standardContent(accent accentColor: Color) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            // Top row — location + hijri, left-aligned (matches large widget)
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(location)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(NuurTheme.text.opacity(0.95))
                    Text(hijri.uppercased())
                        .font(.system(size: 9, weight: .semibold))
                        .tracking(0.8)
                        .foregroundColor(NuurTheme.text.opacity(0.55))
                }
                Spacer()
            }

            Spacer(minLength: 0)

            // Bottom row
            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(countdownLabel)
                        .font(.system(size: 10, weight: .bold))
                        .tracking(2)
                        .foregroundColor(accentColor)
                    CountdownText(
                        state: state,
                        countdownH: countdownH,
                        countdownM: countdownM,
                        size: 38,
                        color: NuurTheme.text,
                        targetDate: targetDate
                    )
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    HStack(alignment: .firstTextBaseline, spacing: 6) {
                        Text(prayerEn)
                            .font(.system(size: 22, weight: .regular, design: .serif))
                            .foregroundColor(NuurTheme.text)
                        Text(prayerAr)
                            .font(.system(size: 16))
                            .foregroundColor(accentColor)
                    }
                    Text("at \(nextAt)")
                        .font(.system(size: 10, weight: .medium))
                        .tracking(0.6)
                        .foregroundColor(NuurTheme.text.opacity(0.65))
                }
            }
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 14)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Ceremony content (T-0)
    @ViewBuilder
    private func ceremonialContent(accent accentColor: Color) -> some View {
        VStack(spacing: 8) {
            Spacer()
            HStack(spacing: 6) {
                Circle()
                    .fill(NuurTheme.gold)
                    .frame(width: 6, height: 6)
                    .shadow(color: NuurTheme.gold.opacity(0.8), radius: 4)
                Text("NOW · TIME TO PRAY")
                    .font(.system(size: 9, weight: .bold))
                    .tracking(2)
                    .foregroundColor(accentColor)
            }
            .padding(.bottom, 4)
            Text("Time for \(prayerEn)")
                .font(.system(size: 28, weight: .medium, design: .serif))
                .italic()
                .foregroundColor(NuurTheme.text)
            Text("حان وقت \(prayerAr)")
                .font(.system(size: 22))
                .foregroundColor(accentColor)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Convenience initializer from ContentState
public extension LiveActivityCard {
    init(contentState: NuurAttributes.ContentState, attributes: NuurAttributes,
         width: CGFloat = 358, height: CGFloat = 160, chromeless: Bool = false) {
        self.init(
            state: contentState.stateEnum,
            skin: contentState.skinEnum,
            prayerEn: contentState.prayerEn,
            prayerAr: contentState.prayerAr,
            nextAt: contentState.nextAt,
            countdownH: contentState.countdownH,
            countdownM: contentState.countdownM,
            countdownLabel: contentState.countdownLabel,
            location: attributes.location,
            hijri: attributes.hijri,
            width: width,
            height: height,
            chromeless: chromeless
        )
    }
}
