import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { CompassMark } from "./CompassMark";

export interface BrandLockupProps {
  accent: string;
  scale?: number;
}

export function BrandLockup({ accent, scale = 1 }: BrandLockupProps) {
  return (
    <View style={[styles.wrap, { paddingTop: 20 * scale }]}>
      <CompassMark color={accent} size={30 * scale} />
      <Text
        style={[
          styles.wordmark,
          { color: accent, fontSize: 11 * scale, letterSpacing: 6 * scale, marginTop: 4 * scale },
        ]}
      >
        NUUR
      </Text>
      <Text
        style={[
          styles.tagline,
          { fontSize: 10 * scale, letterSpacing: 0.3 * scale, marginTop: 4 * scale },
        ]}
      >
        Light for your daily deen
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontFamily: "Fraunces_500Medium",
  },
  tagline: {
    fontFamily: "CormorantGaramond_400Regular_Italic",
    fontStyle: "italic",
    color: "rgba(245,238,220,0.5)",
  },
});
