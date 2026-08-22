import AppIntents
import WidgetKit

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Nuur Prayer"
    static var description = IntentDescription("Next prayer at a glance.")

    @Parameter(title: "24-Hour Clock", default: false)
    var use24Hour: Bool
}
