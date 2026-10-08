import { router } from "expo-router";
import Constants from "expo-constants";
import React, { useState, useRef, useCallback, useLayoutEffect } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useAppContext } from "@/context/AppContext";
import { THEMES, ThemeName, DisplayMode } from "@/constants/themes";
import {
  CALC_METHODS,
  HIGH_LAT_RULES,
  POLAR_RESOLUTIONS,
  CalcMethodId,
  MadhabId,
  HighLatRuleId,
  PolarResolutionId,
  TimeFormat,
  PrayerOffsets,
} from "@/utils/prayerTimes";
import { ADHAN_STYLES, AdhanStyle, AdhanMode, ADHAN_MODE_INFO, getAdhanStyle } from "@/utils/adhanData";
import { prefetchAdhanAudio, previewAdhan, stopAdhanAudio } from "@/utils/adhanPlayer";
import {
  ensureAndroidNotificationChannels,
  getNotificationPermissionState,
  readNotificationScheduleStatus,
  resolvePrayerNotificationPresentation,
} from "@/utils/notifications";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
import { CornerFloret, NuurMark } from "@/components/share/ShareDecor";

const isWeb = Platform.OS === "web";
const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const THEME_ORDER: ThemeName[] = ["emerald", "midnight", "gold", "slate", "burgundy"];

/* ============================================================
   Visual primitives — shared with Hadith / Du'a sections
   ============================================================ */

function MushafFrame({
  children,
  color,
  pad = 16,
}: {
  children: React.ReactNode;
  color: string;
  pad?: number;
}) {
  return (
    <View style={[styles.mushafOuter, { borderColor: color + "55" }]}>
      <View style={[styles.mushafInner, { borderColor: color + "22", padding: pad }]}>
        <View style={styles.cornerTL}><CornerFloret size={20} /></View>
        <View style={styles.cornerTR}><CornerFloret size={20} /></View>
        <View style={styles.cornerBL}><CornerFloret size={20} /></View>
        <View style={styles.cornerBR}><CornerFloret size={20} /></View>
        {children}
      </View>
    </View>
  );
}

function SectionDivider({ label, colors }: { label: string; colors: any }) {
  return (
    <View style={styles.sectionDivider}>
      <View style={[styles.dividerRule, { backgroundColor: colors.gold + "55" }]} />
      <Text style={[styles.sectionLabelText, { color: colors.gold }]}>{label}</Text>
      <View style={[styles.dividerRule, { backgroundColor: colors.gold + "55" }]} />
    </View>
  );
}

function GroupCard({ children, colors }: { children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.cardWrap}>
      <View style={[styles.cardRuleTop, { backgroundColor: colors.gold + "55" }]} />
      <View style={[styles.cardRuleBottom, { backgroundColor: colors.gold + "55" }]} />
      <View style={[styles.tickTL, { borderColor: colors.gold }]} />
      <View style={[styles.tickTR, { borderColor: colors.gold }]} />
      <View style={[styles.tickBL, { borderColor: colors.gold }]} />
      <View style={[styles.tickBR, { borderColor: colors.gold }]} />
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
}

function RowSeparator({ colors }: { colors: any }) {
  return <View style={[styles.separator, { backgroundColor: colors.gold + "22" }]} />;
}

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  colors,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  colors: any;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.gold : "transparent",
                borderColor: active ? colors.gold : colors.gold + "44",
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: active ? colors.background : colors.textSecondary },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ThemeSwatch({
  name, isActive, effectiveDisplayMode, onPress,
}: { name: ThemeName; isActive: boolean; effectiveDisplayMode: "dark" | "light"; onPress: () => void }) {
  const theme = THEMES[name];
  const [accent, bg] = theme.swatch;
  const activeBg = effectiveDisplayMode === "light" ? theme.lightColors.background : bg;

  return (
    <Pressable
      onPress={onPress}
      style={styles.swatchWrapper}
      accessibilityRole="button"
      accessibilityLabel={`${theme.label} accent`}
      accessibilityState={{ selected: isActive }}
    >
      <View style={[styles.swatchOuter, isActive && { borderColor: accent, borderWidth: 2 }]}>
        <Svg width={44} height={44}>
          <Defs>
            <RadialGradient id={`sg_${name}`} cx="50%" cy="35%" r="65%">
              <Stop offset="0%" stopColor={accent} stopOpacity="0.85" />
              <Stop offset="100%" stopColor={activeBg} stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Circle cx={22} cy={22} r={22} fill={activeBg} />
          <Circle cx={22} cy={22} r={21} fill={`url(#sg_${name})`} />
          <Circle cx={22} cy={22} r={8} fill={accent} opacity={0.9} />
        </Svg>
        {isActive && (
          <View style={styles.swatchCheck}>
            <Text style={styles.swatchCheckText}>✓</Text>
          </View>
        )}
      </View>
      <Text style={[styles.swatchLabel, { color: isActive ? accent : "rgba(128,128,128,0.7)" }]}>
        {theme.label}
      </Text>
    </Pressable>
  );
}

/* ============================================================
   Modals — Calc method, Adhan style, Time picker
   ============================================================ */

