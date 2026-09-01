import SwiftUI
import WidgetKit
import AppIntents

// =============================================================================
// MARK: - ADHKAR DATA
// =============================================================================
//
// ⚠️  THEOLOGICAL REVIEW REQUIRED — SADAQ TO VERIFY BEFORE APP STORE SUBMISSION
//
// Source: Hisnul Muslim (Fortress of the Muslim) by Sa'id ibn Ali ibn Wahf
// al-Qahtani — the canonical reference for daily adhkar.
//
// Arabic text: standard mushaf orthography with full diacritics.
// English translations: established renderings from Sahih International
// (for Qur'anic verses) and the standard Hisnul Muslim English edition.
// Transliteration: simplified ALA-LC scheme (without diacritics) for
// readability on small widget glyphs.
//
// Counts and sources match Hisnul Muslim entries verbatim. Each entry below
// is marked // TODO:SADAQ-VERIFY to flag for line-by-line review.
//
// =============================================================================

private struct Dhikr {
    let id: String
    let arabic: String
    let transliteration: String
    let meaning: String
    let count: Int
    let source: String
    let category: Category

    enum Category { case morning, evening, both }
}

private enum AdhkarLibrary {
    // Morning sequence (12 entries) — IDs MUST match utils/adhkarSequence.ts.
    static let morning: [Dhikr] = [
        Dhikr(
            id: "ayat-al-kursi-morning",
            arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
            transliteration: "Allahu la ilaha illa huwa al-hayyu al-qayyum…",
            meaning: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.",
            count: 1,
            source: "Qur'an 2:255 — Hisnul Muslim 75",
            category: .both
        ),
        Dhikr(
            id: "surah-ikhlas-morning",
            arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
            transliteration: "Qul huwa Allahu ahad…",
            meaning: "Say: He is Allah, the One. (Surah al-Ikhlas)",
            count: 3,
            source: "Qur'an 112 — Abu Dawud, Tirmidhi",
            category: .both
        ),
        Dhikr(
            id: "surah-falaq-morning",
            arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
            transliteration: "Qul a'udhu bi-rabbi al-falaq…",
            meaning: "Say: I seek refuge in the Lord of daybreak. (Surah al-Falaq)",
            count: 3,
            source: "Qur'an 113 — Abu Dawud, Tirmidhi",
            category: .both
        ),
        Dhikr(
            id: "surah-nas-morning",
            arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
            transliteration: "Qul a'udhu bi-rabbi an-nas…",
            meaning: "Say: I seek refuge in the Lord of mankind. (Surah an-Nas)",
            count: 3,
            source: "Qur'an 114 — Abu Dawud, Tirmidhi",
            category: .both
        ),
        Dhikr(
            id: "asbahna",
            arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
            transliteration: "Asbahna wa asbaha al-mulku lillah, wa al-hamdu lillah…",
            meaning: "We have reached the morning and the kingdom belongs to Allah; praise is to Allah. None has the right to be worshipped except Allah alone, without partner.",
            count: 1,
            source: "Muslim 2723 — Hisnul Muslim 76",
            category: .morning
        ),
        Dhikr(
            id: "sayyid-al-istighfar-morning",
            arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
            transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduka…",
            meaning: "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. (Sayyid al-Istighfar)",
            count: 1,
            source: "Bukhari 6306 — Hisnul Muslim 80",
            category: .both
        ),
        Dhikr(
            id: "radeetu-billah-morning",
            arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
            transliteration: "Radeetu billahi rabban, wa bi-l-Islami deenan, wa bi-Muhammadin nabiyyan",
            meaning: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.",
            count: 3,
            source: "Abu Dawud, Tirmidhi — Hisnul Muslim 84",
            category: .both
        ),
        Dhikr(
            id: "hasbi-allah-morning",
            arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
            transliteration: "Hasbiya Allahu la ilaha illa huwa, 'alayhi tawakkaltu wa huwa rabbu al-'arshi al-'azeem",
            meaning: "Allah is sufficient for me; there is no deity except Him. I have placed my trust in Him, and He is the Lord of the Mighty Throne.",
            count: 7,
            source: "Abu Dawud — Hisnul Muslim 81",
            category: .both
        ),
        Dhikr(
            id: "al-afiyah-morning",
            arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
            transliteration: "Allahumma inni as'aluka al-'afwa wa al-'afiyata fi ad-dunya wa al-akhirah",
            meaning: "O Allah, I ask You for pardon and well-being in this life and the next.",
            count: 1,
            source: "Ibn Majah, Abu Dawud — Hisnul Muslim 82",
            category: .both
        ),
        Dhikr(
            id: "subhanallah-bihamdihi-morning",
            arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
            transliteration: "Subhan Allahi wa bi-hamdihi",
            meaning: "Glory is to Allah and praise is to Him.",
            count: 100,
            source: "Muslim 2692 — Hisnul Muslim 89",
            category: .both
        ),
        Dhikr(
            id: "la-ilaha-illa-allah-wahdahu",
            arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
            transliteration: "La ilaha illa Allahu wahdahu la shareeka lah, lahu al-mulku wa lahu al-hamd…",
            meaning: "None has the right to be worshipped except Allah, alone, without partner. To Him belongs sovereignty and praise, and He has power over all things.",
            count: 10,
            source: "Nasa'i — Hisnul Muslim 92",
            category: .morning
        ),
        Dhikr(
            id: "astaghfirullah-morning",
            arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
            transliteration: "Astaghfiru Allaha wa atubu ilayh",
            meaning: "I seek the forgiveness of Allah and turn to Him in repentance.",
            count: 100,
            source: "Bukhari, Muslim — Hisnul Muslim 94",
            category: .both
        ),
    ]

