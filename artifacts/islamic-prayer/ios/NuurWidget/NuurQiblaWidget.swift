 import SwiftUI
import WidgetKit

// MARK: - Snapshot decoding
private struct QiblaSnapshot: Decodable {
    let qiblaBearing: Double?
    let location: String?
}

private enum QiblaSnapshotReader {
    static let suiteName = "group.com.nuur.shared"
    static let key = "nuur.prayerSnapshot"

    static func read() -> QiblaSnapshot? {
        guard let defaults = UserDefaults(suiteName: suiteName),
              let json = defaults.string(forKey: key),
              let data = json.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(QiblaSnapshot.self, from: data)
    }
}

// 0=N, 22.5..67.5=NE, etc. 8-point compass to match the mockup.
private func cardinal(for bearing: Double) -> String {
    let b = ((bearing.truncatingRemainder(dividingBy: 360)) + 360)
        .truncatingRemainder(dividingBy: 360)
    let segments = ["N","NE","E","SE","S","SW","W","NW"]
    let idx = Int(((b + 22.5) / 45.0).rounded(.down)) % 8
    return segments[idx]
}

// MARK: - Timeline entry
private struct QiblaEntry: TimelineEntry {
    let date: Date
    let bearing: Double?     // nil → "set up in app"
}

private struct QiblaProvider: TimelineProvider {
    func placeholder(in context: Context) -> QiblaEntry {
        QiblaEntry(date: Date(), bearing: 118)
    }
    func getSnapshot(in context: Context, completion: @escaping (QiblaEntry) -> Void) {
        completion(QiblaEntry(date: Date(),
                              bearing: QiblaSnapshotReader.read()?.qiblaBearing ?? 118))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<QiblaEntry>) -> Void) {
        let entry = QiblaEntry(date: Date(),
                               bearing: QiblaSnapshotReader.read()?.qiblaBearing)
        // Bearing changes very slowly with location, so refresh every 6h.
        let refresh = Date().addingTimeInterval(6 * 3600)
        completion(Timeline(entries: [entry], policy: .after(refresh)))
    }
}

// MARK: - Compass dial
private struct CompassDial: View {
    let bearing: Double
    let diameter: CGFloat

    var body: some View {
        ZStack {
            // Outer ring
            Circle()
                .stroke(NuurTheme.text.opacity(0.18), lineWidth: 1)
            // Inner ring
            Circle()
                .stroke(NuurTheme.text.opacity(0.10), lineWidth: 1)
                .padding(diameter * 0.18)

            // Cardinal letters (N/E/S/W) — positioned via trig so each label
            // stays upright instead of rotating with its placement angle.
            let r = diameter / 2 - 8
            ForEach(0..<4, id: \.self) { i in
                let label = ["N","E","S","W"][i]
                let angleRad = Double(i) * .pi / 2  // N=0, E=π/2, S=π, W=3π/2
                let x = CGFloat(sin(angleRad)) * r
                let y = -CGFloat(cos(angleRad)) * r
                Text(label)
                    .font(.system(size: 9, weight: .semibold, design: .rounded))
                    .tracking(0.5)
                    .foregroundColor(NuurTheme.text.opacity(0.55))
                    .offset(x: x, y: y)
            }

            // Kaaba marker (center square)
            RoundedRectangle(cornerRadius: 1.5)
                .fill(NuurTheme.text.opacity(0.92))
                .frame(width: 8, height: 8)

            // Qibla needle — gold arrow from center pointing at the bearing.
            QiblaNeedle(length: diameter * 0.42)
                .rotationEffect(.degrees(bearing), anchor: .center)
        }
        .frame(width: diameter, height: diameter)
    }
}

// Arrow shape: thin gold shaft + arrowhead, drawn pointing up at 0°.
private struct QiblaNeedle: View {
    let length: CGFloat
    var body: some View {
        ZStack {
            // Shaft
            Capsule()
                .fill(LinearGradient(
                    colors: [NuurTheme.goldLight, NuurTheme.gold],
                    startPoint: .center, endPoint: .top))
                .frame(width: 2.2, height: length)
                .offset(y: -length / 2)
            // Arrowhead (triangle)
            Triangle()
                .fill(NuurTheme.gold)
                .frame(width: 9, height: 10)
                .offset(y: -length + 4)
        }
        .shadow(color: NuurTheme.gold.opacity(0.55), radius: 4)
    }
}

private struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.midX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        p.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        p.closeSubpath()
        return p
    }
}

// MARK: - Widget body
private struct QiblaWidgetView: View {
    var entry: QiblaEntry

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            // Dial takes most of the card; eyebrow + degree label hug top/bottom.
            let dial = min(w, h) * 0.62

            ZStack {
                // Subtle inner card panel (matches the mockup's "card-in-card").
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(NuurTheme.surfaceElevated.opacity(0.55))
                    .padding(10)

                VStack(spacing: 0) {
                    // Top row: QIBLA / القبلة
                    HStack {
                        Text("QIBLA")
                            .font(.system(size: 9, weight: .semibold, design: .rounded))
                            .tracking(1.6)
                            .foregroundColor(NuurTheme.text.opacity(0.85))
                        Spacer()
                        Text("القبلة")
                            .font(.system(size: 10))
                            .foregroundColor(NuurTheme.gold.opacity(0.85))
                    }
                    .padding(.horizontal, 18)
                    .padding(.top, 16)

                    Spacer(minLength: 0)

                    if let b = entry.bearing {
                        CompassDial(bearing: b, diameter: dial)
                    } else {
                        Text("Open Nuur\nto set location")
                            .font(.system(size: 11, weight: .medium, design: .rounded))
                            .foregroundColor(NuurTheme.textSecondary)
                            .multilineTextAlignment(.center)
                    }

                    Spacer(minLength: 0)

                    // Bottom degree label
                    if let b = entry.bearing {
                        Text("\(Int(b.rounded()))° \(cardinal(for: b))")
                            .font(.system(size: 11, weight: .semibold, design: .rounded))
                            .tracking(0.5)
                            .foregroundColor(NuurTheme.gold)
                            .padding(.bottom, 14)
                    } else {
                        Color.clear.frame(height: 14)
                    }
                }
            }
        }
        .containerBackground(NuurTheme.surface, for: .widget)
    }
}

// MARK: - Widget
struct NuurQiblaWidget: Widget {
    let kind: String = "NuurQiblaWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: QiblaProvider()) { entry in
            QiblaWidgetView(entry: entry)
        }
        .configurationDisplayName("Qibla Compass")
        .description("Direction to the Kaaba from your location.")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

#Preview(as: .systemSmall) {
    NuurQiblaWidget()
} timeline: {
    QiblaEntry(date: Date(), bearing: 118)
    QiblaEntry(date: Date(), bearing: 244)
    QiblaEntry(date: Date(), bearing: nil)
}
