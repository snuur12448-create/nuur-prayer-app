import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";
import { LocationModal } from "@/components/LocationModal";
import { PrayerNotifSheet } from "@/components/PrayerNotifSheet";
import { getIslamicDate, getTodaysReminder } from "@/utils/islamicData";
import { calculatePrayerTimes, getNextPrayer, getTimeUntilPrayer, PrayerTime, PrayerTimesResult } from "@/utils/prayerTimes";
import { PrayerKey } from "@/utils/prayerNotifData";
import { GuideSection } from "@/components/GuideSection";

const PRAYER_ORDER = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;

// Static fallbacks so prayer-row Text nodes are in the DOM from first render
// (prevents Inter font FOUT when prayerTimes data arrives late)
const PRAYER_STATIC: Record<string, [string, string]> = {
  fajr:    ["Fajr",    "الفجر"],
  sunrise: ["Sunrise", "الشروق"],
  dhuhr:   ["Dhuhr",   "الظهر"],
  asr:     ["Asr",     "العصر"],
  maghrib: ["Maghrib", "المغرب"],
  isha:    ["Isha",    "العشاء"],
};

export default function PrayerScreen() {
  const {
    prayerTimes, location, isLoadingLocation, locationError,
    refreshPrayerTimes, requestLocation, setManualLocation,
    themeColors: colors, notificationsEnabled, toggleNotifications,
    timeFormat, calcMethod, madhab, highLatRule,
    prayerNotifConfig, setPrayerNotifSettings,
  } = useAppContext();

  const [notifSheetKey, setNotifSheetKey] = useState<PrayerKey | null>(null);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const miniPlayerH = useMiniPlayerHeight();
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLocationModal, setShowLocationModal] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const islamicDate = getIslamicDate();
  // Recomputed every minute (currentTime updates) — passes today's Maghrib
  // time so the reminder rolls over at sunset, not midnight.
  const maghribTime = prayerTimes?.maghrib?.time;
  const reminder = getTodaysReminder(maghribTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      refreshPrayerTimes();
    }, 60000);
    return () => clearInterval(timer);
  }, [refreshPrayerTimes]);

  useEffect(() => {
    if (prayerTimes) {
      const now = Date.now();
      const pList = [prayerTimes.fajr, prayerTimes.dhuhr, prayerTimes.asr, prayerTimes.maghrib, prayerTimes.isha];

      // Current prayer = most recently started obligatory prayer
      const prev = [...pList].reverse().find((p) => p.time.getTime() <= now) ?? null;
      setCurrentPrayer(prev);

      // Next prayer — if all today's prayers are done, fetch tomorrow's Fajr
      let next = getNextPrayer(prayerTimes);
      if (!next && location) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowTimes = calculatePrayerTimes(
          location.latitude,
          location.longitude,
          location.timezone,
          tomorrow,
          calcMethod,
          madhab,
          highLatRule,
          timeFormat,
        );
        next = tomorrowTimes.fajr;
      }
      setNextPrayer(next);

      if (prev && next) {
        setTimeRemaining(getTimeUntilPrayer(next));
        const total = next.time.getTime() - prev.time.getTime();
        const elapsed = now - prev.time.getTime();
        setProgress(Math.min(1, Math.max(0, elapsed / total)));
      } else if (next) {
        // Before today's Fajr — nothing has started yet
        setTimeRemaining(getTimeUntilPrayer(next));
        setProgress(0);
      }
    }
  }, [prayerTimes, currentTime, location, calcMethod, madhab, highLatRule, timeFormat]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    refreshPrayerTimes();
    setTimeout(() => setRefreshing(false), 800);
  };

  const isActivePrayer = (prayerName: string) => {
    return currentPrayer?.name.toLowerCase() === prayerName.toLowerCase();
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: timeFormat === "12h",
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: isWeb ? 34 + 84 : 100 + insets.bottom + miniPlayerH }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.prayerCard }]}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <TouchableOpacity
                onPress={() => setShowLocationModal(true)}
                style={styles.locationChip}
                activeOpacity={0.7}
              >
                <Feather name="map-pin" size={11} color={colors.textSecondary} />
                <Text style={[styles.locationLabel, { color: colors.text }]}>
                  {location?.city || "Locating..."}
                </Text>
                <Feather name="chevron-down" size={11} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.islamicDate, { color: colors.gold }]} numberOfLines={1} adjustsFontSizeToFit>
                {islamicDate.day} {islamicDate.month} {islamicDate.year} AH
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={[styles.currentTime, { color: colors.text }]} numberOfLines={1}>{formatCurrentTime()}</Text>
              {!isWeb && (
                <Pressable
                  onPress={toggleNotifications}
                  style={[
                    styles.paletteBtn,
                    { backgroundColor: notificationsEnabled ? colors.tint + "33" : colors.border },
                  ]}
                  hitSlop={10}
                >
                  <Feather
                    name={notificationsEnabled ? "bell" : "bell-off"}
                    size={18}
                    color={notificationsEnabled ? colors.tint : colors.textSecondary}
                  />
                </Pressable>
              )}
            </View>
          </View>

          <Text style={[styles.gregorianDate, { color: colors.textSecondary }]}>{formatDate()}</Text>

          {/* Current / Next Prayer Card
              ALWAYS rendered — never conditionally mounted.
              Text elements with Inter_700Bold exist from first paint so the
              font is already applied before data arrives; updating text content
              never causes a FOUT (Flash Of Unstyled Text) flash. */}
          <Animated.View
            style={[
              styles.nextPrayerCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {!prayerTimes || (!currentPrayer && !nextPrayer) ? (
              /* Skeleton — same font/size as live content, invisible colour */
              <View style={styles.nextPrayerTop}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <View style={styles.nowBadgeRow}>
                    <View style={[styles.nowDot, { backgroundColor: colors.border }]} />
                    <Text style={[styles.nextLabel, { color: colors.border }]}>···</Text>
                  </View>
                  <Text style={[styles.nextPrayerName, { color: colors.border }]}>Prayer</Text>
                  <Text style={[styles.nextPrayerArabic, { color: colors.border }]}>الصلاة</Text>
                </View>
                <View style={styles.nextRight}>
                  <Text style={[styles.nextTime, { color: colors.border }]}>--:--</Text>
                  <View style={[styles.countdownBadge, { backgroundColor: colors.border + "40", borderColor: "transparent" }]}>
                    <Text style={[styles.countdown, { color: colors.border }]}>-h --m</Text>
                  </View>
                </View>
              </View>
            ) : currentPrayer ? (
              <>
                <View style={styles.nextPrayerTop}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={styles.nowBadgeRow}>
                      <View style={[styles.nowDot, { backgroundColor: colors.tint }]} />
                      <Text style={[styles.nextLabel, { color: colors.tint }]}>NOW</Text>
                    </View>
                    <Text style={[styles.nextPrayerName, { color: colors.text }]} numberOfLines={1}>{currentPrayer.name}</Text>
                    <Text style={[styles.nextPrayerArabic, { color: colors.textSecondary }]}>{currentPrayer.arabicName}</Text>
                  </View>
                  <View style={styles.nextRight}>
                    <Text style={[styles.nextTime, { color: colors.text }]}>{currentPrayer.timeString}</Text>
                    <View style={[styles.countdownBadge, { backgroundColor: colors.gold + "33", borderColor: colors.gold + "55" }]}>
                      <Text style={[styles.countdown, { color: colors.gold }]}>{timeRemaining} left</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
                </View>
                <View style={styles.progressFooter}>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>{Math.round(progress * 100)}% elapsed</Text>
                  {nextPrayer && (
                    <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                      Next: {nextPrayer.name} at {nextPrayer.timeString}
                    </Text>
                  )}
                </View>
              </>
            ) : (
              /* Before Fajr — nothing started yet */
              <View style={styles.nextPrayerTop}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={[styles.nextLabel, { color: colors.textSecondary }]}>UPCOMING</Text>
                  <Text style={[styles.nextPrayerName, { color: colors.text }]} numberOfLines={1}>{nextPrayer!.name}</Text>
                  <Text style={[styles.nextPrayerArabic, { color: colors.textSecondary }]}>{nextPrayer!.arabicName}</Text>
                </View>
                <View style={styles.nextRight}>
                  <Text style={[styles.nextTime, { color: colors.text }]}>{nextPrayer!.timeString}</Text>
                  <View style={[styles.countdownBadge, { backgroundColor: colors.gold + "33", borderColor: colors.gold + "55" }]}>
                    <Text style={[styles.countdown, { color: colors.gold }]}>in {timeRemaining}</Text>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Prayer Times */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Today's Prayer Times
          </Text>

          {/* Prayer rows — ALWAYS rendered (no isLoadingLocation guard).
              Rows show "--:--" until prayerTimes arrives so Text nodes with
              Inter_500Medium exist from the very first paint; data updates are
              text-content swaps, not new node insertions → zero font flash. */}
          {PRAYER_ORDER.map((key) => {
              const prayer = prayerTimes?.[key];
              const [fallbackName, fallbackArabic] = PRAYER_STATIC[key];
              const isActive = prayer ? isActivePrayer(prayer.name) : false;
              const isPast = prayer ? (prayer.time < new Date() && !isActive) : false;

              const isBellPrayer = key !== "sunrise";
              const notifSettings = (isBellPrayer && prayer) ? prayerNotifConfig[key as PrayerKey] : null;
              const notifOn = notifSettings?.enabled ?? false;
              const GOLD = colors.gold ?? "#C9933A";

              return (
                <View
                  key={key}
                  style={[
                    styles.prayerRow,
                    {
                      backgroundColor: isActive ? colors.tint : colors.surface,
                      borderColor: isActive ? colors.tint : colors.border,
                    },
                  ]}
                >
                  <View style={styles.prayerLeft}>
                    <View style={[styles.prayerDot, {
                      backgroundColor: isActive ? colors.background : isPast ? colors.textSecondary : GOLD,
                    }]} />
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.prayerName,
                          {
                            color: isActive ? colors.background : isPast ? colors.textSecondary : colors.text,
                            fontFamily: "Inter_600SemiBold",
                          }
                        ]}>
                        {prayer?.name ?? fallbackName}
                      </Text>
                      <Text style={[styles.prayerArabicSmall, {
                        color: isActive ? colors.background + "CC" : colors.textSecondary,
                      }]}>
                        {prayer?.arabicName ?? fallbackArabic}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.prayerRight}>
                    {isActive && (
                      <View style={[styles.activeBadge, { backgroundColor: colors.background + "33" }]}>
                        <Text style={[styles.activeBadgeText, { color: colors.background }]}>Now</Text>
                      </View>
                    )}
                    <Text style={[
                      styles.prayerTime,
                      { color: isActive ? colors.background : isPast ? colors.textSecondary : colors.text }
                    ]}>
                      {prayer?.timeString ?? "--:--"}
                    </Text>
                    {isBellPrayer && (
                      <TouchableOpacity
                        onPress={() => setNotifSheetKey(key as PrayerKey)}
                        hitSlop={10}
                        style={[
                          styles.bellBtn,
                          {
                            backgroundColor: notifOn
                              ? (isActive ? colors.background + "33" : GOLD + "22")
                              : (isActive ? colors.background + "22" : colors.border),
                            borderColor: notifOn
                              ? (isActive ? colors.background + "66" : GOLD + "66")
                              : "transparent",
                          },
                        ]}
                      >
                        <Feather
                          name={notifOn ? "bell" : "bell-off"}
                          size={13}
                          color={
                            notifOn
                              ? (isActive ? colors.background : GOLD)
                              : (isActive ? colors.background + "99" : colors.textSecondary)
                          }
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

          {locationError && (
            <View style={[styles.errorBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Feather name="info" size={14} color={colors.textSecondary} />
              <Text style={[styles.errorText, { color: colors.textSecondary }]}>{locationError}</Text>
            </View>
          )}
        </View>

        {/* Daily Reminder */}
        <View style={[styles.reminderCard, { backgroundColor: colors.surface, borderColor: colors.border, marginHorizontal: 16 }]}>
          <View style={styles.reminderHeader}>
            <MaterialCommunityIcons name="bookmark-outline" size={16} color={colors.gold} />
            <Text style={[styles.reminderLabel, { color: colors.gold }]}>Daily Reminder</Text>
          </View>
          <Text style={[styles.reminderText, { color: colors.text }]}>
            "{reminder.text}"
          </Text>
          <Text style={[styles.reminderSource, { color: colors.textSecondary }]}>
            — {reminder.source}
          </Text>
        </View>

        {/* Wudhu & Prayer Guide */}
        <GuideSection colors={colors} />
      </ScrollView>

      <LocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onRequestGps={requestLocation}
        onSelectManual={setManualLocation}
        colors={colors}
        isLoadingGps={isLoadingLocation}
      />

      {notifSheetKey && prayerTimes?.[notifSheetKey] && (
        <PrayerNotifSheet
          visible={!!notifSheetKey}
          prayerKey={notifSheetKey}
          prayerName={prayerTimes[notifSheetKey]!.name}
          settings={prayerNotifConfig[notifSheetKey]}
          colors={colors}
          onSave={(s) => setPrayerNotifSettings(notifSheetKey, s)}
          onClose={() => setNotifSheetKey(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
    paddingVertical: 2,
    paddingRight: 4,
    alignSelf: "flex-start",
  },
  locationLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  islamicDate: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
    minWidth: 130,
  },
  paletteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  currentTime: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    fontVariant: ["tabular-nums"],
    textAlign: "right",
    includeFontPadding: false,
  },
  gregorianDate: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  nextPrayerCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  nextPrayerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: "rgba(212, 160, 23, 0.85)",
    borderRadius: 2,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  nowBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  nowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  nextLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  nextPrayerName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    lineHeight: 28,
  },
  nextPrayerArabic: {
    fontSize: 16,
    marginTop: 2,
  },
  nextRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  nextTime: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  countdownBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
  },
  countdown: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  section: {
    padding: 14,
    paddingTop: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 2,
  },
  prayerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
  },
  prayerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  prayerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  prayerName: {
    fontSize: 15,
  },
  prayerArabicSmall: {
    fontSize: 12,
    marginTop: 1,
  },
  prayerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bellBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  activeBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  prayerTime: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    fontVariant: ["tabular-nums"],
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  reminderCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  reminderLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  reminderText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
    marginBottom: 8,
    fontStyle: "italic",
  },
  reminderSource: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
