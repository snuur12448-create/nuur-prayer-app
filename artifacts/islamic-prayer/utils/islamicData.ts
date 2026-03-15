export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishMeaning: string;
  verses: number;
  revelationType: "Meccan" | "Medinan";
}

export interface DuaCategory {
  id: string;
  name: string;
  icon: string;
  duas: Dua[];
}

export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference?: string;
}

export interface IslamicReminder {
  id: string;
  text: string;
  source: string;
}

export const SURAHS: Surah[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", englishMeaning: "The Opening", verses: 7, revelationType: "Meccan" },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", englishMeaning: "The Cow", verses: 286, revelationType: "Medinan" },
  { number: 3, name: "آل عمران", englishName: "Ali 'Imran", englishMeaning: "Family of Imran", verses: 200, revelationType: "Medinan" },
  { number: 4, name: "النساء", englishName: "An-Nisa", englishMeaning: "The Women", verses: 176, revelationType: "Medinan" },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", englishMeaning: "The Table Spread", verses: 120, revelationType: "Medinan" },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", englishMeaning: "The Cattle", verses: 165, revelationType: "Meccan" },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", englishMeaning: "The Heights", verses: 206, revelationType: "Meccan" },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", englishMeaning: "The Spoils of War", verses: 75, revelationType: "Medinan" },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", englishMeaning: "The Repentance", verses: 129, revelationType: "Medinan" },
  { number: 10, name: "يونس", englishName: "Yunus", englishMeaning: "Jonah", verses: 109, revelationType: "Meccan" },
  { number: 11, name: "هود", englishName: "Hud", englishMeaning: "Hud", verses: 123, revelationType: "Meccan" },
  { number: 12, name: "يوسف", englishName: "Yusuf", englishMeaning: "Joseph", verses: 111, revelationType: "Meccan" },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", englishMeaning: "The Thunder", verses: 43, revelationType: "Medinan" },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", englishMeaning: "Abraham", verses: 52, revelationType: "Meccan" },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", englishMeaning: "The Rocky Tract", verses: 99, revelationType: "Meccan" },
  { number: 16, name: "النحل", englishName: "An-Nahl", englishMeaning: "The Bee", verses: 128, revelationType: "Meccan" },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", englishMeaning: "The Night Journey", verses: 111, revelationType: "Meccan" },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", englishMeaning: "The Cave", verses: 110, revelationType: "Meccan" },
  { number: 19, name: "مريم", englishName: "Maryam", englishMeaning: "Mary", verses: 98, revelationType: "Meccan" },
  { number: 20, name: "طه", englishName: "Ta-Ha", englishMeaning: "Ta-Ha", verses: 135, revelationType: "Meccan" },
  { number: 36, name: "يس", englishName: "Ya-Sin", englishMeaning: "Ya Sin", verses: 83, revelationType: "Meccan" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", englishMeaning: "The Beneficent", verses: 78, revelationType: "Medinan" },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'a", englishMeaning: "The Event", verses: 96, revelationType: "Meccan" },
  { number: 67, name: "الملك", englishName: "Al-Mulk", englishMeaning: "The Sovereignty", verses: 30, revelationType: "Meccan" },
  { number: 78, name: "النبأ", englishName: "An-Naba", englishMeaning: "The Great News", verses: 40, revelationType: "Meccan" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", englishMeaning: "The Sincerity", verses: 4, revelationType: "Meccan" },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", englishMeaning: "The Dawn", verses: 5, revelationType: "Meccan" },
  { number: 114, name: "الناس", englishName: "An-Nas", englishMeaning: "Mankind", verses: 6, revelationType: "Meccan" },
];

