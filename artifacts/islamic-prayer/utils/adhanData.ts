export interface AdhanStyle {
  id: string;
  name: string;
  arabic: string;
  reciter: string;
  location: string;
  description: string;
  audioUrl: string;
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
  },
  {
    id: "madinah",
    name: "Madinah",
    arabic: "أذان المدينة المنورة",
    reciter: "Sheikh Essam Bukhari",
    location: "Masjid an-Nabawi, Madinah",
    description: "The beloved call from the Prophet's Mosque",
    audioUrl: "https://www.islamcan.com/audio/adhan/azan2.mp3",
  },
  {
    id: "afasy",
    name: "Mishari Al-Afasy",
    arabic: "الشيخ مشاري العفاسي",
    reciter: "Sheikh Mishari Rashid Al-Afasy",
    location: "Kuwait",
    description: "The world-renowned Kuwaiti reciter's melodious adhan",
    audioUrl: "https://www.islamcan.com/audio/adhan/azan3.mp3",
  },
  {
    id: "egyptian",
    name: "Egyptian",
    arabic: "الأذان المصري",
    reciter: "Traditional Egyptian Style",
    location: "Al-Azhar, Cairo",
    description: "The classical Egyptian maqam style passed through generations",
    audioUrl: "https://www.islamcan.com/audio/adhan/azan4.mp3",
  },
  {
    id: "turkish",
    name: "Turkish",
    arabic: "الأذان العثماني",
    reciter: "Diyanet İşleri Başkanlığı",
    location: "Süleymaniye Mosque, Istanbul",
    description: "The majestic Ottoman-era style from Istanbul's grand mosques",
    audioUrl: "https://www.islamcan.com/audio/adhan/azan5.mp3",
  },
];

export const DEFAULT_ADHAN_STYLE_ID = "makkah";

export function getAdhanStyle(id: string): AdhanStyle {
  return ADHAN_STYLES.find((s) => s.id === id) ?? ADHAN_STYLES[0];
}