function CalcMethodModal({
  visible, current, onSelect, onClose, colors,
}: {
  visible: boolean; current: CalcMethodId; onSelect: (id: CalcMethodId) => void;
  onClose: () => void; colors: any;
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackdrop} />
      </TouchableWithoutFeedback>
      <View style={[styles.methodSheet, { backgroundColor: colors.surface, borderColor: colors.gold + "55" }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.gold + "44" }]} />
        <View style={styles.sheetHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Calculation Method</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.gold }]}>طريقة الحساب</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: colors.gold + "55" }]}>
            <Feather name="x" size={16} color={colors.gold} />
          </TouchableOpacity>
        </View>
        <View style={[styles.sheetRule, { backgroundColor: colors.gold + "55" }]} />
        <ScrollView showsVerticalScrollIndicator={false} style={styles.methodList}>
          {CALC_METHODS.map((method, i) => {
            const active = method.id === current;
            return (
              <TouchableOpacity
                key={method.id}
                onPress={() => { onSelect(method.id); onClose(); }}
                style={[
                  styles.methodRow,
                  { borderBottomColor: colors.gold + "22" },
                  i === CALC_METHODS.length - 1 && { borderBottomWidth: 0 },
                  active && { backgroundColor: colors.gold + "0E" },
                ]}
              >
                <View style={styles.methodRowLeft}>
                  <Text style={[styles.methodName, { color: active ? colors.gold : colors.text }]}>
                    {method.label}
                  </Text>
                  <Text style={[styles.methodRegion, { color: colors.textSecondary }]}>{method.region}</Text>
                  <Text style={[styles.methodDetail, { color: colors.textSecondary }]}>{method.detail}</Text>
                </View>
                {active ? (
                  <View style={[styles.checkActive, { borderColor: colors.gold, backgroundColor: colors.gold + "1A" }]}>
                    <Feather name="check" size={12} color={colors.gold} />
                  </View>
                ) : (
                  <View style={[styles.radioInactive, { borderColor: colors.gold + "44" }]} />
                )}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function AdhanStyleModal({
  visible, current, onSelect, onClose, colors,
}: {
  visible: boolean; current: string; onSelect: (id: string) => void;
  onClose: () => void; colors: any;
}) {
  // Three-state preview model so the UI never lies:
  //   loadingId  → tap registered, audio is downloading/decoding (spinner)
  //   playingId  → audio is actually emitting sound (stop icon)
  //   neither    → idle (play icon)
  // The previous implementation cleared its single state the moment
  // createAsync resolved, which is BEFORE playback starts. That's why
  // "Makkah seems to work but the others don't" — Makkah was the default
  // selected style so the user heard it from the foreground audio path,
  // while preview taps for the other styles silently failed UI-side.
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [playingId, setPlayingId] = React.useState<string | null>(null);
  const previewTokenRef = React.useRef(0);
  const autoStopTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoStop = React.useCallback(() => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
  }, []);

  const stopPreview = React.useCallback(async () => {
    clearAutoStop();
    previewTokenRef.current += 1; // invalidate any in-flight callbacks
    await stopAdhanAudio();
    setLoadingId(null);
    setPlayingId(null);
  }, [clearAutoStop]);

  const handlePreview = async (style: AdhanStyle) => {
    // Re-tap on the same row → stop.
    if (playingId === style.id || loadingId === style.id) {
      await stopPreview();
      return;
    }

    clearAutoStop();
    const token = ++previewTokenRef.current;
    setLoadingId(style.id);
    setPlayingId(null);

    await previewAdhan(
      style.audioUrl,
      {
        onPlaybackStarted: () => {
          if (previewTokenRef.current !== token) return;
          setLoadingId(null);
          setPlayingId(style.id);
          // Auto-stop after 12 s — long enough to hear the reciter's character
          // (the "Allahu Akbar Allahu Akbar" opening + first phrase) without
          // forcing the user to sit through the full 3-minute call.
          clearAutoStop();
          autoStopTimerRef.current = setTimeout(() => {
            if (previewTokenRef.current !== token) return;
            void stopPreview();
          }, 12_000);
        },
        onFinishOrError: (didError) => {
          if (previewTokenRef.current !== token) return;
          clearAutoStop();
          setLoadingId(null);
          setPlayingId(null);
          if (didError) {
            console.warn(`[AdhanStyleModal] Preview failed for ${style.id}`);
          }
        },
      },
      // Per-reciter intro-skip (e.g. Madinah trims its 6 s buildup).
      style.previewSkipMs ?? 0,
    );
  };

  // Always cut audio + clear timers when the modal goes away.
  React.useEffect(() => {
    if (!visible) void stopPreview();
    return () => { void stopPreview(); };
  }, [visible, stopPreview]);

  // When the modal opens, kick off a background prefetch of every reciter's
  // mp3 so that whichever one the user taps starts playing within ~1 s
  // instead of the 6-8 s cold-network start we saw with Madinah. iOS's URL
  // cache holds the bytes for `cache-control: max-age` (server returns 70
  // days), so this only runs once per session in practice.
  React.useEffect(() => {
    if (!visible) return;
    prefetchAdhanAudio(ADHAN_STYLES.map((s) => s.audioUrl));
  }, [visible]);

  const handleClose = async () => {
    await stopPreview();
    onClose();
  };

  const handleSelect = async (id: string) => {
    await stopPreview();
    onSelect(id);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalBackdrop} />
      </TouchableWithoutFeedback>
      <View style={[styles.methodSheet, { backgroundColor: colors.surface, borderColor: colors.gold + "55" }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.gold + "44" }]} />
        <View style={styles.sheetHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Adhan Style</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.gold }]}>
              Tap ▶ to preview · tap row to select
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={[styles.closeBtn, { borderColor: colors.gold + "55" }]}>
            <Feather name="x" size={16} color={colors.gold} />
          </TouchableOpacity>
        </View>
        <View style={[styles.sheetRule, { backgroundColor: colors.gold + "55" }]} />
        <ScrollView showsVerticalScrollIndicator={false} style={styles.methodList}>
          {ADHAN_STYLES.map((style, i) => {
            const active = style.id === current;
            const isLoading = loadingId === style.id;
            const isPlaying = playingId === style.id;
            const isBusy = isLoading || isPlaying;
            return (
              <TouchableOpacity
                key={style.id}
                onPress={() => handleSelect(style.id)}
                style={[
                  styles.adhanRow,
                  { borderBottomColor: colors.gold + "22" },
                  i === ADHAN_STYLES.length - 1 && { borderBottomWidth: 0 },
                  active && { backgroundColor: colors.gold + "0E" },
                ]}
              >
                <View style={styles.adhanRowLeft}>
                  <View style={styles.adhanNameRow}>
                    <Text style={[styles.adhanName, { color: active ? colors.gold : colors.text }]}>
                      {style.name}
                    </Text>
                    <Text style={[styles.adhanArabic, { color: colors.gold, fontFamily: "AmiriQuran_400Regular" }]}>
                      {style.arabic}
                    </Text>
                  </View>
                  <Text style={[styles.adhanReciter, { color: colors.textSecondary }]}>
                    {style.reciter}
                  </Text>
                  <View style={styles.adhanLocationRow}>
                    <Feather name="map-pin" size={10} color={colors.gold + "AA"} />
                    <Text style={[styles.adhanLocation, { color: colors.textSecondary }]}>
                      {style.location}
                    </Text>
                  </View>
                </View>

                <View style={styles.adhanRowRight}>
                  <TouchableOpacity
                    onPress={() => handlePreview(style)}
                    hitSlop={10}
                    style={[
                      styles.previewBtn,
                      {
                        backgroundColor: isBusy ? colors.gold + "22" : "transparent",
                        borderColor: colors.gold + "55",
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isLoading ? `Loading ${style.name} preview`
                        : isPlaying ? `Stop ${style.name} preview`
                        : `Preview ${style.name}`
                    }
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={colors.gold} />
                    ) : (
                      <Feather
                        name={isPlaying ? "square" : "play"}
                        size={12}
                        color={colors.gold}
                      />
                    )}
                  </TouchableOpacity>

                  {active ? (
                    <View style={[styles.checkActive, { borderColor: colors.gold, backgroundColor: colors.gold + "1A" }]}>
                      <Feather name="check" size={12} color={colors.gold} />
                    </View>
                  ) : (
                    <View style={[styles.radioInactive, { borderColor: colors.gold + "44" }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ── Time Picker ────────────────────────────────────────────── */

const WHEEL_ITEM_H = 46;
const WHEEL_VISIBLE = 5;
const WHEEL_H = WHEEL_ITEM_H * WHEEL_VISIBLE;
const WHEEL_PAD = WHEEL_ITEM_H * Math.floor(WHEEL_VISIBLE / 2);

const HOUR_LABELS = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
const MINUTE_LABELS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function hour24ToWheel(h24: number): { hourIdx: number; isPM: boolean } {
  const isPM = h24 >= 12;
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  const hourIdx = h12 === 12 ? 0 : h12;
  return { hourIdx, isPM };
}

function wheelToHour24(hourIdx: number, isPM: boolean): number {
  const h12 = hourIdx === 0 ? 12 : hourIdx;
  if (isPM) return h12 === 12 ? 12 : h12 + 12;
  return h12 === 12 ? 0 : h12;
}

function WheelPicker({
  items,
  selectedIndex,
  onChangeIndex,
  colors,
  width = 72,
}: {
  items: string[];
  selectedIndex: number;
  onChangeIndex: (i: number) => void;
  colors: any;
  width?: number;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(selectedIndex);

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * WHEEL_ITEM_H, animated: false });
  }, []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const raw = e.nativeEvent.contentOffset.y;
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(raw / WHEEL_ITEM_H)));
      if (idx !== indexRef.current) {
        indexRef.current = idx;
        onChangeIndex(idx);
      }
    },
    [items.length, onChangeIndex],
  );

  return (
    <View style={{ height: WHEEL_H, width, position: "relative", overflow: "hidden" }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: WHEEL_PAD,
          left: 4,
          right: 4,
          height: WHEEL_ITEM_H,
          backgroundColor: colors.gold + "1A",
          borderRadius: 4,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: colors.gold + "88",
        }}
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: WHEEL_PAD }}
        onMomentumScrollEnd={onScroll}
        onScrollEndDrag={onScroll}
      >
        {items.map((label, i) => {
          const active = i === selectedIndex;
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              onPress={() => {
                indexRef.current = i;
                onChangeIndex(i);
                scrollRef.current?.scrollTo({ y: i * WHEEL_ITEM_H, animated: true });
              }}
              style={{ height: WHEEL_ITEM_H, alignItems: "center", justifyContent: "center" }}
            >
              <Text
                style={{
                  fontSize: active ? 22 : 16,
                  fontWeight: active ? "700" : "400",
                  color: active ? colors.gold : colors.textSecondary,
                  opacity: active ? 1 : 0.45,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function TimePickerModal({
  visible,
  title,
  hour24,
  minute,
  onConfirm,
  onClose,
  colors,
}: {
  visible: boolean;
  title: string;
  hour24: number;
  minute: number;
  onConfirm: (h24: number, min: number) => void;
  onClose: () => void;
  colors: any;
}) {
  const init = hour24ToWheel(hour24);
  const [hourIdx, setHourIdx] = useState(init.hourIdx);
  const [minIdx, setMinIdx] = useState(Math.round(minute / 5) % 12);
  const [isPM, setIsPM] = useState(init.isPM);

  const handleConfirm = () => {
    onConfirm(wheelToHour24(hourIdx, isPM), minIdx * 5);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.timeOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.timeSheet, { backgroundColor: colors.surface }]}>
              <MushafFrame color={colors.gold} pad={20}>
                <View style={styles.timeSheetTitleRow}>
                  <View style={[styles.timeRule, { backgroundColor: colors.gold + "55" }]} />
                  <Text style={[styles.timeSheetTitle, { color: colors.gold }]}>
                    {title.toUpperCase()}
                  </Text>
                  <View style={[styles.timeRule, { backgroundColor: colors.gold + "55" }]} />
                </View>

                <View style={styles.timeWheelRow}>
                  <WheelPicker
                    key={visible ? `h${hour24}` : "h-hidden"}
                    items={HOUR_LABELS}
                    selectedIndex={hourIdx}
                    onChangeIndex={setHourIdx}
                    colors={colors}
                  />
                  <Text style={[styles.timeColon, { color: colors.gold }]}>:</Text>
                  <WheelPicker
                    key={visible ? `m${minute}` : "m-hidden"}
                    items={MINUTE_LABELS}
                    selectedIndex={minIdx}
                    onChangeIndex={setMinIdx}
                    colors={colors}
                  />
                </View>

                <View style={styles.ampmRow}>
                  {(["AM", "PM"] as const).map((period) => {
                    const active = isPM === (period === "PM");
                    return (
                      <Pressable
                        key={period}
                        onPress={() => setIsPM(period === "PM")}
                        style={[
                          styles.ampmBtn,
                          {
                            backgroundColor: active ? colors.gold : "transparent",
                            borderColor: active ? colors.gold : colors.gold + "55",
                          },
                        ]}
                      >
                        <Text style={[styles.ampmLabel, { color: active ? colors.background : colors.gold }]}>
                          {period}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  onPress={handleConfirm}
                  style={({ pressed }) => [
                    styles.timeDoneBtn,
                    { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={[styles.timeDoneLabel, { color: colors.background }]}>DONE</Text>
                </Pressable>
              </MushafFrame>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function fmt12h(h24: number, minute: number): string {
  const isPM = h24 >= 12;
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  const mm = String(minute).padStart(2, "0");
  return `${h12}:${mm} ${isPM ? "PM" : "AM"}`;
}

/* ── Privacy pledge row ─────────────────────────────────────
   Stacked icon + title + body inside a GroupCard slot. The body
   text wraps and adds vertical breathing room compared to a
   single-line cardRow. Icon is constrained to Feather glyphs so
   colors stay consistent with the rest of the section.            */

function PledgeRow({
  colors,
  icon,
  title,
  body,
}: {
  colors: any;
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  body: string;
}) {
  return (
    <View style={styles.pledgeRow}>
      <View style={[styles.pledgeIconWrap, { borderColor: colors.gold + "55", backgroundColor: colors.gold + "12" }]}>
        <Feather name={icon} size={14} color={colors.gold} />
      </View>
      <View style={styles.pledgeTextCol}>
        <Text style={[styles.pledgeTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.pledgeBody, { color: colors.textSecondary }]}>{body}</Text>
      </View>
    </View>
  );
}

/* ============================================================
   Settings screen
   ============================================================ */

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const {
    themeColors: colors,
    themeName, setThemeName,
    displayMode, setDisplayMode, effectiveDisplayMode,
    calcMethod, setCalcMethod,
    madhab, setMadhab,
    highLatRule, setHighLatRule,
    polarResolution, setPolarResolution,
    timeFormat, setTimeFormat,
    notificationsEnabled, toggleNotifications,
    prayerPreReminderMinutes, setPrayerPreReminderMinutes,
    jummahReminderEnabled, jummahMinutesBefore, setJummahReminder,
    ayahReminderEnabled, ayahReminderHour, ayahReminderMinute, setAyahReminder,
    hadithReminderEnabled, hadithReminderHour, hadithReminderMinute, setHadithReminder,
    islamicEventsEnabled, setIslamicEventsReminder,
    adhanEnabled, toggleAdhan,
    adhanStyleId, setAdhanStyleId,
    adhanMode, setAdhanMode,
    adhanCurrentStyle,
    prayerOffsets, setPrayerOffsets,
  } = useAppContext();

  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showAdhanModal, setShowAdhanModal] = useState(false);
  const [showAyahTimePicker, setShowAyahTimePicker] = useState(false);
  const [showHadithTimePicker, setShowHadithTimePicker] = useState(false);

  const currentMethod = CALC_METHODS.find((m) => m.id === calcMethod);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.surface,
            borderBottomColor: colors.gold + "55",
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="chevron-left" size={24} color={colors.gold} />
          </Pressable>
          <View style={styles.headerTitles}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
            <Text style={[styles.headerArabic, { color: colors.gold, fontFamily: "AmiriQuran_400Regular" }]}>
              الإعدادات
            </Text>
          </View>
          <View style={[styles.headerBadge, { borderColor: colors.gold, backgroundColor: colors.gold + "1A" }]}>
            <NuurMark size={12} color={colors.gold} />
            <Text style={[styles.headerBadgeText, { color: colors.gold }]}>NUUR</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── APPEARANCE ── */}
        <SectionDivider label="APPEARANCE · المظهر" colors={colors} />
        <GroupCard colors={colors}>
          {/* Display Mode chooser intentionally hidden — Nuur is dark-only for
              the v1 release. The setting, persistence, and theme palettes are
              preserved in code so we can re-introduce light / auto modes
              later without touching context plumbing. */}

          <RowSeparator colors={colors} />

          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="droplet" size={16} color={colors.gold} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Accent Colour</Text>
            </View>
          </View>
          <View style={styles.swatchRow}>
            {THEME_ORDER.map((name) => (
              <ThemeSwatch
                key={name}
                name={name}
                isActive={themeName === name}
                effectiveDisplayMode={effectiveDisplayMode}
                onPress={() => setThemeName(name)}
              />
            ))}
          </View>
        </GroupCard>

        {/* ── PRAYER TIMES ── */}
        <SectionDivider label="PRAYER TIMES · أوقات الصلاة" colors={colors} />
        <GroupCard colors={colors}>
          <TouchableOpacity
            style={styles.cardRow}
            onPress={() => setShowMethodModal(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Change calculation method"
          >
            <View style={styles.rowLeft}>
              <Feather name="clock" size={16} color={colors.gold} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Calculation Method</Text>
            </View>
            <View style={styles.rowRight}>
              <View style={[styles.inkStamp, { borderColor: colors.gold + "66", backgroundColor: colors.gold + "10" }]}>
                <Text style={[styles.inkStampText, { color: colors.gold }]} numberOfLines={1}>
                  {currentMethod?.label ?? calcMethod}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.gold + "AA"} />
            </View>
          </TouchableOpacity>

          <RowSeparator colors={colors} />

          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="sunset" size={16} color={colors.gold} style={styles.rowIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Asr Calculation</Text>
                <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                  {madhab === "Hanafi" ? "Shadow = 2× object (later Asr)" : "Shadow = 1× object (earlier Asr)"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.chipPad}>
            <ChipGroup<MadhabId>
              options={[
                { value: "Shafi", label: "STANDARD" },
                { value: "Hanafi", label: "HANAFI" },
              ]}
              value={madhab}
              onChange={setMadhab}
              colors={colors}
            />
          </View>

          <RowSeparator colors={colors} />

          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="globe" size={16} color={colors.gold} style={styles.rowIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>High Latitude Rule</Text>
                <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                  {HIGH_LAT_RULES.find((r) => r.id === highLatRule)?.detail ?? ""}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.chipPad}>
            <View style={styles.chipRow}>
              {HIGH_LAT_RULES.map((rule) => {
                const active = rule.id === highLatRule;
                return (
                  <Pressable
                    key={rule.id}
                    onPress={() => setHighLatRule(rule.id as HighLatRuleId)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.gold : "transparent",
                        borderColor: active ? colors.gold : colors.gold + "44",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? colors.background : colors.textSecondary },
                      ]}
                    >
                      {rule.label.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <RowSeparator colors={colors} />

          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="compass" size={16} color={colors.gold} style={styles.rowIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Polar Day & Night</Text>
                <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                  {POLAR_RESOLUTIONS.find((r) => r.id === polarResolution)?.detail ?? ""}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.chipPad}>
            <View style={styles.chipRow}>
              {POLAR_RESOLUTIONS.map((resolution) => {
                const active = resolution.id === polarResolution;
                return (
                  <Pressable
                    key={resolution.id}
                    onPress={() => setPolarResolution(resolution.id as PolarResolutionId)}
                    accessibilityRole="button"
                    accessibilityLabel={`Polar fallback: ${resolution.label}`}
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.gold : "transparent",
                        borderColor: active ? colors.gold : colors.gold + "44",
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? colors.background : colors.textSecondary }]}>
                      {resolution.label.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <RowSeparator colors={colors} />

          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="sliders" size={16} color={colors.gold} style={styles.rowIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Prayer Time Adjustments</Text>
                <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                  Fine-tune times ±15 min to match local mosque
                </Text>
              </View>
            </View>
          </View>
          {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as (keyof PrayerOffsets)[]).map((key) => {
            const LABELS: Record<string, string> = {
              fajr: "Fajr", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha",
            };
            const val = prayerOffsets[key];
            const label = val === 0 ? "0 min" : val > 0 ? `+${val} min` : `${val} min`;
            return (
              <View key={key} style={[styles.offsetRow, { borderTopColor: colors.gold + "1A" }]}>
                <Text style={[styles.offsetPrayerLabel, { color: colors.text }]}>{LABELS[key]}</Text>
                <View style={styles.offsetStepper}>
                  <Pressable
                    onPress={() => {
                      const next = Math.max(-15, val - 1);
                      setPrayerOffsets({ ...prayerOffsets, [key]: next });
                    }}
                    style={[styles.offsetBtn, { borderColor: colors.gold + "55" }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Decrease ${LABELS[key]} offset`}
                  >
                    <Feather name="minus" size={14} color={val <= -15 ? colors.gold + "33" : colors.gold} />
                  </Pressable>
                  <Text style={[styles.offsetValue, { color: val === 0 ? colors.textSecondary : colors.gold }]}>
                    {label}
                  </Text>
                  <Pressable
                    onPress={() => {
                      const next = Math.min(15, val + 1);
                      setPrayerOffsets({ ...prayerOffsets, [key]: next });
                    }}
                    style={[styles.offsetBtn, { borderColor: colors.gold + "55" }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Increase ${LABELS[key]} offset`}
                  >
                    <Feather name="plus" size={14} color={val >= 15 ? colors.gold + "33" : colors.gold} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </GroupCard>

        {/* ── DISPLAY ── */}
        <SectionDivider label="DISPLAY · العرض" colors={colors} />
        <GroupCard colors={colors}>
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="clock" size={16} color={colors.gold} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Time Format</Text>
            </View>
            <ChipGroup<TimeFormat>
              options={[{ value: "12h", label: "12H" }, { value: "24h", label: "24H" }]}
              value={timeFormat}
              onChange={setTimeFormat}
              colors={colors}
            />
          </View>
        </GroupCard>

        {/* ── ADHAN ── */}
        <SectionDivider label="ADHAN · الأذان" colors={colors} />
        <GroupCard colors={colors}>
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="volume-2" size={16} color={colors.gold} style={styles.rowIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Adhan at prayer time</Text>
                <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                  Full call to prayer plays for Fajr, Dhuhr, Asr, Maghrib & Isha
                </Text>
              </View>
            </View>
            <Switch
              value={adhanEnabled}
              onValueChange={toggleAdhan}
              trackColor={{ false: colors.gold + "33", true: colors.gold + "AA" }}
              thumbColor={adhanEnabled ? colors.gold : colors.textSecondary}
              ios_backgroundColor={colors.gold + "22"}
            />
          </View>

          <RowSeparator colors={colors} />

          <TouchableOpacity
            style={[styles.cardRow, !adhanEnabled && styles.disabledRow]}
            onPress={() => adhanEnabled && setShowAdhanModal(true)}
            activeOpacity={adhanEnabled ? 0.7 : 1}
            accessibilityRole="button"
            accessibilityLabel="Change adhan style"
          >
            <View style={styles.rowLeft}>
              <Feather name="music" size={16} color={adhanEnabled ? colors.gold : colors.textSecondary} style={styles.rowIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: adhanEnabled ? colors.text : colors.textSecondary }]}>
                  Adhan Style
                </Text>
                <Text style={[styles.rowHint, { color: colors.textSecondary }]} numberOfLines={1}>
                  {adhanCurrentStyle.reciter}
                </Text>
              </View>
            </View>
            <View style={styles.rowRight}>
              <View style={[styles.inkStamp, { borderColor: colors.gold + "66", backgroundColor: colors.gold + "10" }]}>
                <Text style={[styles.inkStampText, { color: colors.gold }]} numberOfLines={1}>
                  {adhanCurrentStyle.name}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color={adhanEnabled ? colors.gold + "AA" : colors.gold + "33"}
              />
            </View>
          </TouchableOpacity>

          {adhanEnabled && (
            <>
              <RowSeparator colors={colors} />
              <View style={styles.cardRow}>
                <View style={styles.rowLeft}>
                  <Feather name="sliders" size={16} color={colors.gold} style={styles.rowIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Adhan Mode</Text>
                    <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                      {ADHAN_MODE_INFO[adhanMode].description}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.modeChipsRow}>
                {(["full", "short", "silent"] as AdhanMode[]).map((m) => {
                  const active = adhanMode === m;
                  const info = ADHAN_MODE_INFO[m];
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setAdhanMode(m)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={[
                        styles.modeChip,
                        {
                          backgroundColor: active ? colors.gold + "12" : "transparent",
                          borderColor: active ? colors.gold : colors.gold + "44",
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 16 }}>{info.icon}</Text>
                      <Text style={[styles.modeChipLabel, { color: active ? colors.gold : colors.text }]}>
                        {info.label.toUpperCase()}
                      </Text>
                      <Text style={[styles.modeChipSub, { color: colors.textSecondary }]}>
                        {info.duration}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {adhanMode === "short" && (
                <View style={[styles.adhanInfoRow, { backgroundColor: colors.gold + "08" }]}>
                  <Feather name="sun" size={12} color={colors.gold} />
                  <Text style={[styles.adhanInfoText, { color: colors.textSecondary }]}>
                    Fajr uses a slightly longer recitation with the Fajr-specific call
                  </Text>
                </View>
              )}

              <RowSeparator colors={colors} />
              <View style={[styles.adhanInfoRow, { backgroundColor: colors.gold + "08" }]}>
                <Feather name="map-pin" size={12} color={colors.gold} />
                <Text style={[styles.adhanInfoText, { color: colors.textSecondary }]}>
                  {adhanCurrentStyle.location} · {adhanCurrentStyle.description}
                </Text>
              </View>
              <View style={[styles.adhanInfoRow, { backgroundColor: colors.gold + "08" }]}>
                <Feather name="info" size={12} color={colors.gold} />
                <Text style={[styles.adhanInfoText, { color: colors.textSecondary }]}>
                  Full adhan plays when the app is open. iOS limits notification sounds to ~30 seconds when your phone is locked.
                </Text>
              </View>
            </>
          )}
        </GroupCard>

        {/* ── NOTIFICATIONS ── */}
        {!isWeb && (
          <>
            <SectionDivider label="NOTIFICATIONS · الإشعارات" colors={colors} />
            <GroupCard colors={colors}>
              <View style={styles.cardRow}>
                <View style={styles.rowLeft}>
                  <Feather name="bell" size={16} color={colors.gold} style={styles.rowIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Prayer Alerts</Text>
                    <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                      Receive a notification at each prayer time
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={() => { void toggleNotifications(); }}
                  trackColor={{ false: colors.gold + "33", true: colors.gold + "AA" }}
                  thumbColor={notificationsEnabled ? colors.gold : colors.textSecondary}
                  ios_backgroundColor={colors.gold + "22"}
                />
              </View>

              <RowSeparator colors={colors} />

              <View style={{ padding: 16, gap: 10 }}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Advance Reminder</Text>
                <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                  Optional preparation reminder, separate from your prayer-time alert. Prayer-time alerts take priority; extra reminders cover a shorter window. Open Nuur regularly to refresh them.
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {([0, 5, 10, 15] as const).map((minutes) => (
                    <Pressable
                      key={minutes}
                      onPress={() => {
                        void setPrayerPreReminderMinutes(minutes).catch(() => {
                          Alert.alert("Couldn't update reminders", "Please try again.");
                        });
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: prayerPreReminderMinutes === minutes }}
                      accessibilityLabel={minutes === 0 ? "Advance reminder off" : `Remind ${minutes} minutes before prayer`}
                      style={{
                        flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center",
                        borderRadius: 10, borderWidth: 1,
                        borderColor: prayerPreReminderMinutes === minutes ? colors.gold : colors.border,
                        backgroundColor: prayerPreReminderMinutes === minutes ? colors.gold + "18" : "transparent",
                      }}
                    >
                      <Text style={{ color: prayerPreReminderMinutes === minutes ? colors.gold : colors.text }}>
                        {minutes === 0 ? "Off" : `${minutes} min`}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <RowSeparator colors={colors} />

              {/* Inspect the actual OS queue, including migrated reminders. */}
              <TouchableOpacity
                style={styles.cardRow}
                onPress={async () => {
                  try {
                    const status = await readNotificationScheduleStatus();
                    if (status.error) throw new Error(status.error);
                    const through = status.scheduledThrough
                      ? new Date(status.scheduledThrough).toLocaleString()
                      : "No prayer-time alerts queued";
                    Alert.alert("Prayer alert status", [
                      `Notifications: ${status.permission === "granted" ? "Allowed" : "Not allowed — check iPhone Settings"}`,
                      `Prayer-time alerts: ${status.actualPrayerCount}`,
                      `Advance reminders: ${status.preReminderCount}`,
                      `Duplicate alerts: ${status.duplicateCount}`,
                      `Last queued prayer: ${through}`,
                      "iOS controls background refresh. Open Nuur regularly to replenish alerts.",
                    ].join("\n\n"));
                  } catch {
                    Alert.alert("Couldn't check alerts", "Please try again. Your existing alert settings have been kept.");
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="Check prayer alerts"
              >
                <View style={styles.rowLeft}>
                  <Feather name="check-circle" size={16} color={colors.gold} style={styles.rowIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Check Prayer Alerts</Text>
                    <Text style={[styles.rowHint, { color: colors.textSecondary }]}>Check queued prayer times and duplicate reminders</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={16} color={colors.gold + "AA"} />
              </TouchableOpacity>
              <RowSeparator colors={colors} />
              <TouchableOpacity
                style={styles.cardRow}
                onPress={async () => {
                  try {
                    const permission = await getNotificationPermissionState();
                    if (permission !== "granted") {
                      Alert.alert(
                        "Permission not granted",
                        "Nuur doesn't have notification permission. Open your device Settings → Notifications → Nuur → Allow Notifications.",
                      );
                      return;
                    }
                    await ensureAndroidNotificationChannels();
                    const presentation = resolvePrayerNotificationPresentation(
                      adhanEnabled ? "adhan" : "notification",
                      adhanMode,
                      adhanStyleId,
                    );
                    await Notifications.scheduleNotificationAsync({
                      identifier: "nuur-test-notification",
                      content: {
                        title: "Nuur · Test Notification",
                        body: "If you hear this, notifications work. Fires in 10 seconds.",
                        sound: presentation.sound,
                        interruptionLevel: "timeSensitive",
                        data: { type: "test" },
                      },
                      trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                        seconds: 10,
                        ...(Platform.OS === "android"
                          ? { channelId: presentation.androidChannelId }
                          : {}),
                      },
                    });
                    Alert.alert(
                      "Test scheduled",
                      "Lock your phone now. The test is scheduled for 10 seconds from now. If it is silent, check Nuur's notification sound permission, volume, Silent Mode and Focus settings.",
                    );
                  } catch (err) {
                    Alert.alert("Test failed", String(err));
                  }
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Send test notification"
              >
                <View style={styles.rowLeft}>
                  <Feather name="zap" size={16} color={colors.gold} style={styles.rowIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Send Test Notification</Text>
                    <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                      Verify notifications + sound work on this device
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={16} color={colors.gold + "AA"} />
              </TouchableOpacity>

              <RowSeparator colors={colors} />

              {/* Jummah */}
              <View style={styles.cardRow}>
                <View style={styles.rowLeft}>
                  <MaterialCommunityIcons name="star-crescent" size={16} color={colors.gold} style={styles.rowIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Jummah Reminder</Text>
                    <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                      Notify before Friday Dhuhr prayer
                    </Text>
                  </View>
                </View>
                <Switch
                  value={jummahReminderEnabled}
                  onValueChange={(v) => setJummahReminder(v, jummahMinutesBefore)}
                  trackColor={{ false: colors.gold + "33", true: colors.gold + "AA" }}
                  thumbColor={jummahReminderEnabled ? colors.gold : colors.textSecondary}
                  ios_backgroundColor={colors.gold + "22"}
                />
              </View>

              {jummahReminderEnabled && (
                <>
                  <RowSeparator colors={colors} />
                  <View style={styles.cardRow}>
                    <View style={styles.rowLeft}>
                      <Feather name="clock" size={16} color={colors.gold} style={styles.rowIcon} />
                      <Text style={[styles.rowLabel, { color: colors.text }]}>Minutes Before</Text>
                    </View>
                    <ChipGroup<string>
                      options={[
                        { value: "15", label: "15M" },
                        { value: "30", label: "30M" },
                        { value: "60", label: "60M" },
                      ]}
                      value={String(jummahMinutesBefore)}
                      onChange={(v) => setJummahReminder(jummahReminderEnabled, Number(v))}
                      colors={colors}
                    />
                  </View>
                </>
              )}

              <RowSeparator colors={colors} />

              {/* Ayah */}
              <View style={styles.cardRow}>
                <View style={styles.rowLeft}>
                  <Feather name="book" size={16} color={colors.gold} style={styles.rowIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Ayah of the Day</Text>
                    <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                      Daily verse reminder
                    </Text>
                  </View>
                </View>
                <Switch
                  value={ayahReminderEnabled}
                  onValueChange={(v) => setAyahReminder(v, ayahReminderHour, ayahReminderMinute)}
                  trackColor={{ false: colors.gold + "33", true: colors.gold + "AA" }}
                  thumbColor={ayahReminderEnabled ? colors.gold : colors.textSecondary}
                  ios_backgroundColor={colors.gold + "22"}
                />
              </View>

              {ayahReminderEnabled && (
                <>
                  <RowSeparator colors={colors} />
                  <View style={styles.cardRow}>
                    <View style={styles.rowLeft}>
                      <Feather name="clock" size={16} color={colors.gold} style={styles.rowIcon} />
                      <Text style={[styles.rowLabel, { color: colors.text }]}>Reminder Time</Text>
                    </View>
                    <Pressable
                      onPress={() => setShowAyahTimePicker(true)}
                      style={[styles.timeChip, { borderColor: colors.gold + "55", backgroundColor: colors.gold + "10" }]}
                      accessibilityRole="button"
                      accessibilityLabel="Change ayah reminder time"
                    >
                      <Text style={[styles.timeChipText, { color: colors.gold }]}>
                        {fmt12h(ayahReminderHour, ayahReminderMinute)}
                      </Text>
                      <Feather name="chevron-right" size={14} color={colors.gold} />
                    </Pressable>
                  </View>
                </>
              )}

              <RowSeparator colors={colors} />

              {/* Hadith */}
              <View style={styles.cardRow}>
                <View style={styles.rowLeft}>
                  <MaterialCommunityIcons name="book-open-variant" size={16} color={colors.gold} style={styles.rowIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Hadith of the Day</Text>
                    <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                      Daily hadith reminder
                    </Text>
                  </View>
                </View>
                <Switch
                  value={hadithReminderEnabled}
                  onValueChange={(v) => setHadithReminder(v, hadithReminderHour, hadithReminderMinute)}
                  trackColor={{ false: colors.gold + "33", true: colors.gold + "AA" }}
                  thumbColor={hadithReminderEnabled ? colors.gold : colors.textSecondary}
                  ios_backgroundColor={colors.gold + "22"}
                />
              </View>

              {hadithReminderEnabled && (
                <>
                  <RowSeparator colors={colors} />
                  <View style={styles.cardRow}>
                    <View style={styles.rowLeft}>
                      <Feather name="clock" size={16} color={colors.gold} style={styles.rowIcon} />
                      <Text style={[styles.rowLabel, { color: colors.text }]}>Reminder Time</Text>
                    </View>
                    <Pressable
                      onPress={() => setShowHadithTimePicker(true)}
                      style={[styles.timeChip, { borderColor: colors.gold + "55", backgroundColor: colors.gold + "10" }]}
                      accessibilityRole="button"
                      accessibilityLabel="Change hadith reminder time"
                    >
                      <Text style={[styles.timeChipText, { color: colors.gold }]}>
                        {fmt12h(hadithReminderHour, hadithReminderMinute)}
                      </Text>
                      <Feather name="chevron-right" size={14} color={colors.gold} />
                    </Pressable>
                  </View>
                </>
              )}

              <RowSeparator colors={colors} />

              {/* Islamic Events */}
              <View style={styles.cardRow}>
                <View style={styles.rowLeft}>
                  <MaterialCommunityIcons name="calendar-star" size={16} color={colors.gold} style={styles.rowIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Islamic Events</Text>
                    <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                      Eid, Ramadan, Laylatul Qadr & more
                    </Text>
                  </View>
                </View>
                <Switch
                  value={islamicEventsEnabled}
                  onValueChange={(v) => setIslamicEventsReminder(v)}
                  trackColor={{ false: colors.gold + "33", true: colors.gold + "AA" }}
                  thumbColor={islamicEventsEnabled ? colors.gold : colors.textSecondary}
                  ios_backgroundColor={colors.gold + "22"}
                />
              </View>

              {islamicEventsEnabled && (
                <>
                  <RowSeparator colors={colors} />
                  <View style={[styles.adhanInfoRow, { backgroundColor: colors.gold + "08" }]}>
                    <MaterialCommunityIcons name="calendar-check" size={12} color={colors.gold} />
                    <Text style={[styles.adhanInfoText, { color: colors.textSecondary }]}>
                      Calculated dates may differ from local moon sightings. Confirm Ramadan, Eid and fasting dates with your local authority. Day-of reminders at 7 am · Eve reminders at 8 pm · Possible Laylatul Qadr nights at 9 pm.
                    </Text>
                  </View>
                </>
              )}
            </GroupCard>
          </>
        )}

        {/* Time Picker Modals */}
        <TimePickerModal
          visible={showAyahTimePicker}
          title="Ayah Reminder Time"
          hour24={ayahReminderHour}
          minute={ayahReminderMinute}
          onConfirm={(h, m) => { setAyahReminder(true, h, m); setShowAyahTimePicker(false); }}
          onClose={() => setShowAyahTimePicker(false)}
          colors={colors}
        />
        <TimePickerModal
          visible={showHadithTimePicker}
          title="Hadith Reminder Time"
          hour24={hadithReminderHour}
          minute={hadithReminderMinute}
          onConfirm={(h, m) => { setHadithReminder(true, h, m); setShowHadithTimePicker(false); }}
          onClose={() => setShowHadithTimePicker(false)}
          colors={colors}
        />

        {/* ── PRIVACY ── */}
        <SectionDivider label="PRIVACY · الخصوصية" colors={colors} />
        <Text style={[styles.privacyIntro, { color: colors.textSecondary }]}>
          Nuur is local-first. Your worship history, bookmarks, and settings are
          stored on this device, and you do not need an account to use the app.
        </Text>
        <GroupCard colors={colors}>
          <PledgeRow
            colors={colors}
            icon="shield"
            title="Your worship data stays local"
            body="Prayer tracking, qadā counts, adhkār progress, bookmarks, and preferences are stored on your device. Nuur does not upload them to an account."
          />
          <RowSeparator colors={colors} />
          <PledgeRow
            colors={colors}
            icon="user-x"
            title="No accounts, no sign-in"
            body="Nuur doesn't ask who you are. There are no profiles to create and nothing to log into."
          />
          <RowSeparator colors={colors} />
          <PledgeRow
            colors={colors}
            icon="eye-off"
            title="No ads or behavioural analytics"
            body="Nuur does not use advertising trackers or behavioural analytics to profile how you worship or use the app."
          />
          <RowSeparator colors={colors} />
          <PledgeRow
            colors={colors}
            icon="download-cloud"
            title="When Nuur connects"
            body="Prayer times and Qibla are calculated on your device. City search uses OpenStreetMap Nominatim; nearby mosques use the Overpass services at overpass-api.de and overpass.kumi.systems. These services receive your search or coordinates and IP address. Apple WeatherKit receives your coordinates for contextual widget verses. Quran, tafsir, recitation and live Nisab services receive your IP address and requested content. Hadith browsing works offline."
          />
          <RowSeparator colors={colors} />
          <PledgeRow
            colors={colors}
            icon="clock"
            title="Widgets and saved prayer times"
            body="Widgets require iOS 17 or later and use your last selected location. Open Nuur after travelling to update it. Prayer schedules are saved ahead; iOS decides when background refresh can run. Open Nuur regularly to renew your widgets and prayer alerts."
          />
        </GroupCard>

        {/* ── ABOUT ── */}
        <SectionDivider label="ABOUT · حول" colors={colors} />
        <GroupCard colors={colors}>
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="moon" size={16} color={colors.gold} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>App</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.gold, fontFamily: "AmiriQuran_400Regular" }]}>
              نور · Nuur
            </Text>
          </View>
          <RowSeparator colors={colors} />
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="info" size={16} color={colors.gold} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Version</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{APP_VERSION}</Text>
          </View>
          <RowSeparator colors={colors} />
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="book-open" size={16} color={colors.gold} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Prayer Data</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>adhan.js library</Text>
          </View>
          <RowSeparator colors={colors} />
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="headphones" size={16} color={colors.gold} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Audio Source</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>verses.quran.com</Text>
          </View>
          <RowSeparator colors={colors} />
          <TouchableOpacity
            style={styles.cardRow}
            activeOpacity={0.6}
            onPress={() =>
              Linking.openURL(
                "https://petalite-quartz-769.notion.site/PRIVACY-POLICY-332facde3948808d9d41f9d3a6af97fb"
              )
            }
            accessibilityRole="link"
            accessibilityLabel="Open privacy policy"
          >
            <View style={styles.rowLeft}>
              <Feather name="shield" size={16} color={colors.gold} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Privacy Policy</Text>
            </View>
            <Feather name="external-link" size={16} color={colors.gold + "AA"} />
          </TouchableOpacity>
        </GroupCard>

        {/* End ornament */}
        <View style={styles.endOrnament}>
          <View style={[styles.endLine, { backgroundColor: colors.gold + "44" }]} />
          <Text style={[styles.endGlyph, { color: colors.gold }]}>﷽</Text>
          <View style={[styles.endLine, { backgroundColor: colors.gold + "44" }]} />
        </View>
      </ScrollView>

      <CalcMethodModal
        visible={showMethodModal}
        current={calcMethod}
        onSelect={setCalcMethod}
        onClose={() => setShowMethodModal(false)}
        colors={colors}
      />

      <AdhanStyleModal
        visible={showAdhanModal}
        current={adhanStyleId}
        onSelect={setAdhanStyleId}
        onClose={() => setShowAdhanModal(false)}
        colors={colors}
      />
    </View>
  );
}

/* ============================================================
   Styles
   ============================================================ */

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitles: { flex: 1 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  headerArabic: { fontSize: 18, marginTop: 2, opacity: 0.95 },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },

  /* Section divider */
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 4,
    paddingTop: 22,
    paddingBottom: 12,
  },
  dividerRule: { flex: 1, height: StyleSheet.hairlineWidth },
  sectionLabelText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },

  /* Mushaf frame */
  mushafOuter: {
    borderWidth: 1.2,
    padding: 4,
    borderRadius: 2,
  },
  mushafInner: {
    borderWidth: 0.6,
    position: "relative",
    overflow: "hidden",
  },
  cornerTL: { position: "absolute", top: -2, left: -2 },
  cornerTR: { position: "absolute", top: -2, right: -2, transform: [{ scaleX: -1 }] },
  cornerBL: { position: "absolute", bottom: -2, left: -2, transform: [{ scaleY: -1 }] },
  cornerBR: { position: "absolute", bottom: -2, right: -2, transform: [{ scaleX: -1 }, { scaleY: -1 }] },

  /* Group card (hairline rules + corner ticks) */
  cardWrap: {
    position: "relative",
    paddingVertical: 4,
  },
  cardRuleTop: { position: "absolute", top: 0, left: 0, right: 0, height: 1 },
  cardRuleBottom: { position: "absolute", bottom: 0, left: 0, right: 0, height: 1 },
  tickTL: { position: "absolute", top: 0, left: 0, width: 8, height: 8, borderLeftWidth: 1, borderTopWidth: 1 },
  tickTR: { position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRightWidth: 1, borderTopWidth: 1 },
  tickBL: { position: "absolute", bottom: 0, left: 0, width: 8, height: 8, borderLeftWidth: 1, borderBottomWidth: 1 },
  tickBR: { position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRightWidth: 1, borderBottomWidth: 1 },
  cardInner: { paddingVertical: 4 },

  /* Rows */
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  disabledRow: { opacity: 0.45 },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  rowIcon: { width: 20 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  rowHint: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    maxWidth: "55%",
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    maxWidth: 180,
    textAlign: "right",
  },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },

  /* Ink stamp (for value chip) */
  inkStamp: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 3,
    borderWidth: 1,
    maxWidth: 180,
  },
  inkStampText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
  },

  /* Chip group (replaces SegmentControl) */
  chipPad: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 2,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },

  /* Theme swatches */
  swatchRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
  },
  swatchWrapper: { alignItems: "center", gap: 6 },
  swatchOuter: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: "transparent",
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  swatchCheck: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  swatchCheckText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  swatchLabel: {
    fontSize: 9, fontFamily: "Inter_700Bold",
    textTransform: "uppercase", letterSpacing: 1.2,
  },

  /* Adhan mode chips */
  modeChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
  },
  modeChip: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  modeChipLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  modeChipSub: { fontSize: 10, fontFamily: "Inter_400Regular", opacity: 0.8 },

  adhanInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 14,
    marginBottom: 10,
    marginTop: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
  },
  adhanInfoText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },

  /* Time chip (selected time on a row) */
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 4,
    borderWidth: 1,
  },
  timeChipText: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.4 },

  /* Offset stepper */
  offsetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  offsetPrayerLabel: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  offsetStepper: { flexDirection: "row", alignItems: "center", gap: 10 },
  offsetBtn: {
    width: 30, height: 30, borderRadius: 4,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  offsetValue: { fontSize: 13, fontFamily: "Inter_700Bold", minWidth: 56, textAlign: "center", letterSpacing: 0.3 },

  /* Modal sheets */
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  methodSheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    maxHeight: "75%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: "center", marginTop: 10, marginBottom: 4,
  },
  sheetHeaderRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12,
    gap: 12,
  },
  sheetTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sheetSubtitle: { fontSize: 12, fontFamily: "AmiriQuran_400Regular", marginTop: 2 },
  sheetRule: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 4,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  methodList: { flex: 1 },
  methodRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, gap: 12,
  },
  methodRowLeft: { flex: 1, gap: 2 },
  methodName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  methodRegion: { fontSize: 12, fontFamily: "Inter_400Regular" },
  methodDetail: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  checkActive: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 1,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  radioInactive: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, flexShrink: 0 },

  /* Adhan modal rows */
  adhanRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  adhanRowLeft: { flex: 1, gap: 4 },
  adhanNameRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  adhanName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  adhanArabic: { fontSize: 14 },
  adhanReciter: { fontSize: 12, fontFamily: "Inter_400Regular" },
  adhanLocationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  adhanLocation: { fontSize: 11, fontFamily: "Inter_400Regular" },
  adhanRowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  previewBtn: {
    width: 30, height: 30, borderRadius: 4,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },

  /* Time picker modal */
  timeOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  timeSheet: {
    width: "100%",
    borderRadius: 4,
  },
  timeSheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  timeRule: { flex: 1, height: StyleSheet.hairlineWidth },
  timeSheetTitle: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    textAlign: "center",
  },
  timeWheelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  timeColon: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  ampmRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  ampmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
  },
  ampmLabel: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  timeDoneBtn: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  timeDoneLabel: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 2 },

  /* End ornament */
  endOrnament: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 24,
    paddingHorizontal: 24,
  },
  endLine: { flex: 1, height: StyleSheet.hairlineWidth },
  endGlyph: { fontSize: 22, fontFamily: "AmiriQuran_400Regular" },

  /* Privacy section */
  privacyIntro: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 18,
    paddingBottom: 14,
    paddingTop: 2,
  },
  pledgeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  pledgeIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  pledgeTextCol: {
    flex: 1,
    gap: 4,
  },
  pledgeTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 19,
  },
  pledgeBody: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },
});
