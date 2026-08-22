import SwiftUI

public enum SkyPalette {
    public static let fajr:    [UInt32] = [0x06081C, 0x0E0F2A, 0x2D1A3A, 0x4A2A3E]
    public static let sunrise: [UInt32] = [0x1A2B4A, 0x3D4F70, 0xA87B5A, 0xE4A579]
    public static let dhuhr:   [UInt32] = [0x1B3A5E, 0x3A6B9E, 0x7BB0DC, 0xB5DBED]
    public static let asr:     [UInt32] = [0x2A2545, 0x5A3E5A, 0xA06840, 0xD89055]
    public static let maghrib: [UInt32] = [0x1A1530, 0x3A1F2E, 0x7A3826, 0xC26835]
    public static let isha:    [UInt32] = [0x02030E, 0x060820, 0x0A0E2A, 0x101638]

    public static func blend(_ a: [UInt32], _ b: [UInt32], t: Double) -> [Color] {
        zip(a, b).map { lhs, rhs in mixHex(lhs, rhs, t: t) }
    }

    public static func toColors(_ hexes: [UInt32]) -> [Color] {
        hexes.map { Color(hex: $0) }
    }

    private static func mixHex(_ a: UInt32, _ b: UInt32, t: Double) -> Color {
        let ar = Double((a >> 16) & 0xFF), ag = Double((a >> 8) & 0xFF), ab = Double(a & 0xFF)
        let br = Double((b >> 16) & 0xFF), bg = Double((b >> 8) & 0xFF), bb = Double(b & 0xFF)
        return Color(.sRGB,
            red:   (ar + (br - ar) * t) / 255.0,
            green: (ag + (bg - ag) * t) / 255.0,
            blue:  (ab + (bb - ab) * t) / 255.0,
            opacity: 1.0)
    }
}

public func paletteForState(skin: Skin, state: NuurState) -> [Color] {
    if skin == .day {
        switch state {
        case .normal: return SkyPalette.toColors(SkyPalette.dhuhr)
        case .t30:    return SkyPalette.blend(SkyPalette.dhuhr, SkyPalette.asr, t: 0.35)
        case .t10:    return SkyPalette.blend(SkyPalette.dhuhr, SkyPalette.asr, t: 0.70)
        case .t1:     return SkyPalette.toColors(SkyPalette.asr)
        case .t0:     return SkyPalette.blend(SkyPalette.asr, SkyPalette.maghrib, t: 0.35)
        }
    } else {
        switch state {
        case .normal: return SkyPalette.toColors(SkyPalette.isha)
        case .t30:    return SkyPalette.blend(SkyPalette.isha, SkyPalette.fajr, t: 0.55)
        case .t10:    return SkyPalette.blend(SkyPalette.isha, SkyPalette.fajr, t: 0.80)
        case .t1:     return SkyPalette.toColors(SkyPalette.fajr)
        case .t0:     return SkyPalette.blend(SkyPalette.fajr, SkyPalette.sunrise, t: 0.60)
        }
    }
}

public func skyHorizon(skin: Skin, state: NuurState) -> Color {
    paletteForState(skin: skin, state: state).first ?? .black
}

private func currentHexes(for prayer: Prayer) -> [UInt32] {
    switch prayer {
    case .fajr:    return SkyPalette.isha
    case .sunrise: return SkyPalette.fajr
    case .dhuhr:   return SkyPalette.sunrise
    case .asr:     return SkyPalette.dhuhr
    case .maghrib: return SkyPalette.asr
    case .isha:    return SkyPalette.maghrib
    }
}

private func upcomingHexes(for prayer: Prayer) -> [UInt32] {
    switch prayer {
    case .fajr:    return SkyPalette.fajr
    case .sunrise: return SkyPalette.sunrise
    case .dhuhr:   return SkyPalette.dhuhr
    case .asr:     return SkyPalette.asr
    case .maghrib: return SkyPalette.maghrib
    case .isha:    return SkyPalette.isha
    }
}

private func nextHexes(for prayer: Prayer) -> [UInt32] {
    switch prayer {
    case .fajr:    return SkyPalette.sunrise
    case .sunrise: return SkyPalette.dhuhr
    case .dhuhr:   return SkyPalette.asr
    case .asr:     return SkyPalette.maghrib
    case .maghrib: return SkyPalette.isha
    case .isha:    return SkyPalette.fajr
    }
}

public func paletteFor(prayer: Prayer, state: NuurState) -> [Color] {
    let curr = currentHexes(for: prayer)
    let upco = upcomingHexes(for: prayer)
    let next = nextHexes(for: prayer)
    let isNight = prayer.skin == .night
    switch state {
    case .normal: return SkyPalette.toColors(curr)
    case .t30:    return SkyPalette.blend(curr, upco, t: isNight ? 0.55 : 0.35)
    case .t10:    return SkyPalette.blend(curr, upco, t: isNight ? 0.80 : 0.70)
    case .t1:     return SkyPalette.toColors(upco)
    case .t0:     return SkyPalette.blend(upco, next, t: isNight ? 0.60 : 0.35)
    }
}

public func skyHorizonFor(prayer: Prayer, state: NuurState) -> Color {
    paletteFor(prayer: prayer, state: state).first ?? .black
}
