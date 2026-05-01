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
          left: 210,
          width: 192,
          height: 280,
          justify: "center",
          align: "right",
        },
        // Soft cream wash behind the text so the leaf tendrils don't
        // crowd the Arabic on the right column.
        textHalo:
          "radial-gradient(ellipse 70% 60% at 60% 50%, rgba(245,240,225,0.78) 0%, rgba(245,240,225,0) 80%)",
        emblemColor: "#7E8862",
        emblemDim: "rgba(63,74,46,0.6)",
      }}
      content={{
        // Explicit break matches the conventional Bismillah reading rhythm:
        // "In the name of Allah" / "the Most Gracious, the Most Merciful".
        arabic: "بِسْمِ اللَّهِ\nالرَّحْمَٰنِ الرَّحِيمِ",
        english: "In the name of Allah, the Most Gracious, the Most Merciful.",
        source: "Qur'an · Al-Fatiha 1:1",
      }}
    />
  );
}
