import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";

export interface NameTheme {
  /** outer card background — gradient string */
  background: string;
  /** main ink/text color */
  ink: string;
  /** secondary/dim text color */
  inkDim: string;
  /** thin gold-style stroke for the arch */
  archStroke: string;
  /** Nuur mark gold dot color */
  gold: string;
  /** subtle texture opacity (0..1). 0 = none */
  grain?: number;
  /** soft halo glow gradient at top of arch (CSS background) */
  halo?: string;
  /** add a faint dotted starfield overlay */
  starfield?: boolean;
}

function ScallopedArch({ stroke }: { stroke: string }) {
  // Scalloped trefoil-style arch matching the reference (5 small lobes at the apex,
  // flowing into the side springs of the arch).
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid meet"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="archGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity="0.85" />
          <stop offset="0.6" stopColor={stroke} stopOpacity="0.55" />
          <stop offset="1" stopColor={stroke} stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {/* Outer arch */}
      <path
        d="
          M 22 752
          L 22 240
          C 22 170 60 110 130 100
          C 156 96 168 120 180 120
          C 192 120 198 96 216 96
          C 234 96 240 120 252 120
          C 264 120 276 96 302 100
          C 372 110 410 170 410 240
          L 410 752
        "
        fill="none"
        stroke="url(#archGrad)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner thin parallel arch */}
      <path
        d="
          M 32 752
          L 32 246
          C 32 178 68 122 134 112
          C 158 108 170 130 182 130
          C 194 130 200 110 216 110
          C 232 110 238 130 250 130
          C 262 130 274 108 298 112
          C 364 122 400 178 400 246
          L 400 752
        "
        fill="none"
        stroke="url(#archGrad)"
        strokeWidth="0.6"
        opacity="0.7"
      />
      {/* tiny apex finial dot */}
      <circle cx="216" cy="92" r="2" fill={stroke} opacity="0.7" />
    </svg>
  );
}

function StarField({ color }: { color: string }) {
  const stars: Array<[number, number, number, number]> = [];
  const rng = (i: number) => {
    const x = Math.sin(i * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 80; i++) {
    stars.push([rng(i) * 432, rng(i + 100) * 768, 0.3 + rng(i + 200) * 0.7, 0.25 + rng(i + 300) * 0.5]);
  }
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      {stars.map(([x, y, r, o], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={o} />
      ))}
    </svg>
  );
}

export function NameCardBase({
  theme,
  arabic,
  translit,
  meaning,
}: {
  theme: NameTheme;
  arabic: string;
  translit: string;
  meaning: React.ReactNode;
}) {
  return (
    <FullBleed background={theme.background} ratio="9/16">
      {theme.starfield && <StarField color={theme.ink} />}
      {theme.grain !== 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px)",
            opacity: theme.grain ?? 0.4,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
      )}
      {theme.halo && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: theme.halo,
            pointerEvents: "none",
          }}
        />
      )}

      <ScallopedArch stroke={theme.archStroke} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "150px 50px 38px 50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: theme.ink,
        }}
      >
        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: 64,
            lineHeight: 1.1,
            direction: "rtl",
            fontWeight: 400,
            color: theme.ink,
            textShadow: "0 2px 14px rgba(0,0,0,0.35)",
          }}
        >
          {arabic}
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: SERIF_FONT,
            fontSize: 22,
            color: theme.ink,
            letterSpacing: "0.02em",
          }}
        >
          {translit}
        </div>

        <div
          style={{
            marginTop: 26,
            fontFamily: SERIF_FONT,
            fontSize: 18,
            fontStyle: "italic",
            color: theme.inkDim,
            lineHeight: 1.45,
            maxWidth: 260,
          }}
        >
          {meaning}
        </div>

        <div style={{ flex: 1 }} />

        <NuurMark color={theme.gold} dim={theme.inkDim} />
      </div>
    </FullBleed>
  );
}

// Re-export font tokens so per-name files can use them if needed
export { ARABIC_FONT, SERIF_FONT, SANS_FONT };
