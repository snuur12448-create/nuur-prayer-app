import AsyncStorage from "@/utils/AppStorage";
import { useCallback, useEffect, useState } from "react";

export function useSavedItems(storageKey: string) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((val) => {
      if (val) {
        try {
          setSavedIds(new Set(JSON.parse(val) as string[]));
        } catch {}
      }
    });
  }, [storageKey]);

  const toggle = useCallback(
    (id: string) => {
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        AsyncStorage.setItem(storageKey, JSON.stringify([...next])).catch(() => {});
        return next;
      });
    },
    [storageKey],
  );

  return { savedIds, toggle };
}
