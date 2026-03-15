import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  size?: number;
  gold?: string;
}

export function NuurLogo({ size = 130, gold = "#C9933A" }: Props) {
  const inner = size * 0.5;
  const mid = size * 0.75;
  const rayLength = size * 0.165;
  const rayMarginTop = size * 0.025;

  const GOLD_DIM = gold + "55";
  const GOLD_FAINT = gold + "18";

  return (
    <View style={[styles.logoArea, { width: size, height: size }]}>
      {/* Outer glow ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: GOLD_FAINT,
            borderColor: GOLD_DIM,
          },
        ]}
      />
      {/* Mid glow ring */}
      <View
        style={[
          styles.ring,
          {
            width: mid,
            height: mid,
            borderRadius: mid / 2,
            backgroundColor: gold + "10",
            borderColor: gold + "55",
          },
        ]}
      />

      {/* 8 sunrays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <View
          key={angle}
          style={[
            styles.rayWrap,
            { width: size, height: size, transform: [{ rotate: `${angle}deg` }] },
          ]}
        >
          <View
            style={[
              styles.ray,
              {
                width: 2,
                height: rayLength,
                marginTop: rayMarginTop,
                backgroundColor: gold,
              },
            ]}
          />
        </View>
      ))}

      {/* Inner circle + ن */}
      <View
        style={[
          styles.innerCircle,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            backgroundColor: gold + "22",
            borderColor: gold + "88",
          },
        ]}
      >
        <Text style={[styles.glyph, { fontSize: inner * 0.44, color: gold }]}>ن</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 1,
  },
  rayWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  ray: {
    borderRadius: 1,
    opacity: 0.75,
  },
  innerCircle: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: {
    includeFontPadding: false,
    lineHeight: undefined,
  },
});
