export interface DailyAyah {
  arabic: string;
  translation: string;
  transliteration: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
}

export const DAILY_AYAHS: DailyAyah[] = [
  {
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    translation: "In the name of Allah, the Most Gracious, the Most Merciful.",
    transliteration: "Bismillāhir-Raḥmānir-Raḥīm",
    surahName: "Al-Fatihah", surahNumber: 1, ayahNumber: 1,
  },
  {
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    translation: "All praise is due to Allah, Lord of all the worlds.",
    transliteration: "Al-Ḥamdu lillāhi Rabb il-'ālamīn",
    surahName: "Al-Fatihah", surahNumber: 1, ayahNumber: 2,
  },
  {
    arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    translation: "You alone we worship, and You alone we ask for help.",
    transliteration: "Iyyāka na'budu wa-iyyāka nasta'īn",
    surahName: "Al-Fatihah", surahNumber: 1, ayahNumber: 5,
  },
  {
    arabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
    translation: "This is the Book about which there is no doubt, a guidance for those conscious of Allah.",
    transliteration: "Dhālikal-kitābu lā rayba fīh, hudal-lil-muttaqīn",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 2,
  },
  {
    arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ",
    translation: "Seek help through patience and prayer. Indeed, it is a burden, except for the humble.",
    transliteration: "Wasta'īnū biṣ-ṣabri waṣ-ṣalāh",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 45,
  },
  {
    arabic: "وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ",
    translation: "We will surely test you with something of fear and hunger and loss of wealth and lives and fruits; but give glad tidings to the patient.",
    transliteration: "Wa-lanabluwannakum bi-shay'in minal-khawfi wal-jū'",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 155,
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    translation: "Indeed, Allah is with the patient.",
    transliteration: "Innallāha ma'aṣ-ṣābirīn",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 153,
  },
  {
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    translation: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.",
    transliteration: "Allāhu lā ilāha illā Huw, Al-Ḥayyul-Qayyūm",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 255,
  },
  {
    arabic: "لَا إِكْرَاهَ فِي الدِّينِ ۖ قَد تَّبَيَّنَ الرُّشْدُ مِنَ الْغَيِّ",
    translation: "There is no compulsion in religion. Righteousness has become clearly distinct from error.",
    transliteration: "Lā ikrāha fid-dīn, qad tabayyanar-rushdu minal-ghayy",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 256,
  },
  {
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    translation: "When My servants ask you about Me, I am near. I respond to the call of the caller when he calls upon Me.",
    transliteration: "Wa idhā sa'alaka 'ibādī 'annī fa-innī qarīb",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 186,
  },
  {
    arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا",
    translation: "Our Lord, do not punish us if we forget or make a mistake.",
    transliteration: "Rabbanā lā tu'ākhidhnā in nasīnā aw akhṭa'nā",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 286,
  },
  {
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah does not burden a soul beyond what it can bear.",
    transliteration: "Lā yukallifullāhu nafsan illā wus'ahā",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 286,
  },
  {
    arabic: "شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ",
    translation: "Allah witnesses that there is no deity except Him, and so do the angels and those of knowledge.",
    transliteration: "Shahidallāhu annahu lā ilāha illā Huw wal-malā'ikatu wa-ulul-'ilm",
    surahName: "Ali 'Imran", surahNumber: 3, ayahNumber: 18,
  },
  {
    arabic: "وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا",
    translation: "Put your trust in Allah; and sufficient is Allah as a Trustee.",
    transliteration: "Wa tawakkal 'alallāh, wa kafā billāhi wakīlā",
    surahName: "Al-Ahzab", surahNumber: 33, ayahNumber: 3,
  },
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship comes ease.",
    transliteration: "Inna ma'al-'usri yusrā",
    surahName: "Ash-Sharh", surahNumber: 94, ayahNumber: 6,
  },
  {
    arabic: "فَإِذَا فَرَغْتَ فَانصَبْ ۝ وَإِلَىٰ رَبِّكَ فَارْغَب",
    translation: "So when you have finished, then strive; and to your Lord direct your longing.",
    transliteration: "Fa-idhā faragh-ta fanṣab, wa ilā rabbika farghab",
    surahName: "Ash-Sharh", surahNumber: 94, ayahNumber: 7,
  },
  {
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    translation: "Say: He is Allah, the One.",
    transliteration: "Qul Huwallāhu Aḥad",
    surahName: "Al-Ikhlas", surahNumber: 112, ayahNumber: 1,
  },
  {
    arabic: "اللَّهُ الصَّمَدُ",
    translation: "Allah, the Eternal, Absolute.",
    transliteration: "Allāhuṣ-Ṣamad",
    surahName: "Al-Ikhlas", surahNumber: 112, ayahNumber: 2,
  },
  {
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
    translation: "Whoever fears Allah, He will make a way out for him and provide for him from where he does not expect.",
    transliteration: "Wa man yattaqillāha yaj'al lahu makhrajā wa-yarzuqhu min ḥaythu lā yaḥtasib",
    surahName: "At-Talaq", surahNumber: 65, ayahNumber: 2,
  },
  {
    arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    translation: "And He is with you wherever you are.",
    transliteration: "Wa Huwa ma'akum aynamā kuntum",
    surahName: "Al-Hadid", surahNumber: 57, ayahNumber: 4,
  },
  {
    arabic: "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ",
    translation: "Indeed, Allah will not change the condition of a people until they change what is in themselves.",
    transliteration: "Innallāha lā yughayyiru mā bi-qawmin ḥattā yughayyirū mā bi-anfusihim",
    surahName: "Ar-Ra'd", surahNumber: 13, ayahNumber: 11,
  },
  {
    arabic: "وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ",
    translation: "And remind, for indeed the reminder benefits the believers.",
    transliteration: "Wa dhakkir fa-innadh-dhikrā tanfa'ul-mu'minīn",
    surahName: "Adh-Dhariyat", surahNumber: 51, ayahNumber: 55,
  },
  {
    arabic: "وَلَذِكْرُ اللَّهِ أَكْبَرُ",
    translation: "And the remembrance of Allah is greater.",
    transliteration: "Wa la-dhikrullāhi akbar",
    surahName: "Al-'Ankabut", surahNumber: 29, ayahNumber: 45,
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Verily, in the remembrance of Allah do hearts find rest.",
    transliteration: "Alā bi-dhikrillāhi taṭma'innul-qulūb",
    surahName: "Ar-Ra'd", surahNumber: 13, ayahNumber: 28,
  },
  {
    arabic: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ",
    translation: "And We have certainly made the Quran easy for remembrance, so is there any who will remember?",
    transliteration: "Wa laqad yassarnal-Qur'āna lidh-dhikri fa-hal min muddakir",
    surahName: "Al-Qamar", surahNumber: 54, ayahNumber: 17,
  },
  {
    arabic: "وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا",
    translation: "And if you were to count the blessings of Allah, you could not enumerate them.",
    transliteration: "Wa in ta'uddū ni'matallāhi lā tuḥṣūhā",
    surahName: "An-Nahl", surahNumber: 16, ayahNumber: 18,
  },
  {
    arabic: "يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ",
    translation: "Allah intends ease for you and does not intend hardship for you.",
    transliteration: "Yurīdullāhu bikumul-yusra wa lā yurīdu bikumul-'usr",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 185,
  },
  {
    arabic: "وَبَشِّرِ الصَّابِرِينَ",
    translation: "And give glad tidings to the patient.",
    transliteration: "Wa bashshiriṣ-ṣābirīn",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 155,
  },
  {
    arabic: "إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ",
    translation: "Indeed, Allah loves those who put their trust in Him.",
    transliteration: "Innallāha yuḥibbul-mutawakkilīn",
    surahName: "Ali 'Imran", surahNumber: 3, ayahNumber: 159,
  },
  {
    arabic: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ",
    translation: "My success is only through Allah. Upon Him I have relied, and to Him I return.",
    transliteration: "Wa mā tawfīqī illā billāh, 'alayhi tawakkaltu wa-ilayhi unīb",
    surahName: "Hud", surahNumber: 11, ayahNumber: 88,
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    translation: "Remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    transliteration: "Fadhkurūnī adhkurkum wash-kurū lī wa lā takfurūn",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 152,
  },
  {
    arabic: "وَلَوْ أَنَّ أَهْلَ الْقُرَىٰ آمَنُوا وَاتَّقَوْا لَفَتَحْنَا عَلَيْهِم بَرَكَاتٍ مِّنَ السَّمَاءِ وَالْأَرْضِ",
    translation: "If the people of the cities had believed and feared Allah, We would have opened upon them blessings from the heaven and the earth.",
    transliteration: "Wa law anna ahla l-qurā āmanū wattaqaw la-fataḥnā 'alayhim barakātin minas-samā'i wal-arḍ",
    surahName: "Al-A'raf", surahNumber: 7, ayahNumber: 96,
  },
  {
    arabic: "وَمَا أَصَابَكُم مِّن مُّصِيبَةٍ فَبِمَا كَسَبَتْ أَيْدِيكُمْ وَيَعْفُو عَن كَثِيرٍ",
    translation: "Whatever strikes you of disaster is for what your own hands have earned; but He pardons much.",
    transliteration: "Wa mā aṣābakum min muṣībatin fa-bimā kasabat aydīkum wa ya'fū 'an kathīr",
    surahName: "Ash-Shura", surahNumber: 42, ayahNumber: 30,
  },
  {
    arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
    translation: "Indeed, to Allah we belong and to Him we shall return.",
    transliteration: "Innā lillāhi wa-innā ilayhi rāji'ūn",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 156,
  },
  {
    arabic: "وَهُوَ الْغَفُورُ الرَّحِيمُ",
    translation: "And He is the Most Forgiving, the Most Merciful.",
    transliteration: "Wa Huwal-Ghafūrur-Raḥīm",
    surahName: "Yunus", surahNumber: 10, ayahNumber: 107,
  },
  {
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي",
    translation: "My Lord, expand for me my chest and ease for me my task.",
    transliteration: "Rabbish-raḥ lī ṣadrī, wa-yassir lī amrī",
    surahName: "Ta-Ha", surahNumber: 20, ayahNumber: 25,
  },
  {
    arabic: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ",
    translation: "And your Lord says: Call upon Me; I will respond to you.",
    transliteration: "Wa qāla rabbukum ud'ūnī astajib lakum",
    surahName: "Ghafir", surahNumber: 40, ayahNumber: 60,
  },
  {
    arabic: "وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    translation: "And He is over all things competent.",
    transliteration: "Wa Huwa 'alā kulli shay'in Qadīr",
    surahName: "Al-Hadid", surahNumber: 57, ayahNumber: 2,
  },
  {
    arabic: "وَإِن يَمْسَسْكَ اللَّهُ بِضُرٍّ فَلَا كَاشِفَ لَهُ إِلَّا هُوَ",
    translation: "If Allah should touch you with adversity, there is no remover of it except Him.",
    transliteration: "Wa in yamsasakallāhu bi-ḍurrin falā kāshifa lahu illā Huw",
    surahName: "Al-An'am", surahNumber: 6, ayahNumber: 17,
  },
  {
    arabic: "قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا هُوَ مَوْلَانَا",
    translation: "Say: Nothing will befall us except what Allah has decreed for us; He is our protector.",
    transliteration: "Qul lan yuṣībanā illā mā kataballāhu lanā, Huwa mawlānā",
    surahName: "At-Tawbah", surahNumber: 9, ayahNumber: 51,
  },
  {
    arabic: "وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ",
    translation: "And Allah loves the doers of good.",
    transliteration: "Wallāhu yuḥibbul-muḥsinīn",
    surahName: "Ali 'Imran", surahNumber: 3, ayahNumber: 134,
  },
  {
    arabic: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ",
    translation: "Establish prayer, give zakah, and bow with those who bow.",
    transliteration: "Wa aqīmuṣ-ṣalāta wa ātuz-zakāta warkaʿū ma'ar-rāki'īn",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 43,
  },
  {
    arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا",
    translation: "O you who believe, be patient and endure.",
    transliteration: "Yā ayyuhalladhīna āmanū iṣbirū wa ṣābirū",
    surahName: "Ali 'Imran", surahNumber: 3, ayahNumber: 200,
  },
  {
    arabic: "إِنَّ اللَّهَ لَا يَظْلِمُ مِثْقَالَ ذَرَّةٍ",
    translation: "Indeed, Allah does not do injustice, even as much as an atom's weight.",
    transliteration: "Innallāha lā yaẓlimu mithqāla dharrah",
    surahName: "An-Nisa", surahNumber: 4, ayahNumber: 40,
  },
  {
    arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ",
    translation: "O you who believe, fear Allah and be with the truthful.",
    transliteration: "Yā ayyuhalladhīna āmanū taqullāha wa kūnū ma'aṣ-ṣādiqīn",
    surahName: "At-Tawbah", surahNumber: 9, ayahNumber: 119,
  },
  {
    arabic: "وَالرَّاسِخُونَ فِي الْعِلْمِ يَقُولُونَ آمَنَّا بِهِ كُلٌّ مِّنْ عِندِ رَبِّنَا",
    translation: "Those who are firmly grounded in knowledge say: We believe in it; all of it is from our Lord.",
    transliteration: "War-rāsikhūna fil-'ilmi yaqūlūna āmannā bih, kullun min 'indi Rabbinā",
    surahName: "Ali 'Imran", surahNumber: 3, ayahNumber: 7,
  },
  {
    arabic: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ",
    translation: "And We are closer to him than his jugular vein.",
    transliteration: "Wa naḥnu aqrabu ilayhi min ḥablil-warīd",
    surahName: "Qaf", surahNumber: 50, ayahNumber: 16,
  },
  {
    arabic: "وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَىٰ",
    translation: "Take provision, and indeed the best provision is fear of Allah.",
    transliteration: "Wa tazawwadū fa-inna khayraz-zādit-taqwā",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 197,
  },
  {
    arabic: "يُحِبُّهُمْ وَيُحِبُّونَهُ",
    translation: "He loves them and they love Him.",
    transliteration: "Yuḥibbuhum wa yuḥibbūnah",
    surahName: "Al-Ma'idah", surahNumber: 5, ayahNumber: 54,
  },
  {
    arabic: "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ",
    translation: "And when I am ill, it is He who cures me.",
    transliteration: "Wa idhā mariḍtu fa-Huwa yashfīn",
    surahName: "Ash-Shu'ara", surahNumber: 26, ayahNumber: 80,
  },
  {
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    translation: "Allah is sufficient for us, and He is the best Disposer of affairs.",
    transliteration: "Ḥasbunallāhu wa ni'mal-wakīl",
    surahName: "Ali 'Imran", surahNumber: 3, ayahNumber: 173,
  },
  {
    arabic: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ ۖ إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ",
    translation: "And do not despair of relief from Allah. Indeed, no one despairs of relief from Allah except the disbelieving people.",
    transliteration: "Wa lā tay'asū min rawḥillāh, innahu lā yay'asu min rawḥillāhi illal-qawmul-kāfirūn",
    surahName: "Yusuf", surahNumber: 12, ayahNumber: 87,
  },
  {
    arabic: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
    translation: "Do not despair of the mercy of Allah. Indeed, Allah forgives all sins.",
    transliteration: "Lā taqnaṭū min raḥmatillāh, innallāha yaghfirudh-dhunūba jamī'ā",
    surahName: "Az-Zumar", surahNumber: 39, ayahNumber: 53,
  },
  {
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    translation: "Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
    transliteration: "Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā 'adhāban-nār",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 201,
  },
  {
    arabic: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ",
    translation: "And that man will have nothing except what he strives for.",
    transliteration: "Wa an laysa lil-insāni illā mā sa'ā",
    surahName: "An-Najm", surahNumber: 53, ayahNumber: 39,
  },
  {
    arabic: "فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ",
    translation: "Wherever you turn, there is the Face of Allah.",
    transliteration: "Fa-aynamā tuwallū fa-thamma wajhullāh",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 115,
  },
  {
    arabic: "وَاللَّهُ خَيْرُ الرَّازِقِينَ",
    translation: "And Allah is the best of providers.",
    transliteration: "Wallāhu khayrun-rāziqīn",
    surahName: "Al-Jumu'ah", surahNumber: 62, ayahNumber: 11,
  },
  {
    arabic: "هُوَ الْأَوَّلُ وَالْآخِرُ وَالظَّاهِرُ وَالْبَاطِنُ ۖ وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ",
    translation: "He is the First and the Last, the Manifest and the Hidden, and He has knowledge of all things.",
    transliteration: "Huwal-Awwalu wal-Ākhiru waẓ-Ẓāhiru wal-Bāṭin, wa Huwa bi-kulli shay'in 'Alīm",
    surahName: "Al-Hadid", surahNumber: 57, ayahNumber: 3,
  },
  {
    arabic: "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
    translation: "And provides for him from where he does not expect.",
    transliteration: "Wa yarzuqhu min ḥaythu lā yaḥtasib",
    surahName: "At-Talaq", surahNumber: 65, ayahNumber: 3,
  },
  {
    arabic: "يَا أَيُّهَا النَّاسُ أَنتُمُ الْفُقَرَاءُ إِلَى اللَّهِ ۖ وَاللَّهُ هُوَ الْغَنِيُّ الْحَمِيدُ",
    translation: "O mankind, you are those in need of Allah, while Allah is the Free of need, the Praiseworthy.",
    transliteration: "Yā ayyuhan-nāsu antumul-fuqarā'u ilallāh, wallāhu Huwal-Ghaniyyul-Ḥamīd",
    surahName: "Fatir", surahNumber: 35, ayahNumber: 15,
  },
  {
    arabic: "وَلَكُمْ فِي الْقِصَاصِ حَيَاةٌ يَا أُولِي الْأَلْبَابِ لَعَلَّكُمْ تَتَّقُونَ",
    translation: "And there is for you in legal retribution life, O people of understanding, that you may become righteous.",
    transliteration: "Wa lakum fil-qiṣāṣi ḥayātun yā ulil-albāb la'allakum tattaqūn",
    surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 179,
  },
  {
    arabic: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
    translation: "Indeed, prayer has been decreed upon the believers a decree of specified times.",
    transliteration: "Innaṣ-ṣalāta kānat 'alal-mu'minīna kitābam-mawqūtā",
    surahName: "An-Nisa", surahNumber: 4, ayahNumber: 103,
  },
  {
    arabic: "وَأَقِمِ الصَّلَاةَ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
    translation: "And establish prayer. Indeed, prayer prohibits immorality and wrongdoing.",
    transliteration: "Wa aqimiṣ-ṣalāh, innaṣ-ṣalāta tanhā 'anil-faḥshā'i wal-munkar",
    surahName: "Al-'Ankabut", surahNumber: 29, ayahNumber: 45,
  },
  {
    arabic: "إِنَّ رَبِّي لَطِيفٌ لِّمَا يَشَاءُ ۚ إِنَّهُ هُوَ الْعَلِيمُ الْحَكِيمُ",
    translation: "Indeed, my Lord is subtle in fulfilling what He wills. Indeed, it is He who is the Knowing, the Wise.",
    transliteration: "Inna Rabbī laṭīfun limā yashā', innahu Huwal-'Alīmul-Ḥakīm",
    surahName: "Yusuf", surahNumber: 12, ayahNumber: 100,
  },
];

export function getDailyAyah(): DailyAyah {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_AYAHS[dayOfYear % DAILY_AYAHS.length];
}
