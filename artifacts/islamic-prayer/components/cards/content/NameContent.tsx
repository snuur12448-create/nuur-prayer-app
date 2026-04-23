import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { HookLine } from "../HookLine";
import { arabicFontFor, arabicGlow } from "./_arabicShadow";

export interface NameContentProps {
  arabic: string;
  pronunciation: string;
  meaning: string;
  hook?: string | null;
  accent: string;
  scale?: number;
}

export function NameContent({
  arabic, pronunciation, meaning, hook, accent, scale = 1,
}: NameContentProps) {
  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.arabic,
          arabicGlow,
          { fontSize: 60 * scale, lineHeight: 84 * scale, fontFamily: arabicFontFor("non-quran") },
        ]}
        allowFontScaling={false}
      >
        {arabic}
      </Text>

      <Text
        style={[
          styles.pronunciation,
          { color: accent, fontSize: 13 * scale, letterSpacing: 3 * scale, marginTop: 18 * scale },
        ]}
      >
        {pronunciation.toUpperCase()}
      </Text>

      <Text style={[styles.translation, { fontSize: 16 * scale, lineHeight: 24 * scale, marginTop: 14 * scale }]}>
        {meaning}
      </Text>

      {hook ? (
        <View style={{ marginTop: 18 * scale }}>
          <HookLine hook={hook} accent={accent} scale={scale} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", width: "100%" },
  arabic: {
    color: "rgba(245,238,220,0.96)",
    textAlign: "center",
    writingDirection: "rtl",
  },
  pronunciation: {
    fontFamily: "Fraunces_500Medium",
    textAlign: "center",
  },
  translation: {
    fontFamily: "CormorantGaramond_400Regular_Italic",
    fontStyle: "italic",
    color: "rgba(245,238,220,0.82)",
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
