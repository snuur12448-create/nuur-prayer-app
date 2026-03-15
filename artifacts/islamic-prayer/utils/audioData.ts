export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  style: string;
  folder: string;
  language: "arabic" | "english";
}

export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Rashid Al-Afasy",
    arabicName: "مشاري راشد العفاسي",
    style: "Murattal",
    folder: "Alafasy_128kbps",
    language: "arabic",
  },
  {
    id: "luhaidan",
    name: "Muhammad Al-Luhaidan",
    arabicName: "محمد اللحيدان",
    style: "Murattal",
    folder: "Muhammad_al_Luhaidan_128kbps",
    language: "arabic",
  },
  {
    id: "abdulsamad",
    name: "Abdul Basit Abdul Samad",
    arabicName: "عبد الباسط عبد الصمد",
    style: "Murattal",
    folder: "AbdulSamad_128kbps",
    language: "arabic",
  },
  {
    id: "sudais",
    name: "Abdul Rahman Al-Sudais",
    arabicName: "عبد الرحمن السديس",
    style: "Murattal",
    folder: "Sudais_192kbps",
    language: "arabic",
  },
  {
    id: "husary",
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    style: "Murattal",
    folder: "Husary_128kbps",
    language: "arabic",
  },
  {
    id: "minshawi",
    name: "Mohammed Siddiq Al-Minshawi",
    arabicName: "محمد صديق المنشاوي",
    style: "Murattal",
    folder: "Minshawi_128kbps",
    language: "arabic",
  },
  {
    id: "english",
    name: "English Translation",
    arabicName: "الترجمة الإنجليزية",
    style: "Sahih International",
    folder: "English_recitation_of_Quran_Sahih_International",
    language: "english",
  },
];

export const DEFAULT_RECITER = RECITERS[0];

/**
 * Build EveryAyah.com CDN URL for a specific verse.
 * https://everyayah.com/data/{folder}/{surah_3digits}{verse_3digits}.mp3
 */
export function getVerseAudioUrl(
  reciter: Reciter,
  surahNumber: number,
  verseNumber: number
): string {
  const s = String(surahNumber).padStart(3, "0");
  const v = String(verseNumber).padStart(3, "0");
  return `https://everyayah.com/data/${reciter.folder}/${s}${v}.mp3`;
}

/**
 * Build Islamic Network CDN URL for full surah audio.
 * https://cdn.islamic.network/quran/audio-surah/128/{edition}/{surah}.mp3
 * Only works for reciters that have an edition on the Islamic Network.
 */
const ISLAMIC_NETWORK_EDITIONS: Record<string, string> = {
  alafasy: "ar.alafasy",
  abdulsamad: "ar.abdulsamad",
  sudais: "ar.abdurrahmansudais",
  husary: "ar.husary",
  minshawi: "ar.minshawi",
};

export function getSurahAudioUrl(
  reciter: Reciter,
  surahNumber: number
): string | null {
  const edition = ISLAMIC_NETWORK_EDITIONS[reciter.id];
  if (!edition) return null;
  return `https://cdn.islamic.network/quran/audio-surah/128/${edition}/${surahNumber}.mp3`;
}
