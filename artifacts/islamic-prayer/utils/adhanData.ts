export type AdhanMode = "full" | "short" | "silent";

export const DEFAULT_ADHAN_MODE: AdhanMode = "full";

export interface AdhanStyle {
  id: string;
  name: string;
  arabic: string;
  reciter: string;
  location: string;
  description: string;
  audioUrl: string;       // Full Adhan — Dhuhr/Asr/Maghrib/Isha (~2–3.5 min)
  fajrAudioUrl: string;   // Adhan Al-Fajr — includes "As-salatu khayrun minan nawm" (~3–5 min)
  shortAudioUrl: string;  // Short Adhan — condensed (~2 min)
  cafFilename: string;    // Bundled .caf file for iOS background notifications (28s clip)
}

export const ADHAN_STYLES: AdhanStyle[] = [
  {
    id: "makkah",
    name: "Makkah",
    arabic: "أذان مكة المكرمة",
    reciter: "Sheikh Ali bin Abdurrahman Al-Huthaify",
    location: "Masjid al-Haram, Makkah",
    description: "The sacred call from the Grand Mosque of Makkah",
    audioUrl: "https://www.islamcan.com/audio/adhan/azan1.mp3",
    fajrAudioUrl: "https://www.islamcan.com/audio/adhan/azan9.mp3",
    shortAudioUrl: "https://www.islamcan.com/audio/adhan/azan6.mp3",
    cafFilename: "adhan_makkah.caf",
  },
  {
    id: "madinah",
    name: "Madinah",
    arabic: "أذان المدينة المنورة",
    reciter: "Sheikh Essam Bukhari",
    location: "Masjid an-Nabawi, Madinah",
    description: "The beloved call from the Prophet's Mosque",
    audioUrl: "https://www.islamcan.com/audio/adhan/azan2.mp3",
    fajrAudioUrl: "https://www.islamcan.com/audio/adhan/azan10.mp3",
    shortAudioUrl: "https://www.islamcan.com/audio/adhan/azan19.mp3",
    cafFilename: "adhan_madinah.caf",
  },
  {
    id: "afasy",
    name: "Mishari Al-Afasy",
    arabic: "الشيخ مشاري العفاسي",
    reciter: "Sheikh Mishari Rashid Al-Afasy",
    location: "Kuwait",
    description: "The world-renowned Kuwaiti reciter's melodious adhan",
    audioUrl: "https://www.islamcan.com/audio/adhan/azan3.mp3",
    fajrAudioUrl: "https://www.islamcan.com/audio/adhan/azan12.mp3",
    shortAudioUrl: "https://www.islamcan.com/audio/adhan/azan8.mp3",
    cafFilename: "adhan_afasy.caf",
  },
  {
    id: "egyptian",
    name: "Egyptian",
    arabic: "الأذان المصري",
    reciter: "Traditional Egyptian Style",
    location: "Al-Azhar, Cairo",
    description: "The classical Egyptian maqam style passed through generations",
    audioUrl: "https://www.islamcan.com/audio/adhan/azan4.mp3",
    fajrAudioUrl: "https://www.islamcan.com/audio/adhan/azan14.mp3",
    shortAudioUrl: "https://www.islamcan.com/audio/adhan/azan17.mp3",
    cafFilename: "adhan_egyptian.caf",
  },
  {
    id: "turkish",
    name: "Turkish",
    arabic: "الأذان العثماني",
    reciter: "Diyanet İşleri Başkanlığı",
    location: "Süleymaniye Mosque, Istanbul",
    description: "The majestic Ottoman-era style from Istanbul's grand mosques",
    audioUrl: "https://www.islamcan.com/audio/adhan/azan5.mp3",
    fajrAudioUrl: "https://www.islamcan.com/audio/adhan/azan18.mp3",
    shortAudioUrl: "https://www.islamcan.com/audio/adhan/azan20.mp3",
    cafFilename: "adhan_turkish.caf",
  },
];

export const DEFAULT_ADHAN_STYLE_ID = "makkah";

export function getAdhanStyle(id: string): AdhanStyle {
  return ADHAN_STYLES.find((s) => s.id === id) ?? ADHAN_STYLES[0];
}

export function resolveAdhanUrl(
  style: AdhanStyle,
  mode: AdhanMode,
  isFajr: boolean
): string | null {
  if (mode === "silent") return null;
  if (isFajr) return style.fajrAudioUrl;
  if (mode === "short") return style.shortAudioUrl;
  return style.audioUrl;
}

export const ADHAN_MODE_INFO: Record<
  AdhanMode,
  { label: string; arabic: string; icon: string; duration: string; description: string }
> = {
  full: {
    label: "Full",
    arabic: "أذان كامل",
    icon: "🔊",
    duration: "~3–5 min",
    description: "Complete call to prayer for each salah",
  },
  short: {
    label: "Short",
    arabic: "أذان مختصر",
    icon: "🔉",
    duration: "~2 min",
    description: "Condensed adhan — Fajr uses the Fajr-specific call",
  },
  silent: {
    label: "Silent",
    arabic: "إشعار صامت",
    icon: "🔕",
    duration: "No audio",
    description: "In-app alert only — no audio played",
  },
};
