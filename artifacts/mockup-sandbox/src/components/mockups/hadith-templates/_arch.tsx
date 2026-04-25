import React from "react";

/**
 * Reusable mihrab arch outline. Used by every hadith template so they share
 * a consistent motif (matches the reference image where every card shows the
 * same outlined arch). Stroke color and opacity vary by background.
 */
export function MihrabArchOutline({
  stroke = "rgba(60,40,20,0.35)",
  strokeWidth = 1.0,
  inset = 14,
}: {
  stroke?: string;
  strokeWidth?: number;
  inset?: number;
}) {
  // viewBox 432x768 to match card size
  const left = inset;
  const right = 432 - inset;
  const top = inset;
  const shoulder = 230;
  const apex = 90;
  const center = 216;
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid meet"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <path
        d={`
          M ${left} 768
          L ${left} ${shoulder}
          C ${left} ${shoulder - 80} ${center - 110} ${apex} ${center} ${apex}
          C ${center + 110} ${apex} ${right} ${shoulder - 80} ${right} ${shoulder}
          L ${right} 768
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <path
        d={`
          M ${left + 8} 768
          L ${left + 8} ${shoulder + 6}
          C ${left + 8} ${shoulder - 70} ${center - 100} ${apex + 10} ${center} ${apex + 10}
          C ${center + 100} ${apex + 10} ${right - 8} ${shoulder - 70} ${right - 8} ${shoulder + 6}
          L ${right - 8} 768
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth * 0.55}
        opacity={0.6}
      />
    </svg>
  );
}
