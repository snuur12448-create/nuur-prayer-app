import React, { memo } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from "react-native-svg";
import type { ThemeColors } from "@/constants/themes";
import type { Hadith } from "@/utils/hadithData";

// Scholar's notebook palette — sibling to the Mushaf cream but warmer/older
const PAPER_TOP = "#E8DCC0";
const PAPER_BOT = "#D8C9A4";
const PAPER_DEEP = "#C8B788";
const PAPER_INK = "#2C2418";
const PAPER_INK_DIM = "#6B5A3B";
const PAPER_RULE = "#8B6F3A";

const SEAL_RED = "#9C2A2A";
const SEAL_RED_DEEP = "#6B1818";

// Strip honorifics off the narrator string (data files include "Narrated by …
// (رضي الله عنه)" — we render the label "Narrated by" and the honorific separately).
function splitNarrator(raw: string): { name: string; honorific: string } {
  const honorificMatch = raw.match(/(\(?[\u0600-\u06FF\s]+\)?)\s*$/);
  let name = raw.replace(/^Narrated by\s+/i, "");
  let honorific = "";
  if (honorificMatch) {
    honorific = honorificMatch[0].replace(/[()]/g, "").trim();
    name = name.replace(honorificMatch[0], "").trim();
  }
  return { name, honorific };
}

// Pull a short hadith number out of "Ṣaḥīḥ al-Bukhārī 1 · Ṣaḥīḥ Muslim 1907"
function shortRef(source: string): string {
  const m = source.match(/(\d+)/);
  return m ? `№ ${m[1]}` : "";
}

type Props = {
  colors: ThemeColors;
  hadith: Hadith;
  hadithCopied: boolean;
  onCopy: () => void;
  onShare: () => void;
  onMore: () => void;
};

function HadithScholarsLeafInner({ colors, hadith, hadithCopied, onCopy, onShare, onMore }: Props) {
  const { name: narratorName, honorific } = splitNarrator(hadith.narrator);
  const ref = shortRef(hadith.source);
  const leafEdge = colors.tint + "40";
  const leafShadow = colors.glow;

  return (
    <View style={styles.wrapper}>
      {/* Header — sits in the dark app chrome above the paper */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.gold + "20", borderColor: colors.gold + "55" }]}>
          <Text style={[styles.badgeMark, { color: colors.gold }]} allowFontScaling={false}>☾</Text>
          <Text style={[styles.badgeText, { color: colors.gold }]}>HADITH OF THE DAY</Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={onCopy}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={hadithCopied ? "Hadith copied" : "Copy hadith"}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated, borderColor: hadithCopied ? colors.gold + "60" : colors.border }]}
          >
            <Feather name={hadithCopied ? "check" : "copy"} size={13} color={hadithCopied ? colors.gold : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onShare}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Share hadith"
            style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
          >
            <Feather name="share-2" size={13} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── The Scholar's leaf ─────────────────────────────────────── */}
      <View style={styles.leafStack}>
        {/* Underlayer sheet peeking out — depth without overdraw */}
        <View style={styles.underSheet} pointerEvents="none" />

        <View
          style={[
            styles.leafShadow,
            { shadowColor: leafShadow, borderColor: leafEdge },
          ]}
        >
          <LinearGradient
            colors={[PAPER_TOP, PAPER_BOT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.leafPaper}
          >
            {/* TOP RIBBON — chain sigil + topic + ḥadīth № */}
            <View style={styles.ribbon}>
              <View style={styles.ribbonLeft}>
                <ChainSigil />
                <Text style={styles.ribbonText} numberOfLines={1}>
                  Bāb · {hadith.topic}
                </Text>
              </View>
              {ref ? <Text style={styles.ribbonRef}>ḥadīth {ref}</Text> : null}
            </View>

            {/* Body */}
            <View style={styles.body}>
              {/* Pilcrow ornament introducing the narration */}
              <Text style={styles.pilcrow} allowFontScaling={false}>❖</Text>

              {/* Arabic — Amiri Quran, RTL */}
              <Text style={styles.arabic} allowFontScaling={false}>
                {hadith.arabic}
              </Text>

              {/* Dashed divider — rendered as discrete dashes for cross-platform reliability */}
              <View style={styles.dashedRule}>
                {Array.from({ length: 28 }).map((_, i) => (
                  <View key={i} style={styles.dashSegment} />
                ))}
              </View>

              {/* Translation — italic serif */}
              <Text style={styles.translation}>
                "{hadith.translation}"
              </Text>

              {/* Isnād line — narrator attribution */}
              <View style={styles.isnadRow}>
                <Text style={styles.isnadLabel}>NARRATED BY</Text>
                <View style={styles.isnadNameWrap}>
                  <Text style={styles.isnadName}>
                    {narratorName}
                    {honorific ? "  " : ""}
                    {honorific ? <Text style={styles.isnadHonorific} allowFontScaling={false}>{honorific}</Text> : null}
                  </Text>
                </View>
              </View>
            </View>

            {/* Source — library catalog stamp */}
            <View style={styles.sourceStamp}>
              <Text style={styles.sourceLabel}>﹡ SOURCE</Text>
              <Text style={styles.sourceText} numberOfLines={2}>
                {hadith.source}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Wax seal — sits over the upper-right corner of the leaf */}
        <View style={styles.sealWrap} pointerEvents="none">
          <WaxSeal label={hadith.grade} />
        </View>
      </View>

      {/* CTA — pairs with the Quran "Read full Sūrah" button */}
      <TouchableOpacity
        style={[styles.moreBtn, { borderColor: colors.gold + "40", backgroundColor: colors.gold + "12" }]}
        onPress={onMore}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`More hadiths on ${hadith.topic}`}
      >
        <Feather name="user" size={12} color={colors.gold} />
        <Text
          style={[styles.moreText, { color: colors.gold }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          More on {hadith.topic}
        </Text>
        <Feather name="arrow-right" size={12} color={colors.gold} />
      </TouchableOpacity>
    </View>
  );
}

