import React from "react";
import { BotanicalSprig, DuaTemplateBase, GrainOverlay, PointedArch } from "./_base";

export function DuaSageArch() {
  return (
    <DuaTemplateBase
      background="radial-gradient(ellipse 100% 80% at 50% 45%, #D8DCC8 0%, #C2C8B0 100%)"
      emblemColor="#6E7656"
      emblemDim="rgba(60,68,48,0.55)"
      decor={
        <>
          <GrainOverlay opacity={0.4} />
          <PointedArch stroke="#E8EADC" strokeWidth={1.4} opacity={0.95} inset={48} topInset={80} />
          {/* Small sprig in the bottom-right corner */}
          <svg
            viewBox="0 0 432 768"
            preserveAspectRatio="xMidYMid meet"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          >
            <BotanicalSprig
              fill="#8B9670"
              stroke="#6B7654"
              opacity={0.85}
              transform="translate(390 580) scale(0.7) rotate(15)"
            />
          </svg>
        </>
      }
    />
  );
}
