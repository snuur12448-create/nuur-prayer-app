/**
 * Canonical Morning + Evening Adhkar sequence (Hisnul Muslim).
 *
 * SINGLE SOURCE OF TRUTH for both the iOS widget (NuurAdhkarWidget.swift) and
 * the in-app Du'a & Adhkar screen. The Arabic, transliteration, and meaning
 * strings here MUST stay byte-identical to NuurAdhkarWidget.swift's
 * AdhkarLibrary. If you edit one side, edit the other.
 *
 * IDs are kebab-case and shared across JS and Swift. The widget writes
 * recited IDs into App Group shared UserDefaults; the app reads them via
 * the NuurBridge native module.
 */

import type { DuaItem } from "./duaData";

export interface AdhkarEntry extends DuaItem {
  session: "morning" | "evening";
  reps: number;
}

export const MORNING_ADHKAR: AdhkarEntry[] = [
  {
    id: "ayat-al-kursi-morning",
    session: "morning",
    title: "Ayat al-Kursi",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    transliteration: "Allahu la ilaha illa huwa al-hayyu al-qayyum…",
    translation:
      "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.",
    reps: 1,
    reference: "Qur'an 2:255 — Hisnul Muslim 75",
  },
  {
    id: "surah-ikhlas-morning",
    session: "morning",
    title: "Surah al-Ikhlas",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    transliteration: "Qul huwa Allahu ahad…",
    translation: "Say: He is Allah, the One. (Surah al-Ikhlas)",
    reps: 3,
    reference: "Qur'an 112 — Abu Dawud, Tirmidhi",
    repeat: "3×",
  },
  {
    id: "surah-falaq-morning",
    session: "morning",
    title: "Surah al-Falaq",
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
    transliteration: "Qul a'udhu bi-rabbi al-falaq…",
    translation:
      "Say: I seek refuge in the Lord of daybreak. (Surah al-Falaq)",
    reps: 3,
    reference: "Qur'an 113 — Abu Dawud, Tirmidhi",
    repeat: "3×",
  },
  {
    id: "surah-nas-morning",
    session: "morning",
    title: "Surah an-Nas",
    arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    transliteration: "Qul a'udhu bi-rabbi an-nas…",
    translation:
      "Say: I seek refuge in the Lord of mankind. (Surah an-Nas)",
    reps: 3,
    reference: "Qur'an 114 — Abu Dawud, Tirmidhi",
    repeat: "3×",
  },
  {
    id: "asbahna",
    session: "morning",
    title: "Asbahna — We Have Reached the Morning",
    arabic:
      "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration:
      "Asbahna wa asbaha al-mulku lillah, wa al-hamdu lillah…",
    translation:
      "We have reached the morning and the kingdom belongs to Allah; praise is to Allah. None has the right to be worshipped except Allah alone, without partner.",
    reps: 1,
    reference: "Muslim 2723 — Hisnul Muslim 76",
  },
  {
    id: "sayyid-al-istighfar-morning",
    session: "morning",
    title: "Sayyid al-Istighfar",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
    transliteration:
      "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduka…",
    translation:
      "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. (Sayyid al-Istighfar)",
    reps: 1,
    reference: "Bukhari 6306 — Hisnul Muslim 80",
  },
  {
    id: "radeetu-billah-morning",
    session: "morning",
    title: "Radeetu billah — Contentment",
    arabic:
      "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
    transliteration:
      "Radeetu billahi rabban, wa bi-l-Islami deenan, wa bi-Muhammadin nabiyyan",
    translation:
      "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.",
    reps: 3,
    reference: "Abu Dawud, Tirmidhi — Hisnul Muslim 84",
    repeat: "3×",
  },
  {
    id: "hasbi-allah-morning",
    session: "morning",
    title: "Hasbi Allah — Allah is Sufficient",
    arabic:
      "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration:
      "Hasbiya Allahu la ilaha illa huwa, 'alayhi tawakkaltu wa huwa rabbu al-'arshi al-'azeem",
    translation:
      "Allah is sufficient for me; there is no deity except Him. I have placed my trust in Him, and He is the Lord of the Mighty Throne.",
    reps: 7,
    reference: "Abu Dawud — Hisnul Muslim 81",
    repeat: "7×",
  },
  {
    id: "al-afiyah-morning",
    session: "morning",
    title: "Al-'Afwa wa al-'Afiyah",
    arabic:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    transliteration:
      "Allahumma inni as'aluka al-'afwa wa al-'afiyata fi ad-dunya wa al-akhirah",
    translation:
      "O Allah, I ask You for pardon and well-being in this life and the next.",
    reps: 1,
    reference: "Ibn Majah, Abu Dawud — Hisnul Muslim 82",
  },
  {
    id: "subhanallah-bihamdihi-morning",
    session: "morning",
    title: "SubhanAllah wa bi-hamdihi",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subhan Allahi wa bi-hamdihi",
    translation: "Glory is to Allah and praise is to Him.",
    reps: 100,
    reference: "Muslim 2692 — Hisnul Muslim 89",
    repeat: "100×",
  },
  {
    id: "la-ilaha-illa-allah-wahdahu",
    session: "morning",
    title: "La ilaha illa Allah wahdahu",
    arabic:
      "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration:
      "La ilaha illa Allahu wahdahu la shareeka lah, lahu al-mulku wa lahu al-hamd…",
    translation:
      "None has the right to be worshipped except Allah, alone, without partner. To Him belongs sovereignty and praise, and He has power over all things.",
    reps: 10,
    reference: "Nasa'i — Hisnul Muslim 92",
    repeat: "10×",
  },
  {
    id: "astaghfirullah-morning",
    session: "morning",
    title: "Astaghfirullah",
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfiru Allaha wa atubu ilayh",
    translation:
      "I seek the forgiveness of Allah and turn to Him in repentance.",
    reps: 100,
    reference: "Bukhari, Muslim — Hisnul Muslim 94",
    repeat: "100×",
  },
];

