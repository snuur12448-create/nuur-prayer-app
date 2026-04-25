import React from "react";
import { NameCardBase } from "./_base";

export function NameAsSalam() {
  return (
    <NameCardBase
      theme={{
        background:
          "radial-gradient(ellipse 90% 65% at 50% 40%, #4A4F58 0%, #2E3239 70%, #1B1E24 100%)",
        ink: "#E6DCC4",
        inkDim: "rgba(230,220,196,0.75)",
        archStroke: "#C7AB72",
        gold: "#C7AB72",
        grain: 0.4,
        halo: "radial-gradient(ellipse 70% 30% at 50% 18%, rgba(199,171,114,0.16) 0%, rgba(0,0,0,0) 65%)",
      }}
      arabic="السَّلَام"
      translit="As-Salam"
      meaning={
        <>
          The Source
          <br />
          of Peace
        </>
      }
    />
  );
}
