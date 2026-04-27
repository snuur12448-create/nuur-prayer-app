import React from "react";
import { DuaTemplateBase, GrainOverlay, LeafShadow } from "./_base";

export function DuaSageOval() {
  return (
    <DuaTemplateBase
      background="radial-gradient(ellipse 100% 80% at 50% 45%, #C9D2BC 0%, #B0BCA0 100%)"
      emblemColor="#5E6A4A"
      emblemDim="rgba(60,70,50,0.55)"
      decor={
        <>
          <GrainOverlay opacity={0.4} />
          {/* Leaf shadow from top-right */}
          <LeafShadow
            fill="#5C6648"
            opacity={0.32}
            blur={5}
            transform="translate(432 0) scale(-1 1)"
          />
          <LeafShadow
            fill="#5C6648"
            opacity={0.16}
            blur={10}
            transform="translate(360 -20) scale(-0.6 0.6)"
          />
          {/* Centered oval frame */}
          <svg
            viewBox="0 0 432 768"
            preserveAspectRatio="xMidYMid meet"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          >
            <ellipse
              cx="216"
              cy="384"
              rx="140"
              ry="220"
              fill="none"
              stroke="#E6E8DC"
              strokeWidth="1.2"
              opacity="0.85"
            />
          </svg>
        </>
      }
    />
  );
}