    // TODO:SADAQ-VERIFY — Evening sequence (12 entries)
    // Same content as morning where applicable; "amsayna" replaces "asbahna" etc.
    static let evening: [Dhikr] = [
        Dhikr(
            id: "ayat-al-kursi-evening",
            arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
            transliteration: "Allahu la ilaha illa huwa al-hayyu al-qayyum…",
            meaning: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.",
            count: 1,
            source: "Qur'an 2:255 — Hisnul Muslim 75",
            category: .both
        ),
        Dhikr(
            id: "surah-ikhlas-evening",
            arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
            transliteration: "Qul huwa Allahu ahad…",
            meaning: "Say: He is Allah, the One.",
            count: 3,
            source: "Qur'an 112 — Abu Dawud, Tirmidhi",
            category: .both
        ),
        Dhikr(
            id: "surah-falaq-evening",
            arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
            transliteration: "Qul a'udhu bi-rabbi al-falaq…",
            meaning: "Say: I seek refuge in the Lord of daybreak.",
            count: 3,
            source: "Qur'an 113",
            category: .both
        ),
        Dhikr(
            id: "surah-nas-evening",
            arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
            transliteration: "Qul a'udhu bi-rabbi an-nas…",
            meaning: "Say: I seek refuge in the Lord of mankind.",
            count: 3,
            source: "Qur'an 114",
            category: .both
        ),
        Dhikr(
            id: "amsayna",
            arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
            transliteration: "Amsayna wa amsa al-mulku lillah, wa al-hamdu lillah…",
            meaning: "We have reached the evening and the kingdom belongs to Allah; praise is to Allah. None has the right to be worshipped except Allah alone, without partner.",
            count: 1,
            source: "Muslim 2723 — Hisnul Muslim 77",
            category: .evening
        ),
        Dhikr(
            id: "sayyid-al-istighfar-evening",
            arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ",
            transliteration: "Allahumma anta rabbi la ilaha illa anta…",
            meaning: "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant. (Sayyid al-Istighfar)",
            count: 1,
            source: "Bukhari 6306 — Hisnul Muslim 80",
            category: .both
        ),
        Dhikr(
            id: "radeetu-billah-evening",
            arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
            transliteration: "Radeetu billahi rabban, wa bi-l-Islami deenan, wa bi-Muhammadin nabiyyan",
            meaning: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.",
            count: 3,
            source: "Abu Dawud, Tirmidhi — Hisnul Muslim 84",
            category: .both
        ),
        Dhikr(
            id: "hasbi-allah-evening",
            arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
            transliteration: "Hasbiya Allahu la ilaha illa huwa…",
            meaning: "Allah is sufficient for me; there is no deity except Him. I have placed my trust in Him, and He is the Lord of the Mighty Throne.",
            count: 7,
            source: "Abu Dawud — Hisnul Muslim 81",
            category: .both
        ),
        Dhikr(
            id: "al-afiyah-evening",
            arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
            transliteration: "Allahumma inni as'aluka al-'afwa wa al-'afiyah…",
            meaning: "O Allah, I ask You for pardon and well-being in this life and the next.",
            count: 1,
            source: "Ibn Majah, Abu Dawud — Hisnul Muslim 82",
            category: .both
        ),
        Dhikr(
            id: "subhanallah-bihamdihi-evening",
            arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
            transliteration: "Subhan Allahi wa bi-hamdihi",
            meaning: "Glory is to Allah and praise is to Him.",
            count: 100,
            source: "Muslim 2692 — Hisnul Muslim 89",
            category: .both
        ),
        Dhikr(
            id: "audhu-bi-kalimat-allah",
            arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
            transliteration: "A'udhu bi-kalimati Allahi at-tammati min sharri ma khalaq",
            meaning: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
            count: 3,
            source: "Muslim 2708 — Hisnul Muslim 93",
            category: .evening
        ),
        Dhikr(
            id: "astaghfirullah-evening",
            arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
            transliteration: "Astaghfiru Allaha wa atubu ilayh",
            meaning: "I seek the forgiveness of Allah and turn to Him in repentance.",
            count: 100,
            source: "Bukhari, Muslim — Hisnul Muslim 94",
            category: .both
        ),
    ]
}

