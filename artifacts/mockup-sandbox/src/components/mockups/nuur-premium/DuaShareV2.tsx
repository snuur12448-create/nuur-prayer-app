import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const ARABIC_FONT = "'Amiri Quran', serif";
const SERIF_FONT = "'Cormorant Garamond', Georgia, serif";
const SANS_FONT = "'Inter', system-ui, sans-serif";

const INK = "#3A2A20"; // Deep warm umber for text on the bright hazy dawn background
const INK_DIM = "rgba(58, 42, 32, 0.65)";

export function DuaShareV2() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#E8E1D9" }}>
      <img
        src="/__mockup/images/nuur-premium/dua-share-v2-bg.png"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Gentle center halo to ensure text legibility against the hazy dawn */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "90%",
          height: "70%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse at center, rgba(255, 252, 248, 0.8) 0%, rgba(255, 252, 248, 0.4) 50%, rgba(255, 252, 248, 0) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* content */}
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
            lineHeight: 1.8,
            color: INK,
            direction: "rtl",
            maxWidth: 320,
            textShadow: "0 2px 10px rgba(255,255,255,0.8)",
          }}
        >
          اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ
        </div>

        <div
          style={{
            width: 44,
            height: 1,
            background: INK,
            opacity: 0.35,
            margin: "24px 0 20px",
          }}
        />

        <div
          style={{
            fontFamily: SERIF_FONT,
            fontSize: 17,
            fontStyle: "italic",
            lineHeight: 1.45,
            color: INK,
            opacity: 0.9,
            maxWidth: 300,
            textShadow: "0 1px 5px rgba(255,255,255,0.8)",
          }}
        >
          "O Allah, You are Peace, and from You comes Peace. Blessed are You, Possessor of Majesty and Honor."
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: SANS_FONT,
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: INK_DIM,
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
