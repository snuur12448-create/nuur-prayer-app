/**
 * usePremium — React hook for the Nuur+ entitlement.
 *
 * Returns `{ isPremium: false }` by default (dormant mode). Once RevenueCat
 * keys are provided and a user purchases, this will flip to `true` and
 * re-render any gated UI.
 *
 * Usage:
 *   const { isPremium, loading } = usePremium();
 *   if (!isPremium) return <PaywallTeaser />;
 */

import { useEffect, useState } from "react";
import {
  addPremiumListener,
  checkPremium,
  isConfigured,
} from "@/utils/iap";

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!isConfigured()) {
      setLoading(false);
      return;
    }

    checkPremium().then((v) => {
      if (mounted) {
        setIsPremium(v);
        setLoading(false);
      }
    });

    const unsubscribe = addPremiumListener((v) => {
      if (mounted) setIsPremium(v);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isPremium, loading };
}
