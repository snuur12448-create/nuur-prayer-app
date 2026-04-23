import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface MastheadProps {
  category: string;
  refNumber?: string;
  accent: string;
  scale?: number;
}

export function Masthead({ category, refNumber, accent, scale = 1 }: MastheadProps) {
  return (
    <View style={[styles.row, { paddingBottom: 16 * scale }]}>
      <View style={styles.left}>
        <Text style={[styles.brand, { fontSize: 11 * scale, letterSpacing: 4 * scale }]}>NUUR</Text>
        <Text style={[styles.dot, { fontSize: 10 * scale }]}>·</Text>
        <Text
          style={[
            styles.category,
            { color: accent, fontSize: 9.5 * scale, letterSpacing: 1.8 * scale },
          ]}
        >
          {category.toUpperCase()}
        </Text>
      </View>
      {refNumber ? (
        <Text style={[styles.ref, { fontSize: 10 * scale, letterSpacing: 0.5 * scale }]}>
          {refNumber}
        </Text>
      ) : null}
      <View style={[styles.border, { height: StyleSheet.hairlineWidth }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    position: "relative",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brand: {
    fontFamily: "Fraunces_500Medium",
    color: "rgba(245,238,220,0.92)",
  },
  dot: {
    color: "rgba(245,238,220,0.5)",
  },
  category: {
    fontFamily: "JetBrainsMono_500Medium",
  },
  ref: {
    fontFamily: "JetBrainsMono_400Regular",
    color: "rgba(245,238,220,0.5)",
  },
  border: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(245,238,220,0.14)",
  },
});
