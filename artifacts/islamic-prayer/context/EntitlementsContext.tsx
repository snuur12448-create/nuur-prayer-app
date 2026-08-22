import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getInstallInfo,
  initializeInstallTracking,
  InstallInfo,
} from "@/services/install";

/**
 * Cutoff date for grandfathered Pro access. Any user whose firstLaunchDate
 * falls BEFORE this date is considered grandfathered and gets Pro features
 * for free once Nuur Pro launches.
 *
 * Set to a far-future placeholder so every install during the pre-Pro era is
 * grandfathered automatically. When Pro launches, change this to the actual
 * launch date (e.g. "2026-09-01T00:00:00.000Z").
 */
export const GRANDFATHER_CUTOFF_DATE = "2099-01-01";

export interface EntitlementsContextValue {
  isPro: boolean;
  isGrandfathered: boolean;
  installInfo: InstallInfo | null;
  isLoading: boolean;
}

const EntitlementsContext = createContext<EntitlementsContextValue | null>(
  null,
);

export { EntitlementsContext };

export function EntitlementsProvider({ children }: { children: ReactNode }) {
  const [installInfo, setInstallInfo] = useState<InstallInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initializeInstallTracking();
      const info = await getInstallInfo();
      if (!cancelled) {
        setInstallInfo(info);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<EntitlementsContextValue>(() => {
    // TODO: Replace with IAP entitlement check when Nuur Pro launches.
    const isPro = false;

    let isGrandfathered = false;
    if (installInfo?.firstLaunchDate) {
      const first = new Date(installInfo.firstLaunchDate).getTime();
      const cutoff = new Date(GRANDFATHER_CUTOFF_DATE).getTime();
      if (Number.isFinite(first) && Number.isFinite(cutoff)) {
        isGrandfathered = first < cutoff;
      }
    }

    return { isPro, isGrandfathered, installInfo, isLoading };
  }, [installInfo, isLoading]);

  return (
    <EntitlementsContext.Provider value={value}>
      {children}
    </EntitlementsContext.Provider>
  );
}
