// ─────────────────────────────────────────────────────────────────────────────
// Sunnah-prayer reference data
// Sources: primarily Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan al-Tirmidhī,
// Sunan Abī Dāwūd, Sunan al-Nasāʾī, Sunan Ibn Mājah. Hadith gradings reflect
// the most widely-accepted classifications among major Sunni scholars.
// ─────────────────────────────────────────────────────────────────────────────

export type SunnahCategoryKey =
  | "rawatib"
  | "special"
  | "night"
  | "occasional";

export type SunnahPrayer = {
  id: string;
  nameEn: string;
  nameAr: string;
  rakaat: string;        // "2", "2 + 2", "2 to 8" — kept as a string for flexibility
  status: "Mu'akkadah" | "Ghayr Mu'akkadah" | "Wājib (Ḥanafī)" | "Recommended" | "Sunnah";
  window: string;        // when to perform
  reward: string;        // short text describing the reward / virtue
  hadith: {
    text: string;        // English meaning
    source: string;      // book + reference
    grade: string;       // Ṣaḥīḥ / Ḥasan etc.
  };
  notes?: string;        // optional fiqh note
};

export type SunnahCategory = {
  key: SunnahCategoryKey;
  titleEn: string;
  titleAr: string;
  blurb: string;
  prayers: SunnahPrayer[];
};

