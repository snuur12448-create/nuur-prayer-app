import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Clipboard from "expo-clipboard";
import {
  Linking,
  Platform,
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
import { usePrayerTracker, TRACKER_PRAYERS, type TrackerPrayerKey } from "@/context/PrayerTrackerContext";
import { LocationModal } from "@/components/LocationModal";
import { PrayerNotifSheet } from "@/components/PrayerNotifSheet";
import { NotifQuickSheet } from "@/components/NotifQuickSheet";
import AyahShareSheet from "@/components/AyahShareSheet";
import { getIslamicDate } from "@/utils/islamicData";
import { getDailyAyah, getNightlyAyah } from "@/utils/ayahData";
import { calculatePrayerTimes, applyPrayerOffsets, getNextPrayer, getTimeUntilPrayer, PrayerTime, PrayerTimesResult } from "@/utils/prayerTimes";
import { PrayerKey } from "@/utils/prayerNotifData";
import { HomeV2 } from "@/components/HomeV2";

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
    prayerTimes, location, isLoadingLocation, locationError, isLocationPermDenied,
    refreshPrayerTimes, requestLocation, setManualLocation,
    themeColors: colors, notificationsEnabled,
    timeFormat, calcMethod, madhab, highLatRule, prayerOffsets,
    prayerNotifConfig, setPrayerNotifSettings, toggleMasterPrayerBell,
    notifSnoozeUntil, prayerPreReminderMinutes,
    calcMethodAutoSetLabel, dismissCalcMethodNotice,
  } = useAppContext();

  // ── Master bell state (5 prayers only, Sunrise excluded) ──────────────────
  const FIVE_PRAYER_KEYS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const allPrayersOn  = FIVE_PRAYER_KEYS.every((k) => prayerNotifConfig[k].enabled);
  const allPrayersOff = FIVE_PRAYER_KEYS.every((k) => !prayerNotifConfig[k].enabled);
  const mixedPrayers  = !allPrayersOn && !allPrayersOff;

  const [notifSheetKey, setNotifSheetKey] = useState<PrayerKey | null>(null);
  const [showQuickSheet, setShowQuickSheet] = useState(false);
  const [showAyahShare, setShowAyahShare] = useState(false);
  const [ayahCopied, setAyahCopied] = useState(false);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const miniPlayerH = useMiniPlayerHeight();
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null);
  const [progressEndPrayer, setProgressEndPrayer] = useState<PrayerTime | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  // Separate fast-tick just for the displayed clock — updates every second so it
  // never lags. currentTime stays on a 60s cycle for prayer-period calculations.
  const [clockNow, setClockNow] = useState(new Date());
  const [showLocationModal, setShowLocationModal] = useState(false);
  const islamicDate = getIslamicDate();

  // Prayer tracker — for the chip strip and the day's record
  const { trackerData, togglePrayer: trackerTogglePrayer } = usePrayerTracker();

  // Night detection drives palette swap and verse-of-the-night rotation.
  // Night = before sunrise OR after maghrib. Falls back to false until
  // prayerTimes resolves so we don't flash to night on first paint.
  const nowMs = currentTime.getTime();
  const isNight =
    !!prayerTimes &&
    (nowMs < prayerTimes.sunrise.time.getTime() || nowMs >= prayerTimes.maghrib.time.getTime());
  const dawnApproaching = currentPrayer?.name?.toLowerCase() === "fajr";

  // Verse swaps to a Verse of the Night during the Maghrib→Sunrise window.
  const dailyAyah = isNight ? getNightlyAyah() : getDailyAyah();

  const handleShareAyah = useCallback(() => setShowAyahShare(true), []);
  const handleReadAyahSurah = useCallback(() => {
    router.push({ pathname: "/quran/[id]", params: { id: String(dailyAyah.surahNumber) } });
  }, [dailyAyah.surahNumber]);
  const handleCopyAyah = useCallback(() => {
    const text = `${dailyAyah.arabic}\n\n"${dailyAyah.translation}"\n\n— ${dailyAyah.surahName} ${dailyAyah.surahNumber}:${dailyAyah.ayahNumber}\n\nNuur · نور`;
    if (Platform.OS === "web") {
      navigator.clipboard?.writeText(text).catch(() => {});
    } else {
      Clipboard.setStringAsync(text).catch(() => {});
    }
    setAyahCopied(true);
    setTimeout(() => setAyahCopied(false), 2000);
  }, [dailyAyah]);


  // Refresh prayer times only when the calendar date changes (i.e. at midnight),
  // not every minute — the calculation for a given day is stable within that day.
  const lastDateRef = useRef(new Date().toDateString());
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const todayStr = now.toDateString();
      if (todayStr !== lastDateRef.current) {
        lastDateRef.current = todayStr;
        refreshPrayerTimes();
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [refreshPrayerTimes]);

  // Fast clock: fire immediately then every second so the display is always current.
  useEffect(() => {
    setClockNow(new Date()); // zero-delay initial sync
    const id = setInterval(() => setClockNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (prayerTimes) {
      const now = Date.now();
      // Include Sunrise so that after 06:28 the active period switches from
      // Fajr to Sunrise (counting down to Dhuhr), not staying on Fajr all morning.
      const pList = [prayerTimes.fajr, prayerTimes.sunrise, prayerTimes.dhuhr, prayerTimes.asr, prayerTimes.maghrib, prayerTimes.isha];

      // Current period = most recently started entry
      const prev = [...pList].reverse().find((p) => p.time.getTime() <= now) ?? null;
      setCurrentPrayer(prev);

      // Next prayer — if all today's prayers are done, fetch tomorrow's Fajr
      let next = getNextPrayer(prayerTimes);
      if (!next && location) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const rawTomorrow = calculatePrayerTimes(
          location.latitude,
          location.longitude,
          location.timezone,
          tomorrow,
          calcMethod,
          madhab,
          highLatRule,
          timeFormat,
        );
        const tomorrowTimes = applyPrayerOffsets(rawTomorrow, prayerOffsets, location.timezone, timeFormat);
        next = tomorrowTimes.fajr;
      }
      setNextPrayer(next);

      if (prev && next) {
        // Fajr's window ends at Sunrise, not at Dhuhr.
        // All other prayers end at the start of the next obligatory prayer.
        const isFajr = prev.name === "Fajr";
        const endPrayer =
          isFajr && prayerTimes.sunrise ? prayerTimes.sunrise : next;
        setProgressEndPrayer(endPrayer);
        setTimeRemaining(getTimeUntilPrayer(endPrayer));
        const total = endPrayer.time.getTime() - prev.time.getTime();
        const elapsed = now - prev.time.getTime();
        setProgress(Math.min(1, Math.max(0, elapsed / total)));
      } else if (next && location) {
        // Before today's Fajr — we're inside the overnight Isha→Fajr window
        // that began with YESTERDAY's Isha. Compute it so the marker
        // correctly tracks progress through the night.
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const rawYesterday = calculatePrayerTimes(
          location.latitude,
          location.longitude,
          location.timezone,
          yesterday,
          calcMethod,
          madhab,
          highLatRule,
          timeFormat,
        );
        const yesterdayTimes = applyPrayerOffsets(rawYesterday, prayerOffsets, location.timezone, timeFormat);
        const ishaPrev = yesterdayTimes.isha;
        // Surface yesterday's Isha as the "current" period so the palette
        // stays night and the Arabic name reads العشاء until Fajr.
        setCurrentPrayer(ishaPrev);
        setProgressEndPrayer(next);
        setTimeRemaining(getTimeUntilPrayer(next));
        const total = next.time.getTime() - ishaPrev.time.getTime();
        const elapsed = now - ishaPrev.time.getTime();
        setProgress(Math.min(1, Math.max(0, elapsed / total)));
      } else if (next) {
        // No location yet — fall back to a static UPCOMING display
        setTimeRemaining(getTimeUntilPrayer(next));
        setProgressEndPrayer(next);
        setProgress(0);
      }
    }
  }, [prayerTimes, currentTime, location, calcMethod, madhab, highLatRule, timeFormat, prayerOffsets]);

  const onRefresh = async () => {
    setRefreshing(true);
    refreshPrayerTimes();
    setTimeout(() => setRefreshing(false), 800);
  };


  // ── Quick action routing ──────────────────────────────────────────────────
  const goQibla = useCallback(() => router.push("/(tabs)/qibla"), []);
  const goQuran = useCallback(() => router.push("/(tabs)/quran"), []);
  const goAdhkar = useCallback(() => router.push("/(tabs)/dua"), []);
  const goTahajjud = useCallback(() => router.push("/sunnah-prayers"), []);
  const goTracker = useCallback(() => router.push("/(tabs)/tracker"), []);
  const goCalendar = useCallback(() => router.push("/calendar"), []);

  // ── Tracker map for the day's record + 5/5 count ──────────────────────────
  const todayKey = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, "0")}-${String(currentTime.getDate()).padStart(2, "0")}`;
  const dayRecord = trackerData[todayKey] || {};
  const prayed: Record<TrackerPrayerKey, boolean> = useMemo(() => ({
    fajr: !!dayRecord.fajr,
    dhuhr: !!dayRecord.dhuhr,
    asr: !!dayRecord.asr,
    maghrib: !!dayRecord.maghrib,
    isha: !!dayRecord.isha,
  }), [dayRecord]);
  const prayedCount = TRACKER_PRAYERS.reduce((n, k) => n + (prayed[k] ? 1 : 0), 0);
  // Track when each prayer was last marked, in-memory only — drives the
  // "prayed Xm ago" sub-label on the NOW card without touching persistence.
  const [lastPrayedAt, setLastPrayedAt] = useState<Partial<Record<TrackerPrayerKey, number>>>({});
  const onTogglePrayed = useCallback((key: TrackerPrayerKey) => {
    // Use the in-memory timestamp itself as the local source of truth so
    // rapid double-taps stay consistent without reading stale `dayRecord`.
    setLastPrayedAt((prev) => ({ ...prev, [key]: prev[key] ? undefined : Date.now() }));
    trackerTogglePrayer(key, todayKey);
  }, [trackerTogglePrayer, todayKey]);
  const curKeyForPrayed = currentPrayer?.name?.toLowerCase() as TrackerPrayerKey | undefined;
  const nowPrayedAtMs = curKeyForPrayed ? lastPrayedAt[curKeyForPrayed] ?? null : null;

  // ── Bell state for the dome's top-bar bell button ─────────────────────────
  const isSnoozed = notifSnoozeUntil > Date.now();
  const hasPreReminder = prayerPreReminderMinutes > 0;
  const off = !notificationsEnabled || allPrayersOff;
  const bell = isWeb
    ? null
    : {
        iconName: (isSnoozed ? "clock" : off ? "bell-off" : "bell") as keyof typeof Feather.glyphMap,
        iconColor: off && !isSnoozed ? colors.textSecondary : isSnoozed ? colors.gold : colors.tint,
        bg: isSnoozed
          ? colors.gold + "26"
          : allPrayersOn
          ? colors.tint + "33"
          : mixedPrayers
          ? colors.tint + "1A"
          : "rgba(0,0,0,0.35)",
        showDot: (mixedPrayers || (hasPreReminder && !isSnoozed && !off)) as boolean,
      };

  const hijriLabel = `${islamicDate.day} ${islamicDate.month.toUpperCase()} · ${islamicDate.year}`;
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  // App-state banners (location-denied / error / auto-method)
  const banners = (
    <>
      {isLocationPermDenied ? (
        <View style={[bannerStyles.deniedCard, { backgroundColor: colors.surface, borderColor: colors.tint + "50" }]}>
          <View style={bannerStyles.deniedCardHeader}>
            <Feather name="map-pin" size={18} color={colors.tint} />
            <Text style={[bannerStyles.deniedCardTitle, { color: colors.text }]}>Location Access Required</Text>
          </View>
          <Text style={[bannerStyles.deniedCardBody, { color: colors.textSecondary }]}>
            Prayer times need your location. Please enable location access for Nuur in your device Settings.
          </Text>
          <TouchableOpacity
            style={[bannerStyles.deniedCardButton, { backgroundColor: colors.tint }]}
            onPress={() => Linking.openSettings()}
            activeOpacity={0.8}
          >
            <Feather name="settings" size={14} color="#fff" />
            <Text style={bannerStyles.deniedCardButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      ) : locationError ? (
        <View style={[bannerStyles.errorBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.textSecondary} />
          <Text style={[bannerStyles.errorText, { color: colors.textSecondary }]}>{locationError}</Text>
        </View>
      ) : null}

      {calcMethodAutoSetLabel && (
        <View style={[bannerStyles.autoMethodBanner, { backgroundColor: colors.tint + "18", borderColor: colors.tint + "45" }]}>
          <View style={bannerStyles.autoMethodBannerLeft}>
            <MaterialCommunityIcons name="map-marker-check" size={15} color={colors.tint} />
            <Text style={[bannerStyles.autoMethodText, { color: colors.text }]}>
              Prayer method set to{" "}
              <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.tint }}>{calcMethodAutoSetLabel}</Text>
              {" "}for your region
            </Text>
          </View>
          <TouchableOpacity onPress={dismissCalcMethodNotice} hitSlop={8}>
            <Feather name="x" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  // Use the fast-tick clock as the live time for the dome's body marker so the
  // sun/moon position and embedded "HH:MM" tick smoothly each second.
  const liveNowMs = clockNow.getTime();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: isWeb ? 34 + 84 : 100 + insets.bottom + miniPlayerH }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
      >
        <HomeV2
          colors={colors}
          topPad={topPad}
          prayerTimes={prayerTimes}
          currentPrayer={currentPrayer}
          nextPrayer={nextPrayer}
          progressEndPrayer={progressEndPrayer}
          progress={progress}
          timeRemaining={timeRemaining}
          nowMs={liveNowMs}
          isNight={isNight}
          locationLabel={location?.city || "Locating..."}
          hijriLabel={hijriLabel}
          prayed={prayed}
          prayedCount={prayedCount}
          nowPrayedAtMs={nowPrayedAtMs}
          ayah={dailyAyah}
          isVerseOfNight={isNight}
          ayahCopied={ayahCopied}
          bell={bell}
          banners={banners}
          onLocationPress={() => setShowLocationModal(true)}
          onCalendarPress={goCalendar}
          onBellPress={isWeb ? undefined : () => setShowQuickSheet(true)}
          onTogglePrayed={onTogglePrayed}
          notifEnabled={{
            fajr: !!prayerNotifConfig.fajr?.enabled,
            dhuhr: !!prayerNotifConfig.dhuhr?.enabled,
            asr: !!prayerNotifConfig.asr?.enabled,
            maghrib: !!prayerNotifConfig.maghrib?.enabled,
            isha: !!prayerNotifConfig.isha?.enabled,
          }}
          onPrayerSettingsPress={isWeb ? undefined : (k) => setNotifSheetKey(k as PrayerKey)}
          onViewTracker={goTracker}
          onCopyAyah={handleCopyAyah}
          onShareAyah={handleShareAyah}
          onReadAyah={handleReadAyahSurah}
          onQibla={goQibla}
          onQuran={goQuran}
          onAdhkar={goAdhkar}
          onTahajjud={goTahajjud}
        />
      </ScrollView>

      <LocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onRequestGps={requestLocation}
        onSelectManual={setManualLocation}
        colors={colors}
        isLoadingGps={isLoadingLocation}
      />

      <NotifQuickSheet
        visible={showQuickSheet}
        onClose={() => setShowQuickSheet(false)}
        nextPrayerTimeMs={nextPrayer?.time?.getTime() ?? null}
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

      <AyahShareSheet
        visible={showAyahShare}
        onClose={() => setShowAyahShare(false)}
        verseNumber={dailyAyah.ayahNumber}
        arabicText={dailyAyah.arabic}
        translation={dailyAyah.translation}
        surahName={dailyAyah.surahName}
        surahEnglish={dailyAyah.surahName}
        surahNumber={dailyAyah.surahNumber}
      />
    </View>
  );
}

// Banner styles (kept here since banners are owned by the screen)
const bannerStyles = StyleSheet.create({
  deniedCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 4,
    gap: 10,
  },
  deniedCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deniedCardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  deniedCardBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  deniedCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  deniedCardButtonText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  autoMethodBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 11,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  autoMethodBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  autoMethodText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 18,
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
});

// Legacy styles (referenced by other tabs via shared utilities) ── retained
// to avoid breaking imports. Not used in this file's render.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _legacyStyles = StyleSheet.create({
  container: { flex: 1 },
});
