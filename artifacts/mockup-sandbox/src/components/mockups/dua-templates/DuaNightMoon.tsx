import React from "react";
import { BotanicalSprig, DuaTemplateBase, GrainOverlay } from "./_base";

function StarField({ color = "#E8E2C8" }: { color?: string }) {
  const rng = (i: number) => {
    const x = Math.sin(i * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  const stars: Array<[number, number, number, number]> = [];
  for (let i = 0; i < 90; i++) {
    const y = rng(i + 100) * 380; // top portion only
    stars.push([rng(i) * 432, y, 0.3 + rng(i + 200) * 0.7, 0.3 + rng(i + 300) * 0.5]);
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

function Crescent() {
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid meet"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <defs>
        <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F0DFA6" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#F0DFA6" stopOpacity="0.12" />
          <stop offset="1" stopColor="#F0DFA6" stopOpacity="0" />
        </radialGradient>
        <mask id="crescentMask">
          <rect width="432" height="768" fill="black" />
          <circle cx="306" cy="135" r="22" fill="white" />
          <circle cx="298" cy="128" r="20" fill="black" />
        </mask>
      </defs>
      {/* glow */}
      <circle cx="306" cy="135" r="60" fill="url(#moonGlow)" />
      {/* crescent shape */}
      <rect width="432" height="768" fill="#E8C77A" mask="url(#crescentMask)" />
    </svg>
  );
}

function MountainRange() {
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid meet"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="mtnGrad1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1F3A35" stopOpacity="0.95" />
          <stop offset="1" stopColor="#0D1E1B" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="mtnGrad2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#274744" stopOpacity="0.7" />
          <stop offset="1" stopColor="#142927" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* far range */}
      <path
        d="M 0 540 L 60 510 L 130 530 L 200 495 L 280 525 L 360 500 L 432 520 L 432 768 L 0 768 Z"
        fill="url(#mtnGrad2)"
      />
      {/* near range */}
      <path
        d="M 0 580 L 80 545 L 160 575 L 240 540 L 330 580 L 432 555 L 432 768 L 0 768 Z"
        fill="url(#mtnGrad1)"
      />
    </svg>
  );
}

export function DuaNightMoon() {
  return (
    <DuaTemplateBase
      background="linear-gradient(180deg, #1B3531 0%, #143028 45%, #0E2520 100%)"
      emblemColor="#E8C77A"
      emblemDim="rgba(232,222,186,0.7)"
      decor={
        <>
          <StarField />
          <Crescent />
          <MountainRange />
          <GrainOverlay opacity={0.35} />
          {/* Bottom-right botanical leaves rising */}
          <svg
            viewBox="0 0 432 768"
            preserveAspectRatio="xMidYMid meet"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          >
            <BotanicalSprig
              fill="#3E5C50"
              stroke="#2C443A"
              opacity={0.95}
              transform="translate(420 480) scale(1.2) rotate(20)"
            />
            <BotanicalSprig
              fill="#2F4A40"
              stroke="#1F362E"
              opacity={0.7}
              transform="translate(360 540) scale(0.85) rotate(-10)"
            />
          </svg>
        </>
      }
    />
  );
}
