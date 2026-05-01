import React from "react";
import { NuurBrandFooter, autoHalo } from "../dua-templates/_base";

const ARABIC_FONT = "'Amiri Quran', serif";
const SERIF_FONT = "'Cormorant Garamond', Georgia, serif";
const SANS_FONT = "'Inter', system-ui, sans-serif";

const INK = "#26342B";
const INK_DIM = "rgba(38, 52, 43, 0.85)";
const HALO = autoHalo(INK, 1);

export function DuaShare() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#f6f3ea" }}>
      <img
        src="/__mockup/images/nuur-premium/dua-share-v2.png"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* very light center halo so text reads cleanly without killing the leaves */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "78%",
          height: "62%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse at center, rgba(246, 243, 234, 0.78) 0%, rgba(246, 243, 234, 0.4) 55%, rgba(246, 243, 234, 0) 100%)",
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
            fontSize: 25,
            lineHeight: 1.85,
            color: INK,
            direction: "rtl",
            maxWidth: 320,
            textShadow: HALO,
          }}
        >
          اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ
        </div>

        <div
          style={{
            width: 44,
            height: 1,
            background: INK,
            opacity: 0.45,
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
            opacity: 1,
            maxWidth: 300,
            textShadow: HALO,
          }}
        >
          "O Allah, You are Peace, and from You comes Peace. Blessed are You, Possessor of Majesty and Honor."
        </div>

        <div
          style={{
            marginTop: 16,
            fontFamily: SANS_FONT,
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: INK,
            opacity: 0.85,
            fontWeight: 500,
            textShadow: HALO,
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
