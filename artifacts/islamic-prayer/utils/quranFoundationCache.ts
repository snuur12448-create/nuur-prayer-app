import AsyncStorage from "@/utils/AppStorage";

/** Explicit content-only keys: never worship history, bookmarks or verse text. */
export function isLegacyQuranFoundationCacheKey(key: string): boolean {
  return /^nuur_quran_words_v\d+_\d+$/.test(key)
    || /^nuur_tafsir_ibnkathir_v\d+_\d+$/.test(key);
}

/** Call after storage hydration and before mounting readers. Failure is surfaced. */
export async function purgeLegacyQuranFoundationCaches(): Promise<number> {
  const keys = (await AsyncStorage.getAllKeys()).filter(isLegacyQuranFoundationCacheKey);
  if (keys.length > 0) await AsyncStorage.multiRemove(keys);
  return keys.length;
}
