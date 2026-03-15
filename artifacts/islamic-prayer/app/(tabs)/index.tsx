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
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAppContext } from "@/context/AppContext";
import { getIslamicDate, getTodaysReminder } from "@/utils/islamicData";
import { getNextPrayer, getTimeUntilPrayer, PrayerTime } from "@/utils/prayerTimes";

const PRAYER_ORDER = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;

export default function PrayerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const { prayerTimes, location, isLoadingLocation, locationError, refreshPrayerTimes } = useAppContext();
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [timeUntil, setTimeUntil] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const islamicDate = getIslamicDate();
  const reminder = getTodaysReminder();

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
      if (next) setTimeUntil(getTimeUntilPrayer(next));
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
            <View>
              <Text style={styles.locationLabel}>
                <Feather name="map-pin" size={11} color="rgba(255,255,255,0.6)" />{" "}
                {location?.city || "Locating..."}
              </Text>
              <Text style={[styles.islamicDate, { color: colors.gold }]}>
                {islamicDate.day} {islamicDate.month} {islamicDate.year} AH
              </Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.currentTime}>{formatCurrentTime()}</Text>
            </View>
          </View>

          <Text style={styles.gregorianDate}>{formatDate()}</Text>

          {/* Next Prayer Card */}
          {nextPrayer && (
            <Animated.View style={[styles.nextPrayerCard, { transform: [{ scale: pulseAnim }] }]}>
              <View>
                <Text style={styles.nextLabel}>Next Prayer</Text>
                <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
                <Text style={[styles.nextPrayerArabic]}>{nextPrayer.arabicName}</Text>
              </View>
              <View style={styles.nextRight}>
                <Text style={styles.nextTime}>{nextPrayer.timeString}</Text>
                <View style={styles.countdownBadge}>
                  <Text style={styles.countdown}>{timeUntil}</Text>
                </View>
              </View>
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
                      backgroundColor: isActive ? "#fff" : isPast ? colors.textSecondary : colors.gold,
                    }]} />
                    <View>
                      <Text style={[
                        styles.prayerName,
                        {
                          color: isActive ? "#fff" : isPast ? colors.textSecondary : colors.text,
                          fontFamily: "Inter_600SemiBold",
                        }
                      ]}>
                        {prayer.name}
                      </Text>
                      <Text style={[styles.prayerArabicSmall, {
                        color: isActive ? "rgba(255,255,255,0.7)" : colors.textSecondary,
                      }]}>
                        {prayer.arabicName}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.prayerRight}>
                    {isActive && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Next</Text>
                      </View>
                    )}
                    <Text style={[
                      styles.prayerTime,
                      { color: isActive ? "#fff" : isPast ? colors.textSecondary : colors.text }
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
  locationLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  islamicDate: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  currentTime: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  gregorianDate: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  nextPrayerCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  nextLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  nextPrayerName: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    lineHeight: 28,
  },
  nextPrayerArabic: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    marginTop: 2,
  },
  nextRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  nextTime: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
  },
  countdownBadge: {
    backgroundColor: "rgba(212, 160, 23, 0.3)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(212, 160, 23, 0.5)",
  },
  countdown: {
    color: "#F4C842",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    padding: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
    marginLeft: 4,
  },
  prayerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  prayerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  prayerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  prayerName: {
    fontSize: 16,
  },
  prayerArabicSmall: {
    fontSize: 13,
    marginTop: 1,
  },
  prayerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  activeBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: {
    color: "#fff",
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
