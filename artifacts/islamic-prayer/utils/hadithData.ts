export interface Hadith {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  narrator: string;
  source: string;
  grade: string;
  topic: string;
}

export const HADITHS: Hadith[] = [
  {
    id: "h01",
    topic: "Intentions",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    transliteration: "Innamal-a'mālu bin-niyyāt, wa innamā likulli-mri'in mā nawā",
    translation:
      "Actions are judged by their intentions, and every person will get the reward according to what they intended.",
    narrator: "Narrated by 'Umar ibn al-Khattab (رضي الله عنه)",
    source: "Sahih al-Bukhari 1 · Sahih Muslim 1907",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h02",
    topic: "Mercy",
    arabic: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ",
    transliteration:
      "Ar-rāḥimūna yarḥamuhum ar-Raḥmān, irḥamū man fil-arḍi yarḥamkum man fis-samā'",
    translation:
      "The merciful are shown mercy by the Most Merciful. Be merciful to those on the earth and the One in the heavens will have mercy upon you.",
    narrator: "Narrated by 'Abdullah ibn 'Amr (رضي الله عنه)",
    source: "Sunan al-Tirmidhi 1924 · Abu Dawud 4941",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h03",
    topic: "Patience",
    arabic: "وَمَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْراً وَأَوْسَعَ مِنَ الصَّبْرِ",
    transliteration: "Wa mā u'ṭiya aḥadun 'aṭā'an khayran wa awsa'a minas-ṣabr",
    translation:
      "No one is given a gift better and more comprehensive than patience.",
    narrator: "Narrated by Abu Sa'id al-Khudri (رضي الله عنه)",
    source: "Sahih al-Bukhari 1469 · Sahih Muslim 1053",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h04",
    topic: "Truthfulness",
    arabic: "عَلَيْكُمْ بِالصِّدْقِ فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ",
    transliteration:
      "Alaykum biṣ-ṣidq, fa-innaṣ-ṣidqa yahdī ilal-birr, wa innal-birra yahdī ilal-jannah",
    translation:
      "Hold fast to truthfulness, for truthfulness leads to righteousness, and righteousness leads to Paradise.",
    narrator: "Narrated by 'Abdullah ibn Mas'ud (رضي الله عنه)",
    source: "Sahih al-Bukhari 6094 · Sahih Muslim 2607",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h05",
    topic: "Charity",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    transliteration: "Mā naqaṣat ṣadaqatun min māl",
    translation:
      "Charity does not decrease wealth.",
    narrator: "Narrated by Abu Hurairah (رضي الله عنه)",
    source: "Sahih Muslim 2588",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h06",
    topic: "Kindness",
    arabic: "لا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئاً وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلْقٍ",
    transliteration:
      "Lā taḥqiranna minal-ma'rūfi shay'an wa law an talqā akhāka biwajhin ṭalq",
    translation:
      "Do not consider any good deed insignificant, even if it is just meeting your brother with a cheerful face.",
    narrator: "Narrated by Abu Dharr (رضي الله عنه)",
    source: "Sahih Muslim 2626",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h07",
    topic: "Good Character",
    arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَاناً أَحْسَنُهُمْ خُلُقاً",
    transliteration: "Akmalul-mu'minīna īmānan aḥsanuhum khuluqā",
    translation:
      "The most perfect of the believers in faith is the best of them in character.",
    narrator: "Narrated by Abu Hurairah (رضي الله عنه)",
    source: "Sunan Abu Dawud 4682 · Sunan al-Tirmidhi 1162",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h08",
    topic: "Cleanliness",
    arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
    transliteration: "Aṭ-ṭuhūru shaṭrul-īmān",
    translation:
      "Purity (cleanliness) is half of faith.",
    narrator: "Narrated by Abu Malik al-Ash'ari (رضي الله عنه)",
    source: "Sahih Muslim 223",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h09",
    topic: "Gentleness",
    arabic: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الأَمْرِ كُلِّهِ",
    transliteration: "Innallāha rafīqun yuḥibbur-rifqa fil-amri kullih",
    translation:
      "Indeed, Allah is Gentle and loves gentleness in all matters.",
    narrator: "Narrated by 'Aisha (رضي الله عنها)",
    source: "Sahih al-Bukhari 6927 · Sahih Muslim 2165",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h10",
    topic: "The Neighbor",
    arabic: "لاَ يُؤْمِنُ مَنْ لاَ يَأْمَنُ جَارُهُ بَوَائِقَهُ",
    transliteration: "Lā yu'minu man lā ya'manu jāruhu bawā'iqah",
    translation:
      "He is not a true believer whose neighbor is not safe from his harmful conduct.",
    narrator: "Narrated by Abu Hurairah (رضي الله عنه)",
    source: "Sahih al-Bukhari 6016",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h11",
    topic: "Dhikr",
    arabic: "أَلاَ أُنَبِّئُكُمْ بِخَيْرِ أَعْمَالِكُمْ وَأَزْكَاهَا عِنْدَ مَلِيكِكُمْ، وَأَرْفَعِهَا فِي دَرَجَاتِكُمْ؟ ذِكْرُ اللَّهِ",
    transliteration:
      "Alā unabbi'ukum bikhairi a'mālikum wa azkāhā 'inda malīkikum wa arfa'ihā fī darajātikum? Dhikrullāh",
    translation:
      "Shall I not tell you of the best of your deeds, the purest in the sight of your Lord, and the one that raises you to the highest ranks? The remembrance of Allah.",
    narrator: "Narrated by Abu Darda' (رضي الله عنه)",
    source: "Sunan al-Tirmidhi 3377 · Ibn Majah 3790",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h12",
    topic: "Feeding Others",
    arabic: "أَطْعِمُوا الطَّعَامَ، وَصِلُوا الأَرْحَامَ، وَصَلُّوا بِاللَّيْلِ وَالنَّاسُ نِيَامٌ، تَدْخُلُوا الْجَنَّةَ بِسَلاَمٍ",
    transliteration:
      "Aṭ'imut-ṭa'ām, wa ṣilul-arḥām, wa ṣallū bil-layli wan-nāsu niyām, tadkhulul-jannata bi-salām",
    translation:
      "Feed people, maintain ties of kinship, pray at night while people sleep, and you will enter Paradise in peace.",
    narrator: "Narrated by 'Abdullah ibn Salam (رضي الله عنه)",
    source: "Sahih al-Bukhari 3798 · Sunan al-Tirmidhi 2485",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h13",
    topic: "Gratitude",
    arabic: "مَنْ لَمْ يَشْكُرِ النَّاسَ لَمْ يَشْكُرِ اللَّهَ",
    transliteration: "Man lam yashkurin-nāsa lam yashkurillāh",
    translation:
      "Whoever does not thank people has not thanked Allah.",
    narrator: "Narrated by Abu Hurairah (رضي الله عنه)",
    source: "Sunan Abu Dawud 4811 · Sunan al-Tirmidhi 1954",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h14",
    topic: "Seeking Knowledge",
    arabic: "مَنْ سَلَكَ طَرِيقاً يَلْتَمِسُ فِيهِ عِلْماً سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقاً إِلَى الْجَنَّةِ",
    transliteration:
      "Man salaka ṭarīqan yaltamisu fīhi 'ilman, sahhala Allāhu lahu bihi ṭarīqan ilal-jannah",
    translation:
      "Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise.",
    narrator: "Narrated by Abu Hurairah (رضي الله عنه)",
    source: "Sahih Muslim 2699",
    grade: "Sahih (Authentic)",
  },
  {
    id: "h15",
    topic: "Modesty",
    arabic: "الْحَيَاءُ لاَ يَأْتِي إِلاَّ بِخَيْرٍ",
    transliteration: "Al-ḥayā'u lā ya'tī illā bikhair",
    translation:
      "Modesty (hayā') does not bring anything except good.",
    narrator: "Narrated by 'Imran ibn Husain (رضي الله عنه)",
    source: "Sahih al-Bukhari 6117 · Sahih Muslim 37",
    grade: "Sahih (Authentic)",
  },
];

export function getDailyHadith(): Hadith {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return HADITHS[dayOfYear % HADITHS.length];
}
