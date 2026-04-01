import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
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
  CalcMethodId,
  MadhabId,
  HighLatRuleId,
  TimeFormat,
} from "@/utils/prayerTimes";
import { ADHAN_STYLES, AdhanStyle, AdhanMode, ADHAN_MODE_INFO } from "@/utils/adhanData";
import { previewAdhan, stopAdhanAudio } from "@/utils/adhanPlayer";

const isWeb = Platform.OS === "web";
const THEME_ORDER: ThemeName[] = ["emerald", "midnight", "amber", "violet", "rose"];

function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.tint }]}>{title}</Text>
  );
}

function RowSeparator({ colors }: { colors: any }) {
  return <View style={[styles.separator, { backgroundColor: colors.border }]} />;
}

function SegmentControl<T extends string>({
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
    <View style={[styles.segment, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segmentBtn,
              active && { backgroundColor: colors.tint },
              i < options.length - 1 && styles.segmentBtnBorder,
              i < options.length - 1 && { borderRightColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: active ? "#fff" : colors.textSecondary },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
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
    <Pressable onPress={onPress} style={styles.swatchWrapper}>
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
      <View style={[styles.methodSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <View style={[styles.sheetHeaderRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Calculation Method</Text>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: colors.border }]}>
            <Feather name="x" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.methodList}>
          {CALC_METHODS.map((method, i) => {
            const active = method.id === current;
            return (
              <TouchableOpacity
                key={method.id}
                onPress={() => { onSelect(method.id); onClose(); }}
                style={[
                  styles.methodRow, { borderBottomColor: colors.border },
                  i === CALC_METHODS.length - 1 && { borderBottomWidth: 0 },
                  active && { backgroundColor: colors.tint + "14" },
                ]}
              >
                <View style={styles.methodRowLeft}>
                  <Text style={[styles.methodName, { color: active ? colors.tint : colors.text }]}>
                    {method.label}
                  </Text>
                  <Text style={[styles.methodRegion, { color: colors.textSecondary }]}>{method.region}</Text>
                  <Text style={[styles.methodDetail, { color: colors.textSecondary }]}>{method.detail}</Text>
                </View>
                {active ? (
                  <View style={[styles.radioActive, { backgroundColor: colors.tint }]}>
                    <Feather name="check" size={12} color="#fff" />
                  </View>
                ) : (
                  <View style={[styles.radioInactive, { borderColor: colors.border }]} />
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
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const handlePreview = async (style: AdhanStyle) => {
    if (previewingId === style.id) {
      await stopAdhanAudio();
      setPreviewingId(null);
    } else {
      setPreviewingId(style.id);
      await previewAdhan(style.audioUrl);
      setPreviewingId(null);
    }
  };

  const handleClose = async () => {
    await stopAdhanAudio();
    setPreviewingId(null);
    onClose();
  };

  const handleSelect = async (id: string) => {
    await stopAdhanAudio();
    setPreviewingId(null);
    onSelect(id);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalBackdrop} />
      </TouchableWithoutFeedback>
      <View style={[styles.methodSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <View style={[styles.sheetHeaderRow, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Adhan Style</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
              Tap ▶ to preview · Tap row to select
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={[styles.closeBtn, { borderColor: colors.border }]}>
            <Feather name="x" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.methodList}>
          {ADHAN_STYLES.map((style, i) => {
            const active = style.id === current;
            const isPreviewing = previewingId === style.id;
            return (
              <TouchableOpacity
                key={style.id}
                onPress={() => handleSelect(style.id)}
                style={[
                  styles.adhanRow,
                  { borderBottomColor: colors.border },
                  i === ADHAN_STYLES.length - 1 && { borderBottomWidth: 0 },
                  active && { backgroundColor: colors.tint + "12" },
                ]}
              >
                {/* Left: text info */}
                <View style={styles.adhanRowLeft}>
                  <View style={styles.adhanNameRow}>
                    <Text style={[styles.adhanName, { color: active ? colors.tint : colors.text }]}>
                      {style.name}
                    </Text>
                    <Text style={[styles.adhanArabic, { color: colors.gold }]}>
                      {style.arabic}
                    </Text>
                  </View>
                  <Text style={[styles.adhanReciter, { color: colors.textSecondary }]}>
                    {style.reciter}
                  </Text>
                  <View style={styles.adhanLocationRow}>
                    <Feather name="map-pin" size={10} color={colors.textSecondary} />
                    <Text style={[styles.adhanLocation, { color: colors.textSecondary }]}>
                      {style.location}
                    </Text>
                  </View>
                </View>

                {/* Right: preview + radio */}
                <View style={styles.adhanRowRight}>
                  <TouchableOpacity
                    onPress={() => handlePreview(style)}
                    hitSlop={10}
                    style={[
                      styles.previewBtn,
                      {
                        backgroundColor: isPreviewing ? colors.gold + "22" : colors.surfaceElevated,
                        borderColor: isPreviewing ? colors.gold : colors.border,
                      },
                    ]}
                  >
                    <Feather
                      name={isPreviewing ? "square" : "play"}
                      size={12}
                      color={isPreviewing ? colors.gold : colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {active ? (
                    <View style={[styles.radioActive, { backgroundColor: colors.tint }]}>
                      <Feather name="check" size={12} color="#fff" />
                    </View>
                  ) : (
                    <View style={[styles.radioInactive, { borderColor: colors.border }]} />
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
    timeFormat, setTimeFormat,
    notificationsEnabled, toggleNotifications,
    jummahReminderEnabled, jummahMinutesBefore, setJummahReminder,
    adhanEnabled, toggleAdhan,
    adhanStyleId, setAdhanStyleId,
    adhanMode, setAdhanMode,
    adhanCurrentStyle,
  } = useAppContext();

  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showAdhanModal, setShowAdhanModal] = useState(false);

  const currentMethod = CALC_METHODS.find((m) => m.id === calcMethod);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.navigate("/(tabs)/more")} style={styles.backBtn} hitSlop={10}>
          <Feather name="chevron-left" size={24} color={colors.tint} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>نور</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── APPEARANCE ── */}
        <SectionHeader title="APPEARANCE" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="sun" size={16} color={colors.tint} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Display Mode</Text>
            </View>
            <SegmentControl<DisplayMode>
              options={[
                { value: "auto", label: "Auto" },
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
              value={displayMode}
              onChange={setDisplayMode}
              colors={colors}
            />
          </View>

          <RowSeparator colors={colors} />

          <View style={[styles.cardRow, styles.swatchSection]}>
            <View style={styles.rowLeft}>
              <Feather name="droplet" size={16} color={colors.tint} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Accent Colour</Text>
            </View>
            <View style={styles.swatchRow}>
              {THEME_ORDER.map((name) => (
                <ThemeSwatch key={name} name={name} isActive={themeName === name}
                  effectiveDisplayMode={effectiveDisplayMode} onPress={() => setThemeName(name)} />
              ))}
            </View>
          </View>
        </View>

        {/* ── PRAYER TIMES ── */}
        <SectionHeader title="PRAYER TIMES" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.cardRow} onPress={() => setShowMethodModal(true)} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Feather name="clock" size={16} color={colors.tint} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Calculation Method</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]} numberOfLines={1}>
                {currentMethod?.label ?? calcMethod}
              </Text>
              <Feather name="chevron-right" size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <RowSeparator colors={colors} />

          <View style={[styles.cardRow, styles.columnRow]}>
            <View style={[styles.rowLeft, styles.rowLabelFull]}>
              <Feather name="sunset" size={16} color={colors.tint} style={styles.rowIcon} />
              <View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Asr Calculation</Text>
                <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                  {madhab === "Hanafi" ? "Shadow = 2× object (later Asr)" : "Shadow = 1× object (earlier Asr)"}
                </Text>
              </View>
            </View>
            <SegmentControl<MadhabId>
              options={[{ value: "Shafi", label: "Standard" }, { value: "Hanafi", label: "Hanafi" }]}
              value={madhab}
              onChange={setMadhab}
              colors={colors}
            />
          </View>

          <RowSeparator colors={colors} />

          <View style={[styles.cardRow, styles.columnRow]}>
            <View style={[styles.rowLeft, styles.rowLabelFull]}>
              <Feather name="globe" size={16} color={colors.tint} style={styles.rowIcon} />
              <View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>High Latitude Rule</Text>
                <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                  {HIGH_LAT_RULES.find((r) => r.id === highLatRule)?.detail ?? ""}
                </Text>
              </View>
            </View>
            <View style={styles.chipGroup}>
              {HIGH_LAT_RULES.map((rule) => {
                const active = rule.id === highLatRule;
                return (
                  <TouchableOpacity
                    key={rule.id}
                    onPress={() => setHighLatRule(rule.id as HighLatRuleId)}
                    style={[
                      styles.chip,
                      { borderColor: active ? colors.tint : colors.border },
                      active && { backgroundColor: colors.tint + "20" },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? colors.tint : colors.textSecondary }]}>
                      {rule.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── DISPLAY ── */}
        <SectionHeader title="DISPLAY" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="clock" size={16} color={colors.tint} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Time Format</Text>
            </View>
            <SegmentControl<TimeFormat>
              options={[{ value: "12h", label: "12h" }, { value: "24h", label: "24h" }]}
              value={timeFormat}
              onChange={setTimeFormat}
              colors={colors}
            />
          </View>
        </View>

        {/* ── ADHAN ── */}
        <SectionHeader title="ADHAN" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Enable toggle */}
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="volume-2" size={16} color={colors.tint} style={styles.rowIcon} />
              <View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Play Adhan</Text>
                <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                  Plays the call to prayer at each prayer time
                </Text>
              </View>
            </View>
            <Switch
              value={adhanEnabled}
              onValueChange={toggleAdhan}
              trackColor={{ false: colors.border, true: colors.tint + "80" }}
              thumbColor={adhanEnabled ? colors.tint : colors.textSecondary}
            />
          </View>

          <RowSeparator colors={colors} />

          {/* Style picker */}
          <TouchableOpacity
            style={[styles.cardRow, !adhanEnabled && styles.disabledRow]}
            onPress={() => adhanEnabled && setShowAdhanModal(true)}
            activeOpacity={adhanEnabled ? 0.7 : 1}
          >
            <View style={styles.rowLeft}>
              <Feather name="music" size={16} color={adhanEnabled ? colors.tint : colors.textSecondary} style={styles.rowIcon} />
              <View>
                <Text style={[styles.rowLabel, { color: adhanEnabled ? colors.text : colors.textSecondary }]}>
                  Adhan Style
                </Text>
                <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                  {adhanCurrentStyle.reciter}
                </Text>
              </View>
            </View>
            <View style={styles.rowRight}>
              <View style={[styles.adhanStyleChip, { backgroundColor: colors.gold + "18", borderColor: colors.gold + "44" }]}>
                <Text style={[styles.adhanStyleChipText, { color: colors.gold }]}>
                  {adhanCurrentStyle.name}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color={adhanEnabled ? colors.textSecondary : colors.border}
              />
            </View>
          </TouchableOpacity>

          {/* Mode picker */}
          {adhanEnabled && (
            <>
              <RowSeparator colors={colors} />
              <View style={styles.cardRow}>
                <View style={styles.rowLeft}>
                  <Feather name="sliders" size={16} color={colors.tint} style={styles.rowIcon} />
                  <View>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Adhan Mode</Text>
                    <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                      {ADHAN_MODE_INFO[adhanMode].description}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={[styles.modeChipsRow, { borderColor: colors.border }]}>
                {(["full", "short", "silent"] as AdhanMode[]).map((m) => {
                  const active = adhanMode === m;
                  const info = ADHAN_MODE_INFO[m];
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setAdhanMode(m)}
                      style={[
                        styles.modeChip,
                        {
                          backgroundColor: active ? colors.tint + "18" : colors.surfaceElevated,
                          borderColor: active ? colors.tint : colors.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 16 }}>{info.icon}</Text>
                      <Text style={[styles.modeChipLabel, { color: active ? colors.tint : colors.text }]}>
                        {info.label}
                      </Text>
                      <Text style={[styles.modeChipSub, { color: colors.textSecondary }]}>
                        {info.duration}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {adhanMode === "short" && (
                <View style={[styles.adhanInfoRow, { backgroundColor: colors.gold + "0C" }]}>
                  <Feather name="sun" size={12} color={colors.gold} />
                  <Text style={[styles.adhanInfoText, { color: colors.textSecondary }]}>
                    Fajr uses a slightly longer recitation with the Fajr-specific call
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Description */}
          {adhanEnabled && (
            <>
              <RowSeparator colors={colors} />
              <View style={[styles.adhanInfoRow, { backgroundColor: colors.gold + "0C" }]}>
                <Feather name="map-pin" size={12} color={colors.gold} />
                <Text style={[styles.adhanInfoText, { color: colors.textSecondary }]}>
                  {adhanCurrentStyle.location} · {adhanCurrentStyle.description}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ── NOTIFICATIONS ── */}
        {!isWeb && (
          <>
            <SectionHeader title="NOTIFICATIONS" colors={colors} />
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardRow}>
                <View style={styles.rowLeft}>
                  <Feather name="bell" size={16} color={colors.tint} style={styles.rowIcon} />
                  <View>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Prayer Alerts</Text>
                    <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                      Receive a notification at each prayer time
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: colors.border, true: colors.tint + "80" }}
                  thumbColor={notificationsEnabled ? colors.tint : colors.textSecondary}
                />
              </View>

              <RowSeparator colors={colors} />

              {/* Jummah Reminder */}
              <View style={styles.cardRow}>
                <View style={styles.rowLeft}>
                  <MaterialCommunityIcons name="star-crescent" size={16} color={colors.tint} style={styles.rowIcon} />
                  <View>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Jummah Reminder</Text>
                    <Text style={[styles.rowHint, { color: colors.textSecondary }]}>
                      Notify before Friday Dhuhr prayer
                    </Text>
                  </View>
                </View>
                <Switch
                  value={jummahReminderEnabled}
                  onValueChange={(v) => setJummahReminder(v, jummahMinutesBefore)}
                  trackColor={{ false: colors.border, true: colors.tint + "80" }}
                  thumbColor={jummahReminderEnabled ? colors.tint : colors.textSecondary}
                />
              </View>

              {jummahReminderEnabled && (
                <>
                  <RowSeparator colors={colors} />
                  <View style={styles.cardRow}>
                    <View style={styles.rowLeft}>
                      <Feather name="clock" size={16} color={colors.tint} style={styles.rowIcon} />
                      <Text style={[styles.rowLabel, { color: colors.text }]}>Minutes Before</Text>
                    </View>
                    <SegmentControl<string>
                      options={[
                        { value: "15", label: "15 min" },
                        { value: "30", label: "30 min" },
                        { value: "60", label: "60 min" },
                      ]}
                      value={String(jummahMinutesBefore)}
                      onChange={(v) => setJummahReminder(jummahReminderEnabled, Number(v))}
                      colors={colors}
                    />
                  </View>
                </>
              )}
            </View>
          </>
        )}

        {/* ── ABOUT ── */}
        <SectionHeader title="ABOUT" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="moon" size={16} color={colors.tint} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>App</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>Nuur · نور</Text>
          </View>
          <RowSeparator colors={colors} />
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="info" size={16} color={colors.tint} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Version</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>1.0.0</Text>
          </View>
          <RowSeparator colors={colors} />
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="book-open" size={16} color={colors.tint} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Prayer Data</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>adhan.js library</Text>
          </View>
          <RowSeparator colors={colors} />
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Feather name="headphones" size={16} color={colors.tint} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Audio Source</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>verses.quran.com</Text>
          </View>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { alignSelf: "flex-start", marginBottom: 4 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20 },

  sectionHeader: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 4,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    overflow: "hidden",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  columnRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
  },
  swatchSection: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 16,
  },
  disabledRow: { opacity: 0.45 },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  rowLabelFull: { flex: undefined, width: "100%" },
  rowIcon: { width: 20 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  rowHint: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    maxWidth: 160,
    textAlign: "right",
  },
  separator: { height: 1, marginHorizontal: 16 },

  segment: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  segmentBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnBorder: { borderRightWidth: 1 },
  segmentLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  swatchRow: { flexDirection: "row", gap: 12, paddingLeft: 26 },
  swatchWrapper: { alignItems: "center", gap: 6 },
  swatchOuter: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: "transparent",
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  swatchCheck: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  swatchCheckText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  swatchLabel: {
    fontSize: 10, fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase", letterSpacing: 0.4,
  },

  chipGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingLeft: 26 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  adhanStyleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  adhanStyleChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  adhanInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  adhanInfoText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },

  modeChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
  },
  modeChip: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  modeChipLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  modeChipSub: { fontSize: 10, fontFamily: "Inter_400Regular", opacity: 0.8 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  methodSheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    maxHeight: "75%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: "center", marginTop: 10, marginBottom: 4,
  },
  sheetHeaderRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sheetSubtitle: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  methodList: { flex: 1 },
  methodRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, gap: 12,
  },
  methodRowLeft: { flex: 1, gap: 2 },
  methodName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  methodRegion: { fontSize: 12, fontFamily: "Inter_400Regular" },
  methodDetail: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  radioActive: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  radioInactive: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, flexShrink: 0 },

  adhanRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  adhanRowLeft: { flex: 1, gap: 4 },
  adhanNameRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  adhanName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  adhanArabic: { fontSize: 13, fontFamily: "Inter_400Regular" },
  adhanReciter: { fontSize: 12, fontFamily: "Inter_400Regular" },
  adhanLocationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  adhanLocation: { fontSize: 11, fontFamily: "Inter_400Regular" },
  adhanRowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  previewBtn: {
    width: 30, height: 30, borderRadius: 8,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
});
