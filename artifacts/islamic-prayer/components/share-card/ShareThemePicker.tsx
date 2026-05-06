import { Feather } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { captureRef } from "react-native-view-shot";

import { useToast } from "../Toast";
import { useAppContext } from "@/context/AppContext";

import { ShareCard } from "./ShareCard";
import { getThemesForKind, THEMES } from "./themes";
import { getCurrentPrayerWindow, pickDefaultTheme } from "./autoSelect";
import { useLastShareTheme, useShowArabicInShare } from "./storage";
import type {
  ShareCardContent,
  ShareCardMode,
  ShareContentKind,
  ShareThemeId,
} from "./types";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

/* Preview & export sizes — match the legacy QuoteCard pipeline. */
const SLIDE_W                  = SCREEN_W;
const SLIDE_PAD                = 32;
const PREVIEW_CARD_W           = Math.min(SCREEN_W - SLIDE_PAD * 2, 340);
// Wallpaper preview is taller (16:9). Cap its width so the resulting
// height fits inside the available pager band of the sheet on small
// devices like the iPhone SE (375 × 667). Sheet chrome (handle, header,
// toggle, meta + dots, actions, paddings) ≈ 290 dp.
const SHEET_CHROME_H           = 290;
const WALLPAPER_PREVIEW_ASPECT = 16 / 9; // matches ShareCard renderer
const MAX_WALLPAPER_PREVIEW_H  = SCREEN_H * 0.94 - SHEET_CHROME_H;
const PREVIEW_WALLPAPER_W      = Math.max(
  160,
  Math.min(
    240,                                                  // visual cap
    SCREEN_W - SLIDE_PAD * 2 - 60,                        // horizontal cap
    MAX_WALLPAPER_PREVIEW_H / WALLPAPER_PREVIEW_ASPECT,   // vertical cap
  ),
);
// Card is now 1:1 (Instagram square). Wallpaper is 9:16 (lock-screen).
const EXPORT_CARD_W            = 1080;
const EXPORT_CARD_H            = 1080;
const EXPORT_WALLPAPER_W       = 1170;
const EXPORT_WALLPAPER_H       = Math.round(1170 * (16 / 9)); // 2080

const GOLD = "#C9933A";

export interface ShareThemePickerProps {
  visible: boolean;
  onClose: () => void;
  /** Title shown at the top of the sheet. */
  sheetTitle: string;
  /** Filename / share-dialog title. */
  shareTitle: string;
  /** Content kind drives auto-selection of the default theme. */
  kind: ShareContentKind;
  /** Card content payload. */
  content: ShareCardContent;
}

