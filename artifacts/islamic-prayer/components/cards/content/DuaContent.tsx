import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { HookLine } from "../HookLine";
import { arabicFontFor, arabicGlow } from "./_arabicShadow";

export interface DuaContentProps {
  arabic: string;
  transliteration?: string;
  translation: string;
  hook?: string | null;
  accent: string;
  scale?: number;
  sourceType?: "quran" | "non-quran";
}

export function DuaContent({
  arabic, transliteration, translation, hook, accent, scale = 1, sourceType = "non-quran",
}: DuaContentProps) {
  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.arabic,
          arabicGlow,
          { fontSize: 32 * scale, lineHeight: 56 * scale, fontFamily: arabicFontFor(sourceType) },
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
          { fontSize: 15 * scale, lineHeight: 23 * scale, marginTop: 14 * scale },
        ]}
      >
        {translation}
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
