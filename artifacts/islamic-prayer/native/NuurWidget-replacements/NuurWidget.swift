import SwiftUI
import WidgetKit

// MARK: - Timeline entry
struct NuurEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let state: NuurState
    let skin: Skin
    let prayerEn: String
    let prayerAr: String
    let nextAt: String
    let countdownH: String
    let countdownM: String
    let countdownLabel: String
    let location: String
    let hijri: String
}

// MARK: - Provider
struct NuurProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> NuurEntry { Self.sample(.normal, .day) }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> NuurEntry {
        Self.sample(.normal, .day, config: configuration)
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<NuurEntry> {
        // Phase-1 timeline: a single entry refreshed hourly. Real prayer-time
        // engine + App Group reads land in phase 2.
        let entry = Self.sample(.normal, .day, config: configuration)
        let next = Calendar.current.date(byAdding: .hour, value: 1, to: entry.date) ?? entry.date
        return Timeline(entries: [entry], policy: .after(next))
    }

    static func sample(_ state: NuurState, _ skin: Skin,
                       config: ConfigurationAppIntent = ConfigurationAppIntent()) -> NuurEntry {
        let dayPayload = NuurAttributes.sampleDayState
        let attrs = NuurAttributes.sampleDay
        return NuurEntry(
            date: Date(),
            configuration: config,
            state: state,
            skin: skin,
            prayerEn: dayPayload.prayerEn,
            prayerAr: dayPayload.prayerAr,
            nextAt: dayPayload.nextAt,
            countdownH: dayPayload.countdownH,
            countdownM: dayPayload.countdownM,
            countdownLabel: dayPayload.countdownLabel,
            location: attrs.location,
            hijri: attrs.hijri
        )
    }
}

// MARK: - Widget body
struct NuurWidgetEntryView: View {
    var entry: NuurEntry

    var body: some View {
        // For phase 1 we render the full LiveActivityCard scaled to fit the
        // widget's container size. iOS will pin it to systemMedium.
        GeometryReader { geo in
            LiveActivityCard(
                state: entry.state,
                skin: entry.skin,
                prayerEn: entry.prayerEn,
                prayerAr: entry.prayerAr,
                nextAt: entry.nextAt,
                countdownH: entry.countdownH,
                countdownM: entry.countdownM,
                countdownLabel: entry.countdownLabel,
                location: entry.location,
                hijri: entry.hijri,
                width: 358,
                height: 160
            )
            .scaleEffect(min(geo.size.width / 358, geo.size.height / 160))
            .frame(width: geo.size.width, height: geo.size.height)
        }
        .containerBackground(NuurTheme.bg, for: .widget)
    }
}

// MARK: - Widget configuration
struct NuurWidget: Widget {
    let kind: String = "NuurWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self,
                               provider: NuurProvider()) { entry in
            NuurWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Nuur Prayer")
        .description("Next prayer at a glance.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - Preview
#Preview(as: .systemMedium) {
    NuurWidget()
} timeline: {
    NuurProvider.sample(.normal, .day)
    NuurProvider.sample(.t10,    .day)
    NuurProvider.sample(.t1,     .day)
    NuurProvider.sample(.t0,     .day)
    NuurProvider.sample(.normal, .night)
}
