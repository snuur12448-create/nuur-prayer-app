import ActivityKit
import SwiftUI
import WidgetKit

struct NuurWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: NuurAttributes.self) { context in
            // Lock-screen / banner presentation
            LiveActivityCard(contentState: context.state, attributes: context.attributes)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .activityBackgroundTint(.clear)
                .activitySystemActionForegroundColor(NuurTheme.text)
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded
                DynamicIslandExpandedRegion(.center) {
                    LiveActivityCard(contentState: context.state,
                                     attributes: context.attributes,
                                     width: 358, height: 140)
                }
            } compactLeading: {
                if context.state.skinEnum == .day {
                    SunGlyph(size: 14, intensity: 1)
                } else {
                    MoonGlyph(size: 14, intensity: 1)
                }
            } compactTrailing: {
                Text("\(context.state.countdownH)h \(context.state.countdownM)m")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(NuurTheme.text)
            } minimal: {
                if context.state.skinEnum == .day {
                    SunGlyph(size: 12, intensity: 1)
                } else {
                    MoonGlyph(size: 12, intensity: 1)
                }
            }
            .keylineTint(accent(for: context.state.stateEnum))
        }
    }
}

// MARK: - Previews
#Preview("Lock — Normal Day", as: .content, using: NuurAttributes.sampleDay) {
    NuurWidgetLiveActivity()
} contentStates: {
    NuurAttributes.sampleDayState
    NuurAttributes.sampleNightState
}