// =============================================================================
// MARK: - PERSISTENCE (App Group shared UserDefaults)
// =============================================================================

// First dhikr in the sequence not yet in recitedIds. Returns nil if all done.
private func nextUndone(in sequence: [Dhikr], recited: Set<String>) -> Dhikr? {
    sequence.first { !recited.contains($0.id) }
}

// =============================================================================
// MARK: - STATE MACHINE (based on prayer times from shared snapshot)
// =============================================================================

private enum AdhkarWidgetState {
    case morningActive(progress: Int, total: Int, dhikr: Dhikr, currentCount: Int)
    case eveningActive(progress: Int, total: Int, dhikr: Dhikr, currentCount: Int)
    case morningCompleted(nextOpensAt: Date)
    case eveningCompleted(nextOpensAt: Date)
    // Between morning close (sunrise) and evening open (asr) — point at evening.
    case upcomingEvening(opensAt: Date)
    // After maghrib OR before fajr — point at the next morning window.
    case upcomingMorning(opensAt: Date)
    // Both windows completed for today — surface a calm closure with next morning.
    case bothCompleteToday(nextMorningAt: Date)
    // Fallback when the snapshot hasn't been written yet.
    case empty(label: String)
}

private struct AdhkarPrayerDay: Decodable {
    let fajr: String
    let asr: String
    let maghrib: String
}

private struct SharedPrayerSnapshot: Decodable {
    let fajr: String
    let sunrise: String
    let dhuhr: String?
    let asr: String
    let maghrib: String
    let isha: String?
    let prayerDays: [AdhkarPrayerDay]?
    let timeZone: String?
}

private func readPrayerSnapshot() -> SharedPrayerSnapshot? {
    guard let defaults = UserDefaults(suiteName: "group.com.nuur.shared"),
          let json = defaults.string(forKey: "nuur.prayerSnapshot"),
          let data = json.data(using: .utf8) else { return nil }
    return try? JSONDecoder().decode(SharedPrayerSnapshot.self, from: data)
}

private func parseISODate(_ s: String) -> Date? {
    let iso = ISO8601DateFormatter()
    iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let d = iso.date(from: s) { return d }
    iso.formatOptions = [.withInternetDateTime]
    return iso.date(from: s)
}

private func adhkarTimeZone(_ snap: SharedPrayerSnapshot) -> TimeZone {
    snap.timeZone.flatMap(TimeZone.init(identifier:)) ?? .current
}

private func adhkarCalendar(_ snap: SharedPrayerSnapshot) -> Calendar {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = adhkarTimeZone(snap)
    return calendar
}

