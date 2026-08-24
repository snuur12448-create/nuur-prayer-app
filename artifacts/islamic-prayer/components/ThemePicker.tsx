import React, { useEffect, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { THEMES, ThemeName } from "@/constants/themes";
import { useAppContext } from "@/context/AppContext";

const THEME_ORDER: ThemeName[] = ["emerald", "midnight", "gold", "slate", "burgundy"];

function ThemeSwatch({
  name,
  isActive,
  onPress,
}: {
  name: ThemeName;
  isActive: boolean;
  onPress: () => void;
}) {
  const theme = THEMES[name];
  const [accent, bg] = theme.swatch;
  const scale = useRef(new Animated.Value(isActive ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.12 : 1,
      useNativeDriver: false,
      friction: 6,
    }).start();
  }, [isActive]);

  return (
    <Pressable onPress={onPress} style={styles.swatchWrapper}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Svg width={54} height={54}>
          <Defs>
            <RadialGradient id={`g_${name}`} cx="50%" cy="35%" r="60%">
              <Stop offset="0%" stopColor={accent} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={bg} stopOpacity="1" />
            </RadialGradient>
          </Defs>
          {/* Background circle */}
          <Circle cx={27} cy={27} r={27} fill={bg} />
          {/* Gradient fill */}
          <Circle cx={27} cy={27} r={26} fill={`url(#g_${name})`} />
          {/* Outer accent ring */}
          <Circle
            cx={27} cy={27} r={26}
            fill="none"
            stroke={accent}
            strokeWidth={isActive ? 3 : 1.5}
            opacity={isActive ? 1 : 0.5}
          />
          {/* Inner mini circle */}
          <Circle cx={27} cy={27} r={10} fill={accent} opacity={0.9} />
          {/* Checkmark when active */}
          {isActive && (
            <>
              <Circle cx={27} cy={27} r={9} fill="rgba(0,0,0,0.4)" />
              {/* Simple check lines */}
              <Svg x={19} y={20} width={16} height={14}>
                <Circle cx={8} cy={7} r={7} fill="none" />
              </Svg>
            </>
          )}
        </Svg>
        {isActive && (
          <View style={styles.checkOverlay}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        )}
      </Animated.View>
      <Text style={[styles.swatchLabel, { color: isActive ? accent : "rgba(255,255,255,0.5)" }]}>
        {theme.label}
      </Text>
    </Pressable>
  );
}

export function ThemePicker({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { themeName, setThemeName, themeColors } = useAppContext();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 220, useNativeDriver: false,
        }),
        Animated.spring(slideAnim, {
          toValue: 0, friction: 8, tension: 65, useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0, duration: 160, useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 300, duration: 180, useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSelect = (name: ThemeName) => {
    setThemeName(name);
  };

  const dismissPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderRelease: (_, g) => {
        if (g.dy > 50 || g.vy > 0.5) onClose();
      },
    })
  ).current;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: themeColors.surface, borderColor: themeColors.border },
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle bar */}
        <Pressable onPress={onClose} hitSlop={16} style={styles.handleArea} {...dismissPan.panHandlers}>
          <View style={[styles.handle, { backgroundColor: themeColors.border }]} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>Choose Theme</Text>
          <Pressable
            onPress={onClose}
            style={[styles.closeBtn, { borderColor: themeColors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Close theme picker"
          >
            <Feather name="x" size={18} color={themeColors.textSecondary} />
          </Pressable>
        </View>

        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Select a colour palette for the app
        </Text>

        {/* Swatches */}
        <View style={styles.swatchRow}>
          {THEME_ORDER.map((name) => (
            <ThemeSwatch
              key={name}
              name={name}
              isActive={themeName === name}
              onPress={() => handleSelect(name)}
            />
          ))}
        </View>

        {/* Preview strip */}
        <View style={[styles.previewStrip, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.border }]}>
          <View style={[styles.previewDot, { backgroundColor: themeColors.tint }]} />
          <View style={[styles.previewDot, { backgroundColor: themeColors.gold, opacity: 0.8 }]} />
          <View style={[styles.previewDot, { backgroundColor: themeColors.tintLight }]} />
          <Text style={[styles.previewLabel, { color: themeColors.textSecondary }]}>
            {THEMES[themeName].label} — active
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handleArea: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
  },
  swatchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  swatchWrapper: {
    alignItems: "center",
    gap: 8,
  },
  checkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  swatchLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  previewStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  previewLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginLeft: 4,
  },
});
