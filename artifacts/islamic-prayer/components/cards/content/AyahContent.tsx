import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { HookLine } from "../HookLine";
import { arabicFontFor, arabicGlow } from "./_arabicShadow";

export interface AyahContentProps {
  arabic: string;
  transliteration?: string;
  translation: string;
  hook?: string | null;
  accent: string;
  scale?: number;
}

export function AyahContent({
  arabic, transliteration, translation, hook, accent, scale = 1,
}: AyahContentProps) {
  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.arabic,
          arabicGlow,
          { fontSize: 36 * scale, lineHeight: 64 * scale, fontFamily: arabicFontFor("quran") },
        ]}
        allowFontScaling={false}
      >
        {arabic}
      </Text>

      {transliteration ? (
        <Text
          style={[
            styles.transliteration,
            { fontSize: 14 * scale, lineHeight: 22 * scale, marginTop: 16 * scale },
          ]}
        >
          {transliteration}
        </Text>
      ) : null}

      <Text
        style={[
          styles.translation,
          { fontSize: 16 * scale, lineHeight: 24 * scale, marginTop: 14 * scale },
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
  transliteration: {
    fontFamily: "CormorantGaramond_400Regular_Italic",
    fontStyle: "italic",
    color: "rgba(245,238,220,0.65)",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  translation: {
    fontFamily: "CormorantGaramond_400Regular_Italic",
    fontStyle: "italic",
    color: "rgba(245,238,220,0.82)",
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
