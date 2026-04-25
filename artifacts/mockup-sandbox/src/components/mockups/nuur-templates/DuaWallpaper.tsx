import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "./_shared";

const CREAM = "rgba(244, 236, 216, 0.96)";
const CREAM_DIM = "rgba(244, 236, 216, 0.78)";
const GOLD = "#D5A85A";

function MistyMountains() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0 }}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B8AE94" />
          <stop offset="0.45" stopColor="#8C9285" />
          <stop offset="1" stopColor="#3F4A40" />
        </linearGradient>
        <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#697567" stopOpacity="0.75" />
          <stop offset="1" stopColor="#3A4338" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4D5A4A" stopOpacity="0.85" />
          <stop offset="1" stopColor="#1F2A20" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="m3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2F3B2D" stopOpacity="0.95" />
          <stop offset="1" stopColor="#0E140E" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect width="432" height="768" fill="url(#sky)" />
      <path d="M 0 480 L 70 410 L 130 460 L 200 380 L 280 450 L 360 400 L 432 470 L 432 768 L 0 768 Z" fill="url(#m1)" />
      <path d="M 0 560 L 60 510 L 130 550 L 200 480 L 270 540 L 350 500 L 432 560 L 432 768 L 0 768 Z" fill="url(#m2)" />
      <path d="M 0 640 L 80 600 L 160 630 L 230 580 L 310 620 L 390 590 L 432 620 L 432 768 L 0 768 Z" fill="url(#m3)" />
      <rect width="432" height="768" fill="url(#fade)" />
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor="#0a0a0a" stopOpacity="0" />
          <stop offset="1" stopColor="#0a0a0a" stopOpacity="0.45" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DuaWallpaper() {
  return (
    <FullBleed background="#1F2A20" ratio="9/16">
      <MistyMountains />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "120px 40px 50px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: SANS_FONT,
            fontSize: 9,
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: GOLD,
            opacity: 0.85,
          }}
        >
          A Dua for Comfort
        </div>

        <div style={{ marginTop: 50 }} />

        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: 30,
            lineHeight: 1.95,
            color: CREAM,
            direction: "rtl",
            fontWeight: 400,
            textShadow: "0 2px 18px rgba(0,0,0,0.55)",
          }}
        >
          ٱللَّهُمَّ ٱجْعَلْ أَوْلَادِي قُرَّةَ عَيْنٍ لِي
          <br />
          فِي ٱلدُّنْيَا وَٱلْآخِرَةِ
        </div>

        <div
          style={{
            marginTop: 36,
            fontFamily: SERIF_FONT,
            fontSize: 17,
            lineHeight: 1.55,
            color: CREAM_DIM,
            fontStyle: "italic",
            maxWidth: 320,
            textShadow: "0 1px 8px rgba(0,0,0,0.45)",
          }}
        >
          O Allah, make my children a comfort to my eyes in this life and the next.
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: SANS_FONT,
            fontSize: 8.5,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: CREAM_DIM,
            marginBottom: 14,
          }}
        >
          Inspired by Quran 25:74
        </div>
        <NuurMark color={GOLD} dim="rgba(244,236,216,0.7)" />
      </div>
    </FullBleed>
  );
}
