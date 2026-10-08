import React, { memo, useMemo } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import type { ThemeColors } from "@/constants/themes";
import type { DailyAyah } from "@/utils/ayahData";

const SURAH_ARABIC: Record<number, string> = {
  1: "الفاتحة",   2: "البقرة",    3: "آل عمران",  17: "الإسراء",
  18: "الكهف",    36: "يس",       55: "الرحمن",  56: "الواقعة",
  67: "الملك",    93: "الضحى",    94: "الشرح",   97: "القدر",
  103: "العصر",   108: "الكوثر",  112: "الإخلاص", 113: "الفلق", 114: "الناس",
};

function toArabicNumeral(n: number): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).split("").map((d) => map[+d] ?? d).join("");
}

type Props = {
  colors: ThemeColors;
  ayah: DailyAyah;
  ayahCopied: boolean;
  onCopy: () => void;
  onShare: () => void;
  onReadSurah: () => void;
};

function MushafLeafVerseInner({ colors, ayah, ayahCopied, onCopy, onShare, onReadSurah }: Props) {
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.4;
  const surahArabic = SURAH_ARABIC[ayah.surahNumber] ?? ayah.surahName;
  // Theme-tinted outer hairline so the cream leaf reads cleanly against
  // every accent — especially Gold (warm-on-warm) and Burgundy (warm-on-pink).
  const leafEdge = colors.tint + "40";
  const leafShadow = colors.glow;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.wrapper}>
      {/* Header — sits in the dark app chrome above the paper */}
      <View style={[styles.header, largeText && { flexWrap: "wrap", gap: 8 }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.badge, { backgroundColor: colors.gold + "20", borderColor: colors.gold + "55" }]}>
            <Feather name="book-open" size={9} color={colors.gold} />
            <Text style={[styles.badgeText, { color: colors.gold }]}>VERSE OF THE DAY</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={onCopy}
            accessibilityRole="button"
            accessibilityLabel={ayahCopied ? "Verse copied" : "Copy verse"}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated, borderColor: ayahCopied ? colors.tint + "60" : colors.border }]}
          >
            <Feather name={ayahCopied ? "check" : "copy"} size={13} color={ayahCopied ? colors.tint : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onShare}
            accessibilityRole="button"
            accessibilityLabel="Share verse"
            style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
          >
            <Feather name="share-2" size={13} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── The Mushaf leaf ─────────────────────────────────────── */}
      <View
        style={[
          styles.leafShadow,
          {
            shadowColor: leafShadow,
            borderColor: leafEdge,
          },
        ]}
      >
        <LinearGradient
          colors={[colors.paperTop, colors.paperBot]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.leafPaper}
        >
          {/* Inset hairline frame */}
          <View style={styles.leafFrame}>
            {/* Surah header band */}
            <View style={[styles.surahBand, largeText && { flexDirection: "column" }]}>
              <Text style={styles.surahSide}>SŪRAH {ayah.surahNumber}</Text>
              <View style={styles.bandOrn}>
                <View style={styles.bandLine} />
                <View style={styles.bandDot} />
                <View style={styles.bandLine} />
              </View>
              <Text style={styles.surahArabic} accessibilityLanguage="ar">
                سُورَةُ {surahArabic}
              </Text>
              <View style={styles.bandOrn}>
                <View style={styles.bandLine} />
                <View style={styles.bandDot} />
                <View style={styles.bandLine} />
              </View>
              <Text style={styles.surahSide}>AYAH {ayah.ayahNumber}</Text>
            </View>

            {/* Bismillah — only show when not Surah 1:1 (which IS the bismillah) */}
            {!(ayah.surahNumber === 1 && ayah.ayahNumber === 1) && (
              <Text style={styles.bismillah} accessibilityLanguage="ar">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </Text>
            )}

            {/* The verse with the ornate ﴿n﴾ stamp */}
            <Text style={styles.verse} accessibilityLanguage="ar">
              {ayah.arabic}
              {"\u00A0"}
              <Text style={styles.verseStamp}>
                ﴿{toArabicNumeral(ayah.ayahNumber)}﴾
              </Text>
            </Text>

            {/* Corner ornaments */}
            <CornerOrn pos="tl" stroke={colors.paperRule} />
            <CornerOrn pos="tr" stroke={colors.paperRule} />
            <CornerOrn pos="bl" stroke={colors.paperRule} />
            <CornerOrn pos="br" stroke={colors.paperRule} />
          </View>
        </LinearGradient>
      </View>

      {/* Translation + transliteration — back in app voice, below the leaf */}
      <Text style={[styles.translit, { color: colors.gold }]}>{ayah.transliteration}</Text>
      <Text style={[styles.translation, { color: colors.textSecondary }]}>
        “{ayah.translation}”
      </Text>

      <TouchableOpacity
        style={[styles.readBtn, { borderColor: colors.tint + "40", backgroundColor: colors.tint + "12" }]}
        onPress={onReadSurah}
        accessibilityRole="button"
        accessibilityLabel={`Read full surah ${ayah.surahName}`}
        activeOpacity={0.75}
      >
        <Feather name="book-open" size={12} color={colors.tint} />
        <Text style={[styles.readText, { color: colors.tint }]}>Read full Sūrah</Text>
        <Feather name="arrow-right" size={12} color={colors.tint} />
      </TouchableOpacity>
    </View>
  );
}

