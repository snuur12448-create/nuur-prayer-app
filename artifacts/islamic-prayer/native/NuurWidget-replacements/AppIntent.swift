import AppIntents
import WidgetKit

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Nuur Widget"
    static var description = IntentDescription("Shows the next prayer time.")

    @Parameter(title: "Show Arc", default: false)
    var showArc: Bool
}
