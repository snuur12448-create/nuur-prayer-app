export type CdnType = "verses-quran" | "islamic-network" | "mp3quran-net";

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
  /** Bitrate for cdn.islamic.network — defaults to 128. Use 64/192 when 128 is unavailable. */
  bitrate?: 64 | 128 | 192;
  /**
   * Reciter folder slug on server8.mp3quran.net e.g. "lhdan".
   * These are per-surah files (not per-verse). The player plays the
   * full surah as a single track when this CDN type is used.
   */
  mp3QuranFolder?: string;
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
    cdnType: "islamic-network",
    edition: "ar.abdurrahmaansudais",
    bitrate: 64,
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
  {
    id: "luhaidan",
    name: "Muhammad Al-Luhaidan",
    arabicName: "محمد اللحيدان",
    style: "Murattal",
    language: "arabic",
    cdnType: "mp3quran-net",
    mp3QuranFolder: "lhdan",
  },
  {
    id: "walk",
    name: "Ibrahim Walk",
    arabicName: "English Translation",
    style: "Translation",
    language: "english",
    cdnType: "islamic-network",
    edition: "en.walk",
    bitrate: 192,
  },
];

export const DEFAULT_RECITER = RECITERS[0];

/**
 * Returns true if this reciter serves per-surah audio (not per-verse).
 * The player plays the full surah as one track for these reciters.
 */
export function isSurahLevelReciter(reciter: Reciter): boolean {
  return reciter.cdnType === "mp3quran-net";
}

/**
 * Build the audio URL for a single verse (or full surah for mp3quran-net reciters).
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
    const bitrate = reciter.bitrate ?? 128;
    return `https://cdn.islamic.network/quran/audio/${bitrate}/${reciter.edition}/${globalAyahNum}.mp3`;
  }
  if (reciter.cdnType === "mp3quran-net" && reciter.mp3QuranFolder) {
    const s = String(surahNumber).padStart(3, "0");
    return `https://server8.mp3quran.net/${reciter.mp3QuranFolder}/${s}.mp3`;
  }
  // Fallback
  const s = String(surahNumber).padStart(3, "0");
  const v = String(verseNumber).padStart(3, "0");
  return `https://verses.quran.com/Alafasy/mp3/${s}${v}.mp3`;
}
