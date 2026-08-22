// Enrichment data for the 99 Names — theme classification, deeper reflection,
// a personal du'a invoking the name (per Qur'an 7:180 — "To Allah belong the
// most beautiful names, so call upon Him by them"), and well-known Qur'anic
// occurrences. Hand-curated content for the most invoked names; thoughtful
// authentic fallbacks for the rest based on each name's meaning.

import { ALLAH_NAMES, type AllahName } from "./namesData";

export type NameTheme =
  | "mercy"
  | "power"
  | "knowledge"
  | "creation"
  | "justice"
  | "providence";

export const THEME_LABELS: Record<NameTheme, string> = {
  mercy: "Mercy & Forgiveness",
  power: "Power & Majesty",
  knowledge: "Knowledge & Wisdom",
  creation: "Creation & Life",
  justice: "Justice & Account",
  providence: "Provision & Care",
};

export const THEME_ORDER: NameTheme[] = [
  "mercy",
  "power",
  "knowledge",
  "creation",
  "justice",
  "providence",
];

export interface QuranOccurrence {
  surah: number;
  ayah: number;
  surahName: string;
}

export interface NameEnrichment {
  theme: NameTheme;
  reflection: string;
  dua: { ar: string; en: string };
  occurrences: QuranOccurrence[];
}

// Primary theme for every name (1–99).
const THEMES: Record<number, NameTheme> = {
  1: "mercy", 2: "mercy", 3: "power", 4: "power", 5: "mercy",
  6: "mercy", 7: "power", 8: "power", 9: "power", 10: "power",
  11: "creation", 12: "creation", 13: "creation", 14: "mercy", 15: "power",
  16: "providence", 17: "providence", 18: "providence", 19: "knowledge", 20: "power",
  21: "providence", 22: "justice", 23: "providence", 24: "providence", 25: "justice",
  26: "knowledge", 27: "knowledge", 28: "justice", 29: "justice", 30: "knowledge",
  31: "knowledge", 32: "mercy", 33: "power", 34: "mercy", 35: "mercy",
  36: "power", 37: "power", 38: "providence", 39: "providence", 40: "justice",
  41: "power", 42: "providence", 43: "knowledge", 44: "mercy", 45: "providence",
  46: "knowledge", 47: "mercy", 48: "power", 49: "creation", 50: "knowledge",
  51: "knowledge", 52: "providence", 53: "power", 54: "power", 55: "providence",
  56: "power", 57: "knowledge", 58: "creation", 59: "creation", 60: "creation",
  61: "creation", 62: "power", 63: "power", 64: "knowledge", 65: "power",
  66: "power", 67: "power", 68: "power", 69: "power", 70: "power",
  71: "justice", 72: "justice", 73: "power", 74: "power", 75: "knowledge",
  76: "knowledge", 77: "providence", 78: "power", 79: "mercy", 80: "mercy",
  81: "justice", 82: "mercy", 83: "mercy", 84: "power", 85: "power",
  86: "justice", 87: "justice", 88: "providence", 89: "providence", 90: "justice",
  91: "justice", 92: "providence", 93: "knowledge", 94: "knowledge", 95: "creation",
  96: "power", 97: "power", 98: "knowledge", 99: "mercy",
};

