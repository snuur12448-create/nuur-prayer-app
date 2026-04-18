import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import {
  DEFAULT_QADA_STATE,
  EMPTY_COUNTS,
  QADA_LABELS,
  QADA_PRAYERS,
  QadaPrayerKey,
  QadaState,
  estimateFromWizard,
  isoDate,
  loadQadaState,
  remainingForPrayer,
  saveQadaState,
  todayLogCount,
  totalInitial,
  totalMadeUp,
  totalRemaining,
} from "@/utils/qadaData";

type Mode = "loading" | "setup" | "wizard" | "ledger";

const PRAYER_ICON: Record<QadaPrayerKey, keyof typeof Feather.glyphMap> = {
  fajr: "sunrise",
  dhuhr: "sun",
  asr: "cloud",
  maghrib: "sunset",
  isha: "moon",
};

export default function QadaScreen() {
  const insets = useSafeAreaInsets();
  const { themeColors: colors } = useAppContext();
  const [mode, setMode] = useState<Mode>("loading");
  const [state, setState] = useState<QadaState>(DEFAULT_QADA_STATE);
  const [draft, setDraft] = useState<Record<QadaPrayerKey, number>>(EMPTY_COUNTS);
  const [markupOpen, setMarkupOpen] = useState(false);

  const topInset = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  useEffect(() => {
    loadQadaState().then((s) => {
      setState(s);
      setDraft(s.initial);
      setMode(s.configured ? "ledger" : "setup");
    });
  }, []);

  // Functional updater so multiple rapid taps stay consistent. Every call
  // computes the new state from the latest committed state, then persists.
  // Saves are fire-and-forget but the in-memory state is always authoritative
  // for further reads.
  const updateState = (mutate: (prev: QadaState) => QadaState) => {
    setState((prev) => {
      const next = mutate(prev);
      saveQadaState(next).catch(() => {});
      return next;
    });
  };

  const handleSaveSetup = () => {
    updateState((prev) => ({
      ...prev,
      configured: true,
      initial: { ...draft },
      madeUp: prev.configured ? prev.madeUp : { ...EMPTY_COUNTS },
      startedAt: prev.startedAt ?? new Date().toISOString(),
    }));
    setMode("ledger");
  };

  const handleOptOut = () => {
    router.back();
  };

  const handleConfirmMakeup = (key: QadaPrayerKey, count: number) => {
    // Close the sheet immediately so it feels snappy and so a quick second
    // tap can't double-fire while the previous save is in flight.
    setMarkupOpen(false);
    const today = isoDate(new Date());
    updateState((prev) => {
      const newLog = [...prev.recentLog];
      for (let i = 0; i < count; i++) newLog.push(today);
      while (newLog.length > 60) newLog.shift();
      return {
        ...prev,
        madeUp: { ...prev.madeUp, [key]: prev.madeUp[key] + count },
        recentLog: newLog,
      };
    });
  };

  // ── render ──
  if (mode === "loading") {
    return <View style={[styles.root, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
          <Feather name="arrow-left" size={20} color={colors.tint} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>
          {mode === "setup" ? "MAKE-UP PRAYERS" : mode === "wizard" ? "HELP ME ESTIMATE" : "MY LEDGER"}
        </Text>
        <View style={styles.headerBtn}>
          {mode === "ledger" && (
            <TouchableOpacity
              hitSlop={12}
              onPress={() => {
                setDraft(state.initial);
                setMode("setup");
              }}
            >
              <Feather name="settings" size={18} color={colors.tint} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {mode === "setup" && (
        <SetupView
          colors={colors}
          draft={draft}
          setDraft={setDraft}
          onSave={handleSaveSetup}
          onOptOut={handleOptOut}
          onWizard={() => setMode("wizard")}
          isFirstTime={!state.configured}
          insetsBottom={insets.bottom}
        />
      )}

      {mode === "wizard" && (
        <WizardView
          colors={colors}
          onCancel={() => setMode("setup")}
          onUseEstimate={(counts) => {
            setDraft(counts);
            setMode("setup");
          }}
          insetsBottom={insets.bottom}
        />
      )}

      {mode === "ledger" && (
        <LedgerView
          colors={colors}
          state={state}
          onMakeUp={() => setMarkupOpen(true)}
          insetsBottom={insets.bottom}
        />
      )}

      <Modal
        visible={markupOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMarkupOpen(false)}
      >
        <MarkUpSheet
          colors={colors}
          state={state}
          onCancel={() => setMarkupOpen(false)}
          onConfirm={handleConfirmMakeup}
          insetsBottom={insets.bottom}
        />
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

function SetupView({
  colors, draft, setDraft, onSave, onOptOut, onWizard, isFirstTime, insetsBottom,
}: {
  colors: any;
  draft: Record<QadaPrayerKey, number>;
  setDraft: (d: Record<QadaPrayerKey, number>) => void;
  onSave: () => void;
  onOptOut: () => void;
  onWizard: () => void;
  isFirstTime: boolean;
  insetsBottom: number;
}) {
  const adjust = (key: QadaPrayerKey, delta: number) => {
    setDraft({ ...draft, [key]: Math.max(0, draft[key] + delta) });
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insetsBottom + 120 }}
      showsVerticalScrollIndicator={false}
    >
      {isFirstTime && (
        <View style={styles.introBlock}>
          <Text style={[styles.introArabic, { color: colors.tint }]}>قَضَاء</Text>
          <Text style={[styles.introTitle, { color: colors.text }]}>A quiet ledger</Text>
          <Text style={[styles.introBody, { color: colors.textSecondary }]}>
            A private place to keep track of prayers you'd like to make up — and a gentle way to chip away at them.{"\n\n"}
            Only you can see this. There are no streaks, no badges, and nothing to lose.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.wizardCta, { borderColor: colors.tint + "55", backgroundColor: colors.tint + "10" }]}
        onPress={onWizard}
        activeOpacity={0.8}
      >
        <View style={[styles.wizardIcon, { backgroundColor: colors.tint + "22" }]}>
          <Feather name="zap" size={14} color={colors.tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.wizardTitle, { color: colors.text }]}>Help me estimate</Text>
          <Text style={[styles.wizardSub, { color: colors.textSecondary }]}>Answer a few gentle questions</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.tint} />
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardLabel, { color: colors.tint }]}>HOW MANY DO YOU CARRY?</Text>
        {QADA_PRAYERS.map((p, i) => (
          <View key={p}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            <View style={styles.setupRow}>
              <View style={[styles.prayerIcon, { backgroundColor: colors.tint + "18", borderColor: colors.tint + "33" }]}>
                <Feather name={PRAYER_ICON[p]} size={14} color={colors.tint} />
              </View>
              <Text style={[styles.prayerLabel, { color: colors.text }]}>{QADA_LABELS[p].en}</Text>
              <View style={styles.stepperGroup}>
                <Pressable
                  style={[styles.stepperBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => adjust(p, -1)}
                  hitSlop={8}
                >
                  <Feather name="minus" size={14} color={colors.textSecondary} />
                </Pressable>
                <Text style={[styles.stepperValue, { color: colors.tint }]}>{draft[p]}</Text>
                <Pressable
                  style={[styles.stepperBtn, { backgroundColor: colors.tint + "22", borderColor: colors.tint + "55" }]}
                  onPress={() => adjust(p, 1)}
                  hitSlop={8}
                >
                  <Feather name="plus" size={14} color={colors.tint} />
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.helperText, { color: colors.textSecondary }]}>
        Estimate gently. You can change these any time.
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
          onPress={onSave}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, { color: colors.background }]}>
            {isFirstTime ? "Save my ledger" : "Save changes"}
          </Text>
        </TouchableOpacity>
        {isFirstTime && (
          <TouchableOpacity onPress={onOptOut} style={styles.secondaryBtn}>
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>I'd rather not track this</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Wizard
// ─────────────────────────────────────────────────────────────────────────────

const YEARS_CHIPS = [
  { label: "Last year", value: 1 },
  { label: "5 yrs",     value: 5 },
  { label: "10 yrs",    value: 10 },
  { label: "20 yrs",    value: 20 },
];

function WizardView({
  colors, onCancel, onUseEstimate, insetsBottom,
}: {
  colors: any;
  onCancel: () => void;
  onUseEstimate: (counts: Record<QadaPrayerKey, number>) => void;
  insetsBottom: number;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [years, setYears] = useState(10);
  const [dailyMissed, setDailyMissed] = useState(2);

  const counts = useMemo(() => estimateFromWizard(years, dailyMissed), [years, dailyMissed]);
  const total = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insetsBottom + 120 }} showsVerticalScrollIndicator={false}>
      {/* Progress */}
      <View style={styles.wizardProgress}>
        <View style={[styles.wizardProgressBar, { backgroundColor: colors.tint }]} />
        <View style={[styles.wizardProgressBar, { backgroundColor: step >= 2 ? colors.tint : colors.border }]} />
      </View>

      {step === 1 && (
        <View>
          <View style={styles.wizardHeader}>
            <View style={[styles.wizardBadge, { backgroundColor: colors.tint + "18", borderColor: colors.tint + "55" }]}>
              <Feather name="zap" size={11} color={colors.tint} />
              <Text style={[styles.wizardBadgeText, { color: colors.tint }]}>STEP 1 OF 2</Text>
            </View>
            <Text style={[styles.wizardQuestion, { color: colors.text }]}>
              Roughly how many years did you miss prayers?
            </Text>
            <Text style={[styles.wizardHelp, { color: colors.textSecondary }]}>
              An approximate number is enough. Your make-up intention is what matters.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.yearRow}>
              <View style={[styles.prayerIcon, { backgroundColor: colors.tint + "18", borderColor: colors.tint + "33" }]}>
                <Feather name="calendar" size={14} color={colors.tint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardLabel, { color: colors.tint, marginBottom: 2 }]}>YEARS MISSED</Text>
                <Text style={[styles.yearValue, { color: colors.text }]}>{years}</Text>
              </View>
              <View style={styles.stepperGroup}>
                <Pressable
                  style={[styles.stepperBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setYears((y) => Math.max(0, y - 1))}
                  hitSlop={8}
                >
                  <Feather name="minus" size={14} color={colors.textSecondary} />
                </Pressable>
                <Pressable
                  style={[styles.stepperBtn, { backgroundColor: colors.tint + "22", borderColor: colors.tint + "55" }]}
                  onPress={() => setYears((y) => Math.min(60, y + 1))}
                  hitSlop={8}
                >
                  <Feather name="plus" size={14} color={colors.tint} />
                </Pressable>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 14 }]} />
            <View style={styles.chipsRow}>
              {YEARS_CHIPS.map((c) => {
                const selected = c.value === years;
                return (
                  <Pressable
                    key={c.value}
                    onPress={() => setYears(c.value)}
                    style={[
                      styles.chip,
                      selected
                        ? { backgroundColor: colors.tint, borderColor: colors.tint }
                        : { backgroundColor: colors.background, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: selected ? colors.background : colors.textSecondary }]}>
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
              onPress={() => setStep(2)}
              activeOpacity={0.85}
            >
              <Text style={[styles.primaryBtnText, { color: colors.background }]}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel} style={styles.secondaryBtn}>
              <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 2 && (
        <View>
          <View style={styles.wizardHeader}>
            <View style={[styles.wizardBadge, { backgroundColor: colors.tint + "18", borderColor: colors.tint + "55" }]}>
              <Feather name="zap" size={11} color={colors.tint} />
              <Text style={[styles.wizardBadgeText, { color: colors.tint }]}>YOUR ESTIMATE</Text>
            </View>
            <Text style={[styles.estimateNumber, { color: colors.tint }]}>~{total.toLocaleString()}</Text>
            <Text style={[styles.estimateSub, { color: colors.text }]}>prayers across {years} year{years === 1 ? "" : "s"}</Text>
            <Text style={[styles.wizardHelp, { color: colors.textSecondary, marginTop: 10 }]}>
              Based on {dailyMissed} missed prayer{dailyMissed === 1 ? "" : "s"} per day on average.
            </Text>
          </View>

          {/* Daily missed selector */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.tint }]}>ON A ROUGH DAY, MISSED…</Text>
            <View style={[styles.chipsRow, { marginTop: 10 }]}>
              {[1, 2, 3, 4, 5].map((n) => {
                const selected = n === dailyMissed;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setDailyMissed(n)}
                    style={[
                      styles.chip,
                      selected
                        ? { backgroundColor: colors.tint, borderColor: colors.tint }
                        : { backgroundColor: colors.background, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: selected ? colors.background : colors.textSecondary }]}>
                      {n} of 5
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Per-prayer breakdown */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {QADA_PRAYERS.map((p, i) => (
              <View key={p}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.estRow}>
                  <View style={[styles.prayerIcon, { backgroundColor: colors.tint + "18", borderColor: colors.tint + "33" }]}>
                    <Feather name={PRAYER_ICON[p]} size={14} color={colors.tint} />
                  </View>
                  <Text style={[styles.prayerLabel, { color: colors.text }]}>{QADA_LABELS[p].en}</Text>
                  <Text style={[styles.estValue, { color: colors.tint }]}>{counts[p].toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.reassureBox, { backgroundColor: colors.tint + "10", borderColor: colors.tint + "33" }]}>
            <Feather name="info" size={14} color={colors.tint} style={{ marginTop: 1 }} />
            <Text style={[styles.reassureText, { color: colors.text }]}>
              This is only a starting estimate. Many scholars say a sincere intention to make up missed prayers is itself counted with Allah.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
              onPress={() => onUseEstimate(counts)}
              activeOpacity={0.85}
            >
              <Text style={[styles.primaryBtnText, { color: colors.background }]}>Use this estimate</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep(1)} style={styles.secondaryBtn}>
              <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ledger
// ─────────────────────────────────────────────────────────────────────────────

function LedgerView({
  colors, state, onMakeUp, insetsBottom,
}: {
  colors: any;
  state: QadaState;
  onMakeUp: () => void;
  insetsBottom: number;
}) {
  const remaining = totalRemaining(state);
  const initial = totalInitial(state);
  const made = totalMadeUp(state);
  const pct = initial === 0 ? 0 : Math.round((made / initial) * 100);
  const todayCount = todayLogCount(state);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insetsBottom + 140 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.heroBlock}>
        <Text style={[styles.heroLabel, { color: colors.tint }]}>REMAINING TO MAKE UP</Text>
        <View style={styles.heroNumRow}>
          <Text style={[styles.heroNum, { color: colors.tint }]}>{remaining.toLocaleString()}</Text>
          <Text style={[styles.heroUnit, { color: colors.textSecondary }]}>prayers</Text>
        </View>
        {initial > 0 && (
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            Started with {initial.toLocaleString()} · made up {made.toLocaleString()} so far
          </Text>
        )}
      </View>

      {/* Progress arc */}
      {initial > 0 && (
        <View style={styles.progressBlock}>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.tint, width: `${pct}%` as any }]} />
          </View>
          <View style={styles.progressMeta}>
            <Text style={[styles.progressMetaText, { color: colors.textSecondary }]}>{pct}% completed</Text>
            <Text style={[styles.progressMetaText, { color: colors.textSecondary }]}>
              ≈ {Math.max(1, Math.ceil(remaining / 7))} weeks at 1/day
            </Text>
          </View>
        </View>
      )}

      {/* Per-prayer list */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {QADA_PRAYERS.map((p, i) => {
          const rem = remainingForPrayer(state, p);
          const init = state.initial[p];
          const done = init > 0 && rem === 0;
          const prayerPct = init === 0 ? 0 : Math.max(0, Math.min(100, ((init - rem) / init) * 100));
          return (
            <View key={p}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <View style={styles.ledgerRow}>
                <View style={[styles.prayerIcon, { backgroundColor: colors.tint + "18", borderColor: colors.tint + "33" }]}>
                  <Feather name={PRAYER_ICON[p]} size={14} color={colors.tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.ledgerRowTop}>
                    <Text style={[styles.prayerLabel, { color: colors.text }]}>{QADA_LABELS[p].en}</Text>
                    <Text style={[styles.ledgerRem, { color: done ? "#10b981" : colors.tint }]}>
                      {rem.toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.miniTrack, { backgroundColor: colors.border }]}>
                    <View style={[styles.miniFill, { backgroundColor: colors.tint, width: `${prayerPct}%` as any }]} />
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Today */}
      <View style={styles.todayRow}>
        <View>
          <Text style={[styles.todayLabel, { color: colors.tint }]}>TODAY</Text>
          <Text style={[styles.todayBody, { color: colors.text }]}>
            {todayCount === 0 ? "Tap below when you make one up" : `${todayCount} made up · keep going`}
          </Text>
        </View>
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i < todayCount ? colors.tint : colors.border },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.tint, flexDirection: "row", justifyContent: "center", gap: 8 }]}
          onPress={onMakeUp}
          activeOpacity={0.85}
          disabled={remaining === 0}
        >
          <Feather name="plus" size={16} color={colors.background} />
          <Text style={[styles.primaryBtnText, { color: colors.background }]}>I made one up</Text>
        </TouchableOpacity>
        <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
          Allah is the most merciful — every step toward Him counts.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mark-up sheet
// ─────────────────────────────────────────────────────────────────────────────

function MarkUpSheet({
  colors, state, onCancel, onConfirm, insetsBottom,
}: {
  colors: any;
  state: QadaState;
  onCancel: () => void;
  onConfirm: (key: QadaPrayerKey, count: number) => void;
  insetsBottom: number;
}) {
  // Default selection: first prayer with remaining > 0
  const firstAvailable = useMemo(() => {
    for (const k of QADA_PRAYERS) {
      if (remainingForPrayer(state, k) > 0) return k;
    }
    return "fajr" as QadaPrayerKey;
  }, [state]);
  const [selected, setSelected] = useState<QadaPrayerKey>(firstAvailable);
  const [count, setCount] = useState(1);

  const remaining = remainingForPrayer(state, selected);
  const safeCount = Math.max(1, Math.min(remaining || 1, count));
  const after = Math.max(0, remaining - safeCount);
  const totalAfter = Math.max(0, totalRemaining(state) - safeCount);

  return (
    <Pressable style={styles.sheetBackdrop} onPress={onCancel}>
      <Pressable style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insetsBottom + 18 }]} onPress={(e) => e.stopPropagation()}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <Text style={[styles.sheetLabel, { color: colors.tint }]}>MARK A MAKE-UP</Text>
        <Text style={[styles.sheetTitle, { color: colors.text }]}>Which prayer did you complete?</Text>

        {/* Prayer chips */}
        <View style={styles.chipsGrid}>
          {QADA_PRAYERS.map((p) => {
            const isSelected = p === selected;
            const rem = remainingForPrayer(state, p);
            const disabled = rem === 0;
            return (
              <Pressable
                key={p}
                disabled={disabled}
                onPress={() => { setSelected(p); setCount(1); }}
                style={[
                  styles.prayerChip,
                  isSelected
                    ? { backgroundColor: colors.tint + "22", borderColor: colors.tint }
                    : { backgroundColor: colors.background, borderColor: colors.border },
                  disabled && { opacity: 0.35 },
                ]}
              >
                <Feather name={PRAYER_ICON[p]} size={16} color={isSelected ? colors.tint : colors.textSecondary} />
                <Text style={[styles.prayerChipText, { color: isSelected ? colors.tint : colors.textSecondary }]}>
                  {QADA_LABELS[p].en}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Count */}
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border, marginTop: 16 }]}>
          <View style={styles.countRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: colors.tint }]}>HOW MANY</Text>
              <Text style={[styles.countSub, { color: colors.textSecondary }]}>Stack a few at once if you'd like</Text>
            </View>
            <View style={styles.stepperGroup}>
              <Pressable
                style={[styles.stepperBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setCount((c) => Math.max(1, c - 1))}
                hitSlop={8}
              >
                <Feather name="minus" size={14} color={colors.textSecondary} />
              </Pressable>
              <Text style={[styles.countValue, { color: colors.tint }]}>{safeCount}</Text>
              <Pressable
                style={[styles.stepperBtn, { backgroundColor: colors.tint + "22", borderColor: colors.tint + "55" }]}
                onPress={() => setCount((c) => Math.min(remaining || 1, c + 1))}
                hitSlop={8}
                disabled={safeCount >= (remaining || 1)}
              >
                <Feather name="plus" size={14} color={colors.tint} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Preview */}
        <View style={[styles.previewBox, { backgroundColor: colors.tint + "12", borderColor: colors.tint + "44" }]}>
          <View style={[styles.previewCheck, { backgroundColor: colors.tint }]}>
            <Feather name="check" size={14} color={colors.background} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.previewLine, { color: colors.text }]}>
              {QADA_LABELS[selected].en} remaining: <Text style={{ color: colors.tint }}>{remaining} → {after}</Text>
            </Text>
            <Text style={[styles.previewSub, { color: colors.textSecondary }]}>
              {totalAfter} left in your ledger
            </Text>
          </View>
        </View>

        <View style={[styles.actions, { paddingHorizontal: 0, marginTop: 18 }]}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
            onPress={() => onConfirm(selected, safeCount)}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnText, { color: colors.background }]}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel} style={styles.secondaryBtn}>
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 11, letterSpacing: 1.4, fontFamily: "Inter_600SemiBold" },

  introBlock: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 12, alignItems: "center" },
  introArabic: { fontSize: 36, fontFamily: "AmiriQuran_400Regular", lineHeight: 48 },
  introTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  introBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, textAlign: "center", marginTop: 12 },

  wizardCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  wizardIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  wizardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  wizardSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },

  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardLabel: { fontSize: 10, letterSpacing: 1.4, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 6, opacity: 0.6 },

  setupRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  prayerIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  prayerLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },

  stepperGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepperBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  stepperValue: { width: 36, textAlign: "center", fontSize: 15, fontFamily: "Inter_600SemiBold", fontVariant: ["tabular-nums"] },

  helperText: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 14, paddingHorizontal: 32, lineHeight: 16 },

  actions: { paddingHorizontal: 16, marginTop: 24 },
  primaryBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", letterSpacing: 0.2 },
  secondaryBtn: { height: 40, alignItems: "center", justifyContent: "center", marginTop: 4 },
  secondaryBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  // Wizard
  wizardProgress: { flexDirection: "row", gap: 6, paddingHorizontal: 16, marginTop: 12 },
  wizardProgressBar: { flex: 1, height: 3, borderRadius: 2 },
  wizardHeader: { paddingHorizontal: 28, paddingTop: 20, alignItems: "center" },
  wizardBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  wizardBadgeText: { fontSize: 10, letterSpacing: 1.2, fontFamily: "Inter_600SemiBold" },
  wizardQuestion: { fontSize: 19, fontFamily: "Inter_600SemiBold", textAlign: "center", marginTop: 14, lineHeight: 26 },
  wizardHelp: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8, lineHeight: 18 },

  yearRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  yearValue: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, borderWidth: 1 },
  chipText: { fontSize: 11, fontFamily: "Inter_500Medium" },

  estimateNumber: { fontSize: 56, fontFamily: "Inter_700Bold", fontVariant: ["tabular-nums"], marginTop: 12, lineHeight: 60 },
  estimateSub: { fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 4 },
  estRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  estValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", fontVariant: ["tabular-nums"] },

  reassureBox: {
    flexDirection: "row", gap: 10,
    marginHorizontal: 16, marginTop: 14,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  reassureText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },

  // Ledger
  heroBlock: { paddingHorizontal: 24, paddingTop: 20, alignItems: "center" },
  heroLabel: { fontSize: 10, letterSpacing: 1.4, fontFamily: "Inter_600SemiBold" },
  heroNumRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 6 },
  heroNum: { fontSize: 60, fontFamily: "Inter_700Bold", fontVariant: ["tabular-nums"], lineHeight: 64 },
  heroUnit: { fontSize: 14, fontFamily: "Inter_500Medium" },
  heroSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 6 },

  progressBlock: { paddingHorizontal: 24, marginTop: 16 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  progressMetaText: { fontSize: 10, fontFamily: "Inter_400Regular" },

  ledgerRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  ledgerRowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ledgerRem: { fontSize: 13, fontFamily: "Inter_600SemiBold", fontVariant: ["tabular-nums"] },
  miniTrack: { height: 4, borderRadius: 2, marginTop: 6, overflow: "hidden" },
  miniFill: { height: 4, borderRadius: 2 },

  todayRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, marginTop: 18,
  },
  todayLabel: { fontSize: 10, letterSpacing: 1.4, fontFamily: "Inter_600SemiBold" },
  todayBody: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 },
  dotsRow: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  footerNote: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 14, paddingHorizontal: 24, lineHeight: 16 },

  // Sheet
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 10 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  sheetLabel: { fontSize: 10, letterSpacing: 1.4, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  sheetTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", textAlign: "center", marginTop: 4, marginBottom: 16 },

  chipsGrid: { flexDirection: "row", gap: 6 },
  prayerChip: {
    flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, gap: 4,
  },
  prayerChipText: { fontSize: 10, fontFamily: "Inter_500Medium" },

  countRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  countSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  countValue: { width: 36, textAlign: "center", fontSize: 18, fontFamily: "Inter_700Bold", fontVariant: ["tabular-nums"] },

  previewBox: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginTop: 14, padding: 12, borderRadius: 12, borderWidth: 1,
  },
  previewCheck: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  previewLine: { fontSize: 13, fontFamily: "Inter_500Medium" },
  previewSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});
