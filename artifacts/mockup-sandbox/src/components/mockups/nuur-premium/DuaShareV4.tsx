import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const ARABIC_FONT = "'Amiri Quran', serif";
const SERIF_FONT = "'Cormorant Garamond', Georgia, serif";
const SANS_FONT = "'Inter', system-ui, sans-serif";

const INK = "#EBF0F5"; // Cool crisp white/silver to match the serene blue pool vibes
const INK_DIM = "rgba(235, 240, 245, 0.65)";

export function DuaShareV4() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#0F1626" }}>
      <img
        src="/__mockup/images/nuur-premium/dua-share-v4-bg.png"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Gentle cool vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(15, 22, 38, 0.3) 0%, rgba(15, 22, 38, 0.65) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0) 30%, rgba(15, 22, 38, 0.5) 100%)",
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
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
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
            opacity: 0.95,
            maxWidth: 300,
            textShadow: "0 1px 6px rgba(0,0,0,0.5)",
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
