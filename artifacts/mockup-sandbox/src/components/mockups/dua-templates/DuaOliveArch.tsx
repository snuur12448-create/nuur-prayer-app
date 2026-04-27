import React from "react";
import { BotanicalSprig, DuaTemplateBase, GrainOverlay, PointedArch } from "./_base";

export function DuaOliveArch() {
  return (
    <DuaTemplateBase
      background="radial-gradient(ellipse 100% 80% at 50% 45%, #6A7547 0%, #525C36 70%, #3F4828 100%)"
      emblemColor="#D9C58A"
      emblemDim="rgba(228,218,178,0.7)"
      decor={
        <>
          <GrainOverlay opacity={0.45} />
          {/* Top-corner leaves */}
          <svg
            viewBox="0 0 432 768"
            preserveAspectRatio="xMidYMid meet"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          >
            {/* Top-left leaves drooping down */}
            <BotanicalSprig
              fill="#7B895E"
              stroke="#5A6740"
              opacity={0.75}
              transform="translate(40 -80) scale(1.0) rotate(155)"
            />
            {/* Top-right leaves drooping down */}
            <BotanicalSprig
              fill="#7B895E"
              stroke="#5A6740"
              opacity={0.75}
              transform="translate(380 -80) scale(1.0) rotate(205)"
            />
            {/* Bottom-right corner sprig rising up */}
            <BotanicalSprig
              fill="#7B895E"
              stroke="#5A6740"
              opacity={0.85}
              transform="translate(420 480) scale(1.2) rotate(20)"
            />
          </svg>
          <PointedArch stroke="#D9C58A" strokeWidth={1.2} opacity={0.7} inset={48} topInset={70} />
        </>
      }
    />
  );
}
