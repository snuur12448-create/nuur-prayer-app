import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ContentShareSheet from "@/components/ContentShareSheet";
import { useAppContext } from "@/context/AppContext";
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";
import {
  ASSET_FIELDS,
  CURRENCIES,
  DEDUCTION_FIELDS,
  DEFAULT_PREFERENCES,
  EMPTY_INPUTS,
  NISAB_THRESHOLDS,
  ZAKAT_RATE,
  computeZakat,
  formatCurrency,
  loadZakatPreferences,
  saveZakatCurrency,
  saveZakatInputs,
  saveZakatNisabType,
  type CurrencyCode,
  type NisabType,
  type ZakatInputs,
  type ZakatInputKey,
} from "@/utils/zakatData";

/* ─────────────────────────────────────────────────────────────────────────
 * Zakat Calculator screen.
 *
 * Layout:
 *   • Header (back chevron + title block + ornamental divider)
 *   • Currency toggle (GBP / USD)
 *   • Nisab type toggle (Gold / Silver) with current threshold
 *   • Assets section (six rows of currency-prefixed numeric inputs)
 *   • Deductions section (debts)
 *   • Result card (parchment-style; total / nisab / due / share button)
 *   • Footer note (Hawl reminder)
 *
 * State is hydrated from AsyncStorage on mount and any change is written
 * back debounced (~600 ms) so the calculator picks up where the user
 * left off.
 * ──────────────────────────────────────────────────────────────────────── */

