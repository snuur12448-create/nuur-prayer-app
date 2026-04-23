import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { NuurLogo } from "@/components/NuurLogo";
import { useToast } from "@/components/Toast";
import { useAppContext } from "@/context/AppContext";
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";
import {
  TRACKER_PRAYERS,
  countCompleted,
  dateKey,
  usePrayerTracker,
  type TrackerData,
} from "@/context/PrayerTrackerContext";
import { getIslamicDate } from "@/utils/islamicData";
import { getNextPrayer, getTimeUntilPrayer } from "@/utils/prayerTimes";

const LOGO_GOLD = "#C9933A";
const FEEDBACK_EMAIL = "feedback@nuur.app";
const APP_STORE_URL = "https://apps.apple.com/app/id0000000000"; // placeholder until live
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.nuur.islamicprayer";

interface MoreItem {
  label: string;
  arabic: string;
  description: string;
  route: string;
  icon: React.ReactNode;
  accentColor: string;
}

interface Section {
  title: string;
  arabic: string;
  items: MoreItem[];
}

/** Consecutive days back where all 5 prayers were marked. Mirrors tracker.tsx. */
function calcStreak(data: TrackerData): number {
  const today = new Date();
  let streak = 0;
  const todayComplete = countCompleted(data[dateKey(today)] || {}) === 5;
  const startOffset = todayComplete ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = dateKey(d);
    if (countCompleted(data[k] || {}) === 5) streak++;
    else break;
  }
  return streak;
}