// Hand-curated content for the most invoked names. Reflections are written in
// the spirit of Ibn al-Qayyim's contemplative tradition — meaning + heart.
// Du'as follow the Prophetic pattern of calling Allah by His name, then
// asking for what flows from that attribute.
const CURATED: Record<number, Omit<NameEnrichment, "theme">> = {
  1: {
    reflection:
      "Ar-Raḥmān is the mercy that precedes everything — the air filling your lungs, the eyes reading this, the heart still beating. To know this name is to know that you have never, for a single breath, been outside His care.",
    dua: {
      ar: "يَا رَحْمَٰنُ، ٱرْحَمْنِي بِرَحْمَتِكَ ٱلَّتِي وَسِعَتْ كُلَّ شَيْءٍ",
      en: "O Ar-Raḥmān, envelop me in the mercy that has encompassed all things.",
    },
    occurrences: [
      { surah: 1, ayah: 3, surahName: "Al-Fātiḥa" },
      { surah: 55, ayah: 1, surahName: "Ar-Raḥmān" },
      { surah: 19, ayah: 18, surahName: "Maryam" },
    ],
  },
  2: {
    reflection:
      "If Ar-Raḥmān is mercy poured on every creature, Ar-Raḥīm is the special mercy reserved for the believers — in this life and the next. Hope in this name is the antidote to despair over your sins.",
    dua: {
      ar: "يَا رَحِيمُ، ٱجْعَلْنِي مِنْ أَهْلِ رَحْمَتِكَ ٱلْخَاصَّةِ يَوْمَ ٱلْقِيَامَةِ",
      en: "O Ar-Raḥīm, place me among the people of Your special mercy on the Day of Judgement.",
    },
    occurrences: [
      { surah: 1, ayah: 3, surahName: "Al-Fātiḥa" },
      { surah: 33, ayah: 43, surahName: "Al-Aḥzāb" },
    ],
  },
  3: {
    reflection:
      "Al-Malik owns every kingdom — the one in your pocket, the one in the sky, the one inside your chest. When you remember Him as King, every other authority you fear shrinks to its true size.",
    dua: {
      ar: "يَا مَلِكُ، ٱجْعَلْ قَلْبِي تَحْتَ مُلْكِكَ وَلَا تَجْعَلْ لِغَيْرِكَ عَلَيْهِ سُلْطَانًا",
      en: "O Al-Malik, place my heart under Your sovereignty and let nothing else rule over it.",
    },
    occurrences: [
      { surah: 59, ayah: 23, surahName: "Al-Ḥashr" },
      { surah: 114, ayah: 2, surahName: "An-Nās" },
    ],
  },
  8: {
    reflection:
      "Al-'Azīz is might that cannot be overcome — never tired, never outflanked, never humiliated. To stand with Him is to stand with the only side that does not lose.",
    dua: {
      ar: "يَا عَزِيزُ، أَعِزَّنِي بِطَاعَتِكَ وَلَا تُذِلَّنِي بِمَعْصِيَتِكَ",
      en: "O Al-'Azīz, honour me through obedience to You and never humiliate me through disobedience.",
    },
    occurrences: [
      { surah: 2, ayah: 220, surahName: "Al-Baqara" },
      { surah: 35, ayah: 28, surahName: "Fāṭir" },
    ],
  },
  14: {
    reflection:
      "Al-Ghaffār covers sins again and again — not once, not seven times, but every time you turn back. The sin you fear most has already been forgiven the moment your forehead touches the ground in regret.",
    dua: {
      ar: "يَا غَفَّارُ، ٱغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، أَوَّلَهُ وَآخِرَهُ",
      en: "O Al-Ghaffār, forgive me every sin — small and great, first and last.",
    },
    occurrences: [
      { surah: 20, ayah: 82, surahName: "Ṭā-Hā" },
      { surah: 71, ayah: 10, surahName: "Nūḥ" },
    ],
  },
  17: {
    reflection:
      "Ar-Razzāq is the only One who actually feeds you — the salary, the parent, the harvest are merely hands He uses. Whoever is certain of this stops begging from creation and rests their heart in the Provider.",
    dua: {
      ar: "يَا رَزَّاقُ، ٱرْزُقْنِي مِنْ حَيْثُ لَا أَحْتَسِبُ، رِزْقًا حَلَالًا طَيِّبًا مُبَارَكًا",
      en: "O Ar-Razzāq, provide for me from where I do not expect — a provision lawful, pure and blessed.",
    },
    occurrences: [
      { surah: 51, ayah: 58, surahName: "Adh-Dhāriyāt" },
      { surah: 11, ayah: 6, surahName: "Hūd" },
    ],
  },
  19: {
    reflection:
      "Al-'Alīm knows the secret you have not told anyone, the prayer you whispered last night, and the answer that is already on its way. Nothing in your life is unwitnessed, and nothing about you is misunderstood.",
    dua: {
      ar: "يَا عَلِيمُ، عَلِّمْنِي مَا يَنْفَعُنِي، وَٱنْفَعْنِي بِمَا عَلَّمْتَنِي",
      en: "O Al-'Alīm, teach me what benefits me, and let what You have taught me benefit me.",
    },
    occurrences: [
      { surah: 2, ayah: 32, surahName: "Al-Baqara" },
      { surah: 49, ayah: 13, surahName: "Al-Ḥujurāt" },
    ],
  },
  26: {
    reflection:
      "As-Samī' hears the cry inside your chest before it reaches your tongue. The du'a you thought went unanswered was heard the first time and is being prepared in a way better than you asked.",
    dua: {
      ar: "يَا سَمِيعُ، ٱسْمَعْ دُعَائِي وَٱسْتَجِبْ لِي",
      en: "O As-Samī', hear my call and answer me.",
    },
    occurrences: [
      { surah: 2, ayah: 127, surahName: "Al-Baqara" },
      { surah: 14, ayah: 39, surahName: "Ibrāhīm" },
    ],
  },
  27: {
    reflection:
      "Al-Baṣīr sees the ant on the dark stone on the moonless night, and He sees the intention behind your every action. Living under this gaze is the cure for hidden hypocrisy.",
    dua: {
      ar: "يَا بَصِيرُ، ٱجْعَلْنِي مِمَّنْ يَخْشَاكَ فِي ٱلسِّرِّ وَٱلْعَلَنِ",
      en: "O Al-Baṣīr, make me of those who are conscious of You in private and in public.",
    },
    occurrences: [
      { surah: 4, ayah: 58, surahName: "An-Nisā'" },
      { surah: 17, ayah: 1, surahName: "Al-Isrā'" },
    ],
  },
  34: {
    reflection:
      "Al-Ghafūr does not just forgive — He covers the sin so completely it is as if it never happened, and changes its record into a good deed for the truly repentant. No file He closes is ever reopened.",
    dua: {
      ar: "يَا غَفُورُ، ٱغْفِرْ لِي مَا أَسْرَفْتُ، وَتُبْ عَلَيَّ تَوْبَةً نَّصُوحًا",
      en: "O Al-Ghafūr, forgive my excess and grant me a sincere, lasting return to You.",
    },
    occurrences: [
      { surah: 39, ayah: 53, surahName: "Az-Zumar" },
      { surah: 2, ayah: 173, surahName: "Al-Baqara" },
    ],
  },
  44: {
    reflection:
      "Al-Mujīb answers every du'a — sometimes with the thing you asked for, sometimes with something better, sometimes by saving you from what you wanted. No raised hand returns empty from this Door.",
    dua: {
      ar: "يَا مُجِيبُ، أَجِبْ دَعْوَتِي، وَلَا تَرُدَّ يَدَيَّ خَائِبَتَيْنِ",
      en: "O Al-Mujīb, answer my call, and do not return my hands empty.",
    },
    occurrences: [
      { surah: 11, ayah: 61, surahName: "Hūd" },
      { surah: 2, ayah: 186, surahName: "Al-Baqara" },
    ],
  },
  47: {
    reflection:
      "Al-Wadūd loves and is loved — actively, tenderly, by name. He is not merely tolerating you; the One who fashioned the universe holds affection for you in particular when you turn to Him.",
    dua: {
      ar: "يَا وَدُودُ، أَحْبِبْنِي وَحَبِّبْنِي إِلَى عِبَادِكَ ٱلصَّالِحِينَ",
      en: "O Al-Wadūd, love me, and make me beloved to Your righteous servants.",
    },
    occurrences: [
      { surah: 11, ayah: 90, surahName: "Hūd" },
      { surah: 85, ayah: 14, surahName: "Al-Burūj" },
    ],
  },
  52: {
    reflection:
      "Al-Wakīl is the One you delegate your affair to and then sleep at night. The result is in His hands, the means are in yours; do your part and let His sufficiency do the rest.",
    dua: {
      ar: "حَسْبِيَ ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ، يَا وَكِيلُ تَوَكَّلْتُ عَلَيْكَ",
      en: "Allah is enough for me, and what an excellent Trustee. O Al-Wakīl, in You I place my trust.",
    },
    occurrences: [
      { surah: 3, ayah: 173, surahName: "Āl 'Imrān" },
      { surah: 33, ayah: 3, surahName: "Al-Aḥzāb" },
    ],
  },
  62: {
    reflection:
      "Al-Ḥayy is life that has no beginning and no end, that gives life and never borrows it. Whoever leans on the Living One will not be left to die in the moment they need rescuing.",
    dua: {
      ar: "يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ",
      en: "O Ever-Living, O Self-Subsisting, by Your mercy I seek aid — set right all my affairs.",
    },
    occurrences: [
      { surah: 2, ayah: 255, surahName: "Al-Baqara" },
      { surah: 25, ayah: 58, surahName: "Al-Furqān" },
    ],
  },
  63: {
    reflection:
      "Al-Qayyūm sustains everything that exists, every moment, with no break and no rest. The universe does not run on autopilot — it runs because He is holding it up right now.",
    dua: {
      ar: "يَا قَيُّومُ، أَقِمْنِي عَلَى دِينِكَ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
      en: "O Al-Qayyūm, keep me firm upon Your religion, and do not leave me to myself for the blink of an eye.",
    },
    occurrences: [
      { surah: 2, ayah: 255, surahName: "Al-Baqara" },
      { surah: 3, ayah: 2, surahName: "Āl 'Imrān" },
    ],
  },
  80: {
    reflection:
      "At-Tawwāb turns toward you first — He places the regret in your heart, then accepts the repentance He inspired. Every return to Him is a journey He started.",
    dua: {
      ar: "يَا تَوَّابُ، تُبْ عَلَيَّ، إِنَّكَ أَنْتَ ٱلتَّوَّابُ ٱلرَّحِيمُ",
      en: "O At-Tawwāb, accept my repentance — truly You are the Accepter of Repentance, the Merciful.",
    },
    occurrences: [
      { surah: 2, ayah: 37, surahName: "Al-Baqara" },
      { surah: 110, ayah: 3, surahName: "An-Naṣr" },
    ],
  },
  82: {
    reflection:
      "Al-'Afuww does not just forgive the sin — He erases it, scrubs the record clean, removes it even from the angels' pages. Ask for 'afw on Laylat al-Qadr; this is the very name to invoke.",
    dua: {
      ar: "ٱللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ ٱلْعَفْوَ فَٱعْفُ عَنِّي",
      en: "O Allah, You are the Pardoner who loves to pardon, so pardon me.",
    },
    occurrences: [
      { surah: 4, ayah: 99, surahName: "An-Nisā'" },
      { surah: 22, ayah: 60, surahName: "Al-Ḥajj" },
    ],
  },
  93: {
    reflection:
      "An-Nūr is the light by which the heavens stand and by which the heart sees. Without Him, eyes function but see nothing true; with Him, even the blind walk in clarity.",
    dua: {
      ar: "ٱللَّهُمَّ ٱجْعَلْ فِي قَلْبِي نُورًا، وَفِي بَصَرِي نُورًا، وَفِي سَمْعِي نُورًا",
      en: "O Allah, place in my heart light, in my sight light, and in my hearing light.",
    },
    occurrences: [{ surah: 24, ayah: 35, surahName: "An-Nūr" }],
  },
  94: {
    reflection:
      "Al-Hādī is the only One who can take guidance from the page and place it in the heart. The Prophet ﷺ himself could not guide his uncle — guidance is not won, it is granted by this name.",
    dua: {
      ar: "يَا هَادِي، ٱهْدِنِي ٱلصِّرَاطَ ٱلْمُسْتَقِيمَ، وَثَبِّتْنِي عَلَيْهِ",
      en: "O Al-Hādī, guide me to the straight path and keep me firm upon it.",
    },
    occurrences: [
      { surah: 22, ayah: 54, surahName: "Al-Ḥajj" },
      { surah: 25, ayah: 31, surahName: "Al-Furqān" },
    ],
  },
  99: {
    reflection:
      "Aṣ-Ṣabūr never acts in haste, never lashes out, never punishes the moment the wrong is done. Knowing this name softens our own anger and teaches us to wait the way He waits.",
    dua: {
      ar: "يَا صَبُورُ، ٱرْزُقْنِي ٱلصَّبْرَ ٱلْجَمِيلَ عَلَى مَا قَدَّرْتَ",
      en: "O Aṣ-Ṣabūr, grant me beautiful patience with whatever You have decreed.",
    },
    occurrences: [],
  },
};

