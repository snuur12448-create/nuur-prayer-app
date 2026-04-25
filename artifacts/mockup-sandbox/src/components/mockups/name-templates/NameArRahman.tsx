import React from "react";
import { NameCardBase } from "./_base";

export function NameArRahman() {
  return (
    <NameCardBase
      theme={{
        background:
          "radial-gradient(ellipse 90% 60% at 50% 35%, #4A2A4F 0%, #2C1730 70%, #1A0E20 100%)",
        ink: "#F1E2C2",
        inkDim: "rgba(241,226,194,0.72)",
        archStroke: "#D4B373",
        gold: "#D4B373",
        starfield: true,
        grain: 0.5,
        halo: "radial-gradient(ellipse 70% 30% at 50% 18%, rgba(212,179,115,0.18) 0%, rgba(0,0,0,0) 65%)",
      }}
      arabic="الرَّحْمَٰن"
      translit="Ar-Rahman"
      meaning={
        <>
          The Most
          <br />
          Merciful
        </>
      }
    />
  );
}
