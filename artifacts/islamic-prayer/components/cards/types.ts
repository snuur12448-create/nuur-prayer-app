import { CardCategory } from "@/constants/cardBackgrounds";

import { InfoCell } from "./InfoStrip";

/**
 * Unified data shape rendered by ShareCard and WallpaperCard.
 * Each kind decides which content variant + which info-strip cells to use.
 */
export type CardData =
  | {
      kind: "name";
      category: CardCategory; // name_mercy / name_power / ...
      refNumber?: string;
      arabic: string;
      pronunciation: string;
      meaning: string;
      hook?: string | null;
      info: InfoCell[];
    }
  | {
      kind: "dua";
      category: CardCategory;
      refNumber?: string;
      arabic: string;
      transliteration?: string;
      translation: string;
      hook?: string | null;
      info: InfoCell[];
      sourceType?: "quran" | "non-quran";
    }
  | {
      kind: "hadith";
      category: CardCategory;
      refNumber?: string;
      arabic?: string;
      translation: string;
      hook?: string | null;
      info: InfoCell[];
    }
  | {
      kind: "ayah";
      category: CardCategory;
      refNumber?: string;
      arabic: string;
      transliteration?: string;
      translation: string;
      hook?: string | null;
      info: InfoCell[];
    };