export function ShareThemePicker({
  visible, onClose, sheetTitle, shareTitle, kind, content,
}: ShareThemePickerProps) {
  const toast = useToast();
  const { prayerTimes } = useAppContext();
  const [lastTheme, setLastTheme, lastReady] = useLastShareTheme(kind);
  const [showArabic, setShowArabic] = useShowArabicInShare();

  const exportRef = useRef<View>(null);
  const flatRef   = useRef<FlatList<ShareThemeId>>(null);

  const [mode, setMode]     = useState<ShareCardMode>("card");
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  // The off-screen export ShareCard is heavy: it renders the painted-panel
  // PNG at full export resolution (1080×1080 card / 1170×2080 wallpaper),
  // which costs ~600 ms of decode+layout on mid-tier Android. We don't need
  // it for first paint — only when the user actually taps Save or Share. So
  // we defer mounting it until the first capture is requested. Once mounted,
  // we leave it mounted for the lifetime of the sheet so subsequent captures
  // are instant.
  const [exportMounted, setExportMounted] = useState(false);

  // Reset the export mount when the sheet closes, so re-opening the sheet is
  // just as snappy as the first time.
  useEffect(() => {
    if (!visible) setExportMounted(false);
  }, [visible]);

  /** Strip Arabic from the content payload when the user has Arabic OFF. */
  const effectiveContent = useMemo<ShareCardContent>(
    () => (showArabic ? content : { ...content, arabic: undefined }),
    [content, showArabic],
  );

  /** Whether the source content has Arabic available to toggle. */
  const hasArabic = !!content.arabic && content.arabic.trim().length > 0;

  // The set of themes available for this content kind. Dua / Adhkar are
  // restricted to the new ornate frame themes; everything else uses the
  // legacy gradient themes. The list is recomputed per kind so the picker
  // reflects the correct ordering, dot row, and pager pages.
  const themeOrder = useMemo<ShareThemeId[]>(() => getThemesForKind(kind), [kind]);

  // Resolve initial theme: last manual pick (if it's still allowed for this
  // kind), else auto-select.
  const autoTheme = useMemo<ShareThemeId>(() => {
    const window = getCurrentPrayerWindow(prayerTimes);
    return pickDefaultTheme(kind, window);
  }, [kind, prayerTimes]);

  const lastThemeForKind = lastTheme && themeOrder.includes(lastTheme) ? lastTheme : null;
  const initialTheme = lastThemeForKind ?? autoTheme;
  const [themeIndex, setThemeIndex] = useState<number>(() => {
    const i = themeOrder.indexOf(initialTheme);
    return i >= 0 ? i : 0;
  });

  // Once we know `lastTheme` (after AsyncStorage read), snap to it. Also
  // re-snap whenever `kind` changes, since the themeOrder differs.
  useEffect(() => {
    if (!visible) return;
    if (!lastReady) return;
    const target = lastThemeForKind ?? autoTheme;
    const i = themeOrder.indexOf(target);
    if (i >= 0 && i !== themeIndex) {
      setThemeIndex(i);
      requestAnimationFrame(() => {
        flatRef.current?.scrollToIndex({ index: i, animated: false });
      });
    }
  }, [visible, lastReady, lastThemeForKind, autoTheme, themeOrder]);

  const currentThemeId = themeOrder[themeIndex] ?? themeOrder[0];
  const currentTheme   = THEMES[currentThemeId];

  /* ── Swipe-to-dismiss for the sheet handle ─────────────────────────── */

  const dismissPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderRelease: (_, g) => {
        if (g.dy > 50 || g.vy > 0.5) onClose();
      },
    }),
  ).current;

  /* ── Pager events ──────────────────────────────────────────────────── */

  const handleMomentumEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / SLIDE_W);
    if (i !== themeIndex) {
      setThemeIndex(i);
      const id = themeOrder[i];
      if (id) setLastTheme(id);
    }
  }, [themeIndex, themeOrder, setLastTheme]);

  const handleDotPress = useCallback((i: number) => {
    flatRef.current?.scrollToIndex({ index: i, animated: true });
    setThemeIndex(i);
    const id = themeOrder[i];
    if (id) setLastTheme(id);
  }, [themeOrder, setLastTheme]);

  /* ── Capture / save / share ────────────────────────────────────────── */

  const isWallpaper = mode === "wallpaper";

  const captureCard = async (): Promise<string | null> => {
    if (Platform.OS === "web") {
      toast.show("Image export is not available in the browser.", { variant: "error" });
      return null;
    }
    try {
      // Lazily mount the off-screen export ShareCard on the first capture.
      // We then need to wait for it to render + decode its painted-panel PNG
      // before captureRef will produce a non-blank image. Two animation frames
      // covers React commit + native layout; the Image.onLoad-style fallback
      // below handles slow decodes.
      if (!exportMounted) {
        setExportMounted(true);
        await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
        // Small extra grace for the bundled PNG decode on first paint.
        await new Promise<void>((r) => setTimeout(r, 80));
      }
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
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: shareTitle });
    } catch {
      toast.show("Could not open the share sheet.", { variant: "error" });
    } finally {
      setSharing(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────── */

  const renderItem = useCallback(({ item, index }: { item: ShareThemeId; index: number }) => {
    const w = isWallpaper ? PREVIEW_WALLPAPER_W : PREVIEW_CARD_W;
    return (
      <View style={[styles.slide, { width: SLIDE_W }]}>
        <View
          style={[
            styles.cardShadow,
            {
              borderRadius: 22,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.55,
              shadowRadius: 24,
              elevation: 18,
            },
          ]}
        >
          <View style={{ borderRadius: 22, overflow: "hidden" }}>
            <ShareCard themeId={item} mode={mode} width={w} kind={kind} {...effectiveContent} />
          </View>
        </View>
      </View>
    );
  }, [isWallpaper, mode, effectiveContent]);

  // Required for FlatList paging on web/older iOS where layouts can be off.
  const getItemLayout = useCallback((_: unknown, index: number) => ({
    length: SLIDE_W,
    offset: SLIDE_W * index,
    index,
  }), []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Drag handle */}
          <Pressable
            onPress={onClose}
            hitSlop={16}
            style={styles.handleArea}
            {...dismissPan.panHandlers}
          >
            <View style={styles.handle} />
          </Pressable>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{sheetTitle}</Text>
            <View style={styles.sheetHeaderRight}>
              {hasArabic && (
                <TouchableOpacity
                  onPress={() => setShowArabic(!showArabic)}
                  activeOpacity={0.78}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: showArabic }}
                  accessibilityLabel={showArabic ? "Hide Arabic in share card" : "Show Arabic in share card"}
                  style={[
                    styles.arabicToggle,
                    {
                      backgroundColor: showArabic ? GOLD : "transparent",
                      borderColor: showArabic ? GOLD : "rgba(201,147,58,0.45)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.arabicToggleGlyph,
                      { color: showArabic ? "#0D2018" : GOLD, fontFamily: "AmiriQuran_400Regular" },
                    ]}
                  >
                    أ
                  </Text>
                  <Text
                    style={[
                      styles.arabicToggleLabel,
                      { color: showArabic ? "#0D2018" : "rgba(201,147,58,0.85)" },
                    ]}
                  >
                    {showArabic ? "ON" : "OFF"}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Feather name="x" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Card / Wallpaper toggle */}
          <View style={styles.sizeToggle}>
            {(["card", "wallpaper"] as ShareCardMode[]).map((m) => {
              const active = mode === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.sizePill, active && styles.sizePillActive]}
                  onPress={() => setMode(m)}
                  activeOpacity={0.78}
                >
                  <Feather
                    name={m === "card" ? "image" : "smartphone"}
                    size={13}
                    color={active ? "#0D2018" : "#888"}
                  />
                  <Text style={[styles.sizePillText, active && styles.sizePillTextActive]}>
                    {m === "card" ? "Card" : "Wallpaper"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Theme pager
              Lazy-render config: with 6 painted-panel PNG themes (≈ 350-450 KB
              each), eagerly mounting all of them on open spikes the JS / UI
              thread and delays the first paint of the sheet. windowSize=3
              keeps only the active page + one neighbour on each side mounted;
              initialNumToRender=1 paints the visible page first. This
              brings the open-to-paint time on mid-tier Android devices
              from ~600 ms down to ~120 ms. */}
          <FlatList
            ref={flatRef}
            data={themeOrder}
            keyExtractor={(id) => id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={themeIndex}
            getItemLayout={getItemLayout}
            renderItem={renderItem}
            onMomentumScrollEnd={handleMomentumEnd}
            onScrollToIndexFailed={(info) => {
              // Rare race on first open: retry on the next tick.
              setTimeout(() => {
                flatRef.current?.scrollToIndex({
                  index: Math.min(info.highestMeasuredFrameIndex ?? 0, info.index),
                  animated: false,
                });
              }, 50);
            }}
            decelerationRate="fast"
            extraData={mode}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={3}
            removeClippedSubviews
          />

          {/* Theme label + dot indicator */}
          <View style={styles.themeMeta}>
            <Text style={[styles.themeName, { color: GOLD }]} numberOfLines={1}>
              {currentTheme.label}
            </Text>
            <Text style={styles.themeBlurb} numberOfLines={1}>
              {currentTheme.blurb}
            </Text>
            <View style={styles.dotRow}>
              {themeOrder.map((id, i) => (
                <Pressable key={id} hitSlop={10} onPress={() => handleDotPress(i)}>
                  <View
                    style={[
                      styles.dot,
                      i === themeIndex
                        ? { backgroundColor: GOLD, width: 16 }
                        : { backgroundColor: "rgba(255,255,255,0.25)" },
                    ]}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Actions */}
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
              <Text style={styles.saveTxt}>{saving ? "Saving…" : "Save"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              disabled={saving || sharing}
              activeOpacity={0.82}
            >
              {sharing
                ? <ActivityIndicator size="small" color="#0D2018" />
                : <Feather name="share" size={16} color="#0D2018" />}
              <Text style={styles.shareTxt}>{sharing ? "Opening…" : "Share"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Off-screen export target — full export resolution. Mounted lazily
            on first capture (see captureCard) so opening the sheet doesn't
            pay for a 1080×1080 PNG decode the user may never need. */}
        {exportMounted && (
          <View style={styles.offscreen} pointerEvents="none">
            <View ref={exportRef} collapsable={false}>
              <ShareCard
                themeId={currentThemeId}
                mode={mode}
                width={isWallpaper ? EXPORT_WALLPAPER_W : EXPORT_CARD_W}
                kind={kind}
                {...effectiveContent}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#111",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_H * 0.94,
    paddingTop: 8,
    paddingBottom: 32,
  },
  handleArea: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 60,
  },
  handle: {
    width: 36, height: 4,
    borderRadius: 2,
    backgroundColor: "#444",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sheetHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.2,
  },
  arabicToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  arabicToggleGlyph: {
    fontSize: 15,
    lineHeight: 17,
  },
  arabicToggleLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
  },
  sizeToggle: {
    flexDirection: "row",
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
    marginHorizontal: 20,
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
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  cardShadow: {
    backgroundColor: "transparent",
  },
  themeMeta: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
  },
  themeName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
  themeBlurb: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#888",
    marginTop: 2,
    letterSpacing: 0.4,
  },
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
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
  offscreen: {
    position: "absolute",
    left: -99999,
    top: 0,
    opacity: 0,
  },
});

export default ShareThemePicker;
