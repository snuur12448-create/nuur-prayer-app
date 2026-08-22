import Foundation
import WidgetKit

/// Persistence contract shared by the main app bridge and widget extension.
/// IDs mirror `utils/adhkarSequence.ts` and the widget's Adhkar library.
struct AdhkarState: Codable {
    var dateISO: String
    var recitedIds: [String]
    var inProgressId: String?
    var inProgressCount: Int
    var morningCompleted: Bool
    var eveningCompleted: Bool

    static let empty = AdhkarState(
        dateISO: "", recitedIds: [], inProgressId: nil, inProgressCount: 0,
        morningCompleted: false, eveningCompleted: false
    )
}

enum AdhkarStore {
    static let suiteName = "group.com.nuur.shared"
    static let key = "nuur.adhkarState"
    static let darwinNotification = "com.nuur.adhkar.didUpdate"

    static func read() -> AdhkarState {
        guard let defaults = UserDefaults(suiteName: suiteName),
              let json = defaults.string(forKey: key),
              let data = json.data(using: .utf8),
              let state = try? JSONDecoder().decode(AdhkarState.self, from: data)
        else { return .empty }
        return state
    }

    static func write(_ state: AdhkarState) {
        guard let defaults = UserDefaults(suiteName: suiteName),
              let data = try? JSONEncoder().encode(state),
              let json = String(data: data, encoding: .utf8)
        else { return }
        defaults.set(json, forKey: key)
    }

    static func postDidUpdate() {
        let name = CFNotificationName(darwinNotification as CFString)
        CFNotificationCenterPostNotification(
            CFNotificationCenterGetDarwinNotifyCenter(),
            name, nil, nil, true
        )
    }

    @discardableResult
    static func markRecited(id: String) -> AdhkarState {
        var state = freshenForToday(read())
        if !state.recitedIds.contains(id) {
            state.recitedIds.append(id)
        }
        if state.inProgressId == id {
            state.inProgressId = nil
            state.inProgressCount = 0
        }
        recomputeCompletion(&state)
        write(state)
        WidgetCenter.shared.reloadAllTimelines()
        postDidUpdate()
        return state
    }
}

private let morningAdhkarIds: Set<String> = [
    "ayat-al-kursi-morning", "surah-ikhlas-morning", "surah-falaq-morning",
    "surah-nas-morning", "asbahna", "sayyid-al-istighfar-morning",
    "radeetu-billah-morning", "hasbi-allah-morning", "al-afiyah-morning",
    "subhanallah-bihamdihi-morning", "la-ilaha-illa-allah-wahdahu",
    "astaghfirullah-morning",
]

private let eveningAdhkarIds: Set<String> = [
    "ayat-al-kursi-evening", "surah-ikhlas-evening", "surah-falaq-evening",
    "surah-nas-evening", "amsayna", "sayyid-al-istighfar-evening",
    "radeetu-billah-evening", "hasbi-allah-evening", "al-afiyah-evening",
    "subhanallah-bihamdihi-evening", "audhu-bi-kalimat-allah",
    "astaghfirullah-evening",
]

func todayISO() -> String {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: Date())
}

func freshenForToday(_ state: AdhkarState) -> AdhkarState {
    let today = todayISO()
    if state.dateISO == today { return state }
    return AdhkarState(
        dateISO: today, recitedIds: [], inProgressId: nil, inProgressCount: 0,
        morningCompleted: false, eveningCompleted: false
    )
}

func recomputeCompletion(_ state: inout AdhkarState) {
    let recited = Set(state.recitedIds)
    state.morningCompleted = morningAdhkarIds.isSubset(of: recited)
    state.eveningCompleted = eveningAdhkarIds.isSubset(of: recited)
}
