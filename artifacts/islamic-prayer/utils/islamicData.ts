export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishMeaning: string;
  verses: number;
  revelationType: "Meccan" | "Medinan";
  juz: number;
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
  { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", englishMeaning: "The Opening", verses: 7, revelationType: "Meccan", juz: 1 },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", englishMeaning: "The Cow", verses: 286, revelationType: "Medinan", juz: 1 },
  { number: 3, name: "آل عمران", englishName: "Ali 'Imran", englishMeaning: "Family of Imran", verses: 200, revelationType: "Medinan", juz: 3 },
  { number: 4, name: "النساء", englishName: "An-Nisa", englishMeaning: "The Women", verses: 176, revelationType: "Medinan", juz: 4 },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", englishMeaning: "The Table Spread", verses: 120, revelationType: "Medinan", juz: 6 },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", englishMeaning: "The Cattle", verses: 165, revelationType: "Meccan", juz: 7 },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", englishMeaning: "The Heights", verses: 206, revelationType: "Meccan", juz: 8 },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", englishMeaning: "The Spoils of War", verses: 75, revelationType: "Medinan", juz: 9 },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", englishMeaning: "The Repentance", verses: 129, revelationType: "Medinan", juz: 10 },
  { number: 10, name: "يونس", englishName: "Yunus", englishMeaning: "Jonah", verses: 109, revelationType: "Meccan", juz: 11 },
  { number: 11, name: "هود", englishName: "Hud", englishMeaning: "Hud", verses: 123, revelationType: "Meccan", juz: 11 },
  { number: 12, name: "يوسف", englishName: "Yusuf", englishMeaning: "Joseph", verses: 111, revelationType: "Meccan", juz: 12 },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", englishMeaning: "The Thunder", verses: 43, revelationType: "Medinan", juz: 13 },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", englishMeaning: "Abraham", verses: 52, revelationType: "Meccan", juz: 13 },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", englishMeaning: "The Rocky Tract", verses: 99, revelationType: "Meccan", juz: 14 },
  { number: 16, name: "النحل", englishName: "An-Nahl", englishMeaning: "The Bee", verses: 128, revelationType: "Meccan", juz: 14 },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", englishMeaning: "The Night Journey", verses: 111, revelationType: "Meccan", juz: 15 },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", englishMeaning: "The Cave", verses: 110, revelationType: "Meccan", juz: 15 },
  { number: 19, name: "مريم", englishName: "Maryam", englishMeaning: "Mary", verses: 98, revelationType: "Meccan", juz: 16 },
  { number: 20, name: "طه", englishName: "Ta-Ha", englishMeaning: "Ta-Ha", verses: 135, revelationType: "Meccan", juz: 16 },
  { number: 36, name: "يس", englishName: "Ya-Sin", englishMeaning: "Ya Sin", verses: 83, revelationType: "Meccan", juz: 22 },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", englishMeaning: "The Beneficent", verses: 78, revelationType: "Medinan", juz: 27 },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'a", englishMeaning: "The Event", verses: 96, revelationType: "Meccan", juz: 27 },
  { number: 67, name: "الملك", englishName: "Al-Mulk", englishMeaning: "The Sovereignty", verses: 30, revelationType: "Meccan", juz: 29 },
  { number: 78, name: "النبأ", englishName: "An-Naba", englishMeaning: "The Great News", verses: 40, revelationType: "Meccan", juz: 30 },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah", englishMeaning: "The Earthquake", verses: 8, revelationType: "Medinan", juz: 30 },
  { number: 100, name: "العاديات", englishName: "Al-'Adiyat", englishMeaning: "The Courser", verses: 11, revelationType: "Meccan", juz: 30 },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah", englishMeaning: "The Calamity", verses: 11, revelationType: "Meccan", juz: 30 },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", englishMeaning: "The Rivalry in Worldly Things", verses: 8, revelationType: "Meccan", juz: 30 },
  { number: 103, name: "العصر", englishName: "Al-'Asr", englishMeaning: "The Declining Day", verses: 3, revelationType: "Meccan", juz: 30 },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah", englishMeaning: "The Slanderer", verses: 9, revelationType: "Meccan", juz: 30 },
  { number: 105, name: "الفيل", englishName: "Al-Fil", englishMeaning: "The Elephant", verses: 5, revelationType: "Meccan", juz: 30 },
  { number: 106, name: "قريش", englishName: "Quraysh", englishMeaning: "Quraysh", verses: 4, revelationType: "Meccan", juz: 30 },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", englishMeaning: "Small Kindnesses", verses: 7, revelationType: "Meccan", juz: 30 },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", englishMeaning: "Abundance", verses: 3, revelationType: "Meccan", juz: 30 },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", englishMeaning: "The Disbelievers", verses: 6, revelationType: "Meccan", juz: 30 },
  { number: 110, name: "النصر", englishName: "An-Nasr", englishMeaning: "The Victory", verses: 3, revelationType: "Medinan", juz: 30 },
  { number: 111, name: "المسد", englishName: "Al-Masad", englishMeaning: "The Palm Fiber", verses: 5, revelationType: "Meccan", juz: 30 },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", englishMeaning: "The Sincerity", verses: 4, revelationType: "Meccan", juz: 30 },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", englishMeaning: "The Dawn", verses: 5, revelationType: "Meccan", juz: 30 },
  { number: 114, name: "الناس", englishName: "An-Nas", englishMeaning: "Mankind", verses: 6, revelationType: "Meccan", juz: 30 },
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
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "Asbahna wa asbahal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul mulku wa lahul hamdu wa huwa 'ala kulli shay'in qadeer",
        translation: "We have entered the morning and the kingdom belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner. To Him belongs dominion and praise, and He is over all things capable.",
        reference: "Abu Dawud 4:317"
      },
      {
        id: "m2",
        title: "Entering the Morning",
        arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
        transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namootu wa ilaykan-nushoor",
        translation: "O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die, and unto You is our resurrection.",
        reference: "At-Tirmidhi 3391"
      },
      {
        id: "m3",
        title: "Ayat al-Kursi (Morning)",
        arabic: "اللهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ",
        transliteration: "Allahu la ilaha illa huwal-hayyul-qayyum, la ta'khudhuhu sinatun wa la nawm",
        translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.",
        reference: "Al-Baqarah 2:255 — recite once every morning"
      },
      {
        id: "m4",
        title: "Seeking Protection (x3)",
        arabic: "بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'aleem",
        translation: "In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
        reference: "Abu Dawud 5088 — recite 3 times every morning"
      },
      {
        id: "m5",
        title: "Sayyid al-Istighfar",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
        transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana abduk, wa ana 'ala 'ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bini'matika 'alayya wa abu'u bidhanbi faghfir li fa'innahu la yaghfirudh-dhunuba illa ant",
        translation: "O Allah, You are my Lord. There is no deity except You. You created me and I am Your servant, and I adhere to Your covenant and Your promise as best as I can. I seek refuge in You from the evil that I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me, for none forgives sins but You.",
        reference: "Al-Bukhari 6306 — the Master of seeking forgiveness"
      },
      {
        id: "m6",
        title: "Al-Ikhlas & Mu'awwidhatayn (x3)",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ❋ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ❋ قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        transliteration: "Qul huwallahu ahad... Qul a'udhu birabbil-falaq... Qul a'udhu birabbin-nas...",
        translation: "Recite Surah Al-Ikhlas, Al-Falaq, and An-Nas — each three times in the morning and evening.",
        reference: "Abu Dawud 5082"
      },
      {
        id: "m7",
        title: "Morning Tasbih",
        arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
        transliteration: "SubhanAllahi wa bihamdih",
        translation: "Glory be to Allah and His is the praise — recite 100 times in the morning.",
        reference: "Muslim 2691 — sins forgiven even if like the foam of the sea"
      },
      {
        id: "m8",
        title: "Morning Dua for Well-being",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ",
        transliteration: "Allahumma inni as'alukal-'afiyata fid-dunya wal-akhirah",
        translation: "O Allah, I ask You for well-being in this world and in the Hereafter.",
        reference: "Ibn Majah 3871"
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
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ للهِ، وَالْحَمْدُ للهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "Amsayna wa amsal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul mulku wa lahul hamdu wa huwa 'ala kulli shay'in qadeer",
        translation: "We have entered the evening and the kingdom belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner. To Him belongs dominion and praise, and He is over all things capable.",
        reference: "Abu Dawud 4:317"
      },
      {
        id: "e2",
        title: "Sayyid al-Istighfar (Evening)",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ",
        transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana abduk",
        translation: "O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant.",
        reference: "Al-Bukhari 8:318 — whoever says this at night with certainty and dies that night, enters Paradise"
      },
      {
        id: "e3",
        title: "Protection at Evening (x3)",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
        translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        reference: "Muslim 2709 — no harm will befall one who says this in the evening"
      },
      {
        id: "e4",
        title: "Evening Protection (x3)",
        arabic: "بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'aleem",
        translation: "In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
        reference: "Abu Dawud 5088"
      },
      {
        id: "e5",
        title: "Before Sleep",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allahumma amutu wa ahya",
        translation: "In Your name O Allah, I die and I live.",
        reference: "Al-Bukhari 11/113"
      },
      {
        id: "e6",
        title: "Al-Ikhlas & Mu'awwidhatayn (x3)",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ❋ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ❋ قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        transliteration: "Qul huwallahu ahad... Qul a'udhu birabbil-falaq... Qul a'udhu birabbin-nas...",
        translation: "Recite Surah Al-Ikhlas, Al-Falaq, and An-Nas — each three times in the morning and evening.",
        reference: "Abu Dawud 5082"
      },
      {
        id: "e7",
        title: "Dua before Sleep",
        arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak",
        translation: "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
        reference: "Abu Dawud 5045"
      },
      {
        id: "e8",
        title: "Tasbih before Sleep",
        arabic: "سُبْحَانَ اللهِ ❋ الْحَمْدُ للهِ ❋ اللهُ أَكْبَرُ",
        transliteration: "SubhanAllah (33x) · Alhamdulillah (33x) · Allahu Akbar (34x)",
        translation: "Glory be to Allah (33x) · All praise is for Allah (33x) · Allah is the Greatest (34x) — recite before sleep.",
        reference: "Al-Bukhari 3113"
      }
    ]
  },
  {
    id: "prayer",
    name: "After Prayer",
    icon: "star",
    duas: [
      {
        id: "p1",
        title: "After Salah Tasbih",
        arabic: "سُبْحَانَ اللهِ ❋ الْحَمْدُ للهِ ❋ اللهُ أَكْبَرُ",
        transliteration: "SubhanAllah (33x) • Alhamdulillah (33x) • Allahu Akbar (34x)",
        translation: "Glory be to Allah (33 times) • All praise is for Allah (33 times) • Allah is the Greatest (34 times — completing 100)",
        reference: "Muslim 939"
      },
      {
        id: "p2",
        title: "Ayat al-Kursi",
        arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
        transliteration: "Allahu la ilaha illa huwal-hayyul-qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard",
        translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth.",
        reference: "Al-Baqarah 2:255 — whoever recites it after every prayer, only death separates them from Paradise"
      },
      {
        id: "p3",
        title: "Seeking Help for Worship",
        arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
        transliteration: "Allahumma a'inni ala dhikrika wa shukrika wa husni 'ibadatik",
        translation: "O Allah, help me to remember You, to give thanks to You, and to worship You in the best manner.",
        reference: "Abu Dawud 1522"
      },
      {
        id: "p4",
        title: "Seeking Refuge (After Fajr & Asr)",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْجُبْنِ وَأَعُوذُ بِكَ مِنَ الْبُخْلِ وَأَعُوذُ بِكَ مِنْ أَرْذَلِ الْعُمُرِ وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الدُّنْيَا وَعَذَابِ الْقَبْرِ",
        transliteration: "Allahumma inni a'udhu bika minal-jubni, wa a'udhu bika minal-bukhli, wa a'udhu bika min ardhilil-'umuri, wa a'udhu bika min fitnatid-dunya wa 'adhabil-qabr",
        translation: "O Allah, I seek refuge in You from cowardice, from miserliness, from the disgrace of old age, and from the trials of this world and the torment of the grave.",
        reference: "Al-Bukhari 6374"
      },
      {
        id: "p5",
        title: "Al-Mu'awwidhatayn",
        arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ❋ قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        transliteration: "Qul a'udhu birabbil-falaq... Qul a'udhu birabbin-nas...",
        translation: "Recite Surah Al-Falaq and Surah An-Nas after every prayer.",
        reference: "An-Nasa'i 1336"
      },
      {
        id: "p6",
        title: "La ilaha illallah (x10)",
        arabic: "لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "La ilaha illallahu wahdahu la shareeka lah, lahul mulku wa lahul hamdu wa huwa 'ala kulli shay'in qadeer",
        translation: "None has the right to be worshipped except Allah, alone, without partner. To Him belongs dominion and praise, and He is over all things capable.",
        reference: "Muslim 597 — recite 10 times after Fajr and Maghrib"
      },
      {
        id: "p7",
        title: "Seeking Forgiveness (x3)",
        arabic: "أَسْتَغْفِرُ اللهَ ❋ اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ",
        transliteration: "Astaghfirullah (3x) • Allahumma antas-salam wa minkas-salam, tabarakta ya dhal-jalali wal-ikram",
        translation: "I seek forgiveness from Allah (3 times) • O Allah, You are As-Salam and from You is peace. Blessed are You, O Possessor of majesty and honor.",
        reference: "Muslim 591"
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
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللهِ وَلَجْنَا وَبِسْمِ اللهِ خَرَجْنَا وَعَلَى اللهِ رَبِّنَا تَوَكَّلْنَا",
        transliteration: "Allahumma inni as'aluka khayral mawlaji wa khayral makhraj, bismillahi walajna wa bismillahi kharajna wa 'alallahi rabbina tawakkalna",
        translation: "O Allah, I ask You for a good entry and a good exit. In the name of Allah we enter and in the name of Allah we leave, and upon Allah our Lord we rely.",
        reference: "Abu Dawud 5096"
      },
      {
        id: "d4",
        title: "Entering the Masjid",
        arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        transliteration: "Allahumma iftah li abwaba rahmatik",
        translation: "O Allah, open the gates of Your mercy for me.",
        reference: "Muslim 713"
      },
      {
        id: "d5",
        title: "Leaving the Masjid",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
        transliteration: "Allahumma inni as'aluka min fadlik",
        translation: "O Allah, I ask You for Your bounty.",
        reference: "Muslim 713"
      },
      {
        id: "d6",
        title: "When Leaving Home",
        arabic: "بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللهِ",
        transliteration: "Bismillah, tawakkaltu 'alallah, wa la hawla wa la quwwata illa billah",
        translation: "In the name of Allah, I put my trust in Allah. There is no power and no strength except with Allah.",
        reference: "At-Tirmidhi 3426 — one who says this is guided, protected and sufficed"
      },
      {
        id: "d7",
        title: "Before Wudu",
        arabic: "بِسْمِ اللهِ",
        transliteration: "Bismillah",
        translation: "In the name of Allah — say before beginning ablution.",
        reference: "Abu Dawud 101"
      },
      {
        id: "d8",
        title: "After Wudu",
        arabic: "أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
        transliteration: "Ash-hadu an la ilaha illallahu wahdahu la shareeka lahu wa ash-hadu anna Muhammadan 'abduhu wa rasuluh",
        translation: "I bear witness that none has the right to be worshipped except Allah alone, without partner, and I bear witness that Muhammad is His servant and messenger.",
        reference: "Muslim 234 — the eight gates of Paradise are opened for him"
      },
      {
        id: "d9",
        title: "Dua for Parents",
        arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
        transliteration: "Rabbi irhamhuma kama rabbayani sagheera",
        translation: "My Lord, have mercy upon them as they raised me when I was small.",
        reference: "Quran 17:24"
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
        title: "Relief from Anxiety & Sorrow",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
        transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubni, wa dhala'id-dayni wa ghalabatir-rijal",
        translation: "O Allah, I seek refuge in You from worry and grief, from helplessness and laziness, from miserliness and cowardice, and from the burden of debts and being overpowered by men.",
        reference: "Al-Bukhari 7/158"
      },
      {
        id: "pr2",
        title: "Before Sleep",
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
      },
      {
        id: "pr4",
        title: "Protection from the Evil Eye",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لاَمَّةٍ",
        transliteration: "A'udhu bikalimatillahit-tammati min kulli shaytanin wa hammatin wa min kulli 'aynin lammah",
        translation: "I seek refuge in the perfect words of Allah from every devil and every poisonous pest, and from every evil eye.",
        reference: "Al-Bukhari 3371 — as said by the Prophet for Hasan and Husain"
      },
      {
        id: "pr5",
        title: "Dua of the Oppressed",
        arabic: "حَسْبِيَ اللهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        transliteration: "Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa rabbul-'arshil-'azim",
        translation: "Allah is sufficient for me. There is no deity except Him. I have put my trust in Him, and He is the Lord of the Magnificent Throne.",
        reference: "At-Tawbah 9:129 — recite 7 times morning and evening"
      },
      {
        id: "pr6",
        title: "Protection when Travelling",
        arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى",
        transliteration: "Allahumma inna nas'aluka fi safarina hadhal birra wat-taqwa, wa minal-'amali ma tarda",
        translation: "O Allah, we ask You on this journey for righteousness and piety, and for deeds that are pleasing to You.",
        reference: "Muslim 1342"
      },
      {
        id: "pr7",
        title: "Dua of Prophet Yunus",
        arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
        transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
        translation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
        reference: "Quran 21:87 — the dua of Prophet Yunus (AS) in the whale's belly"
      },
      {
        id: "pr8",
        title: "For Illness & Pain",
        arabic: "اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لاَ شِفَاءَ إِلاَّ شِفَاؤُكَ، شِفَاءً لاَ يُغَادِرُ سَقَمًا",
        transliteration: "Allahumma rabban-nasi, adh-hibil-ba's, ishfi antash-shafi, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama",
        translation: "O Allah, Lord of mankind, remove the harm and heal. You are the Healer. There is no healing except Your healing — a healing that leaves no illness.",
        reference: "Al-Bukhari 5750"
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
