import React from "react";
import { FrameDuaPreview } from "./_duaPreview";

const SHORT_DUA = {
  arabic: "حَسْبِيَ ٱللَّهُ لَا إِلَٰهَ إِلَّا هُوَ · عَلَيْهِ تَوَكَّلْتُ",
  english:
    "“Allah is sufficient for me; there is no deity except Him. Upon Him I have relied.”",
  reference: "At-Tawbah · 9:129",
};

export function DuaWallpaperPreview() {
  return (
    <FrameDuaPreview
      panel={4}
      tone="cream"
      accent="#E8C77A"
      bgFill="#1F2D2A"
      eyebrow="Evening Dhikr"
      arabic={SHORT_DUA.arabic}
      english={SHORT_DUA.english}
      reference={SHORT_DUA.reference}
      mode="wallpaper"
    />
  );
}
