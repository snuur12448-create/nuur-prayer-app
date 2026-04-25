import React from "react";
import { NameCardBase } from "./_base";

export function NameArRaheem() {
  return (
    <NameCardBase
      theme={{
        background:
          "radial-gradient(ellipse 90% 65% at 50% 40%, #C18796 0%, #9C6273 70%, #7E4A5C 100%)",
        ink: "#F4E8D8",
        inkDim: "rgba(244,232,216,0.78)",
        archStroke: "#E8CBA4",
        gold: "#E8CBA4",
        grain: 0.45,
        halo: "radial-gradient(ellipse 70% 30% at 50% 18%, rgba(244,232,216,0.18) 0%, rgba(0,0,0,0) 65%)",
      }}
      arabic="الرَّحِيم"
      translit="Ar-Raheem"
      meaning={
        <>
          The Bestower
          <br />
          of Mercy
        </>
      }
    />
  );
}
