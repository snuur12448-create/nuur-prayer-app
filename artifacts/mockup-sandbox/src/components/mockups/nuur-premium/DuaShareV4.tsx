import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const ARABIC_FONT = "'Amiri Quran', serif";
const SERIF_FONT = "'Cormorant Garamond', Georgia, serif";
const SANS_FONT = "'Inter', system-ui, sans-serif";

const INK = "#3A1F12";
const INK_DIM = "rgba(58, 31, 18, 0.7)";
const SHADOW = "0 1px 3px rgba(255, 235, 200, 0.9), 0 0 14px rgba(255, 220, 180, 0.6)";

export function DuaShareV4() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#F4D9B0" }}>
      <img
        src="/__mockup/images/nuur-premium/dua-share-v4-bg.png?v=3"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "62px 44px 96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: 26,
            lineHeight: 1.85,
            color: INK,
            direction: "rtl",
            maxWidth: 320,
            textShadow: SHADOW,
          }}
        >
          اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ
        </div>

        <div
          style={{
            width: 44,
            height: 1,
            background: INK,
            opacity: 0.55,
            margin: "22px 0 18px",
          }}
        />

        <div
          style={{
            fontFamily: SERIF_FONT,
            fontSize: 17,
            fontStyle: "italic",
            lineHeight: 1.5,
            color: INK,
            opacity: 0.95,
            maxWidth: 300,
            textShadow: SHADOW,
          }}
        >
          "O Allah, You are Peace, and from You comes Peace. Blessed are You, Possessor of Majesty and Honor."
        </div>

        <div
          style={{
            marginTop: 16,
            fontFamily: SANS_FONT,
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: INK_DIM,
            textShadow: SHADOW,
          }}
        >
          Muslim · Daily Adhkar
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          zIndex: 3,
        }}
      >
        <NuurBrandFooter color={INK} dim={INK_DIM} iconSize={32} />
      </div>
    </div>
  );
}
