import React from "react";
import { NameCardBase } from "./_base";

export function NameAlQuddus() {
  return (
    <NameCardBase
      theme={{
        background:
          "radial-gradient(ellipse 90% 75% at 50% 50%, #ECE0C5 0%, #D5C29C 100%)",
        ink: "#3A3220",
        inkDim: "rgba(58,50,32,0.85)",
        archStroke: "#9A7A2E",
        gold: "#9A7A2E",
        grain: 0.3,
      }}
      arabic="الْقُدُّوس"
      translit="Al-Quddus"
      meaning={
        <>
          The Pure,
          <br />
          The Holy
        </>
      }
    />
  );
}
