import React from "react";
import { BotanicalSprig, DuaTemplateBase, GrainOverlay } from "./_base";

export function DuaCreamBotanical() {
  return (
    <DuaTemplateBase
      background="radial-gradient(ellipse 100% 80% at 50% 40%, #ECE6D6 0%, #DCD3BD 100%)"
      emblemColor="#7E8862"
      emblemDim="rgba(70,75,55,0.55)"
      decor={
        <>
          <GrainOverlay opacity={0.4} />
          {/* Botanical sprig curling up the bottom-left corner */}
          <svg
            viewBox="0 0 432 768"
            preserveAspectRatio="xMidYMid meet"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          >
            <BotanicalSprig
              fill="#9AA688"
              stroke="#6E7B58"
              opacity={0.85}
              transform="translate(-10 460) scale(1.4)"
            />
            {/* secondary smaller sprig drifting upward */}
            <BotanicalSprig
              fill="#A8B496"
              stroke="#7E8866"
              opacity={0.55}
              transform="translate(-30 200) scale(0.9) rotate(-8)"
              blur={0.4}
            />
          </svg>
        </>
      }
    />
  );
}
