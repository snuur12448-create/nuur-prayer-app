import SwiftUI

/// Per-state countdown rendering. Mirrors `CountdownText` in the JS mockup:
/// numeric in body color, unit suffix in gold at ~58% size.
public struct CountdownText: View {
    public let state: NuurState
    public let countdownH: String
    public let countdownM: String
    public let size: CGFloat
    public let color: Color
    /// Optional — when set, render a system-managed live countdown.
    public let targetDate: Date?

    public init(state: NuurState, countdownH: String, countdownM: String,
                size: CGFloat = 38, color: Color = NuurTheme.text,
                targetDate: Date? = nil) {
        self.state = state
        self.countdownH = countdownH
        self.countdownM = countdownM
        self.size = size
        self.color = color
        self.targetDate = targetDate
    }

    public var body: some View {
        let unitSize = size * 0.58
        Group {
            switch state {
            case .t0:
                // T-0: prayer time has arrived. The card swaps the countdown
                // for "● NOW · TIME TO PRAY" (handled in LiveActivityCard), so
                // CountdownText renders nothing.
                EmptyView()
            default:
                if let target = targetDate {
                    Text(timerInterval: nuurCountdownInterval(to: target), countsDown: true)
                        .font(.system(size: size, weight: .regular, design: .serif))
                        .foregroundColor(color)
                        .monospacedDigit()
                        .multilineTextAlignment(.leading)
                } else if state == .normal {
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
                } else {
                    pair(num: countdownM, unit: "m", unitSize: unitSize)
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
