import React from "react";
import { FrameDuaPreview } from "./_duaPreview";

const LONG_DUA = {
  arabic:
    "ٱللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ ٱلْهَمِّ وَٱلْحَزَنِ، وَٱلْعَجْزِ وَٱلْكَسَلِ، وَٱلْبُخْلِ وَٱلْجُبْنِ، وَضَلَعِ ٱلدَّيْنِ، وَغَلَبَةِ ٱلرِّجَالِ",
  english:
    "“O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by men.”",
  reference: "Bukhārī · 6369",
};

export function DuaCardPreview() {
  return (
    <FrameDuaPreview
      panel={1}
      tone="cream"
      accent="#E2C788"
      bgFill="#4B5B3C"
      eyebrow="Morning Adhkār"
      arabic={LONG_DUA.arabic}
      english={LONG_DUA.english}
      reference={LONG_DUA.reference}
      mode="card"
    />
  );
}
