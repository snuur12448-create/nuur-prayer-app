import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SERIF, type ThemeColors } from "./constants";

export interface VerseOfDayCardProps {
  colors: ThemeColors;
  ayah: {
    arabic: string;
    translation: string;
    surahName: string;
    surahNumber: number;
    ayahNumber: number;
  };
  isVerseOfNight: boolean;
  ayahCopied: boolean;
  onReadAyah: () => void;
  onCopyAyah: () => void;
  onShareAyah: () => void;
}

function VerseOfDayCardInner({
  colors, ayah, isVerseOfNight, ayahCopied, onReadAyah, onCopyAyah, onShareAyah,
}: VerseOfDayCardProps) {
  const { fontScale } = useWindowDimensions();
  const accessibilityLayout = fontScale >= 1.6;

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14 }}>
      <View style={[styles.verseHeader, accessibilityLayout && styles.verseHeaderAccessibility]}>
        <Text style={[styles.verseEyebrow, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.8}>
          VERSE OF THE MOMENT
        </Text>
        <Text
          style={[styles.verseEyebrowAr, { color: colors.gold, fontFamily: "AmiriQuran_400Regular" }]}
          maxFontSizeMultiplier={1.8}
        >
          آية اللحظة
        </Text>
      </View>
      <View style={[styles.verseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 80,
            backgroundColor: colors.gold + "10",
            opacity: 0.6,
          }}
        />
        <View style={styles.bismillahRow}>
          <View style={[styles.bisLine, { backgroundColor: colors.gold + "40" }]} />
          <Text
            style={[styles.bismillahMark, { color: colors.gold, fontFamily: "AmiriQuran_400Regular" }]}
            maxFontSizeMultiplier={1.8}
          >
            ﷽
          </Text>
          <View style={[styles.bisLine, { backgroundColor: colors.gold + "40" }]} />
        </View>
        <Text
          style={[
            styles.verseArabic,
            { color: colors.text, fontFamily: "AmiriQuran_400Regular" },
          ]}
          maxFontSizeMultiplier={2.2}
        >
          {ayah.arabic}
        </Text>
        <Text
          style={[styles.verseTranslation, { color: colors.text + "DD", fontFamily: SERIF }]}
          maxFontSizeMultiplier={2.2}
        >
          “{ayah.translation}”
        </Text>
        <View style={[styles.verseFooter, accessibilityLayout && styles.verseFooterAccessibility, { borderTopColor: colors.border }]}>
          <Text style={[styles.verseSrc, { color: colors.gold }]} maxFontSizeMultiplier={1.8}>
            SŪRAH {ayah.surahName.toUpperCase()} · {ayah.surahNumber}:{ayah.ayahNumber}
          </Text>
          <View style={[styles.verseActions, accessibilityLayout && styles.verseActionsAccessibility]}>
            <TouchableOpacity
              onPress={onReadAyah}
              activeOpacity={0.8}
              style={[styles.verseBtn, accessibilityLayout && styles.verseBtnAccessibility, { backgroundColor: colors.gold + "1E" }]}
            >
              <Feather name="book-open" size={11} color={colors.gold} />
              <Text style={[styles.verseBtnText, { color: colors.gold }]} maxFontSizeMultiplier={1.8}>Read</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCopyAyah}
              activeOpacity={0.8}
              style={[styles.verseBtn, accessibilityLayout && styles.verseBtnAccessibility, { backgroundColor: colors.gold + "1E" }]}
            >
              <Feather name={ayahCopied ? "check" : "copy"} size={11} color={colors.gold} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onShareAyah}
              activeOpacity={0.8}
              style={[styles.verseBtn, accessibilityLayout && styles.verseBtnAccessibility, { backgroundColor: colors.gold + "1E" }]}
            >
              <Feather name="share-2" size={11} color={colors.gold} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export const VerseOfDayCard = memo(VerseOfDayCardInner);

const styles = StyleSheet.create({
  verseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  verseHeaderAccessibility: { flexDirection: "column", alignItems: "flex-start", gap: 2 },
  verseEyebrow: { fontSize: 10, letterSpacing: 2, fontFamily: "Inter_700Bold" },
  verseEyebrowAr: { fontSize: 12 },
  verseCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 20,
    overflow: "hidden",
  },
  bismillahRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  bisLine: { flex: 1, height: 1 },
  bismillahMark: { fontSize: 18 },
  verseArabic: {
    fontSize: 22,
    lineHeight: 44,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 12,
  },
  verseTranslation: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  verseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  verseFooterAccessibility: { flexDirection: "column", alignItems: "stretch", gap: 12 },
  verseActions: { flexDirection: "row", gap: 6 },
  verseActionsAccessibility: { alignSelf: "stretch" },
  verseSrc: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1, flexShrink: 1, marginRight: 8 },
  verseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  verseBtnAccessibility: { minHeight: 44, justifyContent: "center" },
  verseBtnText: { fontSize: 10, fontFamily: "Inter_700Bold" },
});
