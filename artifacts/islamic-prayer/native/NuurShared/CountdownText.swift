import SwiftUI

/// Per-state countdown rendering. Mirrors `CountdownText` in the JS mockup:
/// numeric in body color, unit suffix in gold at ~58% size.
public struct CountdownText: View {
    public let state: NuurState
    public let countdownH: String
    public let countdownM: String
    public let size: CGFloat
    public let color: Color

    public init(state: NuurState, countdownH: String, countdownM: String,
                size: CGFloat = 38, color: Color = NuurTheme.text) {
        self.state = state
        self.countdownH = countdownH
        self.countdownM = countdownM
        self.size = size
        self.color = color
    }

    public var body: some View {
        let unitSize = size * 0.58
        Group {
            switch state {
            case .t30:
                pair(num: "30", unit: "s", unitSize: unitSize)
            case .t10:
                pair(num: "10", unit: "m", unitSize: unitSize)
            case .t1:
                pair(num: "1",  unit: "m", unitSize: unitSize)
            case .t0:
                EmptyView()
            case .normal:
                HStack(alignment: .firstTextBaseline, spacing: 0) {
                    Text(countdownH)
                        .font(.system(size: size, weight: .regular, design: .serif))
                        .foregroundColor(color)
                    Text("h")
                        .font(.system(size: unitSize, weight: .regular, design: .serif))
                        .foregroundColor(NuurTheme.gold)
                        .padding(.leading, 1)
                        .padding(.trailing, 4)
                    Text(countdownM)
                        .font(.system(size: size, weight: .regular, design: .serif))
                        .foregroundColor(color)
                    Text("m")
                        .font(.system(size: unitSize, weight: .regular, design: .serif))
                        .foregroundColor(NuurTheme.gold)
                        .padding(.leading, 2)
                }
            }
        }
    }

    private func pair(num: String, unit: String, unitSize: CGFloat) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 0) {
            Text(num)
                .font(.system(size: size, weight: .regular, design: .serif))
                .foregroundColor(color)
            Text(unit)
                .font(.system(size: unitSize, weight: .regular, design: .serif))
                .foregroundColor(NuurTheme.gold)
                .padding(.leading, 2)
        }
    }
}
