import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface InfoCell {
  label: string;
  value: string;
}

export interface InfoStripProps {
  cells: InfoCell[];
  /** Horizontal padding of the parent card so the strip can edge-to-edge. */
  cardPadding: number;
  scale?: number;
}

export function InfoStrip({ cells, cardPadding, scale = 1 }: InfoStripProps) {
  return (
    <View
      style={[
        styles.strip,
        {
          marginHorizontal: -cardPadding,
          paddingHorizontal: cardPadding,
          paddingVertical: 16 * scale,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      {cells.map((c, i) => (
        <View key={`${c.label}-${i}`} style={styles.cell}>
          <Text
            style={[
              styles.label,
              { fontSize: 8.5 * scale, letterSpacing: 1.5 * scale },
            ]}
            numberOfLines={1}
          >
            {c.label.toUpperCase()}
          </Text>
          <Text
            style={[styles.value, { fontSize: 10 * scale, marginTop: 4 * scale }]}
            numberOfLines={2}
          >
            {c.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderColor: "rgba(245,238,220,0.16)",
    width: "auto",
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: "JetBrainsMono_400Regular",
    color: "rgba(245,238,220,0.45)",
    textAlign: "center",
  },
  value: {
    fontFamily: "JetBrainsMono_500Medium",
    color: "rgba(245,238,220,0.95)",
    textAlign: "center",
  },
});
