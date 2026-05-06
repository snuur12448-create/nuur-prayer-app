import React, { useMemo } from "react";

import ShareThemePicker from "./share-card/ShareThemePicker";
import type { ShareCardContent } from "./share-card/types";

/* ─────────────────────────────────────────────────────────────────────────
 * HadithShareSheet — dedicated wrapper that mirrors AyahShareSheet.
 * Accepts structured hadith fields, builds a polished eyebrow + Bukhārī /
 * Muslim source caps line, and delegates to the 6-theme picker with
 * `kind="hadith"`.
 *
 * Source normalisation: the curated dataset already stores attribution as
 * `Ṣaḥīḥ al-Bukhārī N · Ṣaḥīḥ Muslim N` — the share card will uppercase it
 * for the caps line. The Sunnah.com live feed gives `Bukhari · Book B,
 * Hadith H`; we promote that to the same `ṢAḤĪḤ AL-BUKHĀRĪ H` shape so
 * shared cards read consistently.
 * ──────────────────────────────────────────────────────────────────────── */

export interface HadithShareSheetProps {
  visible: boolean;
  onClose: () => void;
  topic: string;
  arabic?: string;
  translation: string;
  /** Pre-formatted source (e.g. `Ṣaḥīḥ al-Bukhārī 6306` or `Bukhari · Book 1, Hadith 1`). */
  source: string;
}

/** Promote loose source strings (e.g. live feed) to the Ṣaḥīḥ caps form. */
function normaliseHadithSource(raw: string): string {
  if (!raw) return raw;
  const trimmed = raw.trim();

  // Already in Ṣaḥīḥ form — leave as-is (ShareCard uppercases for the caps line).
  if (/Ṣaḥīḥ|Sahih/i.test(trimmed)) return trimmed;

  // Live feed shape: "Bukhari · Book B, Hadith H" → "Ṣaḥīḥ al-Bukhārī H"
  const liveMatch = trimmed.match(/^(Bukhari|Muslim)\b.*?Hadith\s+(\d+)/i);
  if (liveMatch) {
    const collection = liveMatch[1].toLowerCase() === "bukhari" ? "al-Bukhārī" : "Muslim";
    return `Ṣaḥīḥ ${collection} ${liveMatch[2]}`;
  }

  return trimmed;
}

export default function HadithShareSheet({
  visible, onClose, topic, arabic, translation, source,
}: HadithShareSheetProps) {
  const cleanSource = useMemo(() => normaliseHadithSource(source), [source]);

  const content = useMemo<ShareCardContent>(() => ({
    eyebrow: `HADITH · ${topic.toUpperCase()}`,
    arabic: arabic || undefined,
    body: translation,
    attribution: cleanSource,
  }), [topic, arabic, translation, cleanSource]);

  return (
    <ShareThemePicker
      visible={visible}
      onClose={onClose}
      sheetTitle="Share Hadith"
      shareTitle={cleanSource}
      kind="hadith"
      content={content}
    />
  );
}
