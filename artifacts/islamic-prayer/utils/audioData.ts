export type CdnType = "verses-quran" | "islamic-network";

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  style: string;
  language: "arabic" | "english";
  cdnType: CdnType;
  /** Path prefix on verses.quran.com e.g. "Alafasy/mp3" */
  folder?: string;
  /** Edition identifier on cdn.islamic.network e.g. "ar.husary" */
  edition?: string;
}

export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Rashid Al-Afasy",
    arabicName: "مشاري راشد العفاسي",
    style: "Murattal",
    language: "arabic",
    cdnType: "verses-quran",
    folder: "Alafasy/mp3",
  },
  {
    id: "abdulbaset",
    name: "Abdul Basit Abdul Samad",
    arabicName: "عبد الباسط عبد الصمد",
    style: "Murattal",
    language: "arabic",
    cdnType: "verses-quran",
    folder: "AbdulBaset/Murattal/mp3",
  },
  {
    id: "sudais",
    name: "Abdul Rahman Al-Sudais",
    arabicName: "عبد الرحمن السديس",
    style: "Murattal",
    language: "arabic",
    cdnType: "verses-quran",
    folder: "Sudais/mp3",
  },
  {
    id: "shuraym",
    name: "Sa'ud Ash-Shuraym",
    arabicName: "سعود الشريم",
    style: "Murattal",
    language: "arabic",
    cdnType: "verses-quran",
    folder: "Shuraym/mp3",
  },
  {
    id: "minshawi",
    name: "Mohamed Siddiq Al-Minshawi",
    arabicName: "محمد صديق المنشاوي",
    style: "Murattal",
    language: "arabic",
    cdnType: "verses-quran",
    folder: "Minshawi/Murattal/mp3",
  },
  {
    id: "husary",
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    style: "Murattal",
    language: "arabic",
    cdnType: "islamic-network",
    edition: "ar.husary",
  },
  {
    id: "maher",
    name: "Maher Al-Muaiqly",
    arabicName: "ماهر المعيقلي",
    style: "Murattal",
    language: "arabic",
    cdnType: "islamic-network",
    edition: "ar.mahermuaiqly",
  },
];

export const DEFAULT_RECITER = RECITERS[0];

/**
 * Build the audio URL for a single verse.
 * @param globalAyahNum Required for islamic-network CDN reciters (1-6236).
 *                      Provided by the API field `numberInQuran` on each ayah.
 */
export function getVerseAudioUrl(
  reciter: Reciter,
  surahNumber: number,
  verseNumber: number,
  globalAyahNum?: number
): string {
  if (reciter.cdnType === "verses-quran" && reciter.folder) {
    const s = String(surahNumber).padStart(3, "0");
    const v = String(verseNumber).padStart(3, "0");
    return `https://verses.quran.com/${reciter.folder}/${s}${v}.mp3`;
  }
  if (reciter.cdnType === "islamic-network" && reciter.edition && globalAyahNum) {
    return `https://cdn.islamic.network/quran/audio/128/${reciter.edition}/${globalAyahNum}.mp3`;
  }
  // Fallback — should not happen if globalAyahNum is passed for islamic-network
  const s = String(surahNumber).padStart(3, "0");
  const v = String(verseNumber).padStart(3, "0");
  return `https://verses.quran.com/Alafasy/mp3/${s}${v}.mp3`;
}
