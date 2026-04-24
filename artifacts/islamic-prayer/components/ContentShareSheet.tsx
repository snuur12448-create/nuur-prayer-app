import React, { useMemo } from "react";

import ShareThemePicker from "./share-card/ShareThemePicker";
import type { ShareContentKind, ShareCardContent } from "./share-card/types";

/* ─────────────────────────────────────────────────────────────────────────
 * ContentShareSheet (legacy API — internally delegates to the new
 * 6-theme `ShareThemePicker`). The signature is preserved so existing
 * call-sites in `hadiths.tsx`, `names.tsx`, `dua.tsx`, and `quran/[id].tsx`
 * continue to work without changes.
 * ──────────────────────────────────────────────────────────────────────── */

type LegacyTheme = "hadith" | "dua" | "name";

export interface ContentShareSheetProps {
  visible: boolean;
  onClose: () => void;
  /** "hadith" | "dua" | "name" — used as a hint for default-theme picking. */
  theme: LegacyTheme;
  sheetTitle: string;
  shareTitle: string;
  /** Eyebrow label like "HADITH · INTENTIONS" or "MORNING · ADHKAR · TITLE". */
  label: string;
  secondaryTitle?: string;
  arabicText?: string;
  /** @deprecated — sizing is now derived from text length. */
  arabicFontSize?: number;
  bodyItalic?: string;
  bodyText: string;
  source?: string;
}

/** Decide whether a label hints at adhkar (so we bias toward the dawn-glow theme). */
function isAdhkarLabel(label: string): boolean {
  const upper = label.toUpperCase();
  return /\bADHKAR\b|\bADHK[ĀA]R\b|\bMORNING\b|\bEVENING\b/.test(upper);
}

function legacyToKind(theme: LegacyTheme, label: string): ShareContentKind {
  if (theme === "hadith") return "hadith";
  if (theme === "name")   return "name";
  // dua sheet is also used for adhkar
  if (theme === "dua" && isAdhkarLabel(label)) return "adhkar";
  return "dua";
}

export default function ContentShareSheet(p: ContentShareSheetProps) {
  const kind = useMemo<ShareContentKind>(
    () => legacyToKind(p.theme, p.label),
    [p.theme, p.label],
  );

  const content = useMemo<ShareCardContent>(() => {
    const base: ShareCardContent = {
      eyebrow: p.label,
      arabic: p.arabicText,
      transliteration: p.bodyItalic,
      body: p.bodyText,
      attribution: p.source,
    };
    if (p.theme === "name" && p.secondaryTitle) {
      base.caption = p.secondaryTitle;
    }
    return base;
  }, [p.label, p.arabicText, p.bodyItalic, p.bodyText, p.source, p.theme, p.secondaryTitle]);

  return (
    <ShareThemePicker
      visible={p.visible}
      onClose={p.onClose}
      sheetTitle={p.sheetTitle}
      shareTitle={p.shareTitle}
      kind={kind}
      content={content}
    />
  );
}
