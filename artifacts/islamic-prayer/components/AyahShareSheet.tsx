import { Feather } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";

import { CardCategory } from "@/constants/cardBackgrounds";

import { ShareCard } from "./cards/ShareCard";
import { WallpaperCard } from "./cards/WallpaperCard";
import { CardData } from "./cards/types";
import { useToast } from "./Toast";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const PREVIEW_CARD_W = Math.min(SCREEN_W - 32, 370);
const PREVIEW_WALLPAPER_W = Math.min(SCREEN_W - 80, 240);

const EXPORT_CARD_W = 1080;
const EXPORT_CARD_H = 1350;
const EXPORT_WALLPAPER_W = 1170;
const EXPORT_WALLPAPER_H = 2535;

const GOLD = "#C9933A";

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
  /** Optional category override; defaults to ayah_general. */
  category?: CardCategory;
  hook?: string | null;
}

export default function AyahShareSheet({
  visible, verseNumber, arabicText, translation,
  surahName, surahEnglish, surahNumber, onClose,
  category = "ayah_general", hook,
}: AyahShareSheetProps) {
  const toast = useToast();
  const exportRef = useRef<View>(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [sizeMode, setSizeMode] = useState<SizeMode>("card");

  const dismissPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderRelease: (_, g) => { if (g.dy > 50 || g.vy > 0.5) onClose(); },
    })
  ).current;

  const isWallpaper = sizeMode === "wallpaper";

  const card = useMemo<CardData>(
    () => ({
      kind: "ayah",
      category,
      refNumber: `${surahNumber}:${verseNumber}`,
      arabic: arabicText,
      translation,
      hook,
      info: [
        { label: "Surah", value: `${surahEnglish} · ${surahNumber}` },
        { label: "Verse", value: String(verseNumber) },
        { label: "Reference", value: surahName || `${surahNumber}:${verseNumber}` },
      ],
    }),
    [arabicText, translation, surahEnglish, surahName, surahNumber, verseNumber, category, hook]
  );

  const captureCard = async (): Promise<string | null> => {
    if (Platform.OS === "web") {
      toast.show("Image export is not available in the browser.", { variant: "error" });
      return null;
    }
    try {
      const w = isWallpaper ? EXPORT_WALLPAPER_W : EXPORT_CARD_W;
      const h = isWallpaper ? EXPORT_WALLPAPER_H : EXPORT_CARD_H;
      return await captureRef(exportRef, { format: "png", quality: 1, width: w, height: h });
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
          <Pressable onPress={onClose} hitSlop={16} style={styles.handleArea} {...dismissPan.panHandlers}>
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
            <View style={styles.cardOuter}>
              {isWallpaper
                ? <WallpaperCard card={card} width={PREVIEW_WALLPAPER_W} />
                : <ShareCard card={card} width={PREVIEW_CARD_W} />}
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

        <View style={styles.offscreen} pointerEvents="none">
          <View ref={exportRef} collapsable={false}>
            {isWallpaper
              ? <WallpaperCard card={card} width={EXPORT_WALLPAPER_W} />
              : <ShareCard card={card} width={EXPORT_CARD_W} />}
          </View>
        </View>
      </View>
    </Modal>
  );
}

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
    maxHeight: SCREEN_H * 0.92,
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
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#444" },
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
  sizePillActive: { backgroundColor: GOLD },
  sizePillText: { color: "#888", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sizePillTextActive: { color: "#0D2018" },
  cardOuter: {
    alignItems: "center",
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  actions: { flexDirection: "row", gap: 12, paddingHorizontal: 4 },
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
  saveTxt: { color: GOLD, fontSize: 14, fontFamily: "Inter_600SemiBold" },
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
  shareTxt: { color: "#0D2018", fontSize: 14, fontFamily: "Inter_700Bold" },
  offscreen: {
    position: "absolute",
    left: -99999,
    top: 0,
    opacity: 0,
  },
});
