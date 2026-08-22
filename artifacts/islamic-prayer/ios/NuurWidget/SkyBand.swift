import SwiftUI

/// Sky gradient at the top of the card. Mirrors the JS mockup `SkyBand`:
/// 4 in-app palette stops in the top 70%, then a soft fade to transparent
/// in the bottom 30% so the sky bleeds into the card surface (no horizon line).
/// (Dashed-arc reference removed — the celestial glyph is positioned by
/// `glyphParams.arcT` directly, no visible arc track is needed.)
public struct SkyBand: View {
    public let prayer: Prayer
    public let state: NuurState
    public let height: CGFloat
    public let cornerRadius: CGFloat

    public init(prayer: Prayer, state: NuurState,
                height: CGFloat? = nil, cornerRadius: CGFloat = 22) {
        self.prayer = prayer
        self.state = state
        self.height = height ?? skyHeight(for: state)
        self.cornerRadius = cornerRadius
    }

    public var body: some View {
        let palette = paletteFor(prayer: prayer, state: state)
        let bottom = palette.last ?? .black
        let gradient = LinearGradient(
            stops: [
                .init(color: palette[0],          location: 0.00),
                .init(color: palette[1],          location: 0.28),
                .init(color: palette[2],          location: 0.50),
                .init(color: palette[3],          location: 0.68),
                .init(color: bottom.opacity(0.55), location: 0.82),
                .init(color: bottom.opacity(0.20), location: 0.92),
                .init(color: bottom.opacity(0.00), location: 1.00),
            ],
            startPoint: .top, endPoint: .bottom
        )
        let showStars = prayer.skin == .night
            && (state == .normal || state == .t10 || state == .t30)

        ZStack(alignment: .topLeading) {
            gradient
            if showStars {
                StarField()
            }
        }
        .frame(height: height)
        .clipShape(
            UnevenRoundedRectangle(
                topLeadingRadius: cornerRadius,
                bottomLeadingRadius: 0,
                bottomTrailingRadius: 0,
                topTrailingRadius: cornerRadius
            )
        )
        .allowsHitTesting(false)
    }
}
/// 7 tiny stars sprinkled across the upper sky for night states.
private struct StarField: View {
    private let stars: [(CGFloat, CGFloat, CGFloat, Double)] = [
        (0.13, 0.18, 0.8, 0.60),
        (0.27, 0.32, 0.6, 0.40),
        (0.40, 0.12, 0.5, 0.50),
        (0.53, 0.22, 0.7, 0.55),
        (0.67, 0.36, 0.5, 0.40),
        (0.74, 0.16, 0.6, 0.50),
        (0.90, 0.28, 0.7, 0.55),
    ]
    var body: some View {
        GeometryReader { geo in
            ForEach(0..<stars.count, id: \.self) { i in
                let s = stars[i]
                Circle()
                    .fill(Color(red: 220/255, green: 232/255, blue: 1.0))
                    .frame(width: s.2 * 2, height: s.2 * 2)
                    .position(x: geo.size.width * s.0,
                              y: geo.size.height * s.1)
                    .opacity(s.3)
            }
        }
    }
}
