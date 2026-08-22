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
  notificationSoundFilename: string; // Bundled .wav clip for native notification audio
  // Optional: skip this many ms at the start of the preview so the user
  // doesn't sit through dead air / mic-warmup / a slow takbir intro before
  // hearing the reciter's character. Only applied to in-app previews —
  // notifications and full prayer-time playback always start from 0.
  previewSkipMs?: number;
}

// AlAdhan CDN — production-grade Islamic audio CDN (128–226 kbps)
// https://aladhan.com/download-adhans
const ALA = "https://cdn.aladhan.com/audio/adhans";

export const ADHAN_STYLES: AdhanStyle[] = [
  {
    id: "makkah",
    name: "Makkah",
    arabic: "أذان مكة المكرمة",
    reciter: "Masjid al-Haram",
    location: "Masjid al-Haram, Makkah",
    description: "The sacred call from the Grand Mosque of Makkah",
    audioUrl: `${ALA}/a8.mp3`,                                       // Masjid Al-Haram, 128 kbps
    fajrAudioUrl: "https://www.islamcan.com/audio/adhan/azan9.mp3",  // Makkah Fajr (best available)
    shortAudioUrl: `${ALA}/a11-mansour-al-zahrani.mp3`,              // Salah Mansoor Az-Zahrani, 204 kbps
    notificationSoundFilename: "adhan_makkah.wav",
  },
  {
    id: "madinah",
    name: "Madinah",
    arabic: "أذان المدينة المنورة",
    reciter: "Ahmad al-Nafees",
    location: "Masjid an-Nabawi, Madinah",
    description: "The beloved call from the Prophet's Mosque",
    audioUrl: `${ALA}/a1.mp3`,                                        // Ahmad al-Nafees, 128 kbps
    fajrAudioUrl: "https://www.islamcan.com/audio/adhan/azan10.mp3", // Madinah Fajr (best available)
    shortAudioUrl: `${ALA}/a6.mp3`,                                   // Salah Mansoor Az-Zahrani, 128 kbps
    notificationSoundFilename: "adhan_madinah.wav",
    // The Madinah file (a1.mp3) opens with ~6s of low-volume buildup before
    // the first audible takbir. Skip it so the preview is representative
    // of the reciter, not the silence.
    previewSkipMs: 6000,
  },
  {
    id: "afasy",
    name: "Mishari Al-Afasy",
    arabic: "الشيخ مشاري العفاسي",
    reciter: "Sheikh Mishari Rashid Al-Afasy",
    location: "Kuwait",
    description: "The world-renowned Kuwaiti reciter's melodious adhan",
    audioUrl: `${ALA}/a9.mp3`,   // Mishary Rashid Alafasy, 128 kbps
    fajrAudioUrl: `${ALA}/a4.mp3`, // Mishary Rashid Alafasy (Dubai One TV), 199 kbps — upgrade from 40 kbps!
    shortAudioUrl: `${ALA}/a7.mp3`, // Mishary Rashid Alafasy (variant), 128 kbps
    notificationSoundFilename: "adhan_afasy.wav",
  },
  {
    id: "egyptian",
    name: "Egyptian",
    arabic: "الأذان المصري",
    reciter: "Qari Abdul Karim",
    location: "Al-Azhar, Cairo",
    description: "The classical Egyptian maqam style passed through generations",
    audioUrl: `${ALA}/a10.mp3`,                                        // Qari Abdul Karim, 226 kbps
    fajrAudioUrl: "https://www.islamcan.com/audio/adhan/azan14.mp3",  // Egyptian Fajr (best available)
    shortAudioUrl: `${ALA}/a10.mp3`,                                   // Qari Abdul Karim, 226 kbps (concise)
    notificationSoundFilename: "adhan_egyptian.wav",
  },
  {
    id: "turkish",
    name: "Turkish",
    arabic: "الأذان العثماني",
    reciter: "Hafiz Mustafa Özcan",
    location: "Süleymaniye Mosque, Istanbul",
    description: "The majestic Ottoman-era style from Istanbul's grand mosques",
    audioUrl: `${ALA}/a2.mp3`,                                         // Hafiz Mustafa Özcan, 128 kbps
    fajrAudioUrl: "https://www.islamcan.com/audio/adhan/azan18.mp3",  // Turkish Fajr (best available)
    shortAudioUrl: `${ALA}/a10.mp3`,                                   // Qari Abdul Karim, 226 kbps (shorter)
    notificationSoundFilename: "adhan_turkish.wav",
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