export const SUNNAH_DATA: SunnahCategory[] = [
  {
    key: "rawatib",
    titleEn: "Sunan al-Rawātib",
    titleAr: "السُّنَن الرَّوَاتِب",
    blurb:
      "The 12 confirmed sunnah rakʿahs attached to the five daily prayers. Whoever prays them consistently has a house built for them in Paradise.",
    prayers: [
      {
        id: "rawatib-fajr",
        nameEn: "Before Fajr",
        nameAr: "سنة الفجر",
        rakaat: "2",
        status: "Mu'akkadah",
        window: "Between Fajr adhān and the fard",
        reward: "Better than the world and all that is in it.",
        hadith: {
          text: "The two rakʿahs of Fajr are better than the world and all that is in it.",
          source: "Ṣaḥīḥ Muslim 725",
          grade: "Ṣaḥīḥ",
        },
        notes: "The Prophet ﷺ never left these two, even while travelling.",
      },
      {
        id: "rawatib-dhuhr-before",
        nameEn: "Before Dhuhr",
        nameAr: "قبل الظهر",
        rakaat: "4 (or 2)",
        status: "Mu'akkadah",
        window: "After Dhuhr adhān, before the fard",
        reward: "Whoever prays 12 sunnah rakʿahs in a day, Allah builds for them a house in Paradise.",
        hadith: {
          text: "Whoever is consistent with twelve rakʿahs of voluntary prayer, Allah will build for them a house in Paradise.",
          source: "Ṣaḥīḥ Muslim 728",
          grade: "Ṣaḥīḥ",
        },
      },
      {
        id: "rawatib-dhuhr-after",
        nameEn: "After Dhuhr",
        nameAr: "بعد الظهر",
        rakaat: "2",
        status: "Mu'akkadah",
        window: "Immediately after the fard of Dhuhr",
        reward: "Counted within the 12 sunnah rakʿahs that earn a house in Paradise.",
        hadith: {
          text: "Whoever prays four before Dhuhr and four after, Allah forbids them to the Fire.",
          source: "Sunan al-Tirmidhī 428",
          grade: "Ṣaḥīḥ",
        },
        notes: "Some narrations mention four after Dhuhr — extra reward, not obligatory.",
      },
      {
        id: "rawatib-maghrib",
        nameEn: "After Maghrib",
        nameAr: "بعد المغرب",
        rakaat: "2",
        status: "Mu'akkadah",
        window: "Immediately after the fard of Maghrib",
        reward: "Part of the 12 rawātib of Paradise.",
        hadith: {
          text: "The Prophet ﷺ used to pray two rakʿahs after Maghrib in his house.",
          source: "Ṣaḥīḥ al-Bukhārī 1180",
          grade: "Ṣaḥīḥ",
        },
      },
      {
        id: "rawatib-isha",
        nameEn: "After ʿIshāʾ",
        nameAr: "بعد العشاء",
        rakaat: "2",
        status: "Mu'akkadah",
        window: "Immediately after the fard of ʿIshāʾ",
        reward: "Completes the 12 rawātib.",
        hadith: {
          text: "I memorised from the Prophet ﷺ ten rakʿahs: two before Dhuhr and two after, two after Maghrib in his house, two after ʿIshāʾ in his house, and two before Fajr.",
          source: "Ṣaḥīḥ al-Bukhārī 1180",
          grade: "Ṣaḥīḥ",
        },
      },
      {
        id: "rawatib-asr-before",
        nameEn: "Before ʿAṣr",
        nameAr: "قبل العصر",
        rakaat: "4 (or 2)",
        status: "Ghayr Mu'akkadah",
        window: "Between the adhān of ʿAṣr and the fard",
        reward: "May Allah have mercy on the one who prays four before ʿAṣr.",
        hadith: {
          text: "May Allah have mercy on a person who prays four (rakʿahs) before ʿAṣr.",
          source: "Sunan Abī Dāwūd 1271, Tirmidhī 430",
          grade: "Ḥasan",
        },
        notes: "Not from the 12 mu'akkadah but a recommended additional sunnah.",
      },
    ],
  },
  {
    key: "special",
    titleEn: "Recommended at Special Times",
    titleAr: "صَلَوَاتٌ مُسْتَحَبَّة",
    blurb:
      "Voluntary prayers tied to particular moments — entering the masjid, after wuḍūʾ, the bright morning, and seeking guidance.",
    prayers: [
      {
        id: "duha",
        nameEn: "Ṣalāt al-Ḍuḥā",
        nameAr: "صلاة الضحى",
        rakaat: "2 to 8",
        status: "Recommended",
        window: "From ~15 mins after sunrise until ~15 mins before Dhuhr",
        reward: "Suffices as charity for every joint in the body each morning.",
        hadith: {
          text: "Every morning, charity is due upon every joint of one of you. … And two rakʿahs prayed in the forenoon (Ḍuḥā) are sufficient for all of that.",
          source: "Ṣaḥīḥ Muslim 720",
          grade: "Ṣaḥīḥ",
        },
        notes: "Best time is when the heat intensifies, roughly the last third of the morning.",
      },
      {
        id: "tahiyyat-masjid",
        nameEn: "Taḥiyyat al-Masjid",
        nameAr: "تحية المسجد",
        rakaat: "2",
        status: "Mu'akkadah",
        window: "Upon entering the masjid, before sitting",
        reward: "Greeting the house of Allah.",
        hadith: {
          text: "When one of you enters the masjid, let him not sit until he has prayed two rakʿahs.",
          source: "Ṣaḥīḥ al-Bukhārī 444, Muslim 714",
          grade: "Ṣaḥīḥ",
        },
        notes: "Skipped during the three forbidden times unless one fears missing a fard.",
      },
      {
        id: "wudu",
        nameEn: "Two Rakʿahs after Wuḍūʾ",
        nameAr: "ركعتا الوضوء",
        rakaat: "2",
        status: "Recommended",
        window: "After completing wuḍūʾ, with focus and presence",
        reward: "Forgiveness of past minor sins.",
        hadith: {
          text: "Whoever performs wuḍūʾ as I have, then prays two rakʿahs without letting his mind wander, his past sins are forgiven.",
          source: "Ṣaḥīḥ al-Bukhārī 159, Muslim 226",
          grade: "Ṣaḥīḥ",
        },
      },
      {
        id: "istikhara",
        nameEn: "Ṣalāt al-Istikhāra",
        nameAr: "صلاة الاستخارة",
        rakaat: "2",
        status: "Recommended",
        window: "Any permissible time, before making a decision",
        reward: "Seeking the choice of Allah in a matter.",
        hadith: {
          text: "When one of you is concerned about an affair, let him pray two rakʿahs other than the obligatory, then say: O Allah, I seek Your guidance through Your knowledge…",
          source: "Ṣaḥīḥ al-Bukhārī 1162",
          grade: "Ṣaḥīḥ",
        },
        notes: "The duʿāʾ is recited after the salām, not within the prayer.",
      },
      {
        id: "tawbah",
        nameEn: "Ṣalāt al-Tawbah",
        nameAr: "صلاة التوبة",
        rakaat: "2",
        status: "Recommended",
        window: "After committing a sin, before sincere repentance",
        reward: "Allah forgives the one who prays it and asks forgiveness sincerely.",
        hadith: {
          text: "There is no servant who commits a sin, then performs wuḍūʾ well, prays two rakʿahs, and asks Allah's forgiveness, except that Allah forgives him.",
          source: "Sunan Abī Dāwūd 1521, Tirmidhī 406",
          grade: "Ḥasan",
        },
      },
    ],
  },
  {
    key: "night",
    titleEn: "Qiyām al-Layl & Witr",
    titleAr: "قِيَامُ اللَّيْل وَالْوِتْر",
    blurb:
      "The night prayer — the honour of the believer — and Witr, the seal of the night.",
    prayers: [
      {
        id: "witr",
        nameEn: "Witr",
        nameAr: "الوتر",
        rakaat: "1, 3, 5, 7, or 9 (odd)",
        status: "Mu'akkadah",
        window: "After ʿIshāʾ until just before Fajr (best in the last third)",
        reward: "Allah is Witr (One) and loves the witr.",
        hadith: {
          text: "Allah is Witr and loves the Witr, so observe the Witr, O people of the Qurʾān.",
          source: "Sunan Abī Dāwūd 1416, Tirmidhī 453",
          grade: "Ṣaḥīḥ",
        },
        notes: "Considered Wājib in the Ḥanafī school. Most other schools hold it as a confirmed sunnah.",
      },
      {
        id: "tahajjud",
        nameEn: "Tahajjud",
        nameAr: "التهجد",
        rakaat: "2 by 2 (commonly 8 + 3)",
        status: "Recommended",
        window: "After sleeping, in the last third of the night",
        reward: "The most virtuous prayer after the obligatory.",
        hadith: {
          text: "The best prayer after the obligatory is the night prayer.",
          source: "Ṣaḥīḥ Muslim 1163",
          grade: "Ṣaḥīḥ",
        },
        notes: "Our Lord descends to the lowest heaven in the last third of the night, asking who will call upon Him to answer them. (Bukhārī 1145)",
      },
      {
        id: "qiyam",
        nameEn: "Qiyām al-Layl",
        nameAr: "قيام الليل",
        rakaat: "Any even count, then Witr",
        status: "Recommended",
        window: "Any time of the night after ʿIshāʾ",
        reward: "Honour of the believer; a means of nearness to Allah.",
        hadith: {
          text: "Hold fast to qiyām al-layl, for it was the practice of the righteous before you, a means of nearness to your Lord, an expiation for sins, and a barrier against wrongdoing.",
          source: "Sunan al-Tirmidhī 3549",
          grade: "Ḥasan",
        },
      },
      {
        id: "tarawih",
        nameEn: "Tarāwīḥ",
        nameAr: "التراويح",
        rakaat: "8 or 20 (in pairs), plus Witr",
        status: "Mu'akkadah",
        window: "Nightly during Ramaḍān, after ʿIshāʾ",
        reward: "Whoever stands the nights of Ramaḍān in faith and seeking reward, his past sins are forgiven.",
        hadith: {
          text: "Whoever stands (in prayer) during Ramaḍān out of faith and seeking reward, his previous sins will be forgiven.",
          source: "Ṣaḥīḥ al-Bukhārī 37, Muslim 759",
          grade: "Ṣaḥīḥ",
        },
      },
    ],
  },
  {
    key: "occasional",
    titleEn: "Eid, Jumuʿah & Eclipses",
    titleAr: "صَلَوَاتُ الْمُنَاسَبَات",
    blurb:
      "Sunnah prayers tied to specific occasions — the two Eids, Friday, and natural signs.",
    prayers: [
      {
        id: "jumuah-before",
        nameEn: "Before Jumuʿah",
        nameAr: "سنة قبل الجمعة",
        rakaat: "2 or 4 (any number)",
        status: "Recommended",
        window: "After arriving at the masjid, before the khuṭbah",
        reward: "Sins between this Jumuʿah and the next are wiped away.",
        hadith: {
          text: "Whoever performs ghusl, comes early, draws near the imam, listens, and does not engage in idle talk — for every step he takes there is the reward of a year of fasting and standing in prayer.",
          source: "Sunan Abī Dāwūd 345, Tirmidhī 496",
          grade: "Ṣaḥīḥ",
        },
        notes: "There is no fixed pre-Jumuʿah sunnah like Dhuhr; pray as much as is easy.",
      },
      {
        id: "jumuah-after",
        nameEn: "After Jumuʿah",
        nameAr: "سنة بعد الجمعة",
        rakaat: "2 (in masjid) or 4 (at home)",
        status: "Mu'akkadah",
        window: "Immediately after the fard of Jumuʿah",
        reward: "Continuation of the Prophet's ﷺ practice.",
        hadith: {
          text: "When one of you prays Jumuʿah, let him pray four after it.",
          source: "Ṣaḥīḥ Muslim 881",
          grade: "Ṣaḥīḥ",
        },
        notes: "If praying at the masjid: two; if at home: four. Both narrated.",
      },
      {
        id: "eid",
        nameEn: "Ṣalāt al-ʿĪdayn",
        nameAr: "صلاة العيدين",
        rakaat: "2 (with extra takbīrāt)",
        status: "Mu'akkadah",
        window: "Morning of Eid al-Fiṭr and Eid al-Aḍḥā, after sunrise",
        reward: "A communal sign of the religion.",
        hadith: {
          text: "The Prophet ﷺ used to go out on the day of ʿĪd to the prayer place and the first thing he would begin with was the prayer.",
          source: "Ṣaḥīḥ al-Bukhārī 956",
          grade: "Ṣaḥīḥ",
        },
        notes: "Seven takbīrāt in the first rakʿah and five in the second (in the Shāfiʿī/Mālikī view).",
      },
      {
        id: "kusuf",
        nameEn: "Ṣalāt al-Kusūf",
        nameAr: "صلاة الكسوف",
        rakaat: "2 (with two rukūʿs each)",
        status: "Mu'akkadah",
        window: "During a solar or lunar eclipse",
        reward: "A reminder of the signs of Allah.",
        hadith: {
          text: "The sun and moon are two signs from the signs of Allah; they are not eclipsed for the death or life of anyone. So when you see that, pray and supplicate until it is uncovered.",
          source: "Ṣaḥīḥ al-Bukhārī 1041",
          grade: "Ṣaḥīḥ",
        },
      },
      {
        id: "istisqa",
        nameEn: "Ṣalāt al-Istisqāʾ",
        nameAr: "صلاة الاستسقاء",
        rakaat: "2",
        status: "Sunnah",
        window: "In times of drought, prayed in congregation",
        reward: "Seeking rain and mercy from Allah.",
        hadith: {
          text: "The Prophet ﷺ went out to the prayer place to pray for rain. He faced the qibla, turned his cloak inside out, and prayed two rakʿahs.",
          source: "Ṣaḥīḥ al-Bukhārī 1024",
          grade: "Ṣaḥīḥ",
        },
      },
    ],
  },
];