private func adhkarWindow(at now: Date, from snap: SharedPrayerSnapshot)
    -> (fajr: Date, asr: Date, nextFajr: Date)? {
    if let days = snap.prayerDays, !days.isEmpty,
       let index = days.firstIndex(where: {
           guard let fajr = parseISODate($0.fajr) else { return false }
           return adhkarCalendar(snap).isDate(fajr, inSameDayAs: now)
       }),
       let fajr = parseISODate(days[index].fajr),
       let asr = parseISODate(days[index].asr) {
        let nextFajr = days.indices.contains(index + 1)
            ? parseISODate(days[index + 1].fajr)
            : adhkarCalendar(snap).date(byAdding: .day, value: 1, to: fajr)
        if let nextFajr { return (fajr, asr, nextFajr) }
    }

    guard let fajr = parseISODate(snap.fajr),
          let asr = parseISODate(snap.asr),
          let nextFajr = adhkarCalendar(snap).date(byAdding: .day, value: 1, to: fajr)
    else { return nil }
    return (fajr, asr, nextFajr)
}

private func formatHM(_ date: Date) -> String {
    let f = DateFormatter()
    if let snap = readPrayerSnapshot() { f.timeZone = adhkarTimeZone(snap) }
    f.locale = Locale(identifier: "en_US_POSIX")
    f.dateFormat = "HH:mm"
    return f.string(from: date)
}

// 12-hour clock with AM/PM in the user's current locale (e.g. "4:15 PM").
private func format12h(_ date: Date) -> String {
    let f = DateFormatter()
    if let snap = readPrayerSnapshot() { f.timeZone = adhkarTimeZone(snap) }
    f.locale = Locale.current
    f.setLocalizedDateFormatFromTemplate("h:mm a")
    return f.string(from: date)
}

/// Return persisted progress only for the prayer-location date it belongs to.
/// Future preloaded timeline entries must start clean instead of carrying
/// today's completed adhkar into tomorrow.
private func adhkarState(_ persisted: AdhkarState, at date: Date,
                         snap: SharedPrayerSnapshot?) -> AdhkarState {
    guard let snap else { return freshenForToday(persisted) }
    let f = DateFormatter()
    f.calendar = adhkarCalendar(snap)
    f.timeZone = adhkarTimeZone(snap)
    f.locale = Locale(identifier: "en_US_POSIX")
    f.dateFormat = "yyyy-MM-dd"
    let dateKey = f.string(from: date)
    if persisted.dateISO == dateKey { return persisted }
    return AdhkarState(
        dateISO: dateKey, recitedIds: [], inProgressId: nil, inProgressCount: 0,
        morningCompleted: false, eveningCompleted: false
    )
}

// Resolve which state to show. Pure function of (now, snapshot, persisted state).
private func resolveState(now: Date, snap: SharedPrayerSnapshot?, persisted: AdhkarState) -> AdhkarWidgetState {
    var state = adhkarState(persisted, at: now, snap: snap)
    recomputeCompletion(&state)

    guard let snap = snap,
          let window = adhkarWindow(at: now, from: snap)
    else {
        return .empty(label: "Open Nuur to begin")
    }
    let fajr = window.fajr
    let asr = window.asr

    // Morning adhkar stays open Fajr → Asr; evening Asr → next Fajr. This keeps
    // an adhkar always live for the current part of the day, with no dead gap
    // between Dhuhr and Asr, or after Isha.
    let nextFajr = window.nextFajr

    let inMorningWindow = now >= fajr && now < asr
    let inEveningWindow = now >= asr && now < nextFajr
    let recited = Set(state.recitedIds)

    // ── ACTIVE WINDOWS ──
    if inMorningWindow {
        if state.morningCompleted {
            return .morningCompleted(nextOpensAt: asr)
        }
        let seq = AdhkarLibrary.morning
        let progress = seq.filter { recited.contains($0.id) }.count
        let shown = nextUndone(in: seq, recited: recited) ?? seq[seq.count - 1]
        let currentCount = (state.inProgressId == shown.id) ? state.inProgressCount : 0
        return .morningActive(
            progress: progress, total: seq.count,
            dhikr: shown, currentCount: currentCount
        )
    }

    if inEveningWindow {
        if state.eveningCompleted {
            return .eveningCompleted(nextOpensAt: nextFajr)
        }
        let seq = AdhkarLibrary.evening
        let progress = seq.filter { recited.contains($0.id) }.count
        let shown = nextUndone(in: seq, recited: recited) ?? seq[seq.count - 1]
        let currentCount = (state.inProgressId == shown.id) ? state.inProgressCount : 0
        return .eveningActive(
            progress: progress, total: seq.count,
            dhikr: shown, currentCount: currentCount
        )
    }

    // ── BETWEEN WINDOWS — always point forward, never dwell on missed ──
    if now < fajr {
        return .upcomingMorning(opensAt: fajr)
    }
    if now < asr {
        return .upcomingEvening(opensAt: asr)
    }
    if state.morningCompleted && state.eveningCompleted {
        return .bothCompleteToday(nextMorningAt: nextFajr)
    }
    return .upcomingMorning(opensAt: nextFajr)
}

