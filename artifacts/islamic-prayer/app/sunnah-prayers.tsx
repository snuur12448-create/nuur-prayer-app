import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { MADHAB_LABELS, MadhabKey, SUNNAH_DATA, SunnahCategory, SunnahPrayer } from "@/utils/sunnahData";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STATUS_COLOURS: Record<SunnahPrayer["status"], string> = {
  "Mu'akkadah":       "#10b981",
  "Ghayr Mu'akkadah": "#6b7280",
  Recommended:        "#3b82f6",
  Sunnah:             "#0ea5e9",
  Disputed:           "#f59e0b",
};

const MADHAB_ORDER: MadhabKey[] = ["hanafi", "maliki", "shafii", "hanbali"];

export default function SunnahPrayersScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const [openId, setOpenId] = useState<string | null>(null);

  const togglePrayer = (id: string) => {
    LayoutAnimation.configureNext({
      duration: 220,
      create:  { type: "easeInEaseOut", property: "opacity" },
      update:  { type: "easeInEaseOut" },
      delete:  { type: "easeInEaseOut", property: "opacity" },
    });
    setOpenId((cur) => (cur === id ? null : id));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
          <Feather name="arrow-left" size={20} color={colors.tint} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>SUNNAH PRAYERS</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingHorizontal: 18, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={[styles.introAr, { color: colors.tint }]}>السُّنَن</Text>
          <Text style={[styles.introTitle, { color: colors.text }]}>Beyond the obligatory</Text>
          <Text style={[styles.introBody, { color: colors.textSecondary }]}>
            The voluntary prayers of the Prophet ﷺ — what to pray, when, and the words he left us about each one.
          </Text>
        </View>

        {SUNNAH_DATA.map((cat) => (
          <CategoryBlock
            key={cat.key}
            category={cat}
            colors={colors}
            openId={openId}
            onToggle={togglePrayer}
          />
        ))}

        <Text style={[styles.footer, { color: colors.textSecondary, borderTopColor: colors.border }]}>
          Hadith references are drawn from Bukhārī, Muslim, Tirmidhī, Abī Dāwūd and others. Where opinions differ between madhāhib, the most widely-held view is shown.
        </Text>
      </ScrollView>
    </View>
  );
}

