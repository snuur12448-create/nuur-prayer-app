import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { HookLine } from "../HookLine";
import { arabicFontFor, arabicGlow } from "./_arabicShadow";

export interface HadithContentProps {
  arabic?: string;
  translation: string;
  hook?: string | null;
  accent: string;
  scale?: number;
}

export function HadithContent({
  arabic, translation, hook, accent, scale = 1,
}: HadithContentProps) {
  return (
    <View style={styles.wrap}>
      {arabic ? (
        <Text
          style={[
            styles.arabic,
            arabicGlow,
            { fontSize: 28 * scale, lineHeight: 52 * scale, fontFamily: arabicFontFor("non-quran") },
          ]}
          allowFontScaling={false}
        >
          {arabic}
        </Text>
      ) : null}

      <Text
        style={[
          styles.translation,
          {
            fontSize: 16 * scale,
            lineHeight: 25 * scale,
            marginTop: arabic ? 22 * scale : 0,
          },
        ]}
      >
        {translation}
      </Text>

      {hook ? (
        <View style={{ marginTop: 20 * scale }}>
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
    paddingHorizontal: 4,
  },
  translation: {
    fontFamily: "CormorantGaramond_400Regular_Italic",
    fontStyle: "italic",
    color: "rgba(245,238,220,0.82)",
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
