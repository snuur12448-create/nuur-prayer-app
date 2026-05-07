import SwiftUI

/// Sun — outer gold halo + warm-cream core. 24×24 by default; scales linearly.
public struct SunGlyph: View {
    public let size: CGFloat
    public let opacity: Double
    public let intensity: Double

    public init(size: CGFloat = 22, opacity: Double = 1, intensity: Double = 1) {
        self.size = size
        self.opacity = opacity
        self.intensity = intensity
    }

    public var body: some View {
        let halo = RadialGradient(
            stops: [
                .init(color: Color(hex: 0xFFE9A8).opacity(min(0.95 * intensity, 1)),  location: 0.0),
                .init(color: NuurTheme.gold.opacity(min(0.50 * intensity, 0.9)),       location: 0.55),
                .init(color: NuurTheme.gold.opacity(0),                                 location: 1.0),
            ],
            center: .center,
            startRadius: 0,
            endRadius: size * 0.5
        )
        ZStack {
            Circle().fill(halo)
            Circle().fill(Color(hex: 0xFFF1C4)).opacity(0.92).frame(width: size * 0.48, height: size * 0.48)
            Circle().fill(Color(hex: 0xFFE9A8)).frame(width: size * 0.28, height: size * 0.28)
        }
        .frame(width: size, height: size)
        .opacity(opacity)
    }
}

/// Moon — cool halo + cream core + offset crescent cut filled with `cutColor`.
public struct MoonGlyph: View {
    public let size: CGFloat
    public let opacity: Double
    public let intensity: Double
    public let cutColor: Color

    public init(size: CGFloat = 22, opacity: Double = 1, intensity: Double = 1,
                cutColor: Color = NuurTheme.surface) {
        self.size = size
        self.opacity = opacity
        self.intensity = intensity
        self.cutColor = cutColor
    }

    public var body: some View {
        let halo = RadialGradient(
            stops: [
                .init(color: Color(hex: 0xF0E9D8).opacity(min(0.92 * intensity, 1)),   location: 0.0),
                .init(color: Color(hex: 0xD8C7A0).opacity(min(0.32 * intensity, 0.8)), location: 0.55),
                .init(color: Color(hex: 0xD8C7A0).opacity(0),                            location: 1.0),
            ],
            center: .center,
            startRadius: 0,
            endRadius: size * 0.5
        )
        ZStack {
            Circle().fill(halo)
            Circle().fill(Color(hex: 0xF0E9D8))
                .frame(width: size * 0.48, height: size * 0.48)
            Circle().fill(cutColor)
                .frame(width: size * 0.39, height: size * 0.39)
                .offset(x: -size * 2 / 24.0, y: -size * 0.4 / 24.0)
        }
        .frame(width: size, height: size)
        .opacity(opacity)
        .compositingGroup()
    }
}