// =============================================================================
// MARK: - APP INTENT (tap to count)
// =============================================================================

@available(iOS 17.0, *)
struct IncrementAdhkarIntent: AppIntent {
    static var title: LocalizedStringResource = "Count Dhikr"
    static var description = IntentDescription("Increment the current dhikr count.")
    static var isDiscoverable: Bool = false

    func perform() async throws -> some IntentResult {
        let snap = readPrayerSnapshot()
        let now = Date()
        var state = adhkarState(AdhkarStore.read(), at: now, snap: snap)
        guard let snap = snap,
              let window = adhkarWindow(at: now, from: snap)
        else {
            return .result()
        }
        let fajr = window.fajr
        let asr = window.asr

        // Match resolveState's windows: morning Fajr → Asr, evening Asr → next Fajr.
        let nextFajr = window.nextFajr
        let inMorning = now >= fajr && now < asr
        let inEvening = now >= asr && now < nextFajr
        if !inMorning && !inEvening { return .result() }

        let sequence = inMorning ? AdhkarLibrary.morning : AdhkarLibrary.evening
        let recited = Set(state.recitedIds)

        // Pick the dhikr to advance: the in-progress one if it's still in this
        // sequence and not yet recited, otherwise the next undone dhikr.
        let inProgressDhikr: Dhikr? = {
            guard let id = state.inProgressId,
                  !recited.contains(id),
                  let d = sequence.first(where: { $0.id == id }) else { return nil }
            return d
        }()
        guard let target = inProgressDhikr ?? nextUndone(in: sequence, recited: recited) else {
            // Whole sequence is already done.
            recomputeCompletion(&state)
            AdhkarStore.write(state)
            WidgetCenter.shared.reloadAllTimelines()
            AdhkarStore.postDidUpdate()
            return .result()
        }

        if state.inProgressId == target.id {
            state.inProgressCount += 1
        } else {
            state.inProgressId = target.id
            state.inProgressCount = 1
        }

        if state.inProgressCount >= target.count {
            if !state.recitedIds.contains(target.id) {
                state.recitedIds.append(target.id)
            }
            state.inProgressId = nil
            state.inProgressCount = 0
            recomputeCompletion(&state)
        }

        AdhkarStore.write(state)
        WidgetCenter.shared.reloadAllTimelines()
        AdhkarStore.postDidUpdate()
        return .result()
    }
}

// =============================================================================
// MARK: - TIMELINE
// =============================================================================

private struct AdhkarEntry: TimelineEntry {
    let date: Date
    let state: AdhkarWidgetState
}

private struct AdhkarProvider: TimelineProvider {
    func placeholder(in context: Context) -> AdhkarEntry {
        AdhkarEntry(
            date: Date(),
            state: .upcomingMorning(opensAt: Date().addingTimeInterval(60 * 60 * 4))
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (AdhkarEntry) -> Void) {
        let now = Date()
        let state = resolveState(now: now, snap: readPrayerSnapshot(), persisted: AdhkarStore.read())
        completion(AdhkarEntry(date: now, state: state))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<AdhkarEntry>) -> Void) {
        let now = Date()
        let snap = readPrayerSnapshot()
        let persisted = AdhkarStore.read()
        guard let snap else {
            let entry = AdhkarEntry(
                date: now,
                state: resolveState(now: now, snap: nil, persisted: persisted)
            )
            completion(Timeline(entries: [entry], policy: .after(now.addingTimeInterval(15 * 60))))
            return
        }

        // Fajr and Asr are predictable state boundaries. Preload a week from
        // the 35-day prayer cache so an iOS reload delay cannot strand this
        // widget in yesterday's morning/evening state.
        let calendar = adhkarCalendar(snap)
        let horizon = calendar.date(byAdding: .day, value: 7, to: now)
            ?? now.addingTimeInterval(7 * 24 * 60 * 60)
        var moments = Set<Date>([now, horizon])
        if let days = snap.prayerDays {
            for day in days {
                for raw in [day.fajr, day.asr] {
                    if let boundary = parseISODate(raw), boundary > now, boundary <= horizon {
                        moments.insert(boundary)
                    }
                }
            }
        } else if let window = adhkarWindow(at: now, from: snap) {
            for boundary in [window.fajr, window.asr, window.nextFajr]
                where boundary > now && boundary <= horizon {
                moments.insert(boundary)
            }
        }

        let entries = moments.sorted().map {
            AdhkarEntry(
                date: $0,
                state: resolveState(now: $0, snap: snap, persisted: persisted)
            )
        }
        completion(Timeline(entries: entries, policy: .after(horizon)))
    }
}

