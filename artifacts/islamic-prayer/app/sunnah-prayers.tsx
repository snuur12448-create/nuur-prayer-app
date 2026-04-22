import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import {
  MADHAB_LABELS,
  MadhabKey,
  SUNNAH_DATA,
  SunnahCategory,
  SunnahHowTo,
  SunnahPrayer,
} from "@/utils/sunnahData";
import { useDailySunnah } from "@/utils/useDailySunnah";
import { CornerFloret, NuurMark } from "@/components/share/ShareDecor";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MADHAB_ORDER: MadhabKey[] = ["hanafi", "maliki", "shafii", "hanbali"];

/* ============================================================
   Hijri date (approximation — same one used on Dua / Hadith)
   ============================================================ */
const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Ula", "Jumada al-Akhirah",
  "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qa'dah", "Dhu al-Hijjah",
];

function approximateHijriToday(): string {
  const today = new Date();
  const jd = Math.floor((today.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  const safeMonth = Math.max(1, Math.min(12, month));
  const safeDay = Math.max(1, Math.min(30, day));
  return `${safeDay} ${HIJRI_MONTHS[safeMonth - 1]} ${year}`;
}

/* ============================================================
   Mushaf frame — shared with Dua / Hadith
   ============================================================ */
function MushafFrame({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <View style={[styles.mushafOuter, { borderColor: color + "55" }]}>
      <View style={[styles.mushafInner, { borderColor: color + "22" }]}>
        <View style={styles.cornerTL}><CornerFloret size={22} /></View>
        <View style={styles.cornerTR}><CornerFloret size={22} /></View>
        <View style={styles.cornerBL}><CornerFloret size={22} /></View>
        <View style={styles.cornerBR}><CornerFloret size={22} /></View>
        {children}
      </View>
    </View>
  );
}

/* ============================================================
   Status → display config (gold-only palette to match the app)
   ============================================================ */
function statusBadge(status: SunnahPrayer["status"], gold: string) {
  switch (status) {
    case "Mu'akkadah":
      return { label: "MU'AKKADAH", filled: true, color: gold };
    case "Ghayr Mu'akkadah":
      return { label: "GHAYR MU'AKKADAH", filled: false, color: gold };
    case "Recommended":
      return { label: "RECOMMENDED", filled: false, color: gold };
    case "Sunnah":
      return { label: "SUNNAH", filled: false, color: gold };
    case "Disputed":
      return { label: "DISPUTED · SEE SCHOOLS", filled: false, color: gold };
  }
}

/* ============================================================
   Next-prayer mapping for the Today hero
   ============================================================ */
type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

const PRAYER_LABEL: Record<PrayerKey, { en: string; ar: string }> = {
  fajr:    { en: "Fajr",    ar: "الفجر" },
  dhuhr:   { en: "Dhuhr",   ar: "الظهر" },
  asr:     { en: "Asr",     ar: "العصر" },
  maghrib: { en: "Maghrib", ar: "المغرب" },
  isha:    { en: "Isha",    ar: "العشاء" },
};

const RAWATIB_BEFORE: Partial<Record<PrayerKey, string>> = {
  fajr:  "rawatib-fajr",
  dhuhr: "rawatib-dhuhr-before",
  asr:   "rawatib-asr-before",
};
const RAWATIB_AFTER: Partial<Record<PrayerKey, string>> = {
  dhuhr:   "rawatib-dhuhr-after",
  maghrib: "rawatib-maghrib",
  isha:    "rawatib-isha",
};

function findPrayerById(id: string): SunnahPrayer | undefined {
  for (const cat of SUNNAH_DATA) {
    const p = cat.prayers.find((x) => x.id === id);
    if (p) return p;
  }
  return undefined;
}

function pickNextPrayerFromTimes(prayerTimes: any | null): PrayerKey {
  // Find the next upcoming prayer; falls back to fajr.
  const now = new Date();
  if (!prayerTimes) return "fajr";
  const order: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  for (const k of order) {
    const t = prayerTimes[k]?.time as Date | undefined;
    if (t && t.getTime() > now.getTime()) return k;
  }
  return "fajr"; // After Isha → tomorrow's Fajr
}

function previousPrayer(next: PrayerKey): PrayerKey {
  const order: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const idx = order.indexOf(next);
  return order[(idx - 1 + order.length) % order.length];
}

function formatTimeUntil(target: Date | undefined): string {
  if (!target) return "";
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return "now";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `in ${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `in ${h}h` : `in ${h}h ${m}m`;
}

/* ============================================================
   7-day mini history strip
   ============================================================ */
function HistoryStrip({
  colors, history,
}: { colors: any; history: { date: string; count: number }[] }) {
  const gold = colors.gold;
  // Build last 7 days (oldest → newest, left → right)
  const days: { date: string; count: number; isToday: boolean }[] = [];
  const map = new Map(history.map((h) => [h.date, h.count]));
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ date: key, count: map.get(key) ?? 0, isToday: i === 0 });
  }
  return (
    <View style={styles.historyRow}>
      {days.map((d) => {
        const intensity = Math.min(1, d.count / 4); // 0..4+ → 0..1
        const filled = d.count > 0;
        return (
          <View
            key={d.date}
            style={[
              styles.historyCell,
              {
                borderColor: gold + (d.isToday ? "AA" : "44"),
                backgroundColor: filled
                  ? gold + Math.round(0x33 + intensity * 0xAA).toString(16).padStart(2, "0").toUpperCase()
                  : "transparent",
              },
            ]}
          />
        );
      })}
    </View>
  );
}

/* ============================================================
   Today hero — next/just-passed sunnahs + daily progress
   ============================================================ */
function TodayHero({
  colors,
  hijri,
  nextPrayer,
  prevPrayer,
  nextSunnah,
  prevSunnah,
  nextSunnahDone,
  prevSunnahDone,
  rawatibPct,
  rawatibDone,
  rawatibTotal,
  streak,
  history,
  nextTimeLabel,
  onJumpNext,
  onJumpPrev,
  onToggleNext,
  onTogglePrev,
}: {
  colors: any;
  hijri: string;
  nextPrayer: PrayerKey;
  prevPrayer: PrayerKey;
  nextSunnah: SunnahPrayer | null;
  prevSunnah: SunnahPrayer | null;
  nextSunnahDone: boolean;
  prevSunnahDone: boolean;
  rawatibPct: number;
  rawatibDone: number;
  rawatibTotal: number;
  streak: number;
  history: { date: string; count: number }[];
  nextTimeLabel: string;
  onJumpNext: () => void;
  onJumpPrev: () => void;
  onToggleNext: () => void;
  onTogglePrev: () => void;
}) {
  const gold = colors.gold;
  return (
    <View style={styles.heroWrap}>
      <MushafFrame color={gold}>
        <View>
          {/* Top row */}
          <View style={styles.heroTopRow}>
            <Text style={[styles.heroDate, { color: gold + "B3" }]}>{hijri}</Text>
            <View style={[styles.heroDateRule, { backgroundColor: gold + "44" }]} />
            <View style={[styles.heroBadge, { backgroundColor: gold + "1A", borderColor: gold + "55" }]}>
              <NuurMark size={11} />
              <Text style={[styles.heroBadgeText, { color: gold }]}>TODAY</Text>
            </View>
          </View>

          <Text style={[styles.heroEyebrow, { color: gold + "CC" }]}>SUNNAH AROUND YOUR PRAYERS</Text>
          <Text style={[styles.heroArabic, { color: colors.text }]} numberOfLines={1}>
            السُّنَنُ الرَّوَاتِب
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            The voluntary prayers attached to the five — pray them and a house is built for you in Paradise.
          </Text>

          {/* Two pillars: just-passed and next */}
          <View style={styles.heroPillarRow}>
            <Pressable
              onPress={onJumpPrev}
              style={styles.heroPillar}
              accessibilityRole="button"
              accessibilityLabel={`After ${PRAYER_LABEL[prevPrayer].en}`}
            >
              <View style={styles.heroPillarHead}>
                <Feather name="check-circle" size={12} color={gold} />
                <Text style={[styles.heroPillarLabel, { color: colors.text }]}>
                  AFTER {PRAYER_LABEL[prevPrayer].en.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.heroPillarValue, { color: colors.text }]} numberOfLines={1}>
                {prevSunnah ? `${prevSunnah.rakaat} rak'ah` : "—"}
              </Text>
              <Pressable
                onPress={(e: any) => { e?.stopPropagation?.(); onTogglePrev(); }}
                hitSlop={8}
                disabled={!prevSunnah}
                style={[
                  styles.heroPill,
                  {
                    borderColor: gold + (prevSunnahDone ? "AA" : "55"),
                    backgroundColor: prevSunnahDone ? gold + "22" : "transparent",
                    opacity: prevSunnah ? 1 : 0.4,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ checked: prevSunnahDone }}
              >
                <Feather
                  name={prevSunnahDone ? "check" : "circle"}
                  size={10}
                  color={gold}
                />
                <Text style={[styles.heroPillText, { color: gold }]}>
                  {prevSunnahDone ? "PRAYED" : "MARK"}
                </Text>
              </Pressable>
            </Pressable>

            <View style={[styles.heroPillarDivider, { backgroundColor: gold + "33" }]} />

            <Pressable
              onPress={onJumpNext}
              style={styles.heroPillar}
              accessibilityRole="button"
              accessibilityLabel={`Before ${PRAYER_LABEL[nextPrayer].en}`}
            >
              <View style={styles.heroPillarHead}>
                <Feather name="clock" size={12} color={gold} />
                <Text style={[styles.heroPillarLabel, { color: colors.text }]}>
                  BEFORE {PRAYER_LABEL[nextPrayer].en.toUpperCase()}{nextTimeLabel ? ` · ${nextTimeLabel.toUpperCase()}` : ""}
                </Text>
              </View>
              <Text style={[styles.heroPillarValue, { color: colors.text }]} numberOfLines={1}>
                {nextSunnah ? `${nextSunnah.rakaat} rak'ah` : "—"}
              </Text>
              <Pressable
                onPress={(e: any) => { e?.stopPropagation?.(); onToggleNext(); }}
                hitSlop={8}
                disabled={!nextSunnah}
                style={[
                  styles.heroPill,
                  {
                    borderColor: gold + (nextSunnahDone ? "AA" : "55"),
                    backgroundColor: nextSunnahDone ? gold + "22" : "transparent",
                    opacity: nextSunnah ? 1 : 0.4,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ checked: nextSunnahDone }}
              >
                <Feather
                  name={nextSunnahDone ? "check" : "circle"}
                  size={10}
                  color={gold}
                />
                <Text style={[styles.heroPillText, { color: gold }]}>
                  {nextSunnahDone ? "PRAYED" : "MARK"}
                </Text>
              </Pressable>
            </Pressable>
          </View>

          {/* Daily progress strip */}
          <View style={[styles.heroProgressWrap, { borderTopColor: gold + "33" }]}>
            <View style={styles.heroProgressRow}>
              <Text style={[styles.heroProgressLabel, { color: colors.textSecondary }]}>
                RAWĀTIB · {rawatibDone}/{rawatibTotal} TODAY
              </Text>
              {streak > 0 && (
                <View style={styles.heroStreak}>
                  <Feather name="award" size={11} color={gold} />
                  <Text style={[styles.heroStreakText, { color: gold }]}>
                    {streak} DAY{streak === 1 ? "" : "S"}
                  </Text>
                </View>
              )}
            </View>
            <View style={[styles.heroProgressBar, { backgroundColor: gold + "22" }]}>
              <View
                style={{
                  width: `${Math.round(rawatibPct * 100)}%`,
                  height: 3,
                  backgroundColor: gold,
                }}
              />
            </View>

            {/* 7-day history strip */}
            <View style={styles.historyWrap}>
              <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>
                LAST 7 DAYS
              </Text>
              <HistoryStrip colors={colors} history={history} />
            </View>
          </View>
        </View>
      </MushafFrame>
    </View>
  );
}

/* ============================================================
   Glossary — inline expandable definitions of common terms
   ============================================================ */
const GLOSSARY: { term: string; ar?: string; def: string }[] = [
  {
    term: "Mu'akkadah",
    ar: "مؤكدة",
    def: "Strongly emphasised — the Prophet ﷺ rarely or never left these. Leaving them is disliked.",
  },
  {
    term: "Ghayr Mu'akkadah",
    ar: "غير مؤكدة",
    def: "Recommended but not strongly emphasised. Praying them is rewarded; leaving them carries no blame.",
  },
  {
    term: "Rawātib",
    ar: "الرواتب",
    def: "The fixed sunnah rakʿahs attached to the five daily prayers — twelve in total earn a house in Paradise.",
  },
  {
    term: "Nāfilah",
    ar: "نافلة",
    def: "Any voluntary act of worship beyond the obligatory — including all sunnah prayers.",
  },
  {
    term: "Witr",
    ar: "الوتر",
    def: "An odd-numbered prayer that seals the night. Prayed any time between ʿIshāʾ and Fajr; best in the last third.",
  },
  {
    term: "Qiyām al-Layl",
    ar: "قيام الليل",
    def: "Any voluntary night prayer after ʿIshāʾ. Tahajjud is a specific form prayed after sleeping.",
  },
];

function GlossaryBlock({ colors }: { colors: any }) {
  const [open, setOpen] = useState(false);
  const gold = colors.gold;
  return (
    <View style={[styles.glossaryWrap, { borderColor: gold + "33" }]}>
      <Pressable
        onPress={() => {
          LayoutAnimation.configureNext({
            duration: 200,
            update: { type: "easeInEaseOut" },
          });
          setOpen((v) => !v);
        }}
        style={styles.glossaryHead}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Feather name="book-open" size={12} color={gold} />
        <Text style={[styles.glossaryHeadText, { color: gold }]}>
          GLOSSARY · WHAT THESE TERMS MEAN
        </Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={14} color={gold + "AA"} />
      </Pressable>
      {open && (
        <View style={styles.glossaryBody}>
          {GLOSSARY.map((g, i) => (
            <View
              key={g.term}
              style={[
                styles.glossaryRow,
                i < GLOSSARY.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: gold + "22",
                },
              ]}
            >
              <View style={styles.glossaryTermRow}>
                <Text style={[styles.glossaryTerm, { color: colors.text }]}>{g.term}</Text>
                {g.ar && (
                  <Text style={[styles.glossaryAr, { color: gold + "CC" }]}>· {g.ar}</Text>
                )}
              </View>
              <Text style={[styles.glossaryDef, { color: colors.textSecondary }]}>
                {g.def}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/* ============================================================
   How-to-pray block — stepwise + sūrah deep links
   ============================================================ */
function HowToBlock({
  colors, howTo,
}: { colors: any; howTo: SunnahHowTo }) {
  const gold = colors.gold;
  return (
    <View style={[styles.howToBox, { borderColor: gold + "44" }]}>
      <View style={styles.howToHead}>
        <View style={[styles.refDot, { backgroundColor: gold }]} />
        <Text style={[styles.howToHeadText, { color: gold }]}>HOW TO PRAY</Text>
      </View>
      {howTo.steps.map((s, i) => (
        <View key={i} style={styles.howToStep}>
          <View style={[styles.howToBullet, { borderColor: gold + "AA" }]}>
            <Text style={[styles.howToBulletText, { color: gold }]}>{i + 1}</Text>
          </View>
          <Text style={[styles.howToStepText, { color: colors.text }]}>{s}</Text>
        </View>
      ))}
      {howTo.surahs && howTo.surahs.length > 0 && (
        <View style={[styles.howToSurahs, { borderTopColor: gold + "33" }]}>
          <Text style={[styles.howToSurahLabel, { color: colors.textSecondary }]}>
            RECOMMENDED RECITATION
          </Text>
          <View style={styles.howToSurahRow}>
            {howTo.surahs.map((s) => (
              <Pressable
                key={`${s.rakah}-${s.surahNum}`}
                onPress={(e: any) => {
                  e?.stopPropagation?.();
                  router.push({ pathname: "/quran/[id]", params: { id: String(s.surahNum) } });
                }}
                style={[styles.howToSurahChip, { borderColor: gold + "55" }]}
                accessibilityRole="link"
                accessibilityLabel={`Open Sūrah ${s.nameEn} in Quran`}
              >
                <Text style={[styles.howToSurahRakah, { color: gold + "AA" }]}>
                  RAK'AH {s.rakah}
                </Text>
                <Text style={[styles.howToSurahName, { color: colors.text }]}>
                  {s.nameEn}
                </Text>
                <Text style={[styles.howToSurahAr, { color: gold }]}>{s.nameAr}</Text>
                <Feather name="arrow-up-right" size={11} color={gold + "AA"} />
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

/* ============================================================
   Filter chip rail
   ============================================================ */
type FilterId = "all" | "rawatib" | "special" | "night" | "occasional" | "tracked";

function FilterChips({
  colors,
  active,
  onChange,
  doneCount,
}: {
  colors: any;
  active: FilterId;
  onChange: (id: FilterId) => void;
  doneCount: number;
}) {
  const items: { id: FilterId; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { id: "all",        label: "All",        icon: "list" },
    { id: "rawatib",    label: "Daily",      icon: "sun" },
    { id: "special",    label: "Special",    icon: "star" },
    { id: "night",      label: "Night",      icon: "moon" },
    { id: "occasional", label: "Occasional", icon: "calendar" },
    { id: "tracked",    label: doneCount > 0 ? `Today · ${doneCount}` : "Today", icon: "check-circle" },
  ];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 14 }}
    >
      {items.map((it) => {
        const isActive = active === it.id;
        return (
          <Pressable
            key={it.id}
            onPress={() => onChange(it.id)}
            style={[
              styles.topicChip,
              {
                backgroundColor: isActive ? colors.gold : "transparent",
                borderColor: isActive ? colors.gold : colors.gold + "44",
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Feather
              name={it.icon}
              size={11}
              color={isActive ? colors.background : colors.gold}
            />
            <Text
              style={[
                styles.topicChipText,
                { color: isActive ? colors.background : colors.textSecondary },
              ]}
            >
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ============================================================
   Section divider — rule · CAPS · rule
   ============================================================ */
function SectionDivider({
  colors, label, sublabel,
}: { colors: any; label: string; sublabel?: string }) {
  return (
    <View style={styles.sectionDivider}>
      <View style={[styles.dividerRule, { backgroundColor: colors.gold + "55" }]} />
      <View style={{ alignItems: "center" }}>
        <Text style={[styles.sectionLabelText, { color: colors.gold }]}>{label}</Text>
        {sublabel ? (
          <Text style={[styles.sectionSubLabel, { color: colors.gold + "AA" }]}>{sublabel}</Text>
        ) : null}
      </View>
      <View style={[styles.dividerRule, { backgroundColor: colors.gold + "55" }]} />
    </View>
  );
}

/* ============================================================
   Prayer row — hairline rules + corner ticks + ink stamps
   ============================================================ */
function PrayerCard({
  prayer, colors, isOpen, onToggle, isDone, onToggleDone,
}: {
  prayer: SunnahPrayer;
  colors: any;
  isOpen: boolean;
  onToggle: () => void;
  isDone: boolean;
  onToggleDone: () => void;
}) {
  const gold = colors.gold;
  const badge = statusBadge(prayer.status, gold);

  return (
    <View style={styles.cardWrap}>
      <View style={[styles.cardRuleTop,    { backgroundColor: gold + "55" }]} />
      <View style={[styles.cardRuleBottom, { backgroundColor: gold + "55" }]} />
      <View style={[styles.tickTL, { borderColor: gold }]} />
      <View style={[styles.tickTR, { borderColor: gold }]} />
      <View style={[styles.tickBL, { borderColor: gold }]} />
      <View style={[styles.tickBR, { borderColor: gold }]} />

      <Pressable onPress={onToggle} style={styles.cardInner} accessibilityRole="button">
        {/* Stamp row */}
        <View style={styles.stampRow}>
          <View
            style={[
              styles.inkStamp,
              {
                borderColor: badge.color + (badge.filled ? "" : "66"),
                backgroundColor: badge.filled ? badge.color + "22" : badge.color + "0E",
              },
            ]}
          >
            <Text style={[styles.inkStampText, { color: badge.color }]} numberOfLines={1}>
              {badge.label}
            </Text>
          </View>
          <View style={[styles.inkStamp, { borderColor: gold + "55", backgroundColor: gold + "0E" }]}>
            <Text style={[styles.inkStampText, { color: gold }]} numberOfLines={1}>
              {prayer.rakaat.toUpperCase()} RAK'AH
            </Text>
          </View>
          {isDone && (
            <View style={[styles.doneChip, { borderColor: gold + "AA", backgroundColor: gold + "22" }]}>
              <Feather name="check" size={9} color={gold} />
              <Text style={[styles.doneChipText, { color: gold }]}>PRAYED</Text>
            </View>
          )}
        </View>

        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.titleEn, { color: colors.text }]}>{prayer.nameEn}</Text>
            <Text style={[styles.titleAr, { color: gold }]}>{prayer.nameAr}</Text>
          </View>
          <Feather
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.textSecondary}
            style={{ marginLeft: 8 }}
          />
        </View>

        {/* When (always visible — most useful at-a-glance) */}
        <View style={styles.whenRow}>
          <Feather name="clock" size={11} color={gold + "AA"} />
          <Text style={[styles.whenText, { color: colors.textSecondary }]} numberOfLines={isOpen ? undefined : 2}>
            {prayer.window}
          </Text>
        </View>

        {/* Expanded body */}
        {isOpen && (
          <View style={styles.expanded}>
            {/* Reward */}
            <View style={styles.rewardRow}>
              <Feather name="award" size={11} color={gold} />
              <Text style={[styles.rewardText, { color: colors.text }]}>{prayer.reward}</Text>
            </View>

            {/* Hadith box */}
            <View style={[styles.hadithBox, { borderColor: gold + "44", backgroundColor: gold + "08" }]}>
              <Text style={[styles.hadithQuote, { color: colors.text }]}>"{prayer.hadith.text}"</Text>
              <View style={styles.hadithRefRow}>
                <View style={[styles.refDot, { backgroundColor: gold }]} />
                <Text style={[styles.hadithSrc, { color: gold }]}>
                  {prayer.hadith.source.toUpperCase()}
                </Text>
                <View style={[styles.refSep, { backgroundColor: gold + "44" }]} />
                <Text style={[styles.hadithGrade, { color: gold + "CC" }]}>
                  {prayer.hadith.grade.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Madhab grid */}
            {prayer.madhabViews && (
              <View style={[styles.madhabBox, { borderColor: gold + "33" }]}>
                <View style={styles.madhabHead}>
                  <View style={[styles.refDot, { backgroundColor: gold }]} />
                  <Text style={[styles.madhabHeadText, { color: gold }]}>
                    ACROSS THE MADHĀHIB · {prayer.madhabViews.label.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.madhabGrid}>
                  {MADHAB_ORDER.map((m) => {
                    const v = prayer.madhabViews!.views[m];
                    if (!v) return null;
                    return (
                      <View
                        key={m}
                        style={[styles.madhabTile, { borderColor: gold + "33", backgroundColor: gold + "06" }]}
                      >
                        <Text style={[styles.madhabName, { color: gold }]}>
                          {MADHAB_LABELS[m].toUpperCase()}
                        </Text>
                        <Text style={[styles.madhabValue, { color: colors.text }]}>{v}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* How to pray */}
            {prayer.howTo && <HowToBlock colors={colors} howTo={prayer.howTo} />}

            {/* Notes */}
            {prayer.notes && (
              <Text style={[styles.notes, { color: colors.textSecondary }]}>
                <Text style={{ fontFamily: "Inter_700Bold", color: gold + "DD" }}>NOTE · </Text>
                {prayer.notes}
              </Text>
            )}

            {/* Mark prayed */}
            <Pressable
              onPress={(e: any) => { e?.stopPropagation?.(); onToggleDone(); }}
              style={[
                styles.markPill,
                {
                  borderColor: gold + (isDone ? "AA" : "55"),
                  backgroundColor: isDone ? gold + "22" : "transparent",
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ checked: isDone }}
            >
              <Feather name={isDone ? "check-circle" : "circle"} size={13} color={gold} />
              <Text style={[styles.markPillText, { color: gold }]}>
                {isDone ? "MARKED PRAYED TODAY" : "MARK PRAYED TODAY"}
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    </View>
  );
}

/* ============================================================
   Screen
   ============================================================ */
export default function SunnahPrayersScreen() {
  const { themeColors: colors, prayerTimes } = useAppContext();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ filter?: string; open?: string }>();
  const initialFilter: FilterId = useMemo(() => {
    const allowed: FilterId[] = ["all", "rawatib", "special", "night", "occasional", "tracked"];
    const f = params.filter as FilterId | undefined;
    return f && allowed.includes(f) ? f : "all";
  }, [params.filter]);
  const [openId, setOpenId] = useState<string | null>(params.open ?? null);
  const [filter, setFilter] = useState<FilterId>(initialFilter);

  // React to deep-link changes (e.g. user re-taps Tahajjud quick action while on screen)
  useEffect(() => {
    if (params.filter) setFilter(initialFilter);
    if (params.open) setOpenId(params.open);
  }, [params.filter, params.open, initialFilter]);
  const { doneIds, toggle: toggleDone, streak, history } = useDailySunnah();

  const togglePrayer = (id: string) => {
    LayoutAnimation.configureNext({
      duration: 220,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "easeInEaseOut" },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });
    setOpenId((cur) => (cur === id ? null : id));
  };

  const hijri = useMemo(() => approximateHijriToday(), []);

  /* Today hero context */
  const nextPrayer = useMemo(() => pickNextPrayerFromTimes(prayerTimes), [prayerTimes]);
  const prevPrayer = useMemo(() => previousPrayer(nextPrayer), [nextPrayer]);
  const nextSunnah = useMemo(
    () => (RAWATIB_BEFORE[nextPrayer] ? findPrayerById(RAWATIB_BEFORE[nextPrayer]!) ?? null : null),
    [nextPrayer]
  );
  const prevSunnah = useMemo(
    () => (RAWATIB_AFTER[prevPrayer] ? findPrayerById(RAWATIB_AFTER[prevPrayer]!) ?? null : null),
    [prevPrayer]
  );
  const nextTimeLabel = useMemo(
    () => (prayerTimes ? formatTimeUntil(prayerTimes[nextPrayer]?.time as Date | undefined) : ""),
    [prayerTimes, nextPrayer]
  );

  /* Rawātib daily progress (the 12 confirmed) */
  const rawatibCat = SUNNAH_DATA.find((c) => c.key === "rawatib")!;
  const rawatibTotal = rawatibCat.prayers.length; // 6 distinct mu'akkadah rows in our dataset
  const rawatibDone = rawatibCat.prayers.reduce((n, p) => (doneIds.has(p.id) ? n + 1 : n), 0);
  const rawatibPct = rawatibTotal === 0 ? 0 : rawatibDone / rawatibTotal;

  /* Filtered categories */
  const visibleCategories: SunnahCategory[] = useMemo(() => {
    if (filter === "all") return SUNNAH_DATA;
    if (filter === "tracked") {
      const filtered: SunnahCategory[] = SUNNAH_DATA
        .map((c) => ({ ...c, prayers: c.prayers.filter((p) => doneIds.has(p.id)) }))
        .filter((c) => c.prayers.length > 0);
      return filtered;
    }
    return SUNNAH_DATA.filter((c) => c.key === filter);
  }, [filter, doneIds]);

  /* Jump to a specific prayer row & expand it */
  const focusPrayer = (id?: string | null) => {
    if (!id) return;
    setFilter("all");
    setOpenId(id);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.gold + "22" }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
          <Feather name="chevron-left" size={22} color={colors.gold} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Sunnah Prayers</Text>
          <Text style={[styles.headerArabic, { color: colors.gold }]}>السُّنَن</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: colors.gold + "10", borderColor: colors.gold + "55" }]}>
          <Text style={[styles.headerBadgeText, { color: colors.gold }]}>VOLUNTARY</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 60, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      >
        <FilterChips colors={colors} active={filter} onChange={setFilter} doneCount={doneIds.size} />

        {filter === "all" && (
          <TodayHero
            colors={colors}
            hijri={hijri}
            nextPrayer={nextPrayer}
            prevPrayer={prevPrayer}
            nextSunnah={nextSunnah}
            prevSunnah={prevSunnah}
            nextSunnahDone={!!nextSunnah && doneIds.has(nextSunnah.id)}
            prevSunnahDone={!!prevSunnah && doneIds.has(prevSunnah.id)}
            rawatibPct={rawatibPct}
            rawatibDone={rawatibDone}
            rawatibTotal={rawatibTotal}
            streak={streak}
            history={history}
            nextTimeLabel={nextTimeLabel}
            onJumpNext={() => focusPrayer(nextSunnah?.id)}
            onJumpPrev={() => focusPrayer(prevSunnah?.id)}
            onToggleNext={() => nextSunnah && toggleDone(nextSunnah.id)}
            onTogglePrev={() => prevSunnah && toggleDone(prevSunnah.id)}
          />
        )}

        {visibleCategories.length === 0 && filter === "tracked" && (
          <View style={styles.emptyBox}>
            <Feather name="check-circle" size={40} color={colors.gold + "55"} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nothing tracked yet today. Tap "Mark prayed today" on any sunnah to start your streak.
            </Text>
          </View>
        )}

        {/* Glossary — appears once, just above the first section */}
        {visibleCategories.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            <GlossaryBlock colors={colors} />
          </View>
        )}

        {visibleCategories.map((cat) => (
          <View key={cat.key} style={{ marginTop: 4 }}>
            <SectionDivider colors={colors} label={cat.titleEn.toUpperCase()} sublabel={cat.titleAr} />
            <Text style={[styles.catBlurb, { color: colors.textSecondary }]}>{cat.blurb}</Text>
            {cat.prayers.map((p) => (
              <PrayerCard
                key={p.id}
                prayer={p}
                colors={colors}
                isOpen={openId === p.id}
                onToggle={() => togglePrayer(p.id)}
                isDone={doneIds.has(p.id)}
                onToggleDone={() => toggleDone(p.id)}
              />
            ))}
          </View>
        ))}

        {/* End ornament */}
        {visibleCategories.length > 0 && (
          <View style={styles.endOrnament}>
            <View style={[styles.endLine, { backgroundColor: colors.gold + "44" }]} />
            <Text style={[styles.endGlyph, { color: colors.gold }]}>﷽</Text>
            <View style={[styles.endLine, { backgroundColor: colors.gold + "44" }]} />
          </View>
        )}

        <Text style={[styles.footer, { color: colors.textSecondary }]}>
          Hadith references are drawn from Bukhārī, Muslim, Tirmidhī, Abī Dāwūd and others. Where the schools differ, the most widely held views are shown.
        </Text>
      </ScrollView>
    </View>
  );
}

/* ============================================================
   Styles
   ============================================================ */
const styles = StyleSheet.create({
  root: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  headerBtn: { width: 28, alignItems: "flex-start" },
  headerTitles: { flex: 1 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  headerArabic: { fontSize: 16, marginTop: 1, fontFamily: "AmiriQuran_400Regular" },
  headerBadge: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },

  /* Topic chips */
  topicChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  topicChipText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },

  /* Hero / Mushaf frame */
  heroWrap: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 4 },
  mushafOuter: {
    borderWidth: 1.2,
    padding: 4,
    borderRadius: 2,
  },
  mushafInner: {
    borderWidth: 0.6,
    padding: 18,
    position: "relative",
    overflow: "hidden",
  },
  cornerTL: { position: "absolute", top: -2, left: -2 },
  cornerTR: { position: "absolute", top: -2, right: -2, transform: [{ scaleX: -1 }] },
  cornerBL: { position: "absolute", bottom: -2, left: -2, transform: [{ scaleY: -1 }] },
  cornerBR: { position: "absolute", bottom: -2, right: -2, transform: [{ scaleX: -1 }, { scaleY: -1 }] },

  heroTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
  heroDate: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  heroDateRule: { flex: 1, height: 1 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  heroBadgeText: { fontSize: 8, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  heroEyebrow: {
    fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2,
    textAlign: "center", marginBottom: 6,
  },
  heroArabic: {
    fontFamily: "AmiriQuran_400Regular",
    fontSize: 24, lineHeight: 44,
    textAlign: "center", marginBottom: 6, writingDirection: "rtl",
  },
  heroSubtitle: {
    fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic",
    lineHeight: 18, textAlign: "center", marginBottom: 16, paddingHorizontal: 6,
  },

  heroPillarRow: { flexDirection: "row", alignItems: "stretch", gap: 12 },
  heroPillar: { flex: 1, gap: 6 },
  heroPillarHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroPillarLabel: { fontSize: 9.5, fontFamily: "Inter_700Bold", letterSpacing: 1.2, flexShrink: 1 },
  heroPillarValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  heroPillarDivider: { width: 1, alignSelf: "stretch" },
  heroPill: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    gap: 5, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 2, marginTop: 2,
  },
  heroPillText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },

  heroProgressWrap: { marginTop: 16, paddingTop: 12, borderTopWidth: 1 },
  heroProgressRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 6,
  },
  heroProgressLabel: { fontSize: 9.5, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  heroStreak: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroStreakText: { fontSize: 9.5, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  heroProgressBar: { height: 3, borderRadius: 2, overflow: "hidden" },

  /* Section divider */
  sectionDivider: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 20, paddingVertical: 18, marginTop: 6,
  },
  dividerRule: { flex: 1, height: 1 },
  sectionLabelText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  sectionSubLabel: {
    fontSize: 12, fontFamily: "AmiriQuran_400Regular", marginTop: 2,
  },

  catBlurb: {
    fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18,
    paddingHorizontal: 22, marginBottom: 14, marginTop: -6,
  },

  /* Card */
  cardWrap: { marginHorizontal: 16, marginBottom: 14, position: "relative" },
  cardInner: { paddingVertical: 14, paddingHorizontal: 14 },
  cardRuleTop:    { position: "absolute", top: 0, left: 0, right: 0, height: 1 },
  cardRuleBottom: { position: "absolute", bottom: 0, left: 0, right: 0, height: 1 },
  tickTL: { position: "absolute", top: 0,    left: 0,  width: 8, height: 8, borderLeftWidth: 1,  borderTopWidth: 1 },
  tickTR: { position: "absolute", top: 0,    right: 0, width: 8, height: 8, borderRightWidth: 1, borderTopWidth: 1 },
  tickBL: { position: "absolute", bottom: 0, left: 0,  width: 8, height: 8, borderLeftWidth: 1,  borderBottomWidth: 1 },
  tickBR: { position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRightWidth: 1, borderBottomWidth: 1 },

  stampRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" },
  inkStamp: {
    borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 2, maxWidth: 200,
  },
  inkStampText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  doneChip: {
    flexDirection: "row", alignItems: "center", gap: 3,
    borderWidth: 1, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 2,
  },
  doneChipText: { fontSize: 8, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },

  titleRow: { flexDirection: "row", alignItems: "flex-start" },
  titleEn: { fontSize: 16, fontFamily: "Inter_700Bold" },
  titleAr: { fontSize: 14, fontFamily: "AmiriQuran_400Regular", marginTop: 2 },

  whenRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 6 },
  whenText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },

  expanded: { marginTop: 12, gap: 10 },
  rewardRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  rewardText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 19, fontStyle: "italic" },

  hadithBox: { padding: 12, borderWidth: 1, borderRadius: 2, gap: 8 },
  hadithQuote: { fontSize: 12.5, fontFamily: "Inter_400Regular", lineHeight: 19, fontStyle: "italic" },
  hadithRefRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  refDot: { width: 4, height: 4, borderRadius: 2 },
  refSep: { width: 8, height: 1 },
  hadithSrc:   { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  hadithGrade: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },

  madhabBox: { borderWidth: 1, borderRadius: 2, padding: 10, gap: 10 },
  madhabHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  madhabHeadText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2, flex: 1 },
  madhabGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  madhabTile: {
    borderWidth: 1, borderRadius: 2, padding: 8,
    width: "48%", gap: 4,
  },
  madhabName: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  madhabValue: { fontSize: 11.5, fontFamily: "Inter_400Regular", lineHeight: 16 },

  notes: { fontSize: 11.5, fontFamily: "Inter_400Regular", lineHeight: 17 },

  markPill: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    gap: 6, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 2, marginTop: 4,
  },
  markPillText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.4 },

  /* Empty + footer + ornament */
  emptyBox: { alignItems: "center", paddingTop: 40, gap: 10, paddingHorizontal: 32 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },

  endOrnament: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 14, paddingVertical: 24, paddingHorizontal: 24,
  },
  endLine: { flex: 1, maxWidth: 70, height: 1 },
  endGlyph: { fontSize: 22, fontFamily: "Inter_400Regular", textAlign: "center" },

  footer: {
    fontSize: 10.5, fontFamily: "Inter_400Regular", lineHeight: 15,
    textAlign: "center", paddingHorizontal: 28, paddingVertical: 16,
  },

  /* 7-day history strip */
  historyWrap: { marginTop: 12, gap: 6 },
  historyLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.4 },
  historyRow: { flexDirection: "row", gap: 5 },
  historyCell: {
    flex: 1,
    height: 14,
    borderWidth: 1,
    borderRadius: 1.5,
  },

  /* Glossary block */
  glossaryWrap: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    overflow: "hidden",
  },
  glossaryHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  glossaryHeadText: { flex: 1, fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.3 },
  glossaryBody: { paddingHorizontal: 12, paddingBottom: 8 },
  glossaryRow: { paddingVertical: 9, gap: 3 },
  glossaryTermRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  glossaryTerm: { fontSize: 13, fontFamily: "Inter_700Bold" },
  glossaryAr: { fontSize: 13, fontFamily: "AmiriQuran_400Regular" },
  glossaryDef: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },

  /* How-to block */
  howToBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    padding: 12,
    gap: 8,
  },
  howToHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  howToHeadText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.4 },
  howToStep: { flexDirection: "row", gap: 9, alignItems: "flex-start" },
  howToBullet: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 1,
    alignItems: "center", justifyContent: "center",
    marginTop: 1,
  },
  howToBulletText: { fontSize: 9, fontFamily: "Inter_700Bold" },
  howToStepText: { flex: 1, fontSize: 12.5, fontFamily: "Inter_400Regular", lineHeight: 18 },
  howToSurahs: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  howToSurahLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.3 },
  howToSurahRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  howToSurahChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  howToSurahRakah: { fontSize: 8.5, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  howToSurahName: { fontSize: 11.5, fontFamily: "Inter_700Bold" },
  howToSurahAr: { fontSize: 13, fontFamily: "AmiriQuran_400Regular" },
});
