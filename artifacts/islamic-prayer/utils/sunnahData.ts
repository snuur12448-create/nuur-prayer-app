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

export type MadhabKey = "hanafi" | "maliki" | "shafii" | "hanbali";

export type MadhabViews = Partial<Record<MadhabKey, string>>;

export type SunnahHowTo = {
  steps: string[];
  surahs?: { rakah: number; surahNum: number; nameEn: string; nameAr: string }[];
};

export type SunnahPrayer = {
  id: string;
  nameEn: string;
  nameAr: string;
  rakaat: string;        // "2", "2 + 2", "2 to 8" — kept as a string for flexibility
  status: "Mu'akkadah" | "Ghayr Mu'akkadah" | "Recommended" | "Sunnah" | "Disputed";
  window: string;        // when to perform
  reward: string;        // short text describing the reward / virtue
  hadith: {
    text: string;        // English meaning
    source: string;      // book + reference
    grade: string;       // Ṣaḥīḥ / Ḥasan etc.
  };
  notes?: string;        // optional fiqh note
  madhabViews?: {        // shown only when the four schools meaningfully differ
    label: string;       // e.g. "Number of takbīrāt", "Ruling"
    views: MadhabViews;
  };
  howTo?: SunnahHowTo;   // optional stepwise guide + recommended sūrahs
};