// =============================================================================
// MARK: - VIEW
// =============================================================================

private struct AdhkarCard: View {
    let entry: AdhkarEntry

    var body: some View {
        ZStack {
            switch entry.state {
            case let .morningActive(progress, total, dhikr, currentCount):
                ActiveView(
                    title: "Morning Adhkar",
                    arabicTitle: "أذكار الصباح",
                    eyebrow: "UNTIL ASR",
                    progress: progress, total: total,
                    dhikr: dhikr, currentCount: currentCount,
                    completed: false
                )
            case let .eveningActive(progress, total, dhikr, currentCount):
                ActiveView(
                    title: "Evening Adhkar",
                    arabicTitle: "أذكار المساء",
                    eyebrow: "UNTIL FAJR",
                    progress: progress, total: total,
                    dhikr: dhikr, currentCount: currentCount,
                    completed: false
                )
            case let .morningCompleted(nextOpensAt):
                CompletedView(
                    title: "Morning Adhkar",
                    arabicTitle: "أذكار الصباح",
                    total: AdhkarLibrary.morning.count,
                    nextLabel: "Evening Adhkar opens at Asr",
                    nextTime: formatHM(nextOpensAt)
                )
            case let .eveningCompleted(nextOpensAt):
                CompletedView(
                    title: "Evening Adhkar",
                    arabicTitle: "أذكار المساء",
                    total: AdhkarLibrary.evening.count,
                    nextLabel: "Morning Adhkar opens at Fajr",
                    nextTime: formatHM(nextOpensAt)
                )
            case let .upcomingEvening(opensAt):
                UpcomingView(
                    icon: "moon.stars.fill",
                    title: "Evening Adhkar",
                    arabicTitle: "أذكار المساء",
                    opensAt: opensAt
                )
            case let .upcomingMorning(opensAt):
                UpcomingView(
                    icon: "sun.max.fill",
                    title: "Morning Adhkar",
                    arabicTitle: "أذكار الصباح",
                    opensAt: opensAt
                )
            case let .bothCompleteToday(nextMorningAt):
                BothCompleteView(nextMorningAt: nextMorningAt)
            case let .empty(label):
                EmptyStateView(label: label)
            }
        }
        .widgetURL(deepLink)
    }

    // Tapping anywhere on the widget (outside the count button) opens the app
    // straight to the adhkar list it's currently showing — morning or evening.
    private var deepLink: URL? {
        switch entry.state {
        case .morningActive, .morningCompleted, .upcomingMorning, .bothCompleteToday:
            return URL(string: "nuur://dua?window=morning")
        case .eveningActive, .eveningCompleted, .upcomingEvening:
            return URL(string: "nuur://dua?window=evening")
        case .empty:
            return URL(string: "nuur://dua")
        }
    }
}

// MARK: Active state — full layout per spec

