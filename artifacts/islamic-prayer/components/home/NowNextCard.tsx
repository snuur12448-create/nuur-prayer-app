import React, { memo } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { TrackerPrayerKey } from "@/context/PrayerTrackerContext";
import { SERIF, TRACKER_FIVE, type ThemeColors } from "./constants";

export interface NowNextCardProps {
  colors: ThemeColors;
  nowEn: string;
  nowAr: string;
  nowSub: string | null;
  isCurrentTracked: boolean;
  isPrayedNow: boolean;
  onToggleNow: () => void;
  nextLabel: string;
  nextAt: string;
  nextAr: string;
  cd: { h: string; m: string };
  prayed: Record<TrackerPrayerKey, boolean>;
  prayedCount: number;
  onToggleBud: (k: TrackerPrayerKey) => void;
  onViewTracker: () => void;
  prayedAgoIsGold: boolean;
  /** True between midnight and Fajr — taps record against yesterday's date. */
  recordingForYesterday?: boolean;
  /** Short label of the date being recorded for, e.g. "Sat, Mar 14". */
  yesterdayLabel?: string;
}

function NowNextCardInner(props: NowNextCardProps) {
  const {
    colors, nowEn, nowAr, nowSub, isCurrentTracked, isPrayedNow,
    onToggleNow, nextLabel, nextAt, nextAr, cd, prayed, prayedCount,
    onToggleBud, onViewTracker, prayedAgoIsGold,
    recordingForYesterday, yesterdayLabel,
  } = props;

  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
      <View style={[styles.nowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Soft gold corner glow */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -50,
            top: -50,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: colors.gold + "22",
            opacity: 0.6,
          }}
        />

        {/* NOW row */}
        <View style={styles.nowRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.nowEyebrow, { color: colors.gold }]}>● NOW · IN PROGRESS</Text>
            <View style={styles.nowTitleRow}>
              <Text style={[styles.nowTitle, { color: colors.text }]} numberOfLines={1}>
                {nowEn}
              </Text>
              {!!nowAr && (
                <Text style={[styles.nowAr, { color: colors.gold, fontFamily: SERIF }]} numberOfLines={1}>
                  {nowAr}
                </Text>
              )}
            </View>
            {!!nowSub && (
              <Text
                style={[
                  styles.nowSub,
                  { color: prayedAgoIsGold ? colors.gold : colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {nowSub}
              </Text>
            )}
          </View>

          {isCurrentTracked && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onToggleNow}
              style={[
                styles.markBtn,
                isPrayedNow
                  ? { backgroundColor: colors.gold + "26", borderWidth: 1, borderColor: colors.gold + "55" }
                  : { backgroundColor: colors.gold },
              ]}
            >
              <Feather
                name="check"
                size={13}
                color={isPrayedNow ? colors.gold : "#0A1612"}
              />
              <Text
                style={[
                  styles.markBtnText,
                  { color: isPrayedNow ? colors.gold : "#0A1612" },
                ]}
              >
                {isPrayedNow ? "Prayed" : "Mark prayed"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* NEXT row */}
        <View style={styles.nextRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.nextEyebrow, { color: colors.textSecondary }]}>{nextLabel}</Text>
            <View style={styles.nextLineRow}>
              <Text style={[styles.nextAt, { color: colors.textSecondary }]}>at</Text>
              <Text style={[styles.nextTime, { color: colors.text }]}>{nextAt}</Text>
              {!!nextAr && (
                <Text style={[styles.nextAr, { color: colors.textSecondary, fontFamily: SERIF }]}>· {nextAr}</Text>
              )}
            </View>
          </View>
          <View style={styles.cdRow}>
            <Text style={[styles.cdNum, { color: colors.text, fontFamily: SERIF }]}>{cd.h}</Text>
            <Text style={[styles.cdUnit, { color: colors.gold, fontFamily: SERIF }]}>h</Text>
            <Text style={[styles.cdNum, { color: colors.text, fontFamily: SERIF }]}>{cd.m}</Text>
            <Text style={[styles.cdUnit, { color: colors.gold, fontFamily: SERIF }]}>m</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Rosebud "X of 5 today" + View tracker */}
        <View style={styles.rosebudRow}>
          <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
            {TRACKER_FIVE.map((k) => {
              const filled = !!prayed[k];
              return (
                <Pressable
                  key={k}
                  onPress={() => onToggleBud(k)}
                  hitSlop={6}
                  style={[
                    styles.bud,
                    {
                      backgroundColor: filled ? colors.gold : "transparent",
                      borderColor: filled ? colors.gold + "B3" : colors.border,
                    },
                  ]}
                >
                  {filled && <View style={styles.budDot} />}
                </Pressable>
              );
            })}
            <Text
              style={[
                styles.rosebudCount,
                { color: recordingForYesterday ? colors.gold : colors.textSecondary },
              ]}
              numberOfLines={1}
              accessibilityLabel={
                recordingForYesterday && yesterdayLabel
                  ? `${prayedCount} of 5 — recording for ${yesterdayLabel}`
                  : `${prayedCount} of 5 today`
              }
            >
              {recordingForYesterday && yesterdayLabel
                ? `${prayedCount} of 5 · ${yesterdayLabel}`
                : `${prayedCount} of 5 today`}
            </Text>
          </View>
          <TouchableOpacity onPress={onViewTracker} hitSlop={8} activeOpacity={0.7}>
            <Text style={[styles.viewTracker, { color: colors.gold }]}>↗ View tracker</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export const NowNextCard = memo(NowNextCardInner);

const styles = StyleSheet.create({
  nowCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  nowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  nowEyebrow: { fontSize: 9, letterSpacing: 2, fontFamily: "Inter_700Bold" },
  nowTitleRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 4 },
  nowTitle: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  nowAr: { fontSize: 16 },
  nowSub: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  markBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  markBtnText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: 12 },

  nextRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  nextEyebrow: { fontSize: 9, letterSpacing: 2, fontFamily: "Inter_700Bold" },
  nextLineRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 2 },
  nextAt: { fontSize: 11 },
  nextTime: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nextAr: { fontSize: 11 },
  cdRow: { flexDirection: "row", alignItems: "baseline" },
  cdNum: { fontSize: 38, lineHeight: 42, letterSpacing: -1 },
  cdUnit: { fontSize: 22, paddingHorizontal: 2 },

  rosebudRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bud: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1.5,
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  budDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#FFEEC2" },
  rosebudCount: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginLeft: 4 },
  recordingHint: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.4,
    marginLeft: 4,
    marginTop: 2,
    opacity: 0.9,
  },
  viewTracker: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
});