// Theme-aware request templates used to generate authentic fallback du'as
// for names that don't have hand-curated content. Each follows the Prophetic
// pattern: "O [Name], [request that flows from the attribute]."
const FALLBACK_REQUESTS: Record<NameTheme, { ar: string; en: (m: string) => string }> = {
  mercy: {
    ar: "ٱرْحَمْنِي بِرَحْمَتِكَ، وَٱغْفِرْ لِي خَطَايَايَ",
    en: () => "have mercy on me and forgive my faults.",
  },
  power: {
    ar: "أَعِنِّي بِقُوَّتِكَ، وَٱجْعَلْنِي عَزِيزًا بِكَ، ذَلِيلًا لِغَيْرِكَ",
    en: () => "support me with Your strength, and let me be honoured by You and humble before none else.",
  },
  knowledge: {
    ar: "عَلِّمْنِي مَا يَنْفَعُنِي، وَٱجْعَلْنِي مِنْ عِبَادِكَ ٱلْمُخْلِصِينَ",
    en: () => "teach me what benefits me and make me of Your sincere servants.",
  },
  creation: {
    ar: "أَحْسِنْ خَلْقِي وَخُلُقِي، وَٱجْعَلْنِي شَاهِدًا عَلَى صُنْعِكَ",
    en: () => "perfect my form and my character, and make me a witness to Your craftsmanship.",
  },
  justice: {
    ar: "ٱحْكُمْ بَيْنِي وَبَيْنَ خَلْقِكَ بِٱلْعَدْلِ، وَٱجْعَلْنِي مِنْ أَهْلِ ٱلْإِنْصَافِ",
    en: () => "judge between me and Your creation with justice, and make me of those who deal fairly.",
  },
  providence: {
    ar: "ٱرْزُقْنِي مِنْ فَضْلِكَ ٱلْوَاسِعِ، وَأَغْنِنِي بِحَلَالِكَ عَنْ حَرَامِكَ",
    en: () => "grant me from Your vast bounty and enrich me with what is lawful, away from what is forbidden.",
  },
};

