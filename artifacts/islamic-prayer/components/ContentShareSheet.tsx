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

import { CardCategory, duaCategoryFor, hadithCategoryFor } from "@/constants/cardBackgrounds";

import { ShareCard } from "./cards/ShareCard";
import { WallpaperCard } from "./cards/WallpaperCard";
import { InfoCell } from "./cards/InfoStrip";
import { CardData } from "./cards/types";
import { useToast } from "./Toast";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const PREVIEW_CARD_W = Math.min(SCREEN_W - 32, 370);
const PREVIEW_WALLPAPER_W = Math.min(SCREEN_W - 80, 240);

// Export targets per spec (in pixels — pinned via captureRef width/height)
const EXPORT_CARD_W = 1080;
const EXPORT_CARD_H = 1350;          // 1080 * 5/4
const EXPORT_WALLPAPER_W = 1170;
const EXPORT_WALLPAPER_H = 2535;     // 1170 * 19.5/9

const GOLD = "#C9933A";

type Theme = "hadith" | "dua" | "name";
type SizeMode = "card" | "wallpaper";

export interface ContentShareSheetProps {
  visible: boolean;
  onClose: () => void;
  theme: Theme;
  sheetTitle: string;
  shareTitle: string;
  /** Legacy label, e.g. "HADITH · INTENTIONS" — used to infer category. */
  label: string;
  secondaryTitle?: string;
  arabicText?: string;
  arabicFontSize?: number;
  bodyItalic?: string;
  bodyText: string;
  source?: string;

  /** New: optional category override (else inferred from theme + label). */
  category?: CardCategory;
  /** New: optional hook line ("What makes the <em>same</em> ..."). */
  hook?: string | null;
  /** New: optional info-strip cells. If omitted, sensible defaults are derived. */
  info?: InfoCell[];
  /** New: optional ref number, e.g. "Bukhari · 1". */
  refNumber?: string;
}

function inferCategory(theme: Theme, label: string, override?: CardCategory): CardCategory {
  if (override) return override;
  switch (theme) {
    case "hadith": {
      const after = label.split(/[·•]/).pop()?.trim() ?? "";
      return hadithCategoryFor(after);
    }
    case "dua": {
      const after = label.split(/[·•]/).pop()?.trim() ?? "";
      return duaCategoryFor(after);
    }
    case "name": return "name_general";
  }
}

function buildCard(p: ContentShareSheetProps, category: CardCategory): CardData {
  const refNumber = p.refNumber ?? p.source;
  const info: InfoCell[] = p.info ?? defaultInfo(p);

  switch (p.theme) {
    case "name":
      return {
        kind: "name",
        category,
        refNumber,
        arabic: p.arabicText ?? "",
        pronunciation: p.secondaryTitle ?? p.shareTitle,
        meaning: p.bodyText,
        hook: p.hook,
        info,
      };
    case "dua":
      return {
        kind: "dua",
        category,
        refNumber,
        arabic: p.arabicText ?? "",
        transliteration: p.bodyItalic,
        translation: p.bodyText,
        hook: p.hook,
        info,
        sourceType: "non-quran",
      };
    case "hadith":
      return {
        kind: "hadith",
        category,
        refNumber,
        arabic: p.arabicText,
        translation: p.bodyText,
        hook: p.hook,
        info,
      };
  }
}

function defaultInfo(p: ContentShareSheetProps): InfoCell[] {
  const labelParts = p.label.split(/[·•]/).map((s) => s.trim()).filter(Boolean);
  const topicLabel = labelParts.length > 1 ? labelParts.slice(1).join(" · ") : labelParts[0] ?? "—";
  switch (p.theme) {
    case "hadith":
      return [
        { label: "Grade", value: "Ṣaḥīḥ" },
        { label: "Topic", value: topicLabel },
        { label: "Source", value: p.source ?? "—" },
      ];
    case "dua":
      return [
        { label: "When", value: topicLabel },
        { label: "Repeat", value: "—" },
        { label: "Source", value: p.source ?? "—" },
      ];
    case "name":
      return [
        { label: "Meaning", value: "Allah's Name" },
        { label: "In Quran", value: "Yes" },
        { label: "Pronounce", value: p.secondaryTitle ?? p.shareTitle },
      ];
  }
}

export default function ContentShareSheet(props: ContentShareSheetProps) {
  const { visible, onClose, sheetTitle, shareTitle, theme, label } = props;
  const toast = useToast();
  const previewRef = useRef<View>(null);
  const exportRef = useRef<View>(null);
  const [saving, setSaving]   = useState(false);
  const [sharing, setSharing] = useState(false);
  const [sizeMode, setSizeMode] = useState<SizeMode>("card");

  const category = useMemo(() => inferCategory(theme, label, props.category), [theme, label, props.category]);
  const card = useMemo(() => buildCard(props, category), [props, category]);

  const dismissPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderRelease: (_, g) => { if (g.dy > 50 || g.vy > 0.5) onClose(); },
    })
  ).current;

  const isWallpaper = sizeMode === "wallpaper";

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
      toast.show("Could not capture the card.", { variant: "error" });
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
      toast.show(`Saved ${isWallpaper ? "wallpaper" : "card"} to your camera roll.`, { variant: "success" });
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
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: shareTitle });
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
            <Text style={styles.sheetTitle}>{sheetTitle}</Text>
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
              <View ref={previewRef} collapsable={false}>
                {isWallpaper
                  ? <WallpaperCard card={card} width={PREVIEW_WALLPAPER_W} />
                  : <ShareCard card={card} width={PREVIEW_CARD_W} />}
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

        {/* Off-screen export target rendered at full target resolution. */}
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