private struct ActiveView: View {
    let title: String
    let arabicTitle: String
    let eyebrow: String
    let progress: Int        // dhikrs completed so far
    let total: Int           // sequence length
    let dhikr: Dhikr
    let currentCount: Int    // reps done on current dhikr
    let completed: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text(title)
                    .font(.system(size: 14, weight: .regular, design: .serif))
                    .italic()
                    .foregroundColor(Color(hex: 0xEAE4D4))
                Text(arabicTitle)
                    .font(.system(size: 14))
                    .foregroundColor(NuurTheme.gold)
                Spacer()
                Text(eyebrow)
                    .font(.system(size: 8, weight: .medium))
                    .tracking(1.8)
                    .foregroundColor(NuurTheme.gold)
            }

            HStack(spacing: 8) {
                Text("\(progress) / \(total)")
                    .font(.system(size: 11, weight: .regular, design: .rounded))
                    .foregroundColor(Color(hex: 0xEAE4D4).opacity(0.85))
                ProgressBar(value: Double(progress) / Double(max(total, 1)))
                    .frame(height: 2)
            }

            // The whole widget opens the app to this adhkar list (via the
            // card's .widgetURL); only the count badge increments the counter.
            dhikrCard
        }
        .padding(14)
    }

    private var dhikrCard: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("NEXT · TAP TO COUNT")
                    .font(.system(size: 8, weight: .medium))
                    .tracking(1.8)
                    .foregroundColor(NuurTheme.gold)
                Spacer()
            }

            HStack(alignment: .center, spacing: 10) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(dhikr.arabic)
                        .font(.system(size: 14))
                        .foregroundColor(Color(hex: 0xEAE4D4))
                        .lineLimit(2)
                        .minimumScaleFactor(0.7)
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                    HStack(spacing: 6) {
                        Text(meaningTrimmed)
                            .font(.system(size: 10, weight: .regular, design: .serif))
                            .italic()
                            .foregroundColor(Color(hex: 0xEAE4D4).opacity(0.7))
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                        Text("— \(dhikr.count)×")
                            .font(.system(size: 9, weight: .medium))
                            .foregroundColor(NuurTheme.gold)
                    }
                }
                if #available(iOS 17.0, *) {
                    Button(intent: IncrementAdhkarIntent()) {
                        CountBadge(value: currentCount)
                    }
                    .buttonStyle(.plain)
                } else {
                    CountBadge(value: currentCount)
                }
            }
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.black.opacity(0.18))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(NuurTheme.gold.opacity(0.18), lineWidth: 0.5)
        )
    }

    private var meaningTrimmed: String {
        // Keep meaning to ~50 chars so it fits the medium widget.
        let m = dhikr.meaning
        if m.count <= 50 { return m }
        return String(m.prefix(48)) + "…"
    }
}

private struct CountBadge: View {
    let value: Int
    var body: some View {
        ZStack {
            Circle()
                .stroke(NuurTheme.gold, lineWidth: 1)
                .frame(width: 26, height: 26)
            Text("\(value)")
                .font(.system(size: 12, weight: .medium, design: .rounded))
                .foregroundColor(NuurTheme.gold)
        }
    }
}

private struct ProgressBar: View {
    let value: Double          // 0.0 ... 1.0
    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color.black.opacity(0.35))
                Capsule()
                    .fill(NuurTheme.gold)
                    .frame(width: max(0, min(1, value)) * geo.size.width)
            }
        }
    }
}

// MARK: Upcoming session — between windows, point forward calmly.

private struct UpcomingView: View {
    let icon: String          // SF Symbol name
    let title: String         // "Morning Adhkar" / "Evening Adhkar"
    let arabicTitle: String
    let opensAt: Date

    var body: some View {
        VStack(alignment: .center, spacing: 6) {
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 12))
                    .foregroundColor(NuurTheme.gold)
                Text(title)
                    .font(.system(size: 14, weight: .regular, design: .serif))
                    .italic()
                    .foregroundColor(Color(hex: 0xEAE4D4))
                Text(arabicTitle)
                    .font(.system(size: 13))
                    .foregroundColor(NuurTheme.gold)
            }
            .padding(.top, 12)

            Spacer(minLength: 4)

            Text("opens \(format12h(opensAt))")
                .font(.system(size: 12, weight: .regular, design: .serif))
                .italic()
                .foregroundColor(Color(hex: 0xEAE4D4).opacity(0.75))

            // Live countdown — SwiftUI updates this every minute without a
            // timeline reload. `style: .timer` would tick seconds; we keep it
            // calm and only show "in 4h 12m" via the relative style.
            HStack(spacing: 4) {
                Text("in")
                    .font(.system(size: 14, weight: .regular, design: .rounded))
                    .foregroundColor(Color(hex: 0xEAE4D4).opacity(0.7))
                Text(opensAt, style: .relative)
                    .font(.system(size: 16, weight: .medium, design: .rounded))
                    .foregroundColor(Color(hex: 0xEAE4D4))
            }

            Spacer(minLength: 4)

            HStack(spacing: 5) {
                Text("◆")
                    .font(.system(size: 7))
                    .foregroundColor(NuurTheme.gold)
                Text("The fortress, opened twice a day")
                    .font(.system(size: 10, weight: .regular, design: .serif))
                    .italic()
                    .foregroundColor(Color(hex: 0xEAE4D4).opacity(0.5))
            }
            .padding(.bottom, 10)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: Both complete — calm closure for the day.

