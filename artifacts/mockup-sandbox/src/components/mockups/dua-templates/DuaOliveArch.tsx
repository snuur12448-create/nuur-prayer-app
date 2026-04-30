import React from "react";
import { DuaImageCard } from "./_base";

export function DuaOliveArch() {
  return (
    <DuaImageCard
      theme={{
        image: "02-olive-arch.jpg",
        ink: "#EDE2BC",
        inkDim: "rgba(237,226,188,0.75)",
        arabicSize: 40,
        arabicLineHeight: 1.6,
        englishSize: 16,
        textShadow: "0 1px 8px rgba(0,0,0,0.25)",
        body: {
          top: 230,
          left: 70,
          width: 292,
          height: 320,
          justify: "center",
          align: "center",
        },
        emblemColor: "#D9C58A",
        emblemDim: "rgba(237,226,188,0.75)",
      }}
      content={{
        arabic: "سُبْحَانَ اللَّهِ\nوَبِحَمْدِهِ",
        english: "Glory be to Allah, and praise be to Him.",
        source: "Bukhari & Muslim",
      }}
    />
  );
}
