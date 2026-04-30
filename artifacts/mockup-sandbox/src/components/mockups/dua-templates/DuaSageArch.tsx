import React from "react";
import { DuaImageCard } from "./_base";

export function DuaSageArch() {
  return (
    <DuaImageCard
      theme={{
        image: "06-sage-arch-moon.jpg",
        ink: "#F2E9CD",
        inkDim: "rgba(242,233,205,0.78)",
        arabicSize: 30,
        arabicLineHeight: 1.65,
        englishSize: 14.5,
        textShadow: "0 1px 6px rgba(0,0,0,0.25)",
        body: {
          top: 360,
          left: 70,
          width: 292,
          height: 240,
          justify: "center",
          align: "center",
        },
        emblemColor: "#E0D6B0",
        emblemDim: "rgba(242,233,205,0.78)",
      }}
      content={{
        arabic: "لَا حَوْلَ وَلَا قُوَّةَ\nإِلَّا بِاللَّه",
        english: "There is no might nor power except with Allah.",
        source: "Bukhari · Daily Adhkar",
      }}
    />
  );
}