export const DUA_CATEGORIES: DuaCategory[] = [
  {
    id: "morning",
    name: "Morning Adhkar",
    icon: "sunrise",
    duas: [
      {
        id: "m1",
        title: "Morning Remembrance",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ",
        transliteration: "Asbahna wa asbahal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah",
        translation: "We have entered the morning and the kingdom belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner.",
        reference: "Abu Dawud 4:317"
      },
      {
        id: "m2",
        title: "Protection from Evil",
        arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
        transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namootu wa ilaykan-nushoor",
        translation: "O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die, and unto You is our resurrection.",
        reference: "At-Tirmidhi 3391"
      },
      {
        id: "m3",
        title: "Seeking Protection",
        arabic: "أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ - اللهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ",
        transliteration: "A'udhu billahi minash-shaytanir-rajeem - Allahu la ilaha illa huwal-hayyul-qayyum",
        translation: "I seek refuge in Allah from Satan the accursed - Allah! There is none worthy of worship but Him, the Living, the Self-Subsisting.",
        reference: "Abu Dawud 4:317"
      }
    ]
  },
  {
    id: "evening",
    name: "Evening Adhkar",
    icon: "moon",
    duas: [
      {
        id: "e1",
        title: "Evening Remembrance",
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ للهِ، وَالْحَمْدُ للهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
        transliteration: "Amsayna wa amsal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah",
        translation: "We have entered the evening and the kingdom belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner.",
        reference: "Abu Dawud 4:317"
      },
      {
        id: "e2",
        title: "Seeking Forgiveness",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ",
        transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana abduk",
        translation: "O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant.",
        reference: "Al-Bukhari 8:318"
      }
    ]
  },
  {
    id: "prayer",
    name: "After Prayer",
    icon: "hands-praying",
    duas: [
      {
        id: "p1",
        title: "After Salah",
        arabic: "سُبْحَانَ اللهِ ❋ الْحَمْدُ للهِ ❋ اللهُ أَكْبَرُ",
        transliteration: "SubhanAllah (33x) • Alhamdulillah (33x) • Allahu Akbar (34x)",
        translation: "Glory be to Allah (33 times) • All praise is for Allah (33 times) • Allah is the Greatest (34 times)",
        reference: "Muslim 939"
      },
      {
        id: "p2",
        title: "Ayat al-Kursi",
        arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
        transliteration: "Allahu la ilaha illa huwal-hayyul-qayyum, la ta'khudhuhu sinatun wa la nawm",
        translation: "Allah! There is no god but He, the Ever-Living, the Self-Subsisting. Neither drowsiness overtakes Him nor sleep.",
        reference: "Al-Baqarah 2:255"
      },
      {
        id: "p3",
        title: "Seeking Protection",
        arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
        transliteration: "Allahumma a'inni ala dhikrika wa shukrika wa husni 'ibadatik",
        translation: "O Allah, help me to remember You, to give thanks to You, and to worship You in the best manner.",
        reference: "Abu Dawud 1522"
      }
    ]
  },
  {
    id: "daily",
    name: "Daily Supplications",
    icon: "heart",
    duas: [
      {
        id: "d1",
        title: "Before Eating",
        arabic: "بِسْمِ اللهِ وَعَلَى بَرَكَةِ اللهِ",
        transliteration: "Bismillahi wa 'ala barakatillah",
        translation: "In the name of Allah and with the blessings of Allah.",
        reference: "Abu Dawud 3767"
      },
      {
        id: "d2",
        title: "After Eating",
        arabic: "الْحَمْدُ لِلهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
        transliteration: "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana muslimeen",
        translation: "All praise is for Allah who fed us and gave us drink and made us Muslims.",
        reference: "Abu Dawud 3850"
      },
      {
        id: "d3",
        title: "Entering Home",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ",
        transliteration: "Allahumma inni as'aluka khayral mawlaji wa khayral makhraj",
        translation: "O Allah, I ask You for a good entry and a good exit.",
        reference: "Abu Dawud 5096"
      },
      {
        id: "d4",
        title: "Entering Masjid",
        arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        transliteration: "Allahumma iftah li abwaba rahmatik",
        translation: "O Allah, open the gates of Your mercy for me.",
        reference: "Muslim 713"
      }
    ]
  },
  {
    id: "protection",
    name: "Protection & Safety",
    icon: "shield",
    duas: [
      {
        id: "pr1",
        title: "Anxiety & Sorrow",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
        transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazani",
        translation: "O Allah, I seek refuge in You from worry and grief.",
        reference: "Al-Bukhari 7/158"
      },
      {
        id: "pr2",
        title: "Before Sleeping",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allahumma amutu wa ahya",
        translation: "In Your name O Allah, I die and I live.",
        reference: "Al-Bukhari 11/113"
      },
      {
        id: "pr3",
        title: "Upon Waking",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
        translation: "All praise is for Allah who gave us life after causing us to die, and unto Him is the resurrection.",
        reference: "Al-Bukhari 11/113"
      }
    ]
  }
];

