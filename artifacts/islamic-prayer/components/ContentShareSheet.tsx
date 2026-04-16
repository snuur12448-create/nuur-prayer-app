import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Path,
  Pattern as SvgPattern,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

const { width: SCREEN_W } = Dimensions.get("window");

const CARD_SIZE    = Math.min(SCREEN_W - 32, 370);
const WALLPAPER_W  = Math.min(SCREEN_W - 8, 420);
const WALLPAPER_H  = Math.round(WALLPAPER_W * (19.5 / 9));

const GOLD       = "#C9933A";
const GOLD_LIGHT = "#DFB96A";
const CREAM      = "#F5ECD7";
const CREAM_DIM  = "rgba(245,236,215,0.70)";

type Theme    = "hadith" | "dua" | "name";
type SizeMode = "card" | "wallpaper";

const THEME: Record<Theme, { center: string; mid: string; edge: string }> = {
  hadith: { center: "#0F1A35", mid: "#0C1428", edge: "#0A0F1E" },
  dua:    { center: "#0F2830", mid: "#0C2028", edge: "#0A1A1E" },
  name:   { center: "#1A1035", mid: "#130D2A", edge: "#0F0A1E" },
};

function CardBackground({ size, height, theme }: { size: number; height: number; theme: Theme }) {
  const t = THEME[theme];
  return (
    <Svg width={size} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id={`cbg-${theme}`} cx="50%" cy="48%" r="62%" fx="50%" fy="48%">
          <Stop offset="0%"   stopColor={t.center} stopOpacity="1" />
          <Stop offset="50%"  stopColor={t.mid}    stopOpacity="1" />
          <Stop offset="100%" stopColor={t.edge}   stopOpacity="1" />
        </RadialGradient>
      </Defs>
      <Rect width={size} height={height} fill={`url(#cbg-${theme})`} />
    </Svg>
  );
}

function GeometricPattern({ size, height }: { size: number; height: number }) {
  const T = 56;
  const cx = T / 2, cy = T / 2, r = T * 0.4;
  const pts8 = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 - Math.PI / 8;
    const inner = r * 0.46;
    const isOuter = i % 2 === 0;
    return `${(cx + (isOuter ? r : inner) * Math.cos(a)).toFixed(1)},${(cy + (isOuter ? r : inner) * Math.sin(a)).toFixed(1)}`;
  });
  const star = pts8.join(" ");
  return (
    <Svg width={size} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <SvgPattern id="cgeo" x="0" y="0" width={T} height={T} patternUnits="userSpaceOnUse">
          <Polygon points={star} fill="none" stroke={GOLD} strokeWidth="0.7" opacity="0.13" />
          <Polygon
            points={`${cx},${cy - r * 0.55} ${cx + r * 0.55},${cy} ${cx},${cy + r * 0.55} ${cx - r * 0.55},${cy}`}
            fill="none" stroke={GOLD} strokeWidth="0.45" opacity="0.09"
          />
          <Circle cx={0}  cy={0}  r={T * 0.12} fill="none" stroke={GOLD} strokeWidth="0.4" opacity="0.07" />
          <Circle cx={T}  cy={0}  r={T * 0.12} fill="none" stroke={GOLD} strokeWidth="0.4" opacity="0.07" />
          <Circle cx={0}  cy={T}  r={T * 0.12} fill="none" stroke={GOLD} strokeWidth="0.4" opacity="0.07" />
          <Circle cx={T}  cy={T}  r={T * 0.12} fill="none" stroke={GOLD} strokeWidth="0.4" opacity="0.07" />
        </SvgPattern>
      </Defs>
      <Rect width={size} height={height} fill="url(#cgeo)" />
    </Svg>
  );
}