export const MADHAB_LABELS: Record<MadhabKey, string> = {
  hanafi:  "Ḥanafī",
  maliki:  "Mālikī",
  shafii:  "Shāfiʿī",
  hanbali: "Ḥanbalī",
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
        howTo: {
          steps: [
            "Pray quietly — the Prophet ﷺ kept these two short and light.",
            "Recite al-Fātiḥah, then al-Kāfirūn in the first rakʿah.",
            "Recite al-Fātiḥah, then al-Ikhlāṣ in the second rakʿah.",
            "End with the salām and follow with the obligatory Fajr.",
          ],
          surahs: [
            { rakah: 1, surahNum: 109, nameEn: "Al-Kāfirūn", nameAr: "الكافرون" },
            { rakah: 2, surahNum: 112, nameEn: "Al-Ikhlāṣ",  nameAr: "الإخلاص" },
          ],
        },
      },
      {
        id: "rawatib-dhuhr-before",
        nameEn: "Before Dhuhr",
        nameAr: "قبل الظهر",
        rakaat: "2 or 4",
        status: "Mu'akkadah",
        window: "After Dhuhr adhān, before the fard",
        reward: "Whoever prays 12 sunnah rakʿahs in a day, Allah builds for them a house in Paradise.",
        hadith: {
          text: "Whoever is consistent with twelve rakʿahs of voluntary prayer, Allah will build for them a house in Paradise.",
          source: "Ṣaḥīḥ Muslim 728",
          grade: "Ṣaḥīḥ",
        },
        madhabViews: {
          label: "Number of rakʿahs",
          views: {
            hanafi:  "4 (one salām)",
            maliki:  "2 (4 is also recommended)",
            shafii:  "4 (in two pairs, two salāms)",
            hanbali: "2 (4 is also recommended)",
          },
        },
        howTo: {
          steps: [
            "Pray two rakʿahs (or four in two pairs).",
            "Recite al-Fātiḥah followed by a moderate-length sūrah in each rakʿah.",
            "End with the salām, then proceed to the obligatory Dhuhr.",
          ],
        },
      },
      {
        id: "rawatib-dhuhr-after",
        nameEn: "After Dhuhr",
        nameAr: "بعد الظهر",
        rakaat: "2 or 4",
        status: "Mu'akkadah",
        window: "Immediately after the fard of Dhuhr",
        reward: "Counted within the 12 sunnah rakʿahs that earn a house in Paradise.",
        hadith: {
          text: "Whoever prays four before Dhuhr and four after, Allah forbids them to the Fire.",
          source: "Sunan al-Tirmidhī 428",
          grade: "Ṣaḥīḥ",
        },
        madhabViews: {
          label: "Number of rakʿahs",
          views: {
            hanafi:  "2 mu'akkadah, plus 2 more recommended",
            maliki:  "2",
            shafii:  "2 mu'akkadah, with 2 more being meritorious",
            hanbali: "2",
          },
        },
        howTo: {
          steps: [
            "Pray these immediately after the obligatory Dhuhr — best at home.",
            "Two rakʿahs is the minimum; four (in two pairs) is more meritorious.",
            "Standard recitation: al-Fātiḥah and a short sūrah in each rakʿah.",
          ],
        },
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
        howTo: {
          steps: [
            "Pray two short rakʿahs immediately after the obligatory Maghrib.",
            "Recite al-Fātiḥah, then al-Kāfirūn in the first rakʿah.",
            "Recite al-Fātiḥah, then al-Ikhlāṣ in the second rakʿah.",
            "Best prayed at home, as the Prophet ﷺ did.",
          ],
          surahs: [
            { rakah: 1, surahNum: 109, nameEn: "Al-Kāfirūn", nameAr: "الكافرون" },
            { rakah: 2, surahNum: 112, nameEn: "Al-Ikhlāṣ",  nameAr: "الإخلاص" },
          ],
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
        howTo: {
          steps: [
            "Pray two short rakʿahs at home, immediately after the obligatory ʿIshāʾ.",
            "Recite al-Fātiḥah and a short sūrah in each rakʿah.",
            "These complete the 12 rawātib of the day.",
          ],
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
        howTo: {
          steps: [
            "Pray any even number of rakʿahs from 2 up to 8, two at a time.",
            "Recite al-Fātiḥah and a short sūrah (e.g. al-Shams, al-Ḍuḥā) in each rakʿah.",
            "End each pair with the salām before starting the next.",
          ],
          surahs: [
            { rakah: 1, surahNum: 91, nameEn: "Al-Shams", nameAr: "الشمس" },
            { rakah: 2, surahNum: 93, nameEn: "Al-Ḍuḥā",  nameAr: "الضحى" },
          ],
        },
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
        howTo: {
          steps: [
            "Upon entering the masjid, before sitting, face the qibla and make intention.",
            "Pray two short rakʿahs — al-Fātiḥah with a short sūrah is sufficient.",
            "Then sit and engage in dhikr or wait for the next prayer.",
          ],
        },
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
        howTo: {
          steps: [
            "After completing a thorough wuḍūʾ, pray two rakʿahs immediately.",
            "Bring full presence of heart — this is the condition of the reward.",
            "Recite al-Fātiḥah and any short sūrah in each rakʿah.",
          ],
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
        howTo: {
          steps: [
            "Make intention for two voluntary rakʿahs of istikhāra over the matter you face.",
            "Pray two normal rakʿahs — al-Fātiḥah with any sūrah in each.",
            "After the salām, raise your hands and recite the duʿāʾ of istikhāra.",
            "Then proceed with what your heart inclines to and trust Allah.",
          ],
        },
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
        status: "Disputed",
        window: "After ʿIshāʾ until just before Fajr (best in the last third)",
        reward: "Allah is Witr (One) and loves the witr.",
        hadith: {
          text: "Allah is Witr and loves the Witr, so observe the Witr, O people of the Qurʾān.",
          source: "Sunan Abī Dāwūd 1416, Tirmidhī 453",
          grade: "Ṣaḥīḥ",
        },
        madhabViews: {
          label: "Ruling",
          views: {
            hanafi:  "Wājib (obligatory) — sin to leave intentionally",
            maliki:  "Sunnah Mu'akkadah",
            shafii:  "Sunnah Mu'akkadah",
            hanbali: "Sunnah Mu'akkadah (strongest of the voluntary)",
          },
        },
        howTo: {
          steps: [
            "Pray any odd number of rakʿahs — most commonly 3 (or 1 after qiyām).",
            "For 3: pray two rakʿahs and salām, then a single one. Or pray all three together with one salām.",
            "In the single (witr) rakʿah, recite al-Fātiḥah and al-Ikhlāṣ.",
            "Many add the qunūt duʿāʾ in the final rakʿah before or after the rukūʿ.",
          ],
          surahs: [
            { rakah: 3, surahNum: 112, nameEn: "Al-Ikhlāṣ", nameAr: "الإخلاص" },
          ],
        },
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
        howTo: {
          steps: [
            "After sleeping, rise in the last third of the night, perform wuḍūʾ.",
            "Pray two rakʿahs at a time, lengthening the recitation if you can.",
            "The Prophet ﷺ commonly prayed 8 rakʿahs of qiyām, then 3 of witr.",
            "Conclude with witr — do not let it be the last prayer of the night.",
          ],
        },
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
        rakaat: "2 or 4",
        status: "Mu'akkadah",
        window: "Immediately after the fard of Jumuʿah",
        reward: "Continuation of the Prophet's ﷺ practice.",
        hadith: {
          text: "When one of you prays Jumuʿah, let him pray four after it.",
          source: "Ṣaḥīḥ Muslim 881",
          grade: "Ṣaḥīḥ",
        },
        madhabViews: {
          label: "Number of rakʿahs",
          views: {
            hanafi:  "4",
            maliki:  "2 or 4",
            shafii:  "2 in the masjid, 4 at home (both narrated)",
            hanbali: "2 (and 4 is also valid)",
          },
        },
        howTo: {
          steps: [
            "Pray two rakʿahs in the masjid, or four at home — both are sunnah.",
            "Recite al-Fātiḥah and a short sūrah in each rakʿah.",
            "Do not pray immediately after the salām of Jumuʿah — speak briefly or move position first (sunnah).",
          ],
        },
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
        madhabViews: {
          label: "Extra takbīrāt (1st rakʿah + 2nd rakʿah)",
          views: {
            hanafi:  "3 + 3 (excluding takbīrat al-iḥrām and rukūʿ)",
            maliki:  "7 + 6 (including takbīrat al-iḥrām)",
            shafii:  "7 + 5 (after the opening, before recitation)",
            hanbali: "7 + 5 (after the opening, before recitation)",
          },
        },
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
