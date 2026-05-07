import SwiftUI

public enum NuurTheme {
    public static let appGroup = "group.com.nuur.shared"

    public static let bg              = Color(hex: 0x0A1A0E)
    public static let surface         = Color(hex: 0x111F14)
    public static let surfaceElevated = Color(hex: 0x172B1B)
    public static let prayerCard      = Color(hex: 0x152A1A)
    public static let border          = Color(hex: 0x1F3526)

    public static let text          = Color(hex: 0xF0EDE5)
    public static let textSecondary = Color(hex: 0x8FA99A)
    public static let textMute      = Color.white.opacity(0.45)

    public static let gold      = Color(hex: 0xF4C842)
    public static let goldLight = Color(hex: 0xF9D97A)
    public static let amber     = Color(hex: 0xF9A641)
    public static let red       = Color(hex: 0xE55555)
}

public enum NuurFont {
    public static let serif  = "Fraunces"
    public static let sans   = "Manrope"
    public static let arabic = "AmiriQuran"
}

public extension Color {
    init(hex: UInt32, alpha: Double = 1.0) {
        let r = Double((hex >> 16) & 0xFF) / 255.0
        let g = Double((hex >> 8)  & 0xFF) / 255.0
        let b = Double( hex        & 0xFF) / 255.0
        self.init(.sRGB, red: r, green: g, blue: b, opacity: alpha)
    }
}