function OrnamentalDivider({ width: w }: { width: number }) {
  const cx = w / 2, lineY = 10, gap = 14;
  return (
    <Svg width={w} height={20}>
      <Line x1={cx - 90} y1={lineY} x2={cx - gap} y2={lineY} stroke={GOLD} strokeWidth="0.9" opacity="0.65" />
      <Line x1={cx + gap} y1={lineY} x2={cx + 90} y2={lineY} stroke={GOLD} strokeWidth="0.9" opacity="0.65" />
      <Polygon points={`${cx},${lineY - 7} ${cx + 7},${lineY} ${cx},${lineY + 7} ${cx - 7},${lineY}`} fill={GOLD} opacity="0.9" />
      <Circle cx={cx - 96} cy={lineY} r={2} fill={GOLD} opacity="0.45" />
      <Circle cx={cx + 96} cy={lineY} r={2} fill={GOLD} opacity="0.45" />
    </Svg>
  );
}

function CornerOrnament({ size = 34 }: { size?: number }) {
  const s = size;
  return (
    <Svg width={s} height={s}>
      <Path d={`M2,${s * 0.5} L2,2 L${s * 0.5},2`} fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      <Path d={`M2,2 L${s * 0.38},${s * 0.38}`} stroke={GOLD} strokeWidth="0.7" strokeLinecap="round" opacity="0.5" />
      <Polygon points={`${s * 0.22},${s * 0.22} ${s * 0.3},${s * 0.3} ${s * 0.22},${s * 0.38} ${s * 0.14},${s * 0.3}`} fill={GOLD} opacity="0.85" />
      <Circle cx={2} cy={2} r={2.5} fill={GOLD} opacity="0.7" />
    </Svg>
  );
}

function NuurLogo({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      <Circle cx={14} cy={14} r={13} fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.45" />
      <G transform="translate(14,14)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          return <Line key={i} x1={0} y1={0} x2={(8.5 * Math.cos(a)).toFixed(2)} y2={(8.5 * Math.sin(a)).toFixed(2)} stroke={GOLD} strokeWidth="0.5" opacity="0.3" />;
        })}
      </G>
    </Svg>
  );
}

export interface ContentShareSheetProps {
  visible: boolean;
  onClose: () => void;
  theme: Theme;
  sheetTitle: string;
  shareTitle: string;
  label: string;
  secondaryTitle?: string;
  arabicText?: string;
  arabicFontSize?: number;
  bodyItalic?: string;
  bodyText: string;
  source?: string;
}

