import { TextStyle } from "react-native";

export const arabicGlow: TextStyle = {
  textShadowColor: "rgba(230, 200, 140, 0.35)",
  textShadowRadius: 20,
  textShadowOffset: { width: 0, height: 2 },
};

export function arabicFontFor(sourceType: "quran" | "non-quran"): string {
  // For Quranic ayat the project ships AmiriQuran (closest to KFGQPC available).
  return sourceType === "quran" ? "AmiriQuran_400Regular" : "Amiri_400Regular";
}
