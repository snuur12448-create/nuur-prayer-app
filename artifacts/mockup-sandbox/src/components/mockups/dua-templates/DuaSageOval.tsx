import React from "react";
import { DuaImageCard } from "./_base";

export function DuaSageOval() {
  return (
    <DuaImageCard
      theme={{
        image: "04-sage-oval.jpg",
        ink: "#2E3D26",
        inkDim: "rgba(46,61,38,0.7)",
        arabicSize: 34,
        arabicLineHeight: 1.6,
        englishSize: 15,
        body: {
          top: 290,
          left: 96,
          width: 240,
          height: 240,
          justify: "center",
          align: "center",
        },
        emblemColor: "#5E6A4A",
        emblemDim: "rgba(46,61,38,0.65)",
      }}
      content={{
        arabic: "أَسْتَغْفِرُ اللَّهَ\nالْعَظِيم",
        english: "I seek the forgiveness of Allah, the Magnificent.",
        source: "Daily Adhkar",
      }}
    />
  );
}
