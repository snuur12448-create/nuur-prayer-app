import React from "react";
import { NameCardBase } from "./_base";

export function NameAlMalik() {
  return (
    <NameCardBase
      theme={{
        background:
          "radial-gradient(ellipse 90% 65% at 50% 40%, #1F4438 0%, #0F2A20 70%, #07180F 100%)",
        ink: "#EDD9A4",
        inkDim: "rgba(237,217,164,0.78)",
        archStroke: "#D4B373",
        gold: "#D4B373",
        grain: 0.4,
        halo: "radial-gradient(ellipse 70% 30% at 50% 18%, rgba(212,179,115,0.18) 0%, rgba(0,0,0,0) 65%)",
      }}
      arabic="الْمَلِك"
      translit="Al-Malik"
      meaning={
        <>
          The King,
          <br />
          The Sovereign
        </>
      }
    />
  );
}
