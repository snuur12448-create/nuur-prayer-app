import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const ARABIC_FONT = "'Amiri Quran', serif";
const SERIF_FONT = "'Cormorant Garamond', Georgia, serif";
const SANS_FONT = "'Inter', system-ui, sans-serif";

const INK = "#EDF1F6";
const INK_DIM = "rgba(237, 241, 246, 0.65)";
const RULE = "rgba(180, 196, 220, 0.45)";

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

      {/* subtle cool darken at top + bottom for footer + breathing room */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(15, 22, 38, 0.25) 0%, rgba(15, 22, 38, 0) 35%, rgba(15, 22, 38, 0) 65%, rgba(15, 22, 38, 0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "44px 36px 96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 340,
            background: "rgba(12, 18, 32, 0.78)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(180, 196, 220, 0.28)",
            borderRadius: 14,
            padding: "32px 28px 28px",
            textAlign: "center",
            boxShadow: "0 20px 56px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              fontFamily: ARABIC_FONT,
              fontSize: 25,
              lineHeight: 1.85,
              color: INK,
              direction: "rtl",
            }}
          >
            اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ
          </div>

          <div
            style={{
              width: 40,
              height: 1,
              background: RULE,
              margin: "20px auto 16px",
            }}
          />

          <div
            style={{
              fontFamily: SERIF_FONT,
              fontSize: 16,
              fontStyle: "italic",
              lineHeight: 1.5,
              color: INK,
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
            }}
          >
            Muslim · Daily Adhkar
          </div>
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
