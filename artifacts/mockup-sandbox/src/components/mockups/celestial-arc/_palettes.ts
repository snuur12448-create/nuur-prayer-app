export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export type Palette = {
  skyTop: string;
  skyMid: string;
  skyHorizon: string;
  ember: string;
  emberBright: string;
  emberDim: string;
  horizonGlowAlpha: number;
  starCount: number;
  starOpacity: number;
  arabicTextColor: string;
};

export type PrayerData = {
  name: string;
  arabic: string;
  time: string;
  remaining: string;
  windowProgress: number;
  prevLabel: string;
  nextLabel: string;
  windowNote: string;
};

export const PALETTES: Record<PrayerKey, Palette> = {
  fajr: {
    skyTop: "#0D1733",
    skyMid: "#2E1F3A",
    skyHorizon: "#6B3548",
    ember: "#D4708F",
    emberBright: "#F4C2D2",
    emberDim: "#7A3550",
    horizonGlowAlpha: 0.4,
    starCount: 6,
    starOpacity: 0.55,
    arabicTextColor: "#FFE8EE",
  },
  dhuhr: {
    skyTop: "#0F2D3D",
    skyMid: "#1F4E5F",
    skyHorizon: "#C99B3A",
    ember: "#F4C84A",
    emberBright: "#FFEDA8",
    emberDim: "#A8782A",
    horizonGlowAlpha: 0.55,
    starCount: 0,
    starOpacity: 0,
    arabicTextColor: "#FFF8DC",
  },
  asr: {
    skyTop: "#1F2A1A",
    skyMid: "#4A3520",
    skyHorizon: "#A6712A",
    ember: "#E89A3A",
    emberBright: "#FFD080",
    emberDim: "#8C5520",
    horizonGlowAlpha: 0.45,
    starCount: 0,
    starOpacity: 0,
    arabicTextColor: "#FFF0D0",
  },
  maghrib: {
    skyTop: "#1A0F22",
    skyMid: "#3D1830",
    skyHorizon: "#7A2818",
    ember: "#E07A2A",
    emberBright: "#FFB055",
    emberDim: "#9C4A1F",
    horizonGlowAlpha: 0.45,
    starCount: 10,
    starOpacity: 0.55,
    arabicTextColor: "#FFF6E0",
  },
  isha: {
    skyTop: "#070D1F",
    skyMid: "#0F1845",
    skyHorizon: "#1A2A5F",
    ember: "#9BA8E8",
    emberBright: "#E8E8FF",
    emberDim: "#5060A8",
    horizonGlowAlpha: 0.18,
    starCount: 22,
    starOpacity: 0.75,
    arabicTextColor: "#E8EEFF",
  },
};

export const PRAYERS: Record<PrayerKey, PrayerData> = {
  fajr: {
    name: "Fajr",
    arabic: "الفجر",
    time: "5:24 AM",
    remaining: "1h 27m to Shurūq",
    windowProgress: 0.18,
    prevLabel: "Isha",
    nextLabel: "Shurūq",
    windowNote: "window closes at sunrise (6:51 AM)",
  },
  dhuhr: {
    name: "Dhuhr",
    arabic: "الظهر",
    time: "12:46 PM",
    remaining: "2h 14m left",
    windowProgress: 0.32,
    prevLabel: "Shurūq",
    nextLabel: "Asr",
    windowNote: "window closes at 4:08 PM (Asr)",
  },
  asr: {
    name: "Asr",
    arabic: "العصر",
    time: "4:08 PM",
    remaining: "1h 34m left",
    windowProgress: 0.55,
    prevLabel: "Dhuhr",
    nextLabel: "Maghrib",
    windowNote: "window closes at 5:42 PM (Maghrib)",
  },
  maghrib: {
    name: "Maghrib",
    arabic: "المغرب",
    time: "5:42 PM",
    remaining: "23m left",
    windowProgress: 0.62,
    prevLabel: "Asr",
    nextLabel: "Isha",
    windowNote: "window closes at 7:08 PM (Isha)",
  },
  isha: {
    name: "Isha",
    arabic: "العشاء",
    time: "7:08 PM",
    remaining: "until Fajr",
    windowProgress: 0.4,
    prevLabel: "Maghrib",
    nextLabel: "Fajr",
    windowNote: "window closes at 5:24 AM (Fajr, tomorrow)",
  },
};
