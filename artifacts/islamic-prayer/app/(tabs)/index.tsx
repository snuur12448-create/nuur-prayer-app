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
import { LocationModal } from "@/components/LocationModal";
import { getIslamicDate, getTodaysReminder } from "@/utils/islamicData";
import { getNextPrayer, getTimeUntilPrayer, PrayerTime, PrayerTimesResult } from "@/utils/prayerTimes";

const PRAYER_ORDER = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;

export default function PrayerScreen() {
  const {
    prayerTimes, location, isLoadingLocation, locationError,
    refreshPrayerTimes, requestLocation, setManualLocation,
    themeColors: colors, notificationsEnabled, toggleNotifications,
  } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [timeUntil, setTimeUntil] = useState<string>("");
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
      const next = getNextPrayer(prayerTimes);
      setNextPrayer(next);
      if (next) {
        setTimeUntil(getTimeUntilPrayer(next));
        const now = Date.now();
        const pList = [prayerTimes.fajr, prayerTimes.dhuhr, prayerTimes.asr, prayerTimes.maghrib, prayerTimes.isha];
        const prev = [...pList].reverse().find((p) => p.time.getTime() <= now);
        if (prev) {
          const total = next.time.getTime() - prev.time.getTime();
          const elapsed = now - prev.time.getTime();
          setProgress(Math.min(1, Math.max(0, elapsed / total)));
        } else {
          setProgress(0);
        }
      }
    }
  }, [prayerTimes, currentTime]);

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
    return nextPrayer?.name.toLowerCase() === prayerName.toLowerCase();
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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
        contentContainerStyle={{ paddingBottom: isWeb ? 34 + 84 : 100 + insets.bottom }}
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
              <View style={styles.timeContainer}>
                <Text style={[styles.currentTime, { color: colors.text }]}>{formatCurrentTime()}</Text>
              </View>
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

          {/* Next Prayer Card */}
          {nextPrayer && (
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
              <View style={styles.nextPrayerTop}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={[styles.nextLabel, { color: colors.textSecondary }]}>Next Prayer</Text>
                  <Text style={[styles.nextPrayerName, { color: colors.text }]} numberOfLines={1}>{nextPrayer.name}</Text>
                  <Text style={[styles.nextPrayerArabic, { color: colors.textSecondary }]}>{nextPrayer.arabicName}</Text>
                </View>
                <View style={styles.nextRight}>
                  <Text style={[styles.nextTime, { color: colors.text }]}>{nextPrayer.timeString}</Text>
                  <View style={[styles.countdownBadge, { backgroundColor: colors.gold + "33", borderColor: colors.gold + "55" }]}>
                    <Text style={[styles.countdown, { color: colors.gold }]}>{timeUntil}</Text>
                  </View>
                </View>
              </View>
              {/* Progress bar */}
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
              </View>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>{Math.round(progress * 100)}% of time elapsed</Text>
            </Animated.View>
          )}
        </View>

        {/* Prayer Times */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Today's Prayer Times
          </Text>

          {isLoadingLocation ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.tint} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Calculating prayer times...
              </Text>
            </View>
          ) : (
            PRAYER_ORDER.map((key) => {
              const prayer = prayerTimes?.[key];
              if (!prayer) return null;
              const isActive = isActivePrayer(prayer.name);
              const isPast = prayer.time < new Date() && !isActive;

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
                      backgroundColor: isActive ? colors.background : isPast ? colors.textSecondary : colors.gold,
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
                        {prayer.name}
                      </Text>
                      <Text style={[styles.prayerArabicSmall, {
                        color: isActive ? colors.background + "CC" : colors.textSecondary,
                      }]}>
                        {prayer.arabicName}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.prayerRight}>
                    {isActive && (
                      <View style={[styles.activeBadge, { backgroundColor: colors.background + "33" }]}>
                        <Text style={[styles.activeBadgeText, { color: colors.background }]}>Next</Text>
                      </View>
                    )}
                    <Text style={[
                      styles.prayerTime,
                      { color: isActive ? colors.background : isPast ? colors.textSecondary : colors.text }
                    ]}>
                      {prayer.timeString}
                    </Text>
                  </View>
                </View>
              );
            })
          )}

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
      </ScrollView>

      <LocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onRequestGps={requestLocation}
        onSelectManual={setManualLocation}
        colors={colors}
        isLoadingGps={isLoadingLocation}
      />
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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
    marginLeft: "auto" as any,
  },
  timeContainer: {
    alignItems: "flex-end",
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
  progressLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
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
    gap: 10,
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