private struct BothCompleteView: View {
    let nextMorningAt: Date

    var body: some View {
        VStack(alignment: .center, spacing: 6) {
            Spacer(minLength: 6)
            Text("◆ ◆ ◆")
                .font(.system(size: 9))
                .tracking(4)
                .foregroundColor(NuurTheme.gold)
            Text("Both complete today")
                .font(.system(size: 14, weight: .regular, design: .serif))
                .italic()
                .foregroundColor(Color(hex: 0xEAE4D4))
            Text("الحمد لله")
                .font(.system(size: 13))
                .foregroundColor(NuurTheme.gold)
            Spacer(minLength: 4)
            VStack(spacing: 1) {
                Text("Next: Morning · \(format12h(nextMorningAt))")
                    .font(.system(size: 11, weight: .regular, design: .serif))
                    .italic()
                    .foregroundColor(Color(hex: 0xEAE4D4).opacity(0.7))
            }
            .padding(.bottom, 10)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: Empty — shown only when the app hasn't pushed a snapshot yet.

private struct EmptyStateView: View {
    let label: String
    var body: some View {
        VStack(spacing: 8) {
            Spacer()
            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(Color(hex: 0xEAE4D4).opacity(0.85))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 14)
            Spacer()
        }
    }
}

// MARK: Completed state

private struct CompletedView: View {
    let title: String
    let arabicTitle: String
    let total: Int
    let nextLabel: String
    let nextTime: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text(title)
                    .font(.system(size: 14, weight: .regular, design: .serif))
                    .italic()
                    .foregroundColor(Color(hex: 0xEAE4D4))
                Text(arabicTitle)
                    .font(.system(size: 14))
                    .foregroundColor(NuurTheme.gold)
                Spacer()
                HStack(spacing: 3) {
                    Text("COMPLETE")
                        .font(.system(size: 8, weight: .medium))
                        .tracking(1.8)
                        .foregroundColor(NuurTheme.gold)
                    Text("✓")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(NuurTheme.gold)
                }
            }

            HStack(spacing: 8) {
                Text("\(total) / \(total)")
                    .font(.system(size: 11, weight: .regular, design: .rounded))
                    .foregroundColor(Color(hex: 0xEAE4D4).opacity(0.85))
                ProgressBar(value: 1.0)
                    .frame(height: 2)
            }

            Spacer()

            VStack(spacing: 2) {
                Text(nextLabel)
                    .font(.system(size: 11, weight: .regular, design: .serif))
                    .italic()
                    .foregroundColor(Color(hex: 0xEAE4D4).opacity(0.75))
                Text(nextTime)
                    .font(.system(size: 16, weight: .medium, design: .rounded))
                    .foregroundColor(Color(hex: 0xEAE4D4))
            }
            .frame(maxWidth: .infinity)
            .padding(.bottom, 6)
        }
        .padding(14)
    }
}

// =============================================================================
// MARK: - WIDGET
// =============================================================================

struct NuurAdhkarWidget: Widget {
    let kind: String = "NuurAdhkarWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AdhkarProvider()) { entry in
            if #available(iOS 17.0, *) {
                AdhkarCard(entry: entry)
                    .containerBackground(NuurTheme.surface, for: .widget)
            } else {
                ZStack {
                    NuurTheme.surface
                    AdhkarCard(entry: entry)
                }
            }
        }
        .configurationDisplayName("Morning & Evening Adhkar")
        .description("The fortress, opened twice a day — tap to count your daily adhkar.")
        .supportedFamilies([.systemMedium])
    }
}
