import React from "react";
import { NuurBrandFooter } from "../dua-templates/_base";

const ARABIC_FONT = "'Amiri Quran', serif";
const SERIF_FONT = "'Cormorant Garamond', Georgia, serif";
const SANS_FONT = "'Inter', system-ui, sans-serif";

const INK = "#F2DDB4";
const INK_DIM = "rgba(242, 221, 180, 0.65)";
const RULE = "rgba(212, 168, 108, 0.55)";

export function DuaShareV3() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#1C1410" }}>
      <img
        src="/__mockup/images/nuur-premium/dua-share-v3-bg.png"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* very gentle vignette to focus center */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 110% 80% at 50% 50%, rgba(0,0,0,0) 30%, rgba(8, 5, 3, 0.55) 100%)",
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
            background: "rgba(20, 14, 10, 0.78)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(212, 168, 108, 0.32)",
            borderRadius: 14,
            padding: "32px 28px 28px",
            textAlign: "center",
            boxShadow: "0 20px 56px rgba(0, 0, 0, 0.55)",
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