export default function ZakatScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const miniPlayerH = useMiniPlayerHeight();
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const [hydrated, setHydrated] = useState(false);
  const [inputs, setInputs] = useState<ZakatInputs>({ ...EMPTY_INPUTS });
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_PREFERENCES.currency);
  const [nisabType, setNisabType] = useState<NisabType>(DEFAULT_PREFERENCES.nisabType);
  const [shareOpen, setShareOpen] = useState(false);

  // Hydrate persisted prefs once.
  useEffect(() => {
    let cancelled = false;
    loadZakatPreferences().then((prefs) => {
      if (cancelled) return;
      setInputs(prefs.inputs);
      setCurrency(prefs.currency);
      setNisabType(prefs.nisabType);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced persistence of the input bag.
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      saveZakatInputs(inputs);
    }, 600);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [inputs, hydrated]);

  // Currency / nisab toggles persist immediately — they're discrete picks.
  useEffect(() => {
    if (hydrated) saveZakatCurrency(currency);
  }, [currency, hydrated]);
  useEffect(() => {
    if (hydrated) saveZakatNisabType(nisabType);
  }, [nisabType, hydrated]);

  const computation = useMemo(
    () => computeZakat(inputs, currency, nisabType),
    [inputs, currency, nisabType],
  );

  const handleInputChange = (key: ZakatInputKey, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // ── Share payload ──────────────────────────────────────────────────────
  const shareBody = useMemo(() => {
    const c = computation;
    if (!c.isAboveNisab) {
      return [
        `My wealth this year is ${formatCurrency(c.zakatableWealth, currency)}.`,
        `It is below the ${nisabType} Nisab threshold (${formatCurrency(c.nisabThreshold, currency)}),`,
        `so no Zakat is due, alhamdulillah.`,
      ].join("\n");
    }
    return [
      `My annual Zakat for this year is`,
      `${formatCurrency(c.zakatDue, currency)}.`,
      ``,
      `Calculated at 2.5% on ${formatCurrency(c.zakatableWealth, currency)}`,
      `of zakatable wealth (above the ${nisabType} Nisab).`,
      ``,
      `May Allah accept it from us all.`,
    ].join("\n");
  }, [computation, currency, nisabType]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={26} color={colors.text} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>Zakat</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={topPad + 16}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 80 + miniPlayerH },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerBlock}>
            <Text style={[styles.headerArabic, { color: colors.gold }]}>
              حَاسِبَةُ الزَّكَاةِ
            </Text>
            <View style={styles.headerRule}>
              <View style={[styles.ruleDot, { backgroundColor: colors.gold + "88" }]} />
              <View style={[styles.ruleLine, { backgroundColor: colors.gold + "44" }]} />
              <View style={[styles.ruleDiamond, { borderColor: colors.gold + "AA" }]} />
              <View style={[styles.ruleLine, { backgroundColor: colors.gold + "44" }]} />
              <View style={[styles.ruleDot, { backgroundColor: colors.gold + "88" }]} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Zakat Calculator</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              Calculate your annual Zakat (2.5%)
            </Text>
          </View>

          {/* Currency toggle */}
          <View style={styles.currencyToggleRow}>
            <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>CURRENCY</Text>
            <View style={[styles.segWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => {
                const active = currency === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCurrency(c)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.segPill,
                      active && { backgroundColor: colors.gold },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segPillText,
                        { color: active ? "#0D2018" : colors.textSecondary },
                      ]}
                    >
                      {CURRENCIES[c].symbol} {CURRENCIES[c].label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Nisab selector */}
          <View
            style={[
              styles.nisabCard,
              { backgroundColor: colors.surface, borderColor: colors.gold + "33" },
            ]}
          >
            <View style={styles.nisabHeaderRow}>
              <View style={styles.nisabTitleRow}>
                <MaterialCommunityIcons
                  name="scale-balance"
                  size={18}
                  color={colors.gold}
                />
                <Text style={[styles.nisabTitle, { color: colors.text }]}>Nisab Threshold</Text>
              </View>
              <Text style={[styles.nisabValue, { color: colors.gold }]}>
                {formatCurrency(NISAB_THRESHOLDS[currency][nisabType], currency)}
              </Text>
            </View>

            <View style={styles.nisabPillRow}>
              {(["gold", "silver"] as NisabType[]).map((t) => {
                const active = nisabType === t;
                const grams = t === "gold" ? "85g gold" : "612g silver";
                return (
                  <Pressable
                    key={t}
                    onPress={() => setNisabType(t)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.nisabPill,
                      {
                        backgroundColor: active ? colors.gold : "transparent",
                        borderColor: active ? colors.gold : colors.border,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={t === "gold" ? "circle-multiple" : "circle-multiple-outline"}
                      size={14}
                      color={active ? "#0D2018" : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.nisabPillText,
                        { color: active ? "#0D2018" : colors.text },
                      ]}
                    >
                      {t === "gold" ? "Gold Nisab" : "Silver Nisab"}
                    </Text>
                    <Text
                      style={[
                        styles.nisabPillSub,
                        { color: active ? "#0D2018AA" : colors.textSecondary },
                      ]}
                    >
                      {grams}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.nisabHint, { color: colors.textSecondary }]}>
              Most scholars recommend the Silver Nisab as it benefits more
              people in need. Spot prices fluctuate — please verify.
            </Text>
          </View>

          {/* Assets */}
          <SectionLabel
            title="ASSETS"
            arabic="الأصول"
            color={colors.textSecondary}
            ruleColor={colors.border}
          />
          <View
            style={[
              styles.fieldGroup,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {ASSET_FIELDS.map((f, idx) => (
              <ZakatField
                key={f.key}
                label={f.label}
                hint={f.hint}
                value={inputs[f.key]}
                onChange={(v) => handleInputChange(f.key, v)}
                currency={currency}
                isLast={idx === ASSET_FIELDS.length - 1}
                colors={colors}
              />
            ))}
          </View>

          {/* Deductions */}
          <SectionLabel
            title="DEDUCTIONS"
            arabic="الخصومات"
            color={colors.textSecondary}
            ruleColor={colors.border}
          />
          <View
            style={[
              styles.fieldGroup,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {DEDUCTION_FIELDS.map((f, idx) => (
              <ZakatField
                key={f.key}
                label={f.label}
                hint={f.hint}
                value={inputs[f.key]}
                onChange={(v) => handleInputChange(f.key, v)}
                currency={currency}
                isLast={idx === DEDUCTION_FIELDS.length - 1}
                colors={colors}
              />
            ))}
          </View>

          {/* Result card — parchment-styled */}
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: "#F4ECD8",
                borderColor: "#C9933A",
              },
            ]}
          >
            {/* Ribbon centred via a full-width absolute wrapper. We can't
                use translateX-by-half because the ribbon width depends on
                the rendered text and we don't measure it. */}
            <View style={styles.resultRibbonWrap}>
              <View style={styles.resultRibbon}>
                <Text style={styles.resultRibbonText}>YOUR ZAKAT</Text>
              </View>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultRowLabel}>Total Assets</Text>
              <Text style={styles.resultRowValue}>
                {formatCurrency(computation.totalAssets, currency)}
              </Text>
            </View>
            {computation.totalDebts > 0 && (
              <View style={styles.resultRow}>
                <Text style={styles.resultRowLabel}>Less: Debts</Text>
                <Text style={styles.resultRowValue}>
                  − {formatCurrency(computation.totalDebts, currency)}
                </Text>
              </View>
            )}
            <View style={styles.resultRow}>
              <Text style={[styles.resultRowLabel, styles.resultRowLabelStrong]}>
                Zakatable Wealth
              </Text>
              <Text style={[styles.resultRowValue, styles.resultRowValueStrong]}>
                {formatCurrency(computation.zakatableWealth, currency)}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultRowLabel}>
                Nisab Threshold ({nisabType})
              </Text>
              <Text style={styles.resultRowValue}>
                {formatCurrency(computation.nisabThreshold, currency)}
              </Text>
            </View>

            <View style={styles.resultDivider} />

            {computation.isAboveNisab ? (
              <>
                <Text style={styles.resultDueLabel}>
                  Zakat Due ({(ZAKAT_RATE * 100).toFixed(1)}%)
                </Text>
                <Text style={styles.resultDueValue}>
                  {formatCurrency(computation.zakatDue, currency)}
                </Text>
                <Pressable
                  onPress={() => setShareOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Share your Zakat result"
                  style={({ pressed }) => [
                    styles.shareBtn,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Feather name="share-2" size={16} color="#F4ECD8" />
                  <Text style={styles.shareBtnText}>Share Result</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.resultBelowTitle}>
                  Below the Nisab threshold
                </Text>
                <Text style={styles.resultBelowText}>
                  No Zakat is due this year.
                </Text>
              </>
            )}
          </View>

          {/* Footer note */}
          <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
            Zakat becomes obligatory after wealth remains above the Nisab for
            one full lunar year (Hawl). This calculator is a guide — please
            consult a scholar for your specific situation.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Share sheet */}
      {shareOpen && (
        <ContentShareSheet
          visible={shareOpen}
          onClose={() => setShareOpen(false)}
          theme="dua"
          sheetTitle="Share Your Zakat"
          shareTitle="My Zakat"
          label={`ZAKAT  ·  ${(ZAKAT_RATE * 100).toFixed(1)}%`}
          arabicText={undefined}
          bodyText={shareBody}
          source="Calculated with Nuur · حاسبة الزكاة"
        />
      )}
    </View>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function SectionLabel({
  title, arabic, color, ruleColor,
}: { title: string; arabic: string; color: string; ruleColor: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionLabel, { color }]}>
        {title} · {arabic}
      </Text>
      <View style={[styles.sectionRule, { backgroundColor: ruleColor }]} />
    </View>
  );
}

interface ZakatFieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  currency: CurrencyCode;
  isLast: boolean;
  colors: ReturnType<typeof useAppContext>["themeColors"];
}

function ZakatField({
  label, hint, value, onChange, currency, isLast, colors,
}: ZakatFieldProps) {
  // Sanitise as the user types: only digits, comma and a single dot.
  const handleChange = (raw: string) => {
    let cleaned = raw.replace(/[^0-9.,]/g, "");
    // Collapse multiple dots to one.
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      cleaned =
        cleaned.slice(0, firstDot + 1) +
        cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    onChange(cleaned);
  };

  return (
    <View
      style={[
        styles.fieldRow,
        {
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.fieldLabelBlock}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.fieldHint, { color: colors.textSecondary }]}>
          {hint}
        </Text>
      </View>
      <View style={[styles.fieldInputWrap, { borderColor: colors.border }]}>
        <Text style={[styles.fieldCurrencySym, { color: colors.gold }]}>
          {CURRENCIES[currency].symbol}
        </Text>
        <TextInput
          style={[styles.fieldInput, { color: colors.text }]}
          value={value}
          onChangeText={handleChange}
          keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
          inputMode="decimal"
          placeholder="0"
          placeholderTextColor={colors.textSecondary + "88"}
          returnKeyType="done"
          accessibilityLabel={`${label} amount in ${currency}`}
        />
      </View>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  topBarTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },

  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  /* Header */
  headerBlock: { alignItems: "center", marginBottom: 22, marginTop: 4 },
  headerArabic: {
    fontSize: 26,
    fontFamily: "AmiriQuran_400Regular",
    marginBottom: 8,
    includeFontPadding: false,
    paddingTop: 4,
  },
  headerRule: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  ruleDot: { width: 4, height: 4, borderRadius: 2 },
  ruleLine: { width: 40, height: 1 },
  ruleDiamond: { width: 6, height: 6, borderWidth: 1, transform: [{ rotate: "45deg" }] },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerSub: { fontSize: 13, textAlign: "center" },

  /* Currency toggle */
  currencyToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  miniLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
  },
  segWrap: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 999,
    padding: 3,
    gap: 2,
  },
  segPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  segPillText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
  },

  /* Nisab card */
  nisabCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 22,
  },
  nisabHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  nisabTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  nisabTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nisabValue: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  nisabPillRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  nisabPill: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 10,
  },
  nisabPillText: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
  nisabPillSub: { fontSize: 10, fontFamily: "Inter_500Medium", letterSpacing: 0.4 },
  nisabHint: { fontSize: 11, lineHeight: 16, marginTop: 2 },

  /* Section header */
  sectionHeader: { marginTop: 4, marginBottom: 10, gap: 6 },
  sectionLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.4 },
  sectionRule: { height: 1 },

  /* Field group */
  fieldGroup: {
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 18,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  fieldLabelBlock: { flex: 1, gap: 2 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  fieldHint: { fontSize: 10, lineHeight: 14 },
  fieldInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 120,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    gap: 4,
  },
  fieldCurrencySym: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    paddingVertical: 0,
    minWidth: 60,
    textAlign: "right",
  },

  /* Result card */
  resultCard: {
    borderRadius: 16,
    padding: 18,
    paddingTop: 26,
    borderWidth: 1.5,
    marginBottom: 18,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  resultRibbonWrap: {
    position: "absolute",
    top: -10,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  resultRibbon: {
    backgroundColor: "#7A5A2E",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
  },
  resultRibbonText: {
    color: "#F4ECD8",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.6,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  resultRowLabel: {
    color: "#5C4632",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  resultRowLabelStrong: {
    color: "#2A2018",
    fontFamily: "Inter_600SemiBold",
  },
  resultRowValue: {
    color: "#2A2018",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  resultRowValueStrong: {
    fontSize: 16,
  },
  resultDivider: {
    height: 1,
    backgroundColor: "#C9933A55",
    marginVertical: 12,
  },
  resultDueLabel: {
    textAlign: "center",
    color: "#5C4632",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  resultDueValue: {
    textAlign: "center",
    color: "#7A5A2E",
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  resultBelowTitle: {
    textAlign: "center",
    color: "#2A2018",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  resultBelowText: {
    textAlign: "center",
    color: "#5C4632",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7A5A2E",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  shareBtnText: {
    color: "#F4ECD8",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.6,
  },

  /* Footer */
  footerNote: {
    fontSize: 11,
    lineHeight: 16,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 6,
  },
});
