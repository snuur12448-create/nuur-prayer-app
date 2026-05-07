import SwiftUI

/// The main reusable Nuur card. Used by:
///   – Lock-screen Live Activity (358 × 160, 178 at T-0)
///   – Dynamic Island expanded region
///   – Home medium widget (scaled)
///
/// Mirrors `LiveActivityCard` in `_shared.tsx` 1:1.
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

    public init(state: NuurState, skin: Skin,
                prayerEn: String, prayerAr: String, nextAt: String,
                countdownH: String, countdownM: String, countdownLabel: String,
                location: String, hijri: String,
                width: CGFloat = 358, height: CGFloat = 160) {
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
    }

    public var body: some View {
        let isT0 = state == .t0
        let cardHeight: CGFloat = isT0 ? max(height, 178) : height
        let ring = ringed(state: state)
        let accentColor = accent(for: state)
        let g = glyphParams(for: state)
        let sky = skyHeight(for: state)
        let glyphPt = arcPoint(width: width, skyHeight: sky, t: g.arcT)

        return ZStack(alignment: .topLeading) {
            // Card surface
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(NuurTheme.surface)
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(NuurTheme.border, lineWidth: 0.5)
                )
                .shadow(color: .black.opacity(ring ? 0.40 : 0.30),
                        radius: ring ? 24 : 14, x: 0, y: 8)
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(accentColor.opacity(ring ? 0.33 : 0), lineWidth: 1)
                )

            // Sky band
            SkyBand(skin: skin, state: state)

            // Gold corner glow (top-right) — fakes a soft warm radial highlight.
            // RadialGradient clipped to a small circle in the top-right corner.
            Circle()
                .fill(RadialGradient(
                    stops: [
                        .init(color: NuurTheme.gold.opacity(ring ? 0.34 : 0.22), location: 0),
                        .init(color: NuurTheme.gold.opacity(0), location: 0.65),
                    ],
                    center: .center,
                    startRadius: 0,
                    endRadius: 55
                ))
                .frame(width: 110, height: 110)
                .offset(x: width - 60, y: -20)
                .blendMode(.screen)
                .allowsHitTesting(false)

            // Celestial body riding the dashed arc
            Group {
                if skin == .day {
                    SunGlyph(size: g.size, intensity: g.intensity)
                } else {
                    MoonGlyph(size: g.size, intensity: g.intensity,
                              cutColor: skyHorizon(skin: skin, state: state))
                }
            }
            .position(x: glyphPt.x, y: glyphPt.y)

            // Foreground content
            if isT0 {
                ceremonialContent(accent: accentColor)
            } else {
                standardContent(accent: accentColor, ringed: ring)
            }
        }
        .frame(width: width, height: cardHeight)
    }

    @ViewBuilder
    private func ceremonialContent(accent accentColor: Color) -> some View {
        VStack(spacing: 4) {
            Spacer().frame(height: 90)
            Text(eyebrow(state: state, countdownLabel: countdownLabel))
                .font(.system(size: 9, weight: .bold))
                .tracking(2)
                .foregroundColor(accentColor.opacity(0.95))
                .padding(.bottom, 6)
            Text("Time for \(prayerEn)")
                .font(.system(size: 26, weight: .medium, design: .serif))
                .italic()
                .foregroundColor(NuurTheme.text)
                .lineSpacing(0)
            Text("حان وقت \(prayerAr)")
                .font(.system(size: 22))
                .foregroundColor(accentColor)
            Spacer().frame(height: 14)
        }
        .frame(maxWidth: .infinity)
    }

    @ViewBuilder
    private func standardContent(accent accentColor: Color, ringed ring: Bool) -> some View {
        HStack(alignment: .bottom, spacing: 12) {
            // Left column
            VStack(alignment: .leading, spacing: 2) {
                Text(eyebrow(state: state, countdownLabel: countdownLabel))
                    .font(.system(size: 9, weight: .bold))
                    .tracking(2)
                    .foregroundColor(accentColor)
                    .padding(.bottom, 4)
                CountdownText(
                    state: state,
                    countdownH: countdownH,
                    countdownM: countdownM,
                    size: 38,
                    color: ring ? accentColor : NuurTheme.text
                )
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text(prayerEn)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(NuurTheme.text)
                    Text(prayerAr)
                        .font(.system(size: 15))
                        .foregroundColor(accentColor)
                }
                .padding(.top, 2)
            }
            Spacer()
            // Right column
            VStack(alignment: .trailing, spacing: 5) {
                Text(location.uppercased())
                    .font(.system(size: 9, weight: .bold))
                    .tracking(1.4)
                    .foregroundColor(NuurTheme.textSecondary)
                Text(hijri)
                    .font(.system(size: 9, weight: .semibold))
                    .tracking(0.8)
                    .foregroundColor(NuurTheme.textMute)
                Text(nextAt)
                    .font(.system(size: 17, weight: .semibold, design: .serif))
                    .foregroundColor(NuurTheme.text)
                    .monospacedDigit()
                    .padding(.top, 2)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
    }
}

// MARK: - Convenience initializer from ContentState
public extension LiveActivityCard {
    init(contentState: NuurAttributes.ContentState, attributes: NuurAttributes,
         width: CGFloat = 358, height: CGFloat = 160) {
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
            height: height
        )
    }
}