function CornerOrn({ pos, stroke }: { pos: "tl" | "tr" | "bl" | "br"; stroke: string }) {
  const rotation = pos === "tl" ? 0 : pos === "tr" ? 90 : pos === "br" ? 180 : 270;
  const positionStyle = {
    top: pos.startsWith("t") ? 4 : undefined,
    bottom: pos.startsWith("b") ? 4 : undefined,
    left: pos.endsWith("l") ? 4 : undefined,
    right: pos.endsWith("r") ? 4 : undefined,
  };
  return (
    <View style={[ornStyles.cornerOrn, positionStyle, { transform: [{ rotate: `${rotation}deg` }] }]} pointerEvents="none">
      <Svg width={14} height={14} viewBox="0 0 14 14">
        <Path
          d="M1 1 L1 6 M1 1 L6 1 M1 1 Q4 1 4 4 Q4 4 1 4"
          stroke={stroke}
          strokeWidth={0.8}
          fill="none"
          opacity={0.55}
        />
      </Svg>
    </View>
  );
}

const ornStyles = StyleSheet.create({
  cornerOrn: {
    position: "absolute",
    width: 14,
    height: 14,
  },
});

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: 0,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 4,
      marginBottom: 12,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
    },
    badgeText: {
      fontSize: 9,
      fontFamily: "Inter_700Bold",
      letterSpacing: 1.2,
    },
    actionRow: {
      flexDirection: "row",
      gap: 6,
    },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    // ── leaf ────────────────────────────────────────────────
    leafShadow: {
      borderRadius: 6,
      borderWidth: 1,
      // Theme-tinted halo so the cream paper feels integrated, not pasted-on
      shadowOpacity: Platform.OS === "ios" ? 0.18 : 0,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: Platform.OS === "android" ? 4 : 0,
    },
    leafPaper: {
      borderRadius: 5,
      padding: 8,
    },
    leafFrame: {
      borderWidth: 1,
      borderColor: c.paperRule,
      borderRadius: 3,
      paddingHorizontal: 14,
      paddingBottom: 16,
      position: "relative",
    },
    surahBand: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: -14,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: c.paperRule + "66",
      backgroundColor: c.paperBand,
      marginTop: 8,
      marginBottom: 14,
      gap: 8,
    },
    surahSide: {
      fontSize: 9,
      fontFamily: "Inter_700Bold",
      letterSpacing: 1.2,
      color: c.paperInkDim,
    },
    surahArabic: {
      fontSize: 18,
      fontFamily: "AmiriQuran_400Regular",
      color: c.paperInk,
      includeFontPadding: false,
      lineHeight: 22,
    },
    bandOrn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 12,
    },
    bandLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.paperRule,
      opacity: 0.55,
    },
    bandDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.paperRule,
      marginHorizontal: 4,
      opacity: 0.7,
    },
    bismillah: {
      textAlign: "center",
      fontFamily: "AmiriQuran_400Regular",
      fontSize: 18,
      color: c.paperInk,
      opacity: 0.85,
      marginBottom: 12,
      includeFontPadding: false,
      lineHeight: 28,
    },
    verse: {
      fontFamily: "AmiriQuran_400Regular",
      fontSize: 24,
      lineHeight: 44,
      color: c.paperInk,
      textAlign: "center",
      writingDirection: "rtl",
      includeFontPadding: false,
      paddingTop: 4,
      paddingBottom: 6,
    },
    verseStamp: {
      fontFamily: "AmiriQuran_400Regular",
      fontSize: 22,
      color: c.paperRule,
      includeFontPadding: false,
    },
    // ── below the leaf ───────────────────────────────────────
    translit: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 14,
    },
    translation: {
      fontSize: 13,
      lineHeight: 19,
      fontFamily: "Inter_400Regular",
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 6,
      paddingHorizontal: 4,
    },
    readBtn: {
      minHeight: 44,
      marginTop: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
    },
    readText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
  });

// Memoized — the verse only changes once per day, so we want to skip
// re-rendering the entire leaf on every minute-tick of the parent screen.
export const MushafLeafVerse = memo(MushafLeafVerseInner, (prev, next) => {
  return (
    prev.ayah === next.ayah &&
    prev.colors === next.colors &&
    prev.ayahCopied === next.ayahCopied &&
    prev.onCopy === next.onCopy &&
    prev.onShare === next.onShare &&
    prev.onReadSurah === next.onReadSurah
  );
});
