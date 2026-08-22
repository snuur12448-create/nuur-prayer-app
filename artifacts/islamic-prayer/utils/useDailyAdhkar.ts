import { useCallback, useEffect, useRef, useState } from "react";
import {
  markAdhkarRecited,
  readAdhkarState,
  subscribeToAdhkarUpdates,
  type AdhkarStateNative,
} from "./nuurBridge";

/**
 * Tracks which adhkar IDs the user has marked recited today. State lives in
 * the iOS App Group shared store (key "nuur.adhkarState") so the in-app
 * counter and the home-screen widget stay in sync:
 *
 *  - Reads the current state from the native bridge on mount.
 *  - Subscribes to "NuurAdhkarDidUpdate" so widget taps refresh the UI live
 *    while the app is foregrounded.
 *  - Marks via `markAdhkarRecited` — add-only, idempotent. (The widget can't
 *    un-tap, so the app deliberately doesn't either; keeps both surfaces in
 *    sync. Day rollover is handled by the native store and clears the set.)
 *  - `reset()` performs an optimistic local clear; the next bridge event will
 *    overwrite. There's no native "reset" — by design, a fresh day's empty
 *    state happens via the date check inside Swift's AdhkarStore.
 */
export function useDailyAdhkar() {
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const mountedRef = useRef(true);

  // ---- Initial read + live subscription ----
  useEffect(() => {
    mountedRef.current = true;

    readAdhkarState()
      .then((state) => {
        if (!mountedRef.current) return;
        setDoneIds(new Set(state.recitedIds));
      })
      .catch(() => {});

    const unsubscribe = subscribeToAdhkarUpdates((state: AdhkarStateNative) => {
      if (!mountedRef.current) return;
      setDoneIds(new Set(state.recitedIds));
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  // ---- Mark a dhikr as recited (add-only, idempotent) ----
  const toggle = useCallback((id: string) => {
    // Optimistic local update — bridge event will reconcile.
    setDoneIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    markAdhkarRecited(id).catch(() => {});
  }, []);

  // ---- Local-only reset (native store self-resets on day rollover) ----
  const reset = useCallback(() => {
    setDoneIds(new Set());
  }, []);

  return { doneIds, toggle, reset };
}
