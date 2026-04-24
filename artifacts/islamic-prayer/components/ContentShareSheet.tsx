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

import { QuoteCard, QuoteCardMode, QuoteCardPalette } from "./cards/QuoteCard";
import { useToast } from "./Toast";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const PREVIEW_CARD_W      = Math.min(SCREEN_W - 32, 370);
const PREVIEW_WALLPAPER_W = Math.min(SCREEN_W - 80, 240);
const EXPORT_CARD_W       = 1080;
const EXPORT_CARD_H       = 1350;
const EXPORT_WALLPAPER_W  = 1170;
const EXPORT_WALLPAPER_H  = 2535;

const GOLD = "#C9933A";

type Theme = "hadith" | "dua" | "name";

export interface ContentShareSheetProps {
  visible: boolean;
  onClose: () => void;
  theme: Theme;
  sheetTitle: string;
  shareTitle: string;
  /** Legacy uppercase label like "HADITH · INTENTIONS" — used as eyebrow. */
  label: string;
  secondaryTitle?: string;
  arabicText?: string;
  /** @deprecated — sizing is now derived from text length. */
  arabicFontSize?: number;
  bodyItalic?: string;
  bodyText: string;
  source?: string;
}

/** Map call-site label → eyebrow + reference. The label arrives as
 *  "HADITH · INTENTIONS" or "MORNING · ADHKAR · TITLE"; we take the head
 *  segment as the eyebrow and the rest joined as the attribution. */
function splitLabel(label: string): { eyebrow: string; attributionTail: string } {
  const parts = label.split(/[·•]/).map((s) => s.trim()).filter(Boolean);
  const eyebrow = parts[0] ?? "NUUR";
  const tail = parts.slice(1).join(" · ");
  return { eyebrow, attributionTail: tail };
}

export default function ContentShareSheet(p: ContentShareSheetProps) {
  const toast = useToast();
  const exportRef = useRef<View>(null);
  const [saving, setSaving]   = useState(false);
  const [sharing, setSharing] = useState(false);
  const [mode, setMode]       = useState<QuoteCardMode>("card");

  const { eyebrow, attributionTail } = useMemo(() => splitLabel(p.label), [p.label]);
  const palette: QuoteCardPalette = p.theme === "hadith" ? "hadith" : p.theme === "name" ? "name" : "dua";

  const dismissPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderRelease: (_, g) => { if (g.dy > 50 || g.vy > 0.5) p.onClose(); },
    })
  ).current;

  const isWallpaper = mode === "wallpaper";

  const cardProps = useMemo(() => {
    const base = {
      eyebrow,
      reference: undefined as string | undefined,
      arabic: p.arabicText,
      transliteration: p.bodyItalic,
      body: p.bodyText,
      caption: undefined as string | undefined,
      attribution: p.source ?? (attributionTail || undefined),
    };
    if (p.theme === "name") {
      base.caption = p.secondaryTitle ?? p.shareTitle;
    }
    return base;
  }, [p, eyebrow, attributionTail]);

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
      if (!(await Sharing.isAvailableAsync())) {
        toast.show("Sharing is not supported on this device.", { variant: "error" });
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: p.shareTitle });
    } catch {
      toast.show("Could not open the share sheet.", { variant: "error" });
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal visible={p.visible} transparent animationType="slide" onRequestClose={p.onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={p.onClose} />
        <View style={styles.sheet}>
          <Pressable onPress={p.onClose} hitSlop={16} style={styles.handleArea} {...dismissPan.panHandlers}>
            <View style={styles.handle} />
          </Pressable>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{p.sheetTitle}</Text>
            <TouchableOpacity onPress={p.onClose} hitSlop={12}>
              <Feather name="x" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <View style={styles.sizeToggle}>
            {(["card", "wallpaper"] as QuoteCardMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.sizePill, mode === m && styles.sizePillActive]}
                onPress={() => setMode(m)}
                activeOpacity={0.78}
              >
                <Feather
                  name={m === "card" ? "image" : "smartphone"}
                  size={13}
                  color={mode === m ? "#0D2018" : "#888"}
                />
                <Text style={[styles.sizePillText, mode === m && styles.sizePillTextActive]}>
                  {m === "card" ? "Card" : "Wallpaper"}
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
              <QuoteCard
                {...cardProps}
                palette={palette}
                mode={mode}
                width={isWallpaper ? PREVIEW_WALLPAPER_W : PREVIEW_CARD_W}
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving || sharing}
                activeOpacity={0.78}
              >
                {saving
                  ? <ActivityIndicator size="small" color={GOLD} />
                  : <Feather name="download" size={16} color={GOLD} />}
                <Text style={styles.saveTxt}>{saving ? "Saving…" : "Save to Camera Roll"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShare}
                disabled={saving || sharing}
                activeOpacity={0.82}
              >
                {sharing
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Feather name="share" size={16} color="#0D2018" />}
                <Text style={styles.shareTxt}>{sharing ? "Opening…" : "Share"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Off-screen export target rendered at the full export resolution. */}
        <View style={styles.offscreen} pointerEvents="none">
          <View ref={exportRef} collapsable={false}>
            <QuoteCard
              {...cardProps}
              palette={palette}
              mode={mode}
              width={isWallpaper ? EXPORT_WALLPAPER_W : EXPORT_CARD_W}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#111",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_H * 0.92,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  handleArea: { alignItems: "center", paddingTop: 12, paddingBottom: 8, paddingHorizontal: 60 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#444" },
  sheetHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 14, paddingHorizontal: 4,
  },
  sheetTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.2 },
  sizeToggle: {
    flexDirection: "row", backgroundColor: "#1c1c1c",
    borderRadius: 14, padding: 3, marginBottom: 18, gap: 3,
  },
  sizePill: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 9, borderRadius: 11,
  },
  sizePillActive: { backgroundColor: GOLD },
  sizePillText: { color: "#888", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sizePillTextActive: { color: "#0D2018" },
  cardOuter: {
    alignItems: "center", marginBottom: 22, borderRadius: 22, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 16,
  },
  actions: { flexDirection: "row", gap: 12, paddingHorizontal: 4 },
  saveBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: GOLD, backgroundColor: "rgba(201,147,58,0.08)",
  },
  saveTxt: { color: GOLD, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  shareBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: GOLD,
  },
  shareTxt: { color: "#0D2018", fontSize: 14, fontFamily: "Inter_700Bold" },
  offscreen: { position: "absolute", left: -99999, top: 0, opacity: 0 },
});