// Build a thoughtful default reflection from the existing meaning + description.
function fallbackReflection(name: AllahName, theme: NameTheme): string {
  const themeAnchor: Record<NameTheme, string> = {
    mercy:
      "Reflecting on this name softens the heart toward Allah and toward His creation — the one who has tasted His mercy cannot withhold it from others.",
    power:
      "Reflecting on this name shrinks every other authority you fear and roots dignity where it truly belongs — in being known by the Most Powerful.",
    knowledge:
      "Reflecting on this name silences the inner accuser — what He knows of you is the only verdict that matters, and He knows the whole story.",
    creation:
      "Reflecting on this name turns ordinary sights into signs — every leaf, every breath, every cell is a fresh act of His will.",
    justice:
      "Reflecting on this name is a comfort to the wronged and a warning to the heedless — no atom of injustice escapes Him.",
    providence:
      "Reflecting on this name frees the heart from begging creation — every door that opens, opens because He decided it should open.",
  };
  return `${name.description}. ${themeAnchor[theme]}`;
}

// Strip the Arabic definite article "Al-" / "Ar-" / "As-" etc. for the
// vocative "Yā [Name]" form, matching how the name is invoked in du'a.
function vocativeArabic(name: AllahName): string {
  // Replace leading ٱل / الْ / ال with nothing so e.g. الرَّحْمَٰنُ → رَحْمَٰنُ
  return name.arabic.replace(/^ٱل|^الْ|^ال/, "");
}

function vocativeTranslit(name: AllahName): string {
  return name.transliteration.replace(/^Al-|^Ar-|^As-|^Ash-|^At-|^Adh-|^An-|^Az-/i, "");
}

function fallbackDua(name: AllahName, theme: NameTheme): { ar: string; en: string } {
  const tmpl = FALLBACK_REQUESTS[theme];
  return {
    ar: `يَا ${vocativeArabic(name)}، ${tmpl.ar}`,
    en: `O ${vocativeTranslit(name)}, ${tmpl.en(name.meaning)}`,
  };
}

export function getEnrichment(name: AllahName): NameEnrichment {
  const theme = THEMES[name.number] ?? "knowledge";
  const curated = CURATED[name.number];
  if (curated) {
    return { theme, ...curated };
  }
  return {
    theme,
    reflection: fallbackReflection(name, theme),
    dua: fallbackDua(name, theme),
    occurrences: [],
  };
}

export interface EnrichedName extends AllahName, NameEnrichment {}

export function enrich(name: AllahName): EnrichedName {
  return { ...name, ...getEnrichment(name) };
}

export const ENRICHED_NAMES: EnrichedName[] = ALLAH_NAMES.map(enrich);