export default function MoreScreen() {
  const { themeColors: colors, prayerTimes } = useAppContext();
  const toast = useToast();
  const { trackerData } = usePrayerTracker();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const miniPlayerH = useMiniPlayerHeight();
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  // Tick once a minute so "in 12m" stays fresh.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // ── Today snapshot data ───────────────────────────────────────────────────
  const islamicDate = getIslamicDate();
  const streak = useMemo(() => calcStreak(trackerData), [trackerData]);

  // Islamic-day convention: before today's Fajr, "today" is yesterday.
  const beforeTodayFajr =
    !!prayerTimes && Date.now() < prayerTimes.fajr.time.getTime();
  const trackerDay = useMemo(() => {
    const d = new Date();
    if (beforeTodayFajr) d.setDate(d.getDate() - 1);
    return dateKey(d);
  }, [beforeTodayFajr]);
  const dayRecord = trackerData[trackerDay] || {};
  const prayedFlags = TRACKER_PRAYERS.map((p) => !!dayRecord[p]);
  const prayedCount = prayedFlags.filter(Boolean).length;
  const next = prayerTimes ? getNextPrayer(prayerTimes) : null;
  const nextLabel = next?.name ?? "Fajr";
  const nextIn = next ? getTimeUntilPrayer(next) : "—";

  const todayDate = new Date();
  const weekday = todayDate.toLocaleDateString(undefined, { weekday: "short" });
  const dayMonth = todayDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
  const hijri = `${islamicDate.day} ${islamicDate.month}`;

  // ── My Library counts ─────────────────────────────────────────────────────
  const [libCounts, setLibCounts] = useState<{ hadiths: number; duas: number; mosques: number }>({
    hadiths: 0,
    duas: 0,
    mosques: 0,
  });
  useEffect(() => {
    let cancelled = false;
    const readCount = async (k: string) => {
      const v = await AsyncStorage.getItem(k);
      if (!v) return 0;
      try {
        const arr = JSON.parse(v);
        return Array.isArray(arr) ? arr.length : 0;
      } catch {
        return 0;
      }
    };
    Promise.all([
      readCount("nuur_saved_hadiths"),
      readCount("nuur_saved_duas"),
      readCount("nuur_saved_mosques"),
    ]).then(([h, d, m]) => {
      if (!cancelled) setLibCounts({ hadiths: h, duas: d, mosques: m });
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const savedCount = libCounts.hadiths + libCounts.duas + libCounts.mosques;

  const openLibrary = () => {
    if (savedCount === 0) {
      toast.show(
        "Bookmark a hadith, dua, or mosque and it will appear in your library.",
      );
      return;
    }
    const opts: { text: string; onPress?: () => void; style?: "cancel" }[] = [];
    if (libCounts.hadiths)
      opts.push({
        text: `Hadiths (${libCounts.hadiths})`,
        onPress: () => router.push("/hadiths" as any),
      });
    if (libCounts.duas)
      opts.push({
        text: `Duas (${libCounts.duas})`,
        onPress: () => router.push("/dua" as any),
      });
    if (libCounts.mosques)
      opts.push({
        text: `Mosques (${libCounts.mosques})`,
        onPress: () => router.push("/mosques" as any),
      });
    opts.push({ text: "Cancel", style: "cancel" });
    Alert.alert("My Library", `${savedCount} saved item${savedCount === 1 ? "" : "s"}`, opts);
  };

  // ── Sections ──────────────────────────────────────────────────────────────
  const sections: Section[] = [
    {
      title: "WORSHIP",
      arabic: "العبادة",
      items: [
        {
          label: "Prayer Tracker",
          arabic: "متابعة الصلوات",
          description: "Daily streak, week view and milestones",
          route: "/tracker",
          icon: <Feather name="zap" size={22} color="#F77F2E" />,
          accentColor: "#F77F2E",
        },
        {
          label: "Tasbeeh & Dhikr",
          arabic: "التسبيح",
          description: "Counter with preset phrases and post-prayer guide",
          route: "/tasbeeh",
          icon: <MaterialCommunityIcons name="hands-pray" size={22} color="#80CBC4" />,
          accentColor: "#80CBC4",
        },
        {
          label: "99 Names of Allah",
          arabic: "أسماء الله الحسنى",
          description: "Meanings, transliterations and reflections",
          route: "/names",
          icon: <MaterialCommunityIcons name="star-circle-outline" size={22} color="#B39DDB" />,
          accentColor: "#B39DDB",
        },
      ],
    },
    {
      title: "LEARN",
      arabic: "التعلم",
      items: [
        {
          label: "How to Pray & Wudu",
          arabic: "كيفية الصلاة والوضوء",
          description: "Step-by-step illustrated guide for salah and wudu",
          route: "/guide",
          icon: <MaterialCommunityIcons name="hands-pray" size={22} color="#F5D27A" />,
          accentColor: "#F5D27A",
        },
      ],
    },
    {
      title: "KNOWLEDGE",
      arabic: "المعرفة",
      items: [
        {
          label: "Sahih Hadiths",
          arabic: "الأحاديث الصحيحة",
          description: "Bukhari & Muslim with live Sunnah.com content",
          route: "/hadiths",
          icon: <MaterialCommunityIcons name="book-open-page-variant" size={22} color="#A5D6A7" />,
          accentColor: "#A5D6A7",
        },
        {
          label: "Islamic Calendar",
          arabic: "التقويم الإسلامي",
          description: "Hijri dates, Islamic events, Eid, Ramadan, Laylatul Qadr",
          route: "/calendar",
          icon: <MaterialCommunityIcons name="calendar-month" size={22} color="#C9933A" />,
          accentColor: "#C9933A",
        },
      ],
    },
    {
      title: "DISCOVER",
      arabic: "اكتشف",
      items: [
        {
          label: "Mosque Finder",
          arabic: "المساجد القريبة",
          description: "Nearest mosques with directions, hours & contact",
          route: "/mosques",
          icon: <MaterialCommunityIcons name="mosque" size={22} color="#4DB6AC" />,
          accentColor: "#4DB6AC",
        },
      ],
    },
    {
      title: "APP",
      arabic: "التطبيق",
      items: [
        {
          label: "Settings",
          arabic: "الإعدادات",
          description: "Calculation method, adhan style, theme, time format",
          route: "/settings",
          icon: <Feather name="settings" size={22} color="#90A4AE" />,
          accentColor: "#90A4AE",
        },
      ],
    },
  ];

  // ── Footer actions ────────────────────────────────────────────────────────
  const appVersion =
    (Constants.expoConfig?.version as string | undefined) ?? "1.0.0";

  const handleRate = () => {
    const url = Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
    Linking.openURL(url).catch(() => {});
  };
  const handleShare = async () => {
    try {
      await Share.share({
        message:
          "I'm using Nuur for prayer times, Quran, Qibla and adhkar — beautifully made. Try it: https://nuur.app",
      });
    } catch {}
  };
  const handleFeedback = () => {
    const subject = encodeURIComponent("Nuur feedback");
    const body = encodeURIComponent(
      `\n\n— sent from Nuur v${appVersion} (${Platform.OS})`,
    );
    Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`).catch(
      () => {
        toast.show(`Email us at ${FEEDBACK_EMAIL}`);
      },
    );
  };
  const handleAbout = () => {
    Alert.alert(
      "About Nuur",
      `Nuur · نور\nLight for your daily deen\n\nVersion ${appVersion}\n\nHadith data © sunnah.com\nMosque data © OpenStreetMap contributors\nMade with care.`,
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: topPad + 12,
            paddingBottom: insets.bottom + 100 + miniPlayerH,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo header */}
        <View style={[styles.logoBlock, { borderBottomColor: LOGO_GOLD + "30" }]}>
          <NuurLogo size={48} />
          <View style={styles.logoText}>
            <View style={styles.logoTitleRow}>
              <Text style={styles.logoArabic}>نُور</Text>
              <Text style={styles.logoLatin}>  NUUR</Text>
            </View>
            <Text style={styles.logoTagline}>Light for your daily deen</Text>
          </View>
        </View>

        {/* TODAY snapshot */}
        <View
          style={[
            styles.todayCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.gold + "33",
            },
          ]}
        >
          <View style={styles.todayHeader}>
            <Text style={[styles.todayLabel, { color: colors.gold }]}>
              TODAY · {hijri.toUpperCase()}
            </Text>
            <Text style={[styles.todayDate, { color: colors.textSecondary }]}>
              {weekday} · {dayMonth}
            </Text>
          </View>
          <View style={styles.statRow}>
            {/* Streak */}
            <View
              style={[
                styles.statTile,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.statTitleRow}>
                <MaterialCommunityIcons name="fire" size={13} color="#E8A87C" />
                <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                  STREAK
                </Text>
              </View>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {streak}
                </Text>
                <Text style={[styles.statValueUnit, { color: colors.textSecondary }]}>
                  {streak === 1 ? " day" : " days"}
                </Text>
              </View>
            </View>

            {/* Prayed */}
            <View
              style={[
                styles.statTile,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                PRAYED
              </Text>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValue, { color: colors.gold }]}>
                  {prayedCount}
                </Text>
                <Text style={[styles.statValueUnit, { color: colors.textSecondary }]}>
                  {" "}/ 5
                </Text>
              </View>
              <View style={styles.dotRow}>
                {prayedFlags.map((p, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dotPip,
                      {
                        backgroundColor: p ? colors.gold : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Next */}
            <View
              style={[
                styles.statTile,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                NEXT
              </Text>
              <Text
                style={[styles.statNextName, { color: colors.text }]}
                numberOfLines={1}
              >
                {nextLabel}
              </Text>
              <Text
                style={[styles.statNextIn, { color: "#8BAF8E" }]}
                numberOfLines={1}
              >
                in {nextIn}
              </Text>
            </View>
          </View>
        </View>

        {/* My Library */}
        <Pressable
          onPress={openLibrary}
          accessibilityRole="button"
          accessibilityLabel={`My Library, ${savedCount} saved items`}
          style={({ pressed }) => [
            styles.libraryCard,
            {
              backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
              borderColor: colors.gold + "4D",
            },
          ]}
        >
          <View style={[styles.accentBar, { backgroundColor: colors.gold }]} />
          <View
            style={[
              styles.libIconWrap,
              { backgroundColor: colors.gold + "22" },
            ]}
          >
            <Feather name="bookmark" size={20} color={colors.gold} />
          </View>
          <View style={styles.cardText}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.cardLabel, { color: colors.text }]}>My Library</Text>
              <Text style={[styles.cardArabic, { color: colors.gold }]}>مكتبتي</Text>
            </View>
            <Text
              style={[styles.cardDesc, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {savedCount === 0
                ? "Bookmarks of hadiths, duas and mosques live here"
                : `${savedCount} saved across hadiths, duas & mosques`}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={18}
            color={colors.textSecondary}
            style={styles.chevron}
          />
        </Pressable>

        {/* Sectioned menu */}
        {sections.map((section) => (
          <View key={section.title}>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionLabel, { color: colors.textSecondary }]}
              >
                {section.title} · {section.arabic}
              </Text>
              <View
                style={[
                  styles.sectionRule,
                  { backgroundColor: colors.border },
                ]}
              />
            </View>
            <View>
              {section.items.map((item, idx) => (
                <Pressable
                  key={item.route}
                  onPress={() => router.push(item.route as any)}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  style={({ pressed }) => [
                    styles.card,
                    {
                      backgroundColor: pressed
                        ? colors.surfaceElevated
                        : colors.surface,
                      borderColor: colors.border,
                      marginBottom: idx < section.items.length - 1 ? 10 : 0,
                    },
                  ]}
                >
                  <View
                    style={[styles.accentBar, { backgroundColor: item.accentColor }]}
                  />
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: item.accentColor + "22" },
                    ]}
                  >
                    {item.icon}
                  </View>
                  <View style={styles.cardText}>
                    <View style={styles.cardTitleRow}>
                      <Text style={[styles.cardLabel, { color: colors.text }]}>
                        {item.label}
                      </Text>
                      <Text
                        style={[styles.cardArabic, { color: item.accentColor }]}
                      >
                        {item.arabic}
                      </Text>
                    </View>
                    <Text
                      style={[styles.cardDesc, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={colors.textSecondary}
                    style={styles.chevron}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* App footer */}
        <View
          style={[
            styles.footerCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <FooterRow
            icon={<Feather name="star" size={16} color={colors.textSecondary} />}
            label="Rate Nuur"
            sub={Platform.OS === "ios" ? "App Store" : Platform.OS === "android" ? "Play Store" : undefined}
            onPress={handleRate}
            colors={colors}
            isLast={false}
          />
          <FooterRow
            icon={<Feather name="share-2" size={16} color={colors.textSecondary} />}
            label="Share Nuur with a friend"
            onPress={handleShare}
            colors={colors}
            isLast={false}
          />
          <FooterRow
            icon={<Feather name="message-square" size={16} color={colors.textSecondary} />}
            label="Send feedback"
            onPress={handleFeedback}
            colors={colors}
            isLast={false}
          />
          <FooterRow
            icon={<Feather name="info" size={16} color={colors.textSecondary} />}
            label="About"
            sub={`v${appVersion}`}
            onPress={handleAbout}
            colors={colors}
            isLast={true}
          />
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={[styles.bismillah, { color: colors.gold }]}>﷽</Text>
          <Text style={[styles.creditsText, { color: colors.textSecondary }]}>
            Made with care · Hadith data © sunnah.com · Mosque data © OpenStreetMap
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function FooterRow({
  icon,
  label,
  sub,
  onPress,
  colors,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onPress: () => void;
  colors: ReturnType<typeof useAppContext>["themeColors"];
  isLast: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.footerRow,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      {icon}
      <Text style={[styles.footerLabel, { color: colors.text }]}>{label}</Text>
      {sub ? (
        <Text style={[styles.footerSub, { color: colors.textSecondary }]}>
          {sub}
        </Text>
      ) : null}
      <Feather name="chevron-right" size={14} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },

  /* Logo */
  logoBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  logoText: { flex: 1, gap: 2 },
  logoTitleRow: { flexDirection: "row", alignItems: "center" },
  logoArabic: {
    fontSize: 22,
    color: "#C9933A",
    letterSpacing: 1,
    includeFontPadding: false,
    lineHeight: 40,
    paddingTop: 8,
  },
  logoLatin: {
    fontSize: 13,
    color: "#C9933A",
    letterSpacing: 5,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", web: "Georgia, serif" }),
  },
  logoTagline: {
    fontSize: 11,
    color: "#8BAF8E",
    letterSpacing: 1,
    marginTop: 2,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", web: "Georgia, serif" }),
    fontStyle: "italic",
  },

  /* Today */
  todayCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  todayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  todayLabel: {
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: "Inter_700Bold",
  },
  todayDate: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  statRow: { flexDirection: "row", gap: 8 },
  statTile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    minHeight: 76,
  },
  statTitleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  statTitle: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValueRow: { flexDirection: "row", alignItems: "baseline" },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 24,
  },
  statValueUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
  dotRow: { flexDirection: "row", gap: 3, marginTop: 8 },
  dotPip: { flex: 1, height: 3, borderRadius: 2 },
  statNextName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginTop: 2,
  },
  statNextIn: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 3,
  },

  /* Section header */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 10.5,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  sectionRule: { flex: 1, height: 1, opacity: 0.5 },

  /* Cards */
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 14,
    paddingRight: 12,
  },
  libraryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 14,
    paddingRight: 12,
    marginBottom: 4,
  },
  accentBar: { width: 3, alignSelf: "stretch", marginRight: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  libIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardText: { flex: 1, gap: 3 },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap",
  },
  cardLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardArabic: { fontSize: 13, fontFamily: "Inter_500Medium" },
  cardDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  chevron: { marginLeft: 4 },

  /* Footer */
  footerCard: {
    marginTop: 24,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    overflow: "hidden",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  footerLabel: { fontSize: 14, flex: 1, fontFamily: "Inter_500Medium" },
  footerSub: { fontSize: 11, fontFamily: "Inter_400Regular" },

  /* Credits */
  credits: { alignItems: "center", marginTop: 16, marginBottom: 8 },
  bismillah: {
    fontSize: 16,
    opacity: 0.7,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", web: "Georgia, serif" }),
  },
  creditsText: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
});
