import type { OnlineWordsResult } from "./quranCache";

export type OnlineContentState<T> =
  | { status: "idle" }
  | { status: "loading"; surahNumber: number }
  | { status: "ready"; surahNumber: number; result: T }
  | { status: "error"; surahNumber: number };

/** A screen-owned request: late cache/network results cannot replace a new surah. */
export function createOnlineContentLoader<T>(
  load: (surahNumber: number, signal: AbortSignal) => Promise<T>,
  onState: (state: OnlineContentState<T>) => void,
  timeoutMs = 20_000,
) {
  let cancelCurrent = () => {};
  return {
    cancel() { cancelCurrent(); },
    start(surahNumber: number) {
      cancelCurrent();
      const controller = new AbortController();
      let active = true;
      const timer = setTimeout(() => {
        if (!active) return;
        active = false;
        controller.abort();
        onState({ status: "error", surahNumber });
      }, timeoutMs);
      cancelCurrent = () => {
        active = false;
        clearTimeout(timer);
        controller.abort();
      };
      onState({ status: "loading", surahNumber });
      Promise.resolve().then(() => {
        if (!active) return;
        return load(surahNumber, controller.signal);
      }).then((result) => {
        if (!active || !result) return;
        active = false;
        clearTimeout(timer);
        onState({ status: "ready", surahNumber, result });
      }).catch(() => {
        if (!active) return;
        active = false;
        clearTimeout(timer);
        onState({ status: "error", surahNumber });
      });
    },
  };
}

export type WordByWordState = OnlineContentState<OnlineWordsResult>;
export const createWordByWordLoader = createOnlineContentLoader<OnlineWordsResult>;