// ── decorative ────────────────────────────────────────────────────

function ChainSigil() {
  return (
    <Svg width={18} height={12} viewBox="0 0 18 12">
      <Circle cx={4} cy={6} r={2.4} stroke={PAPER_RULE} strokeWidth={0.9} fill="none" />
      <Circle cx={14} cy={6} r={2.4} stroke={PAPER_RULE} strokeWidth={0.9} fill="none" />
      <Line x1={6} y1={6} x2={12} y2={6} stroke={PAPER_RULE} strokeWidth={0.9} />
      <Circle cx={4} cy={6} r={0.7} fill={PAPER_RULE} />
      <Circle cx={14} cy={6} r={0.7} fill={PAPER_RULE} />
    </Svg>
  );
}

function WaxSeal({ label }: { label: string }) {
  return (
    <View style={styles.sealOuter}>
      <Svg width={56} height={56} viewBox="0 0 56 56" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="seal" cx="35%" cy="32%" rx="70%" ry="70%">
            <Stop offset="0%" stopColor={SEAL_RED} stopOpacity={1} />
            <Stop offset="100%" stopColor={SEAL_RED_DEEP} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Circle cx={28} cy={28} r={27} fill="url(#seal)" stroke={SEAL_RED_DEEP} strokeWidth={1} />
        <Circle cx={28} cy={28} r={22} stroke="rgba(255, 220, 180, 0.35)" strokeWidth={0.8} fill="none" />
      </Svg>
      <Text style={styles.sealText} allowFontScaling={false}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeMark: {
    fontSize: 11,
    lineHeight: 12,
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
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // ── leaf stack ───────────────────────────────────────────
  leafStack: {
    position: "relative",
    transform: [{ rotate: "-0.4deg" }],
  },
  underSheet: {
    position: "absolute",
    top: 5,
    left: 4,
    right: -4,
    bottom: -5,
    backgroundColor: PAPER_DEEP,
    borderRadius: 4,
    transform: [{ rotate: "0.8deg" }],
    opacity: 0.55,
  },
  leafShadow: {
    borderRadius: 5,
    borderWidth: 1,
    shadowOpacity: Platform.OS === "ios" ? 0.22 : 0,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: Platform.OS === "android" ? 4 : 0,
  },
  leafPaper: {
    borderRadius: 4,
    paddingBottom: 12,
    overflow: "hidden",
  },
  // ── ribbon ──────────────────────────────────────────────
  ribbon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PAPER_RULE,
    backgroundColor: "rgba(139, 111, 58, 0.08)",
  },
  ribbonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    paddingRight: 60, // keep clear of the wax seal
  },
  ribbonText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
    color: PAPER_INK_DIM,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  ribbonRef: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
    letterSpacing: 0.8,
    color: PAPER_INK_DIM,
  },
  // ── body ────────────────────────────────────────────────
  body: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  pilcrow: {
    fontFamily: "AmiriQuran_400Regular",
    fontSize: 18,
    color: PAPER_RULE,
    opacity: 0.7,
    marginBottom: 4,
  },
  arabic: {
    fontFamily: "AmiriQuran_400Regular",
    fontSize: 22,
    lineHeight: 42,
    color: PAPER_INK,
    textAlign: "right",
    writingDirection: "rtl",
    includeFontPadding: false,
    paddingTop: 2,
  },
  dashedRule: {
    marginTop: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 1,
  },
  dashSegment: {
    flex: 1,
    height: 1,
    marginHorizontal: 1,
    backgroundColor: "rgba(139, 111, 58, 0.5)",
  },
  translation: {
    fontFamily: "Inter_400Regular",
    fontSize: 13.5,
    lineHeight: 20,
    color: PAPER_INK,
    fontStyle: "italic",
    opacity: 0.92,
  },
  // ── isnād ───────────────────────────────────────────────
  isnadRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    paddingTop: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(139, 111, 58, 0.45)",
  },
  isnadLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.3,
    color: PAPER_INK_DIM,
    marginTop: 2,
  },
  isnadNameWrap: {
    flex: 1,
  },
  isnadName: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: PAPER_INK,
    lineHeight: 18,
  },
  isnadHonorific: {
    fontFamily: "AmiriQuran_400Regular",
    fontSize: 13,
    color: PAPER_INK_DIM,
  },
  // ── source stamp ────────────────────────────────────────
  sourceStamp: {
    marginTop: 10,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(139, 111, 58, 0.5)",
    borderRadius: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sourceLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
    color: PAPER_INK_DIM,
  },
  sourceText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: PAPER_INK,
    textAlign: "right",
    letterSpacing: 0.3,
  },
  // ── wax seal ────────────────────────────────────────────
  sealWrap: {
    position: "absolute",
    top: -12,
    right: 12,
    transform: [{ rotate: "8deg" }],
  },
  sealOuter: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  sealText: {
    fontFamily: "AmiriQuran_400Regular",
    fontSize: 14,
    color: "#F4E4C5",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  // ── CTA ─────────────────────────────────────────────────
  moreBtn: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  moreText: {
    flexShrink: 1,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

export const HadithScholarsLeaf = memo(HadithScholarsLeafInner, (prev, next) => {
  return (
    prev.hadith === next.hadith &&
    prev.colors === next.colors &&
    prev.hadithCopied === next.hadithCopied &&
    prev.onCopy === next.onCopy &&
    prev.onShare === next.onShare &&
    prev.onMore === next.onMore
  );
});
