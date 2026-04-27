import React from "react";
import { DuaTemplateBase, GrainOverlay, LeafShadow, PointedArch } from "./_base";

export function DuaCreamLeafShadow() {
  return (
    <DuaTemplateBase
      background="radial-gradient(ellipse 100% 80% at 50% 45%, #F0E2D0 0%, #E2CFB8 100%)"
      emblemColor="#9A7A4A"
      emblemDim="rgba(80,60,40,0.55)"
      decor={
        <>
          <GrainOverlay opacity={0.4} />
          {/* Soft leafy shadow drifting from top-right */}
          <LeafShadow
            fill="#7E8466"
            opacity={0.32}
            blur={5}
            transform="translate(432 0) scale(-1 1)"
          />
          <LeafShadow
            fill="#6E7558"
            opacity={0.18}
            blur={9}
            transform="translate(380 60) scale(-0.7 0.7)"
          />
          <PointedArch stroke="#A88864" strokeWidth={1.2} opacity={0.65} inset={48} topInset={80} />
        </>
      }
    />
  );
}
