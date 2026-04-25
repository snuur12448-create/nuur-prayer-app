import React from "react";
import { NameCardBase } from "./_base";

export function NameAlMumin() {
  return (
    <NameCardBase
      theme={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 40%, #B6A7CC 0%, #8E7BB1 70%, #6B5995 100%)",
        ink: "#F4ECDC",
        inkDim: "rgba(244,236,220,0.78)",
        archStroke: "#E8D2A6",
        gold: "#E8D2A6",
        starfield: true,
        grain: 0.45,
        halo: "radial-gradient(ellipse 70% 30% at 50% 18%, rgba(244,236,220,0.18) 0%, rgba(0,0,0,0) 65%)",
      }}
      arabic="الْمُؤْمِن"
      translit="Al-Mu'min"
      meaning={
        <>
          The One Who
          <br />
          gives Emaan
          <br />
          (Faith)
        </>
      }
    />
  );
}
