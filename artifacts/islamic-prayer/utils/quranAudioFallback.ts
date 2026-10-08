import { getVerseAudioUrl, type Reciter } from "./audioData";

/**
 * Return ordered URLs that preserve the user's selected reciter.
 *
 * Most providers expose only one known URL per recording, so inventing a
 * cross-provider mapping could silently play a different reciter. The Islamic
 * Network endpoint explicitly supports bitrate variants for the same edition;
 * those are the only automatic fallbacks we can safely derive.
 */
export function getSameReciterAudioCandidates(
  reciter: Reciter,
  surahNumber: number,
  verseNumber: number,
  globalAyahNumber?: number,
): string[] {
  const primary = getVerseAudioUrl(
    reciter,
    surahNumber,
    verseNumber,
    globalAyahNumber,
  );

  if (reciter.cdnType !== "islamic-network" || !reciter.edition || !globalAyahNumber) {
    return [primary];
  }

  const preferred = reciter.bitrate ?? 128;
  const bitrates = [preferred, 128, 64, 192] as const;
  return Array.from(new Set(bitrates)).map(
    (bitrate) =>
      `https://cdn.islamic.network/quran/audio/${bitrate}/${reciter.edition}/${globalAyahNumber}.mp3`,
  );
}