export const EVENING_ADHKAR: AdhkarEntry[] = [
  {
    id: "ayat-al-kursi-evening",
    session: "evening",
    title: "Ayat al-Kursi",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    transliteration: "Allahu la ilaha illa huwa al-hayyu al-qayyum…",
    translation:
      "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.",
    reps: 1,
    reference: "Qur'an 2:255 — Hisnul Muslim 75",
  },
  {
    id: "surah-ikhlas-evening",
    session: "evening",
    title: "Surah al-Ikhlas",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    transliteration: "Qul huwa Allahu ahad…",
    translation: "Say: He is Allah, the One.",
    reps: 3,
    reference: "Qur'an 112 — Abu Dawud, Tirmidhi",
    repeat: "3×",
  },
  {
    id: "surah-falaq-evening",
    session: "evening",
    title: "Surah al-Falaq",
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
    transliteration: "Qul a'udhu bi-rabbi al-falaq…",
    translation: "Say: I seek refuge in the Lord of daybreak.",
    reps: 3,
    reference: "Qur'an 113",
    repeat: "3×",
  },
  {
    id: "surah-nas-evening",
    session: "evening",
    title: "Surah an-Nas",
    arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    transliteration: "Qul a'udhu bi-rabbi an-nas…",
    translation: "Say: I seek refuge in the Lord of mankind.",
    reps: 3,
    reference: "Qur'an 114",
    repeat: "3×",
  },
  {
    id: "amsayna",
    session: "evening",
    title: "Amsayna — We Have Reached the Evening",
    arabic:
      "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration:
      "Amsayna wa amsa al-mulku lillah, wa al-hamdu lillah…",
    translation:
      "We have reached the evening and the kingdom belongs to Allah; praise is to Allah. None has the right to be worshipped except Allah alone, without partner.",
    reps: 1,
    reference: "Muslim 2723 — Hisnul Muslim 77",
  },
  {
    id: "sayyid-al-istighfar-evening",
    session: "evening",
    title: "Sayyid al-Istighfar",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ",
    transliteration: "Allahumma anta rabbi la ilaha illa anta…",
    translation:
      "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant. (Sayyid al-Istighfar)",
    reps: 1,
    reference: "Bukhari 6306 — Hisnul Muslim 80",
  },
  {
    id: "radeetu-billah-evening",
    session: "evening",
    title: "Radeetu billah — Contentment",
    arabic:
      "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
    transliteration:
      "Radeetu billahi rabban, wa bi-l-Islami deenan, wa bi-Muhammadin nabiyyan",
    translation:
      "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.",
    reps: 3,
    reference: "Abu Dawud, Tirmidhi — Hisnul Muslim 84",
    repeat: "3×",
  },
  {
    id: "hasbi-allah-evening",
    session: "evening",
    title: "Hasbi Allah — Allah is Sufficient",
    arabic:
      "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration: "Hasbiya Allahu la ilaha illa huwa…",
    translation:
      "Allah is sufficient for me; there is no deity except Him. I have placed my trust in Him, and He is the Lord of the Mighty Throne.",
    reps: 7,
    reference: "Abu Dawud — Hisnul Muslim 81",
    repeat: "7×",
  },
  {
    id: "al-afiyah-evening",
    session: "evening",
    title: "Al-'Afwa wa al-'Afiyah",
    arabic:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    transliteration: "Allahumma inni as'aluka al-'afwa wa al-'afiyah…",
    translation:
      "O Allah, I ask You for pardon and well-being in this life and the next.",
    reps: 1,
    reference: "Ibn Majah, Abu Dawud — Hisnul Muslim 82",
  },
  {
    id: "subhanallah-bihamdihi-evening",
    session: "evening",
    title: "SubhanAllah wa bi-hamdihi",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subhan Allahi wa bi-hamdihi",
    translation: "Glory is to Allah and praise is to Him.",
    reps: 100,
    reference: "Muslim 2692 — Hisnul Muslim 89",
    repeat: "100×",
  },
  {
    id: "audhu-bi-kalimat-allah",
    session: "evening",
    title: "A'udhu bi-kalimat Allah at-tammat",
    arabic:
      "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration:
      "A'udhu bi-kalimati Allahi at-tammati min sharri ma khalaq",
    translation:
      "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    reps: 3,
    reference: "Muslim 2708 — Hisnul Muslim 93",
    repeat: "3×",
  },
  {
    id: "astaghfirullah-evening",
    session: "evening",
    title: "Astaghfirullah",
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfiru Allaha wa atubu ilayh",
    translation:
      "I seek the forgiveness of Allah and turn to Him in repentance.",
    reps: 100,
    reference: "Bukhari, Muslim — Hisnul Muslim 94",
    repeat: "100×",
  },
];

export const ALL_ADHKAR: AdhkarEntry[] = [
  ...MORNING_ADHKAR,
  ...EVENING_ADHKAR,
];

export const MORNING_ADHKAR_IDS = MORNING_ADHKAR.map((d) => d.id);
export const EVENING_ADHKAR_IDS = EVENING_ADHKAR.map((d) => d.id);
