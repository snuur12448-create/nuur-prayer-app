import { SURAHS } from "./islamicData";

type QuranRow = [number, number, string, string];

export interface QuranSearchResult {
  surahNum: number;
  verseNum: number;
  surahNameEn: string;
  surahNameAr: string;
  arabicText: string;
  engText: string;
}

let cachedIndex: QuranRow[] | null = null;

function getIndex(): QuranRow[] {
  if (!cachedIndex) {
    cachedIndex = require("../assets/quranIndex.json") as QuranRow[];
  }
  return cachedIndex;
}

export function searchQuranVerses(query: string, limit = 40): QuranSearchResult[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const qLower = q.toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(q);

  const results: QuranSearchResult[] = [];
  const index = getIndex();

  for (let i = 0; i < index.length && results.length < limit; i++) {
    const [surahNum, verseNum, arabicText, engText] = index[i];
    const matches = isArabic
      ? arabicText.includes(q)
      : engText.toLowerCase().includes(qLower);

    if (matches) {
      const surah = SURAHS.find((s) => s.number === surahNum);
      results.push({
        surahNum,
        verseNum,
        surahNameEn: surah?.englishName ?? "",
        surahNameAr: surah?.name ?? "",
        arabicText,
        engText,
      });
    }
  }

  return results;
}

export function highlightSegments(
  text: string,
  query: string
): { text: string; highlight: boolean }[] {
  const q = query.trim();
  if (!q) return [{ text, highlight: false }];

  const isArabic = /[\u0600-\u06FF]/.test(q);
  const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQ})`, isArabic ? "g" : "gi");
  const parts = text.split(regex);
  const qLower = q.toLowerCase();

  return parts.map((part) => ({
    text: part,
    highlight: isArabic ? part === q : part.toLowerCase() === qLower,
  }));
}