export default function ContentShareSheet({
  visible,
  onClose,
  theme,
  sheetTitle,
  shareTitle,
  label,
  secondaryTitle,
  arabicText,
  arabicFontSize,
  bodyItalic,
  bodyText,
  source,
}: ContentShareSheetProps) {
  const cardRef   = useRef<View>(null);
  const [saving,   setSaving]   = useState(false);
  const [sharing,  setSharing]  = useState(false);
  const [cardH,    setCardH]    = useState(CARD_SIZE);
  const [sizeMode, setSizeMode] = useState<SizeMode>("card");

  const isWallpaper = sizeMode === "wallpaper";
  const cardW       = isWallpaper ? WALLPAPER_W : CARD_SIZE;
  const currentH    = isWallpaper ? WALLPAPER_H : cardH;
  const FS          = isWallpaper ? 1.28 : 1;
  const cornSize    = isWallpaper ? 46 : 34;
  const hPad        = isWallpaper ? 36 : 22;
  const divW        = cardW - hPad * 2 - 12;

  const captureCard = async (): Promise<string | null> => {
    if (Platform.OS === "web") {
      Alert.alert("Not supported", "Image export is not available in the browser.");
      return null;
    }
    try {
      return await captureRef(cardRef, { format: "png", quality: 1 });
    } catch {
      Alert.alert("Error", "Could not capture the card.");
      return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const uri = await captureCard();
      if (!uri) return;
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow photo library access to save the image.");
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved! ✨", `The ${isWallpaper ? "wallpaper" : "card"} has been saved to your camera roll.`);
    } catch {
      Alert.alert("Error", "Could not save the image.");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const uri = await captureCard();
      if (!uri) return;
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("Not available", "Sharing is not supported on this device.");
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: shareTitle });
    } catch {
      Alert.alert("Error", "Could not open the share sheet.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <Pressable onPress={onClose} hitSlop={16} style={styles.handleArea}>
            <View style={styles.handle} />
          </Pressable>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{sheetTitle}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Feather name="x" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          {/* ── Size toggle ── */}
          <View style={styles.sizeToggle}>
            {(["card", "wallpaper"] as SizeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.sizePill, sizeMode === mode && styles.sizePillActive]}
                onPress={() => setSizeMode(mode)}
                activeOpacity={0.78}
              >
                <Feather
                  name={mode === "card" ? "image" : "smartphone"}
                  size={13}
                  color={sizeMode === mode ? "#0D2018" : "#888"}
                />
                <Text style={[styles.sizePillText, sizeMode === mode && styles.sizePillTextActive]}>
                  {mode === "card" ? "Card" : "Wallpaper"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.cardOuter}>
              <View
                ref={cardRef}
                style={{
                  width: cardW,
                  height: isWallpaper ? WALLPAPER_H : undefined,
                  borderRadius: isWallpaper ? 28 : 20,
                  overflow: "hidden",
                }}
                collapsable={false}
                onLayout={(e) => setCardH(e.nativeEvent.layout.height)}
              >
                <CardBackground size={cardW} height={currentH} theme={theme} />
                <GeometricPattern size={cardW} height={currentH} />

                <Svg width={cardW} height={currentH} style={StyleSheet.absoluteFill}>
                  <Rect
                    x={10} y={10}
                    width={cardW - 20} height={currentH - 20}
                    rx={14} fill="none"
                    stroke={GOLD} strokeWidth="0.7" opacity="0.35"
                  />
                </Svg>

                <View style={[s.corner, s.cTL]}><CornerOrnament size={cornSize} /></View>
                <View style={[s.corner, s.cTR, { transform: [{ scaleX: -1 }] }]}><CornerOrnament size={cornSize} /></View>
                <View style={[s.corner, s.cBL, { transform: [{ scaleY: -1 }] }]}><CornerOrnament size={cornSize} /></View>
                <View style={[s.corner, s.cBR, { transform: [{ scale: -1 }] }]}><CornerOrnament size={cornSize} /></View>

                {/* ── Card content ── */}
                <View style={[
                  s.cardInner,
                  { paddingHorizontal: hPad },
                  isWallpaper && s.cardInnerWP,
                ]}>
                  {/* Bismillah — wallpaper only */}
                  {isWallpaper && (
                    <Text style={s.bismillah}>بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
                  )}

                  {/* Top flex spacer — wallpaper only */}
                  {isWallpaper && <View style={{ flex: 1 }} />}

                  {/* ── Main content ── */}
                  <View style={{ alignItems: "center", width: "100%" }}>
                    <View style={s.refRow}>
                      <View style={s.refDot} />
                      <Text style={[s.refText, { fontSize: 9.5 * FS }]}>{label}</Text>
                      <View style={s.refDot} />
                    </View>

                    {secondaryTitle ? (
                      <Text style={[s.secondaryTitle, { fontSize: 15 * FS, lineHeight: 22 * FS }]}>
                        {secondaryTitle}
                      </Text>
                    ) : null}

                    {arabicText ? (
                      <View style={s.arabicWrap}>
                        <Text style={[
                          s.arabicTxt,
                          { fontSize: (arabicFontSize ?? 21) * FS, lineHeight: (arabicFontSize ?? 21) * FS * 1.75 },
                        ]}>
                          {arabicText}
                        </Text>
                      </View>
                    ) : null}

                    <View style={{ alignItems: "center", marginVertical: 8 }}>
                      <OrnamentalDivider width={divW} />
                    </View>

                    {bodyItalic ? (
                      <Text style={[s.italicTxt, { fontSize: 12 * FS, lineHeight: 19 * FS }]}>
                        {bodyItalic}
                      </Text>
                    ) : null}

                    <Text style={[s.bodyTxt, { fontSize: 11.5 * FS, lineHeight: 18.5 * FS }]}>
                      {bodyText}
                    </Text>

                    {source ? (
                      <Text style={[s.sourceTxt, { fontSize: 9 * FS }]}>{source}</Text>
                    ) : null}
                  </View>

                  {/* Bottom flex spacer — wallpaper only */}
                  {isWallpaper && <View style={{ flex: 1 }} />}

                  {/* ── Brand ── */}
                  <View style={{ width: "100%" }}>
                    <Svg
                      width={divW} height={1}
                      style={{ marginTop: 14, marginBottom: 8, alignSelf: "center" }}
                    >
                      <Line x1={0} y1={0.5} x2={divW} y2={0.5} stroke={GOLD} strokeWidth="0.5" opacity="0.3" />
                    </Svg>
                    <View style={s.brand}>
                      <NuurLogo size={isWallpaper ? 34 : 28} />
                      <Text style={[s.brandNun, isWallpaper && { fontSize: 22 }]}>ن</Text>
                      <Text style={s.brandName}>N U U R</Text>
                      <Text style={s.brandTag}>Light for your daily deen</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving || sharing}
                activeOpacity={0.78}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={GOLD} />
                ) : (
                  <Feather name="download" size={16} color={GOLD} />
                )}
                <Text style={styles.saveTxt}>{saving ? "Saving…" : "Save to Camera Roll"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShare}
                disabled={saving || sharing}
                activeOpacity={0.82}
              >
                {sharing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="share" size={16} color="#fff" />
                )}
                <Text style={styles.shareTxt}>{sharing ? "Opening…" : "Share"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  corner:   { position: "absolute" },
  cTL:      { top: 12, left: 12 },
  cTR:      { top: 12, right: 12 },
  cBL:      { bottom: 12, left: 12 },
  cBR:      { bottom: 12, right: 12 },
  cardInner: {
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: "center",
  },
  cardInnerWP: {
    flex: 1,
    paddingTop: 52,
    paddingBottom: 44,
  },
  bismillah: {
    color: GOLD,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: 0.5,
    opacity: 0.75,
    marginBottom: 4,
  },
  refRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD,
    opacity: 0.6,
  },
  refText: {
    color: GOLD,
    fontSize: 9.5,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    textAlign: "center",
  },
  secondaryTitle: {
    color: CREAM,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginTop: 3,
    opacity: 0.7,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  arabicWrap: {
    width: "100%",
    paddingHorizontal: 4,
    marginTop: 10,
    marginBottom: 4,
  },
  arabicTxt: {
    color: GOLD_LIGHT,
    fontSize: 21,
    textAlign: "center",
    lineHeight: 38,
    letterSpacing: 0.3,
    writingDirection: "rtl",
    fontFamily: "Inter_700Bold",
  },
  italicTxt: {
    color: CREAM,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 19,
    fontStyle: "italic",
    opacity: 0.75,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  bodyTxt: {
    color: CREAM_DIM,
    fontSize: 11.5,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18.5,
    paddingHorizontal: 4,
    fontStyle: "italic",
  },
  sourceTxt: {
    color: GOLD,
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.8,
  },
  brand: {
    alignItems: "center",
    gap: 1,
  },
  brandNun: {
    color: GOLD,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  brandName: {
    color: GOLD,
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3.5,
    marginTop: 1,
  },
  brandTag: {
    color: CREAM,
    fontSize: 8,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    opacity: 0.45,
    marginTop: 1,
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#111",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: Dimensions.get("window").height * 0.92,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  handleArea: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 60,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#444",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.2,
  },
  sizeToggle: {
    flexDirection: "row",
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    padding: 3,
    marginBottom: 18,
    gap: 3,
  },
  sizePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 11,
  },
  sizePillActive: {
    backgroundColor: GOLD,
  },
  sizePillText: {
    color: "#888",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  sizePillTextActive: {
    color: "#0D2018",
  },
  cardOuter: {
    alignItems: "center",
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: GOLD,
    backgroundColor: "rgba(201,147,58,0.08)",
  },
  saveTxt: {
    color: GOLD,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: GOLD,
  },
  shareTxt: {
    color: "#0D2018",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
