import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
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
import { getIslamicDate } from "@/utils/islamicData";
import { getDailyAyah } from "@/utils/ayahData";
import { getDailyHadith } from "@/utils/hadithData";
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
  const dailyAyah = getDailyAyah();
  const dailyHadith = getDailyHadith();

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
    const h24 = currentTime.getHours();
    const mm = String(currentTime.getMinutes()).padStart(2, "0");
    if (timeFormat === "24h") {
      return `${String(h24).padStart(2, "0")}:${mm}`;
    }
    const period = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 || 12;
    return `${h12}:${mm} ${period}`;
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
              <TouchableOpacity
                onPress={() => router.push("/calendar")}
                activeOpacity={0.7}
                hitSlop={8}
                style={styles.islamicDateBtn}
              >
                <Text style={[styles.islamicDate, { color: colors.gold }]} numberOfLines={1} adjustsFontSizeToFit>
                  {islamicDate.day} {islamicDate.month} {islamicDate.year} AH
                </Text>
                <Feather name="calendar" size={12} color={colors.gold + "90"} style={{ marginLeft: 5, marginTop: 1 }} />
              </TouchableOpacity>
            </View>
            <View style={styles.headerRight}>
              <Text
                style={[styles.currentTime, { color: colors.text }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                allowFontScaling={false}
              >
                {formatCurrentTime()}
              </Text>
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

              // All 6 rows (including Sunrise) get a notification bell.
              // Sunrise opens its own sheet variant (no adhan, minutes-before picker).
              const notifSettings = prayer ? prayerNotifConfig[key as PrayerKey] : null;
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

        {/* ── Verse of the Day Widget ── */}
        <View style={[styles.votdWidget, { backgroundColor: colors.surface, borderColor: colors.tint + "35" }]}>
          {/* Header row: badge + share */}
          <View style={styles.votdHeader}>
            <View style={styles.votdHeaderLeft}>
              <View style={[styles.votdBadge, { backgroundColor: colors.tint + "20", borderColor: colors.tint + "50" }]}>
                <MaterialCommunityIcons name="book-open-variant" size={9} color={colors.tint} />
                <Text style={[styles.votdBadgeText, { color: colors.tint }]}>VERSE OF THE DAY</Text>
              </View>
              <Text style={[styles.votdRef, { color: colors.textSecondary }]}>
                {dailyAyah.surahName} · {dailyAyah.surahNumber}:{dailyAyah.ayahNumber}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                Share.share({
                  message: `${dailyAyah.arabic}\n\n"${dailyAyah.translation}"\n\n— ${dailyAyah.surahName} ${dailyAyah.surahNumber}:${dailyAyah.ayahNumber}\n\nShared from Nuur · نور`,
                })
              }
              hitSlop={12}
              style={[styles.votdShareBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            >
              <Feather name="share-2" size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Arabic hero text */}
          <Text style={[styles.votdArabic, { color: colors.text }]}>{dailyAyah.arabic}</Text>

          {/* Ornamental divider */}
          <View style={styles.votdOrnRow}>
            <View style={[styles.votdOrnLine, { backgroundColor: colors.gold + "35" }]} />
            <Text style={[styles.votdOrnStar, { color: colors.gold + "80" }]}>✦</Text>
            <View style={[styles.votdOrnLine, { backgroundColor: colors.gold + "35" }]} />
          </View>

          {/* Transliteration */}
          <Text style={[styles.votdTranslit, { color: colors.gold }]}>{dailyAyah.transliteration}</Text>

          {/* Translation */}
          <Text style={[styles.votdTranslation, { color: colors.textSecondary }]}>
            "{dailyAyah.translation}"
          </Text>

          {/* Footer: open in Quran */}
          <TouchableOpacity
            style={[styles.votdReadBtn, { borderColor: colors.tint + "40", backgroundColor: colors.tint + "12" }]}
            onPress={() => router.push({ pathname: "/quran/[id]", params: { id: String(dailyAyah.surahNumber) } })}
            activeOpacity={0.75}
          >
            <Feather name="book-open" size={12} color={colors.tint} />
            <Text style={[styles.votdReadText, { color: colors.tint }]}>Read full Surah</Text>
            <Feather name="arrow-right" size={12} color={colors.tint} />
          </TouchableOpacity>
        </View>

        {/* ── Hadith of the Day Widget ── */}
        <View style={[styles.votdWidget, { backgroundColor: colors.surface, borderColor: colors.gold + "40", marginTop: 10 }]}>
          {/* Header row: badge + share */}
          <View style={styles.votdHeader}>
            <View style={styles.votdHeaderLeft}>
              <View style={[styles.votdBadge, { backgroundColor: colors.gold + "20", borderColor: colors.gold + "50" }]}>
                <MaterialCommunityIcons name="star-crescent" size={9} color={colors.gold} />
                <Text style={[styles.votdBadgeText, { color: colors.gold }]}>HADITH OF THE DAY</Text>
              </View>
              <View style={styles.hadithGradeRow}>
                <View style={[styles.hadithGradePill, { backgroundColor: colors.gold + "18", borderColor: colors.gold + "45" }]}>
                  <Text style={[styles.hadithGradeText, { color: colors.gold }]}>{dailyHadith.grade}</Text>
                </View>
                <Text style={[styles.votdRef, { color: colors.textSecondary }]}>{dailyHadith.collection}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                Share.share({
                  message: `${dailyHadith.arabic}\n\n"${dailyHadith.translation}"\n\n— ${dailyHadith.narrator}\n${dailyHadith.source}\n\nShared from Nuur · نور`,
                })
              }
              hitSlop={12}
              style={[styles.votdShareBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            >
              <Feather name="share-2" size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Arabic hero text */}
          <Text style={[styles.votdArabic, { color: colors.text, fontSize: 22, lineHeight: 42 }]}>{dailyHadith.arabic}</Text>

          {/* Ornamental divider */}
          <View style={styles.votdOrnRow}>
            <View style={[styles.votdOrnLine, { backgroundColor: colors.gold + "35" }]} />
            <MaterialCommunityIcons name="star-crescent" size={11} color={colors.gold + "70"} />
            <View style={[styles.votdOrnLine, { backgroundColor: colors.gold + "35" }]} />
          </View>

          {/* Translation */}
          <Text style={[styles.votdTranslation, { color: colors.textSecondary }]}>
            "{dailyHadith.translation}"
          </Text>

          {/* Narrator footer */}
          <View style={[styles.hadithNarratorRow, { borderTopColor: colors.border }]}>
            <Feather name="user" size={11} color={colors.textSecondary} />
            <Text style={[styles.hadithNarratorText, { color: colors.textSecondary }]} numberOfLines={2}>
              {dailyHadith.narrator}
            </Text>
          </View>

          {/* Source pill */}
          <View style={[styles.hadithSourcePill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="book-open-page-variant" size={11} color={colors.textSecondary} />
            <Text style={[styles.hadithSourceText, { color: colors.textSecondary }]} numberOfLines={1}>
              {dailyHadith.source}
            </Text>
          </View>
        </View>

        {/* Wudhu & Prayer Guide */}
        <View style={{ marginTop: 10 }}>
          <GuideSection colors={colors} />
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
  islamicDateBtn: {
    flexDirection: "row",
    alignItems: "center",
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
    width: 110,
  },
  paletteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  currentTime: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    includeFontPadding: false,
    textAlign: "right",
    width: "100%",
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
  // ── Verse of the Day Widget ──────────────────────────────────────────────
  votdWidget: {
    marginHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  votdHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  votdHeaderLeft: {
    gap: 5,
    flex: 1,
  },
  votdBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  votdBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.9,
  },
  votdRef: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 1,
  },
  votdShareBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    flexShrink: 0,
  },
  votdArabic: {
    fontSize: 26,
    textAlign: "center",
    lineHeight: 48,
    writingDirection: "rtl",
    letterSpacing: 0.5,
  },
  votdOrnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  votdOrnLine: {
    flex: 1,
    height: 1,
  },
  votdOrnStar: {
    fontSize: 12,
  },
  votdTranslit: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
    fontStyle: "italic",
  },
  votdTranslation: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlign: "center",
    fontStyle: "italic",
  },
  votdReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 2,
  },
  votdReadText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  // ── Hadith widget extras ──────────────────────────────────────────────────
  hadithGradeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 1,
  },
  hadithGradePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  hadithGradeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  hadithNarratorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  hadithNarratorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 18,
  },
  hadithSourcePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
  },
  hadithSourceText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  // ─────────────────────────────────────────────────────────────────────────

  dailyCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 0,
  },
  dailyAccent: {
    width: 4,
  },
  dailyInner: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  dailyBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dailyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dailyBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  dailyRef: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  dailyArabic: {
    fontSize: 20,
    textAlign: "right",
    lineHeight: 36,
    writingDirection: "rtl",
  },
  dailyTranslation: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    fontStyle: "italic",
  },
  dailySourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    flexWrap: "wrap",
  },
  dailySourceText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  dailySourceBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  dailySourceBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
  },
});
