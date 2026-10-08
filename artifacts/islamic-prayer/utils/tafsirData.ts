// ─────────────────────────────────────────────────────────────────────────────
// Tafsir (Quranic commentary) — types, fetchers, HTML→blocks parser
// ─────────────────────────────────────────────────────────────────────────────
//
// We start with Tafsir Ibn Kathir (Abridged, English) — Quran.com QDC
// resource id 169. The endpoint returns one tafsir entry per verse, keyed by
// "{surah}:{ayah}". Some surahs only have entries for some verses (the
// abridged edition skips coverage in places); the consumer must handle the
// "no commentary for this verse" case gracefully.
//
// The API returns commentary as HTML. We parse it into a tiny block list
// (heading / paragraph) so the UI can render it with React Native <Text>
// without pulling in a full HTML renderer.
//
// Source attribution (always shown in the UI footer):
//   Tafsir Ibn Kathir (Abridged) — Mubarakpuri ed., via quran.com
// ─────────────────────────────────────────────────────────────────────────────

export const IBN_KATHIR_RESOURCE_ID = 169;
export const TAFSIR_SOURCE_ATTRIBUTION =
  "Tafsir Ibn Kathir (Abridged) — Mubarakpuri ed., via quran.com";

/** A single block of rendered commentary. */
export type TafsirBlock =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "p"; text: string };

/** One verse's tafsir, parsed and ready to render. */
export interface TafsirEntry {
  /** "{surah}:{ayah}" — the verse this commentary is anchored to. */
  verseKey: string;
  /** Pre-parsed render-ready blocks. Empty array = no commentary text. */
  blocks: TafsirBlock[];
}

/** Whole-surah commentary, keyed by ayah number. */
export type TafsirByAyah = Record<number, TafsirEntry>;

// ── HTML → blocks parser ────────────────────────────────────────────────────
//
// The QDC payload uses a small, predictable HTML subset:
//   <h1>, <h2>           → section headings
//   <p>, <div>           → paragraphs
//   <strong>, <i>, <sup> → inline formatting (we drop the tags, keep text)
//   <span style="...">   → coloured text (we drop styles, keep text)
//   &amp; &quot; &lt;…   → HTML entities (we decode the common ones)
//
// We intentionally do NOT pull in a full HTML parser — this is a hot path
// rendered in a bottom sheet on a mobile device, and the input grammar is
// narrow enough to handle with a small state machine.

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&[a-zA-Z]+;|&#\d+;/g, (m) => ENTITIES[m] ?? m)
    // Numeric entities not in the table — best-effort decode.
    .replace(/&#(\d+);/g, (_, code) => {
      const n = parseInt(code, 10);
      return Number.isFinite(n) ? String.fromCharCode(n) : _;
    });
}

function stripInlineTags(s: string): string {
  // Remove all remaining tags (we've already split on block-level ones).
  return s.replace(/<[^>]+>/g, "");
}

function normalize(s: string): string {
  return decodeEntities(stripInlineTags(s))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse the QDC tafsir HTML payload into block-level segments suitable for
 * React Native rendering. Pure function, no DOM access — works on-device.
 */
export function parseTafsirHtml(html: string): TafsirBlock[] {
  if (!html || typeof html !== "string") return [];
  const blocks: TafsirBlock[] = [];

  // Greedy block extraction: match <h1>…</h1>, <h2>…</h2>, <p>…</p>,
  // <div>…</div> in source order. Anything that falls between blocks is
  // appended to the previous block (or seeded as a paragraph).
  const blockRe = /<(h1|h2|p|div)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null) {
    // Loose text between blocks → treat as a paragraph.
    if (m.index > lastIdx) {
      const between = normalize(html.slice(lastIdx, m.index));
      if (between) blocks.push({ kind: "p", text: between });
    }
    const tag = m[1].toLowerCase();
    const text = normalize(m[2]);
    if (text) {
      if (tag === "h1") blocks.push({ kind: "h1", text });
      else if (tag === "h2") blocks.push({ kind: "h2", text });
      else blocks.push({ kind: "p", text });
    }
    lastIdx = blockRe.lastIndex;
  }
  // Trailing text after the last block.
  if (lastIdx < html.length) {
    const tail = normalize(html.slice(lastIdx));
    if (tail) blocks.push({ kind: "p", text: tail });
  }

  // If the input had no block-level tags at all, fall back to a single
  // paragraph of the normalised text.
  if (blocks.length === 0) {
    const flat = normalize(html);
    if (flat) blocks.push({ kind: "p", text: flat });
  }

  return blocks;
}

// ── API response shape (loose; we only touch what we need) ──────────────────

interface QdcByChapterResponse {
  tafsirs?: Array<{
    id?: number;
    resource_id?: number;
    verse_key?: string;
    text?: string;
  }>;
}

// ── Fetcher ─────────────────────────────────────────────────────────────────

/**
 * Fetch the entire surah's Ibn Kathir tafsir in one round-trip and return it
 * keyed by ayah number. Throws on network/HTTP/parse errors so the caller
 * can show a graceful "tafsir unavailable" state.
 */
export async function fetchSurahTafsir(
  surah: number,
  signal?: AbortSignal,
): Promise<TafsirByAyah> {
  const res = await fetch(
    `https://api.qurancdn.com/api/qdc/tafsirs/${IBN_KATHIR_RESOURCE_ID}/by_chapter/${surah}?per_page=300`,
    { signal },
  );
  if (!res.ok) {
    throw new Error(`tafsir-http-${res.status}`);
  }
  const json = (await res.json()) as QdcByChapterResponse;
  if (!Array.isArray(json?.tafsirs)) throw new Error("bad-tafsir-response");
  const list = json.tafsirs;
  const byAyah: TafsirByAyah = {};
  for (const item of list) {
    const key = item?.verse_key ?? "";
    const ayah = parseAyahFromKey(key, surah);
    if (ayah == null) continue;
    byAyah[ayah] = {
      verseKey: key,
      blocks: parseTafsirHtml(item?.text ?? ""),
    };
  }
  return byAyah;
}

function parseAyahFromKey(key: string, expectedSurah: number): number | null {
  // Expected format: "{surah}:{ayah}". We tolerate ranges like "1:1-7" by
  // taking the start ayah, but in practice the QDC abridged edition returns
  // one entry per verse so we rarely hit this branch.
  const m = /^(\d+):(\d+)/.exec(key);
  if (!m) return null;
  const s = parseInt(m[1], 10);
  const a = parseInt(m[2], 10);
  if (!Number.isFinite(s) || !Number.isFinite(a)) return null;
  if (s !== expectedSurah) return null;
  return a;
}
