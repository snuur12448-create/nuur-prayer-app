import React from "react";
import { DuaImageCard } from "./_base";

export function DuaCreamLeafShadow() {
  return (
    <DuaImageCard
      theme={{
        image: "03-cream-arch-shadow.jpg",
        ink: "#5B4A2C",
        inkDim: "rgba(91,74,44,0.7)",
        arabicSize: 38,
        arabicLineHeight: 1.6,
        englishSize: 16,
        body: {
          top: 250,
          left: 70,
          width: 292,
          height: 300,
          justify: "center",
          align: "center",
        },
        emblemColor: "#9A7A4A",
        emblemDim: "rgba(91,74,44,0.7)",
      }}
      content={{
        arabic: "الْحَمْدُ لِلَّهِ\nرَبِّ الْعَالَمِين",
        english: "All praise is for Allah, Lord of all the worlds.",
        source: "Qur'an · Al-Fatiha 1:2",
      }}
    />
  );
}
