// ─────────────────────────────────────────────────────────────────────────────
// TafsirSheet — bottom-sheet modal showing Ibn Kathir commentary for a verse
// ─────────────────────────────────────────────────────────────────────────────
//
// Mirrors the visual language of the in-screen WordSheet: dark overlay,
// rounded-top sheet pinned to the bottom inset, a centred handle + close
// button. Differs in that the body is scrollable (commentary can be long)
// and supports loading / error / empty states.
//
// Inputs:
//   visible       — show/hide
//   verseLabel    — e.g. "Al-Fatihah · 1:1" (already localised by caller)
//   arabicAnchor  — short Arabic line shown above the commentary as anchor
//   blocks        — pre-parsed tafsir blocks, or null for not-yet-loaded
//   loading       — true while first fetch is in flight
//   error         — true after failed fetch with no cached data
//   onClose       — dismiss
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { TafsirBlock, TAFSIR_SOURCE_ATTRIBUTION } from "@/utils/tafsirData";
import { ThemeColors } from "@/constants/themes";

interface TafsirSheetProps {
  visible: boolean;
  verseLabel: string;
  arabicAnchor?: string;
  blocks: TafsirBlock[] | null;
  loading: boolean;
  error: boolean;
  colors: ThemeColors;
  bottomInset: number;
  onClose: () => void;
}

const TafsirSheet: React.FC<TafsirSheetProps> = ({
  visible,
  verseLabel,
  arabicAnchor,
  blocks,
  loading,
  error,
  colors,
  bottomInset,
  onClose,
}) => {
  if (!visible) return null;

  // Decide which content state to render.
  let body: React.ReactNode;
  if (loading) {
    body = (
      <View style={styles.stateBlock}>
        <ActivityIndicator size="small" color={colors.gold} />
        <Text style={[styles.stateText, { color: colors.textSecondary }]}>
          Loading commentary…
        </Text>
      </View>
    );
  } else if (error) {
    body = (
      <View style={styles.stateBlock}>
        <Feather name="cloud-off" size={20} color={colors.textSecondary} />
        <Text style={[styles.stateText, { color: colors.textSecondary }]}>
          Tafsir unavailable. Check your connection and try again.
        </Text>
      </View>
    );
  } else if (!blocks || blocks.length === 0) {
    body = (
      <View style={styles.stateBlock}>
        <Feather name="book-open" size={20} color={colors.textSecondary} />
        <Text style={[styles.stateText, { color: colors.textSecondary }]}>
          No commentary available for this verse in the abridged edition.
        </Text>
      </View>
    );
  } else {
    body = (
      <View style={{ paddingTop: 4 }}>
        {blocks.map((b, i) => {
          if (b.kind === "h1") {
            return (
              <Text
                key={i}
                style={[styles.h1, { color: colors.gold }]}
                accessibilityRole="header"
              >
                {b.text}
              </Text>
            );
          }
          if (b.kind === "h2") {
            return (
              <Text
                key={i}
                style={[styles.h2, { color: colors.text }]}
                accessibilityRole="header"
              >
                {b.text}
              </Text>
            );
          }
          return (
            <Text key={i} style={[styles.p, { color: colors.text }]}>
              {b.text}
            </Text>
          );
        })}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop is a sibling of the sheet (not a parent) so that vertical
          swipes inside the ScrollView are never claimed by an outer
          Pressable. Wrapping the sheet in a Pressable broke scrolling on iOS
          because the parent Pressable kept winning the responder. */}
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.prayerCard,
              borderTopColor: colors.border,
              paddingBottom: Math.max(bottomInset, 20) + 12,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Close — generous hit target + zIndex so the parent Pressable
              and ScrollView never swallow the tap. */}
          <TouchableOpacity
            onPress={onClose}
            hitSlop={16}
            style={[
              styles.closeBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            accessibilityLabel="Close tafsir"
          >
            <Feather name="x" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Header — verse label + optional Arabic anchor */}
          <View style={styles.header}>
            <Text style={[styles.label, { color: colors.gold }]}>
              {verseLabel}
            </Text>
            {!!arabicAnchor && (
              <Text
                style={[styles.arabic, { color: colors.text }]}
                numberOfLines={2}
              >
                {arabicAnchor}
              </Text>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Body — scrollable */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator
          >
            {body}
          </ScrollView>

          {/* Footer attribution */}
          <View
            style={[styles.footer, { borderTopColor: colors.border }]}
          >
            <Text
              style={[styles.footerText, { color: colors.textSecondary }]}
            >
              {TAFSIR_SOURCE_ATTRIBUTION}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TafsirSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    // The sheet should never push past the screen — we cap at 80% of the
    // viewport via maxHeight on the inner ScrollView wrapper below.
    maxHeight: "85%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 4,
  },
  header: { gap: 6, marginBottom: 12, paddingRight: 28 },
  label: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
  },
  arabic: {
    fontSize: 18,
    fontFamily: "AmiriQuran_400Regular",
    writingDirection: "rtl",
    textAlign: "right",
  },
  divider: { height: 1, marginBottom: 8 },
  scroll: { flexGrow: 0, maxHeight: 480 },
  h1: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginTop: 14,
    marginBottom: 6,
  },
  h2: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginTop: 12,
    marginBottom: 4,
  },
  p: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 8,
  },
  stateBlock: {
    paddingVertical: 24,
    alignItems: "center",
    gap: 10,
  },
  stateText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  footerText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