export const ISLAMIC_REMINDERS: IslamicReminder[] = [
  {
    id: "r1",
    text: "The best of people are those that bring most benefit to the rest of mankind.",
    source: "Prophet Muhammad ﷺ (Daraqutni)"
  },
  {
    id: "r2",
    text: "Verily, with hardship comes ease.",
    source: "Quran 94:5"
  },
  {
    id: "r3",
    text: "And whoever relies upon Allah – then He is sufficient for him.",
    source: "Quran 65:3"
  },
  {
    id: "r4",
    text: "The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger.",
    source: "Prophet Muhammad ﷺ (Bukhari)"
  },
  {
    id: "r5",
    text: "Make things easy and do not make them difficult, cheer people up and do not drive them away.",
    source: "Prophet Muhammad ﷺ (Bukhari)"
  },
  {
    id: "r6",
    text: "None of you will have faith till he loves for his brother what he loves for himself.",
    source: "Prophet Muhammad ﷺ (Bukhari)"
  },
  {
    id: "r7",
    text: "And your Lord says, 'Call upon Me; I will respond to you.'",
    source: "Quran 40:60"
  },
  {
    id: "r8",
    text: "Speak good or remain silent.",
    source: "Prophet Muhammad ﷺ (Bukhari & Muslim)"
  },
  {
    id: "r9",
    text: "Richness is not having many belongings, but richness is the richness of the soul.",
    source: "Prophet Muhammad ﷺ (Bukhari)"
  },
  {
    id: "r10",
    text: "Indeed, Allah does not wrong the people at all, but it is the people who are wronging themselves.",
    source: "Quran 10:44"
  },
  {
    id: "r11",
    text: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.",
    source: "Prophet Muhammad ﷺ (Bukhari & Muslim)"
  },
  {
    id: "r12",
    text: "Be in this world as if you were a stranger or a traveler.",
    source: "Prophet Muhammad ﷺ (Bukhari)"
  }
];

export function getTodaysReminder(): IslamicReminder {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return ISLAMIC_REMINDERS[dayOfYear % ISLAMIC_REMINDERS.length];
}

export function getIslamicDate(): { day: number; month: string; year: number } {
  const now = new Date();
  const JD = Math.floor(now.getTime() / 86400000) + 2440588;
  const L = JD - 1948440 + 10632;
  const N = Math.floor((L - 1) / 10631);
  const LL = L - 10631 * N + 354;
  const J = Math.floor((10985 - LL) / 5316) * Math.floor(50 * LL / 17719) + Math.floor(LL / 5670) * Math.floor(43 * LL / 15238);
  const LL2 = LL - Math.floor((30 - J) / 15) * Math.floor(17719 * J / 50) - Math.floor(J / 16) * Math.floor(15238 * J / 43) + 29;
  const month = Math.floor(24 * LL2 / 709);
  const day = LL2 - Math.floor(709 * month / 24);
  const year = 30 * N + J - 30;

  const months = [
    "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qa'dah", "Dhu al-Hijjah"
  ];

  return { day, month: months[month - 1] || "Unknown", year };
}