function CategoryBlock({
  category, colors, openId, onToggle,
}: {
  category: SunnahCategory;
  colors: any;
  openId: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <View style={{ marginBottom: 26 }}>
      <View style={styles.catHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.catTitleEn, { color: colors.text }]}>{category.titleEn}</Text>
          <Text style={[styles.catTitleAr, { color: colors.tint }]}>{category.titleAr}</Text>
        </View>
      </View>
      <Text style={[styles.catBlurb, { color: colors.textSecondary }]}>{category.blurb}</Text>

      <View style={[styles.catCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {category.prayers.map((p, idx) => (
          <PrayerRow
            key={p.id}
            prayer={p}
            colors={colors}
            isOpen={openId === p.id}
            onToggle={() => onToggle(p.id)}
            isLast={idx === category.prayers.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

function PrayerRow({
  prayer, colors, isOpen, onToggle, isLast,
}: {
  prayer: SunnahPrayer;
  colors: any;
  isOpen: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const tagColor = STATUS_COLOURS[prayer.status];

  return (
    <View style={[styles.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <TouchableOpacity activeOpacity={0.7} onPress={onToggle} style={styles.rowHead}>
        <View style={{ flex: 1 }}>
          <View style={styles.rowTitleLine}>
            <Text style={[styles.rowName, { color: colors.text }]}>{prayer.nameEn}</Text>
            <Text style={[styles.rowNameAr, { color: colors.textSecondary }]}>{prayer.nameAr}</Text>
          </View>
          <View style={styles.rowMeta}>
            <View style={[styles.rakaatPill, { backgroundColor: colors.tint + "1a", borderColor: colors.tint + "40" }]}>
              <Text style={[styles.rakaatText, { color: colors.tint }]}>{prayer.rakaat} rakʿah</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: tagColor + "1f", borderColor: tagColor + "55" }]}>
              <Text style={[styles.statusText, { color: tagColor }]}>{prayer.status}</Text>
            </View>
          </View>
        </View>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textSecondary}
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.rowBody}>
          <DetailRow icon="clock" label="When"   value={prayer.window}   colors={colors} />
          <DetailRow icon="award" label="Reward" value={prayer.reward}   colors={colors} />
          <View style={[styles.hadithBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.hadithText, { color: colors.text }]}>"{prayer.hadith.text}"</Text>
            <Text style={[styles.hadithSrc, { color: colors.textSecondary }]}>
              {prayer.hadith.source}  ·  <Text style={{ color: colors.tint }}>{prayer.hadith.grade}</Text>
            </Text>
          </View>
          {prayer.madhabViews && (
            <View style={[styles.madhabBox, { borderColor: colors.border }]}>
              <View style={styles.madhabHead}>
                <Feather name="users" size={11} color={colors.textSecondary} />
                <Text style={[styles.madhabLabel, { color: colors.textSecondary }]}>
                  ACROSS THE MADHĀHIB · {prayer.madhabViews.label.toUpperCase()}
                </Text>
              </View>
              {MADHAB_ORDER.map((m) => {
                const v = prayer.madhabViews!.views[m];
                if (!v) return null;
                return (
                  <View key={m} style={styles.madhabRow}>
                    <Text style={[styles.madhabName, { color: colors.tint }]}>{MADHAB_LABELS[m]}</Text>
                    <Text style={[styles.madhabValue, { color: colors.text }]}>{v}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {prayer.notes && (
            <Text style={[styles.notes, { color: colors.textSecondary }]}>
              <Text style={{ fontFamily: "Inter_600SemiBold" }}>Note · </Text>
              {prayer.notes}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function DetailRow({
  icon, label, value, colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={styles.detail}>
      <View style={[styles.detailIcon, { backgroundColor: colors.tint + "14" }]}>
        <Feather name={icon} size={12} color={colors.tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label.toUpperCase()}</Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: { width: 40, alignItems: "flex-start" },
  headerTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 1.6 },

  intro: { paddingVertical: 18, alignItems: "center" },
  introAr: { fontSize: 32, fontFamily: "AmiriQuran_400Regular", marginBottom: 4 },
  introTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 6 },
  introBody: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19, paddingHorizontal: 12 },

  catHeader: { flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 4 },
  catTitleEn: { fontSize: 16, fontFamily: "Inter_700Bold" },
  catTitleAr: { fontSize: 14, fontFamily: "AmiriQuran_400Regular", marginTop: 2 },
  catBlurb: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginBottom: 10 },

  catCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },

  row: { paddingHorizontal: 14 },
  rowHead: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  rowTitleLine: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 6 },
  rowName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rowNameAr: { fontSize: 14, fontFamily: "AmiriQuran_400Regular" },
  rowMeta: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  rakaatPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  rakaatText: { fontSize: 10.5, fontFamily: "Inter_600SemiBold" },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  statusText: { fontSize: 10.5, fontFamily: "Inter_600SemiBold" },

  rowBody: { paddingBottom: 16, paddingTop: 2, gap: 10 },
  detail: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  detailIcon: { width: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center", marginTop: 2 },
  detailLabel: { fontSize: 9.5, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 1 },
  detailValue: { fontSize: 12.5, fontFamily: "Inter_400Regular", lineHeight: 17 },

  hadithBox: { padding: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, marginTop: 4 },
  hadithText: { fontSize: 12.5, fontFamily: "Inter_400Regular", lineHeight: 18, fontStyle: "italic" },
  hadithSrc: { fontSize: 10.5, fontFamily: "Inter_500Medium", marginTop: 6 },

  notes: { fontSize: 11.5, fontFamily: "Inter_400Regular", lineHeight: 16, marginTop: 4 },

  madhabBox: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, padding: 10, marginTop: 4 },
  madhabHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  madhabLabel: { fontSize: 9.5, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  madhabRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 4 },
  madhabName: { fontSize: 11, fontFamily: "Inter_600SemiBold", width: 56 },
  madhabValue: { flex: 1, fontSize: 11.5, fontFamily: "Inter_400Regular", lineHeight: 16 },

  footer: {
    fontSize: 10.5, fontFamily: "Inter_400Regular", lineHeight: 15,
    textAlign: "center", paddingTop: 16, marginTop: 8, borderTopWidth: StyleSheet.hairlineWidth,
  },
});
