import SwiftUI

/// Per-state countdown rendering. Mirrors `CountdownText` in the JS mockup:
/// numeric in body color, unit suffix in gold at ~58% size.
public struct CountdownText: View {
    public let state: NuurState
    public let countdownH: String
    public let countdownM: String
    public let size: CGFloat
    public let color: Color
    /// When provided, renders a live system-managed ticking timer
    /// (H:MM:SS / MM:SS) instead of the static "Hh Mm" text. Required to
    /// show seconds, since widgets cannot refresh once per second.
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
                    // Live ticking timer (H:MM:SS or MM:SS, system-rendered).
                    Text(timerInterval: Date()...target, countsDown: true)
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
                    // Inside urgency window without a live target: minute count.
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
