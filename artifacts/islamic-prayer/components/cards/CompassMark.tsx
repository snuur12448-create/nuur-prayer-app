import React from "react";
import Svg, { Circle, G, Line, Rect } from "react-native-svg";

export interface CompassMarkProps {
  color?: string;
  size?: number;
}

export function CompassMark({ color = "#E8C88A", size = 30 }: CompassMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect
        x="3" y="3" width="58" height="58" rx="11"
        fill="none" stroke={color} strokeWidth="1.3" opacity={0.8}
      />
      <G stroke={color} strokeWidth="1.2" strokeLinecap="round">
        <Line x1="32" y1="13" x2="32" y2="20" />
        <Line x1="32" y1="44" x2="32" y2="51" />
        <Line x1="13" y1="32" x2="20" y2="32" />
        <Line x1="44" y1="32" x2="51" y2="32" />
        <Line x1="18" y1="18" x2="22.5" y2="22.5" />
        <Line x1="41.5" y1="22.5" x2="46" y2="18" />
        <Line x1="18" y1="46" x2="22.5" y2="41.5" />
        <Line x1="41.5" y1="41.5" x2="46" y2="46" />
      </G>
      <Circle cx="32" cy="32" r="4" fill={color} />
    </Svg>
  );
}
