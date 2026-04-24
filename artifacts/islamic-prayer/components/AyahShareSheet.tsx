import React, { useMemo } from "react";

import ShareThemePicker from "./share-card/ShareThemePicker";
import type { ShareCardContent } from "./share-card/types";

/* ─────────────────────────────────────────────────────────────────────────
 * AyahShareSheet (legacy API — delegates to the new 6-theme picker).
 * The signature is preserved so existing call-sites in `app/(tabs)/index.tsx`
 * continue to work without changes.
 * ──────────────────────────────────────────────────────────────────────── */

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
  visible, verseNumber, arabicText, translation,
  surahName, surahEnglish, surahNumber, onClose,
}: AyahShareSheetProps) {
  // Reference unused props so TS is happy in case the surahName isn't used
  // visibly — keep for future tweaks without changing the API.
  void surahName;

  const content = useMemo<ShareCardContent>(() => ({
    eyebrow: `${surahEnglish.toUpperCase()} · ${surahNumber}:${verseNumber}`,
    arabic: arabicText,
    body: translation,
    attribution: `Qur'an · ${surahEnglish} · ${surahNumber}:${verseNumber}`,
  }), [arabicText, translation, surahEnglish, surahNumber, verseNumber]);

  return (
    <ShareThemePicker
      visible={visible}
      onClose={onClose}
      sheetTitle="Share Ayah"
      shareTitle={`${surahEnglish} ${surahNumber}:${verseNumber}`}
      kind="quran"
      content={content}
    />
  );
}
