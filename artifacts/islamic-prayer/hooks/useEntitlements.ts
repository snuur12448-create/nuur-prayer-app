import { useContext } from "react";

import {
  EntitlementsContext,
  EntitlementsContextValue,
} from "@/context/EntitlementsContext";

export function useEntitlements(): EntitlementsContextValue {
  const ctx = useContext(EntitlementsContext);
  if (!ctx) {
    throw new Error(
      "useEntitlements must be used within an <EntitlementsProvider>.",
    );
  }
  return ctx;
}
