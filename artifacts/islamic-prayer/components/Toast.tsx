import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";

export type ToastVariant = "success" | "error" | "info";

export type ToastOptions = {
  variant?: ToastVariant;
  /** Milliseconds visible. Defaults: success/info 2200, error 3200. */
  duration?: number;
};

type ToastApi = {
  show: (message: string, opts?: ToastOptions) => void;
  hide: () => void;
};

const ToastCtx = createContext<ToastApi | null>(null);

/**
 * Lightweight in-app toast — replaces native `Alert.alert` for non-destructive
 * messages (success, info, recoverable error). Anchored just above the tab bar
 * (or safe-area bottom on screens without one), auto-dismisses, never blocks.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.show("Saved to your camera roll", { variant: "success" });
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { themeColors: colors } = useAppContext();

  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<ToastVariant>("info");

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 12,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setMessage(null);
    });
  }, [opacity, translateY]);

  const hide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    animateOut();
  }, [animateOut]);

  const show = useCallback(
    (msg: string, opts?: ToastOptions) => {
      const v = opts?.variant ?? "info";
      const d = opts?.duration ?? (v === "error" ? 3200 : 2200);

      if (hideTimer.current) clearTimeout(hideTimer.current);
      setMessage(msg);
      setVariant(v);

      // Reset values for the new toast, then animate in.
      opacity.setValue(0);
      translateY.setValue(12);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      hideTimer.current = setTimeout(animateOut, d);
    },
    [opacity, translateY, animateOut],
  );

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const api = useMemo<ToastApi>(() => ({ show, hide }), [show, hide]);

  // Anchor above tab bar height (49 iOS / 60 Android / 84 web) + safe area.
  const TAB_H = Platform.OS === "web" ? 84 : Platform.OS === "ios" ? 49 + insets.bottom : 60;
  const bottom = TAB_H + 12;

  const accent =
    variant === "success" ? colors.tint :
    variant === "error" ? colors.red :
    colors.gold;
  const icon: keyof typeof Feather.glyphMap =
    variant === "success" ? "check-circle" :
    variant === "error" ? "alert-circle" :
    "info";

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {message !== null && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            {
              bottom,
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <View
            style={[
              styles.toast,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: accent + "55",
              },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: accent + "22" }]}>
              <Feather name={icon} size={15} color={accent} />
            </View>
            <Text
              style={[styles.text, { color: colors.text }]}
              numberOfLines={3}
            >
              {message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Soft-fail in tests / disconnected components — log instead of throw so a
    // stray usage never crashes the app.
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn("useToast called outside <ToastProvider>");
    }
    return {
      show: () => {},
      hide: () => {},
    };
  }
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 480,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 17,
  },
});
