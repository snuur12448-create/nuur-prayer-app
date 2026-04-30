import React from "react";
import { DuaImageCard } from "./_base";

export function DuaNightMoon() {
  return (
    <DuaImageCard
      theme={{
        image: "05-night-mountains.jpg",
        ink: "#EAE0BE",
        inkDim: "rgba(234,224,190,0.78)",
        arabicSize: 32,
        arabicLineHeight: 1.6,
        englishSize: 14.5,
        textShadow: "0 2px 12px rgba(0,0,0,0.55)",
        body: {
          top: 320,
          left: 50,
          width: 332,
          height: 240,
          justify: "center",
          align: "center",
        },
        emblemColor: "#E8C77A",
        emblemDim: "rgba(234,224,190,0.78)",
      }}
      content={{
        arabic: "حَسْبُنَا اللَّهُ\nوَنِعْمَ الْوَكِيل",
        english: "Allah is sufficient for us, and the best Trustee.",
        source: "Qur'an · Aal Imran 3:173",
      }}
    />
  );
}
