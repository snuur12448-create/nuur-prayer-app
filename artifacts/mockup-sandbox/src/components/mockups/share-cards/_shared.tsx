import React from "react";

export const BG = "#08110C";
export const CREAM = "#F4ECD8";
export const CREAM_DIM = "rgba(244, 236, 216, 0.62)";
export const GOLD = "#C9933A";
export const GOLD_DIM = "rgba(201, 147, 58, 0.45)";

/** Minimal top label: small uppercase, generous letter-spacing, no flanking lines. */
export function TopLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 10.5,
        letterSpacing: "0.42em",
        textTransform: "uppercase",
        color: GOLD,
        fontWeight: 500,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

/** Minimal reference line: muted, small, no flanking lines. */
export function Reference({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 10.5,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: CREAM_DIM,
        fontWeight: 500,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

/** Tiny "nuur" wordmark — lowercase, light, with a single faint gold dot. */
export function NuurMark() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          letterSpacing: "0.5em",
          textTransform: "lowercase",
          color: CREAM_DIM,
          fontWeight: 400,
          paddingLeft: "0.5em",
        }}
      >
        nuur
      </div>
      <div
        style={{
          width: 3,
          height: 3,
          borderRadius: 999,
          background: GOLD,
          opacity: 0.85,
        }}
      />
    </div>
  );
}

interface CardFrameProps {
  /** Glow tone — "warm" (gold) for hadith/names, "amber" (slightly warmer) for dua. */
  tone?: "warm" | "amber";
  children: React.ReactNode;
}

/**
 * Minimal card frame: deep dark canvas, ONE soft radial glow centered on the
 * Arabic line. No silhouettes, no patterns, no borders. Just light.
 */
export function CardFrame({ tone = "warm", children }: CardFrameProps) {
  const glow =
    tone === "amber"
      ? "radial-gradient(ellipse 70% 45% at 50% 48%, rgba(255, 188, 110, 0.18) 0%, rgba(201, 147, 58, 0.07) 35%, rgba(8, 17, 12, 0) 72%)"
      : "radial-gradient(ellipse 65% 42% at 50% 46%, rgba(255, 210, 140, 0.16) 0%, rgba(201, 147, 58, 0.06) 35%, rgba(8, 17, 12, 0) 72%)";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "#0a0a0a",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: 460,
          aspectRatio: "9/13.5",
          borderRadius: 28,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
          color: CREAM,
          background: BG,
        }}
      >
        {/* The single subtle glow — represents "noor". */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: glow,
            pointerEvents: "none",
          }}
        />
        {/* Content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: "56px 44px 40px 44px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
