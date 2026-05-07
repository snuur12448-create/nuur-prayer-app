import SwiftUI

public enum Skin: String, Codable { case day, night }

public enum NuurState: String, Codable {
    case normal, t30, t10, t1, t0
}

/// Per-state sky band height (points). Mirrors `skyHeightForState` in JS mock.
public func skyHeight(for state: NuurState) -> CGFloat {
    switch state {
    case .normal: return 62
    case .t10:    return 68
    case .t1:     return 74
    case .t30:    return 80
    case .t0:     return 102
    }
}

/// Urgency-ramp accent color.
public func accent(for state: NuurState) -> Color {
    switch state {
    case .normal: return NuurTheme.gold
    case .t10:    return NuurTheme.goldLight
    case .t1:     return NuurTheme.gold
    case .t30:    return NuurTheme.amber
    case .t0:     return NuurTheme.gold
    }
}

/// Eyebrow text. `countdownLabel` comes from the prayer payload (e.g. "TO ASR").
public func eyebrow(state: NuurState, countdownLabel: String) -> String {
    state == .t0 ? "● NOW · TIME TO PRAY" : countdownLabel
}

/// Glyph size + brightness + arc fraction (0 = left horizon, 1 = right horizon).
public struct GlyphParams {
    public let size: CGFloat
    public let intensity: Double
    public let arcT: CGFloat
}

public func glyphParams(for state: NuurState) -> GlyphParams {
    switch state {
    case .normal: return .init(size: 24, intensity: 1.00, arcT: 0.55)
    case .t30:    return .init(size: 30, intensity: 1.10, arcT: 0.68)
    case .t10:    return .init(size: 32, intensity: 1.15, arcT: 0.78)
    case .t1:     return .init(size: 36, intensity: 1.20, arcT: 0.86)
    case .t0:     return .init(size: 44, intensity: 1.35, arcT: 0.92)
    }
}

/// Whether to draw the soft glow ring around the card (T-1 and T-30 only).
public func ringed(state: NuurState) -> Bool {
    state == .t1 || state == .t30
}
