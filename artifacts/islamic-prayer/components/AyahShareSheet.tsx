import { Feather } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { captureRef } from "react-native-view-shot";

import { useToast } from "./Toast";

import {
  Bismillah,
  CornerFloret,
  CREAM,
  CREAM_DIM,
  cornerPos,
  GOLD,
  GOLD_LIGHT,
  HeroMedallion,
  NuurLockup,
  OrnamentalDivider,
  PALETTES,
  RefRow,
  ShareBackground,
  ShareFrame,
} from "./share/ShareDecor";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const CARD_SIZE   = Math.min(SCREEN_W - 32, 370);
const WALLPAPER_W = SCREEN_W;
const WALLPAPER_H = SCREEN_H;

type SizeMode = "card" | "wallpaper";

export interface AyahShareSheetProps {
  visible: boolean;
  verseNumber: number;
  arabicText: string;
  translation: string;
  surahName: string;
  surahEnglish: string;
  surahNumber: number;
  onClose: () => void;
}

export default function AyahShareSheet({
  visible,
  verseNumber,
  arabicText,
  translation,
  surahName,
  surahEnglish,
  surahNumber,
  onClose,
}: AyahShareSheetProps) {
  const toast = useToast();
  const cardRef   = useRef<View>(null);
  const [saving,   setSaving]   = useState(false);
  const [sharing,  setSharing]  = useState(false);
  const [cardH,    setCardH]    = useState(CARD_SIZE);
  const [sizeMode, setSizeMode] = useState<SizeMode>("card");

  const isWallpaper = sizeMode === "wallpaper";
  const cardW       = isWallpaper ? WALLPAPER_W : CARD_SIZE;
  const currentH    = isWallpaper ? WALLPAPER_H : cardH;
  const FS          = isWallpaper ? 1.32 : 1;
  const cornSize    = isWallpaper ? 44 : 30;
  const hPad        = isWallpaper ? 38 : 24;
  const divW        = cardW - hPad * 2 - 12;
  const palette     = PALETTES.quran;
  const medallion   = isWallpaper ? Math.min(cardW, currentH) * 0.78 : cardW * 0.82;

  const captureCard = async (): Promise<string | null> => {
    if (Platform.OS === "web") {
      toast.show("Image export is not available in the browser.", { variant: "error" });
      return null;
    }
    try {
      return await captureRef(cardRef, { format: "png", quality: 1 });
    } catch {
      toast.show("Could not capture the card. Please try again.", { variant: "error" });
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
        toast.show("Allow photo library access to save the image.", { variant: "error" });
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      toast.show(`Saved ${isWallpaper ? "wallpaper" : "ayah card"} to your camera roll.`, { variant: "success" });
    } catch {
      toast.show("Could not save the image.", { variant: "error" });
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
        toast.show("Sharing is not supported on this device.", { variant: "error" });
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `${surahEnglish} ${surahNumber}:${verseNumber}`,
      });
    } catch {
      toast.show("Could not open the share sheet.", { variant: "error" });
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
            <Text style={styles.sheetTitle}>Share Ayah</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Feather name="x" size={20} color="#888" />
            </TouchableOpacity>
          </View>

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
            <View style={[styles.cardOuter, isWallpaper && { marginHorizontal: -16 }]}>
              <View
                ref={cardRef}
                style={{
                  width: cardW,
                  height: isWallpaper ? WALLPAPER_H : undefined,
                  borderRadius: isWallpaper ? 0 : 22,
                  overflow: "hidden",
                  backgroundColor: palette.edge,
                }}
                collapsable={false}
                onLayout={(e) => setCardH(e.nativeEvent.layout.height)}
              >
                <ShareBackground w={cardW} h={currentH} palette={palette} />

                {/* Hero medallion centered behind content */}
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: (cardW - medallion) / 2,
                    top: (currentH - medallion) / 2 - (isWallpaper ? 30 : 8),
                  }}
                >
                  <HeroMedallion size={medallion} opacity={isWallpaper ? 0.16 : 0.20} />
                </View>

                <ShareFrame w={cardW} h={currentH} inset={isWallpaper ? 18 : 12} />

                <View style={[cornerPos.base, cornerPos.tl]}><CornerFloret size={cornSize} /></View>
                <View style={[cornerPos.base, cornerPos.tr]}><CornerFloret size={cornSize} /></View>
                <View style={[cornerPos.base, cornerPos.bl]}><CornerFloret size={cornSize} /></View>
                <View style={[cornerPos.base, cornerPos.br]}><CornerFloret size={cornSize} /></View>

                <View style={[s.cardInner, { paddingHorizontal: hPad }, isWallpaper && s.cardInnerWP]}>
                  {isWallpaper && (
                    <View style={{ alignItems: "center", marginTop: 4 }}>
                      <Bismillah scale={1.05} />
                    </View>
                  )}

                  {isWallpaper && <View style={{ flex: 1 }} />}

                  <View style={{ alignItems: "center", width: "100%" }}>
                    <RefRow label={`${surahEnglish.toUpperCase()}  ·  ${surahNumber}:${verseNumber}`} scale={FS} />

                    {surahName ? (
                      <Text style={[s.surahAr, { fontSize: 18 * FS, lineHeight: 26 * FS }]}>{surahName}</Text>
                    ) : null}

                    <View style={s.arabicWrap}>
                      <Text style={[s.arabicTxt, { fontSize: 24 * FS, lineHeight: 46 * FS }]}>
                        {arabicText}
                      </Text>
                    </View>

                    <View style={{ alignItems: "center", marginVertical: isWallpaper ? 16 : 10 }}>
                      <OrnamentalDivider width={divW} />
                    </View>

                    <Text style={[s.translTxt, { fontSize: 12 * FS, lineHeight: 19.5 * FS }]}>
                      {translation}
                    </Text>
                  </View>

                  {isWallpaper && <View style={{ flex: 1 }} />}

                  <View style={{ width: "100%", alignItems: "center" }}>
                    <View style={[s.brandRule, { width: divW * 0.6 }]} />
                    <NuurLockup size={isWallpaper ? "md" : "sm"} showTagline />
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
                  <Feather name="share" size={16} color="#0D2018" />
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
  cardInner: {
    paddingTop: 22,
    paddingBottom: 22,
    alignItems: "center",
  },
  cardInnerWP: {
    flex: 1,
    paddingTop: 64,
    paddingBottom: 52,
  },
  surahAr: {
    color: GOLD_LIGHT,
    fontFamily: "AmiriQuran_400Regular",
    marginTop: 10,
    opacity: 0.95,
    textAlign: "center",
    writingDirection: "rtl",
  },
  arabicWrap: {
    width: "100%",
    paddingHorizontal: 4,
    marginTop: 14,
    marginBottom: 4,
  },
  arabicTxt: {
    color: CREAM,
    textAlign: "center",
    writingDirection: "rtl",
    fontFamily: "AmiriQuran_400Regular",
  },
  translTxt: {
    color: CREAM_DIM,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 4,
    fontStyle: "italic",
  },
  brandRule: {
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.28,
    marginTop: 16,
    marginBottom: 12,
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
