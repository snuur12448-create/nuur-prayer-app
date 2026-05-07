import CoreGraphics

/// Position along the visible sky-band curve.
///
/// The dashed arc is a shallow slice of a huge circle whose true apex sits
/// far above the visible band — so we use a clean inverted parabola that
/// hugs what the eye reads as the horizon-to-horizon path:
///
///   t = 0   → low-left  (~70% down the band)
///   t = 0.5 → apex      (~15% down the band, just below top edge)
///   t = 1   → low-right (~70% down the band)
///
/// Returns the centre point in card pixels — caller offsets by glyph size/2.
public func arcPoint(width w: CGFloat, skyHeight h: CGFloat, t: CGFloat) -> CGPoint {
    let x = w * (0.08 + 0.84 * t)
    let k = 2 * t - 1                       // -1 at left, 0 apex, +1 right
    let y = h * (0.15 + 0.55 * k * k)       // inverted parabola
    return CGPoint(x: x, y: y)
}

/// 6 prayer-dot positions along the arc for `Home_Large_Arc`.
public let prayerArcStops: [CGFloat] = [0.04, 0.22, 0.50, 0.72, 0.88, 0.99]
