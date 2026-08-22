/**
 * Short Qur'an verses for the Large widget's "Verse of the day" line.
 * Each entry: Arabic text + reference (surah:ayah). Picked for brevity so they
 * fit on one or two lines in the widget. Rotated daily by day-of-year.
 */
export interface WidgetVerse {
  ar: string;
  ref: string; // "94:5"
}

export const WIDGET_VERSES: WidgetVerse[] = [
  { ar: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا", ref: "94:5" },
  { ar: "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ", ref: "2:152" },
  { ar: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", ref: "57:4" },
  { ar: "إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ", ref: "2:153" },
  { ar: "وَٱللَّهُ خَيْرُ ٱلرَّٰزِقِينَ", ref: "62:11" },
  { ar: "حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ", ref: "3:173" },
  { ar: "إِنَّ ٱللَّهَ يُحِبُّ ٱلْمُتَوَكِّلِينَ", ref: "3:159" },
  { ar: "وَلَا تَيْـَٔسُوا۟ مِن رَّوْحِ ٱللَّهِ", ref: "12:87" },
  { ar: "وَبَشِّرِ ٱلصَّـٰبِرِينَ", ref: "2:155" },
  { ar: "إِنَّ صَلَاتِى وَنُسُكِى ... لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ", ref: "6:162" },
  { ar: "وَأَقِمِ ٱلصَّلَوٰةَ لِذِكْرِىٓ", ref: "20:14" },
  { ar: "إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَاءِ", ref: "29:45" },
  { ar: "رَبَّنَا ٱجْعَلْنَا مُسْلِمَيْنِ لَكَ", ref: "2:128" },
  { ar: "وَمَا تَوْفِيقِىٓ إِلَّا بِٱللَّهِ", ref: "11:88" },
  { ar: "إِنَّمَا ٱلْأَعْمَالُ بِٱلنِّيَّاتِ", ref: "Ḥadīth" },
  { ar: "ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ", ref: "40:60" },
  { ar: "وَٱللَّهُ يُحِبُّ ٱلْمُحْسِنِينَ", ref: "3:134" },
  { ar: "إِنَّ رَحْمَتَ ٱللَّهِ قَرِيبٌ مِّنَ ٱلْمُحْسِنِينَ", ref: "7:56" },
  { ar: "وَٱذْكُر رَّبَّكَ كَثِيرًۭا", ref: "3:41" },
  { ar: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا", ref: "94:5" },
  { ar: "وَلَذِكْرُ ٱللَّهِ أَكْبَرُ", ref: "29:45" },
  { ar: "إِنَّ ٱللَّهَ غَفُورٌۭ رَّحِيمٌۭ", ref: "2:173" },
  { ar: "رَبِّ زِدْنِى عِلْمًۭا", ref: "20:114" },
  { ar: "وَكَفَىٰ بِٱللَّهِ وَكِيلًۭا", ref: "4:81" },
  { ar: "إِنَّ ٱللَّهَ سَمِيعٌ بَصِيرٌۭ", ref: "22:75" },
  { ar: "وَهُوَ ٱلْغَفُورُ ٱلْوَدُودُ", ref: "85:14" },
  { ar: "فَٱصْبِرْ صَبْرًۭا جَمِيلًۭا", ref: "70:5" },
  { ar: "وَتَوَكَّلْ عَلَى ٱللَّهِ", ref: "33:3" },
  { ar: "إِنَّ ٱللَّهَ عَلَىٰ كُلِّ شَىْءٍۢ قَدِيرٌۭ", ref: "2:20" },
  { ar: "وَكَانَ ٱللَّهُ غَفُورًۭا رَّحِيمًۭا", ref: "4:96" },
];

/** Day-of-year (0–365) for the given date in local time. */
function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

/** Pick the verse for `date` (defaults to today). Rotates once per day. */
export function verseForDate(date: Date = new Date()): WidgetVerse {
  return WIDGET_VERSES[dayOfYear(date) % WIDGET_VERSES.length];
}
