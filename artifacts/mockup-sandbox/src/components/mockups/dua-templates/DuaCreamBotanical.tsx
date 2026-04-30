import React from "react";
import { DuaImageCard } from "./_base";

export function DuaCreamBotanical() {
  return (
    <DuaImageCard
      theme={{
        image: "01-cream-leaves.jpg",
        ink: "#3F4A2E",
        inkDim: "rgba(63,74,46,0.7)",
        arabicSize: 30,
        arabicLineHeight: 1.7,
        englishSize: 15,
        body: {
          top: 240,
          left: 200,
          width: 200,
          height: 280,
          justify: "center",
          align: "right",
        },
        emblemColor: "#7E8862",
        emblemDim: "rgba(63,74,46,0.6)",
      }}
      content={{
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        english: "In the name of Allah, the Most Gracious, the Most Merciful.",
        source: "Qur'an · Al-Fatiha 1:1",
      }}
    />
  );
}
