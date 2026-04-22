import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const GOLD = "#C9933A";
const GOLD_SOFT = "#E0B968";
const BG = "#0F0E0C";
const PARCHMENT = "#F2E8D5";
const DIM = "#A89C84";
const SURFACE = "#171411";

type Choice = "standard" | "hanafi";

export function AutoMadhab() {
  const [selected, setSelected] = useState<Choice>("hanafi");
  const [tick, setTick] = useState(0);

  // Loop the "auto-detect → suggest" sweep so the canvas viewer can see the badge
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-hidden relative"
      style={{ backgroundColor: BG }}
    >
      <RadialGlow />

      {/* top bar */}
      <div className="flex items-center justify-between px-6 pt-14 pb-4 relative z-10">
        <button className="text-[12px] tracking-[0.2em] uppercase font-['Inter']" style={{ color: DIM }}>
          ← Back
        </button>
        <ProgressDots active={2} count={4} />
        <div className="w-10" />
      </div>

      {/* header */}
      <div className="px-6 pt-2 relative z-10">
        <div
          className="font-['Amiri'] text-xl mb-1"
          style={{ color: PARCHMENT, opacity: 0.7 }}
        >
          الْمَذْهَبُ
        </div>
        <h1
          className="font-['Playfair_Display'] text-[26px] leading-tight"
          style={{ color: PARCHMENT }}
        >
          When does Asr begin?
        </h1>
        <p
          className="mt-2 font-['Inter'] text-[13px] leading-relaxed"
          style={{ color: DIM }}
        >
          Asr starts when an object's shadow reaches a certain length. The school of thought you follow decides which.
        </p>

        {/* Auto-detected hint */}
        <motion.div
          key={`detect-${tick}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 flex items-center gap-2 px-3 py-2 rounded-full self-start"
          style={{
            backgroundColor: GOLD + "12",
            border: `1px solid ${GOLD}33`,
            width: "fit-content",
          }}
        >
          <Spark />
          <span
            className="font-['Inter'] text-[11px] tracking-wide"
            style={{ color: GOLD_SOFT }}
          >
            Detected from your location · Karachi, PK
          </span>
        </motion.div>
      </div>

      {/* options */}
      <div className="px-5 mt-5 flex flex-col gap-3 relative z-10">
        <MadhabOption
          choice="hanafi"
          selected={selected === "hanafi"}
          isAuto
          arabic="حَنَفِي"
          name="Hanafi"
          shadowDesc="Asr when shadow = 2× object height"
          example="≈ 4:48 PM today"
          regions="Common in: Pakistan, India, Turkey, Central Asia"
          onSelect={() => setSelected("hanafi")}
          shadowMultiplier={2}
        />
        <MadhabOption
          choice="standard"
          selected={selected === "standard"}
          isAuto={false}
          arabic="شَافِعِي"
          name="Standard (Shafi'i, Maliki, Hanbali)"
          shadowDesc="Asr when shadow = 1× object height"
          example="≈ 3:18 PM today"
          regions="Common in: Arab world, SE Asia, most of Africa"
          onSelect={() => setSelected("standard")}
          shadowMultiplier={1}
        />
      </div>

      {/* gentle nudge */}
      <div className="px-6 pt-4 relative z-10">
        <div className="font-['Inter'] text-[11px] leading-relaxed flex items-start gap-2" style={{ color: DIM }}>
          <span style={{ color: GOLD, marginTop: 1 }}>ⓘ</span>
          <span>Not sure? Keep the suggestion — you can change it any time in Settings.</span>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto px-6 pb-10 relative z-10">
        <button
          className="w-full rounded-full py-4 font-['Inter'] text-[13px] tracking-[0.18em] uppercase flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD})`,
            color: BG,
            fontWeight: 600,
          }}
        >
          Continue <span>→</span>
        </button>
      </div>
    </div>
  );
}

function MadhabOption({
  choice,
  selected,
  isAuto,
  arabic,
  name,
  shadowDesc,
  example,
  regions,
  onSelect,
  shadowMultiplier,
}: {
  choice: Choice;
  selected: boolean;
  isAuto: boolean;
  arabic: string;
  name: string;
  shadowDesc: string;
  example: string;
  regions: string;
  onSelect: () => void;
  shadowMultiplier: 1 | 2;
}) {
  return (
    <motion.button
      onClick={onSelect}
      animate={{
        borderColor: selected ? GOLD : GOLD + "22",
        boxShadow: selected
          ? `0 0 0 3px ${GOLD}1A, 0 12px 30px -18px ${GOLD}66`
          : "0 0 0 0 transparent",
      }}
      transition={{ duration: 0.3 }}
      className="text-left rounded-2xl p-4 relative"
      style={{
        backgroundColor: selected ? "#1B1610" : SURFACE,
        border: `1.5px solid ${GOLD}22`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="font-['Amiri'] text-2xl"
              style={{ color: selected ? GOLD : PARCHMENT }}
            >
              {arabic}
            </span>
            {isAuto && (
              <motion.span
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: GOLD,
                  color: BG,
                  fontWeight: 700,
                }}
              >
                Auto
              </motion.span>
            )}
          </div>
          <div
            className="font-['Inter'] text-[13px] mt-0.5"
            style={{ color: selected ? PARCHMENT : DIM, fontWeight: selected ? 600 : 400 }}
          >
            {name}
          </div>
        </div>

        <ShadowDiagram multiplier={shadowMultiplier} active={selected} />
      </div>

      <div
        className="mt-3 font-['Inter'] text-[11px]"
        style={{ color: DIM }}
      >
        {shadowDesc}
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span
          className="font-['Inter'] text-[10px] tracking-wider"
          style={{ color: DIM, opacity: 0.8 }}
        >
          {regions}
        </span>
        <span
          className="font-['Inter'] text-[12px] tabular-nums"
          style={{ color: selected ? GOLD : GOLD + "88", fontWeight: 600 }}
        >
          {example}
        </span>
      </div>

      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: GOLD }}
        >
          <span className="text-[11px]" style={{ color: BG, fontWeight: 800 }}>✓</span>
        </motion.div>
      )}
    </motion.button>
  );
}

function ShadowDiagram({ multiplier, active }: { multiplier: 1 | 2; active: boolean }) {
  // Mini visualization: a "stick" with its shadow stretching to the right.
  const stickColor = active ? GOLD : DIM;
  const shadowLen = multiplier === 1 ? 24 : 48;
  return (
    <div className="flex items-end h-10" style={{ width: 70 }}>
      <div className="flex flex-col items-center">
        {/* sun */}
        <motion.div
          animate={{ opacity: active ? [0.6, 1, 0.6] : 0.4 }}
          transition={{ duration: 3, repeat: Infinity }}
          className="rounded-full mb-0.5"
          style={{
            width: 6, height: 6,
            backgroundColor: stickColor,
            boxShadow: active ? `0 0 6px ${GOLD}` : "none",
          }}
        />
        {/* stick */}
        <div style={{ width: 2, height: 22, backgroundColor: stickColor }} />
      </div>
      {/* shadow */}
      <motion.div
        animate={{ width: shadowLen, backgroundColor: stickColor + "55" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: 2,
          marginBottom: 0,
          marginLeft: 0,
        }}
      />
    </div>
  );
}

function ProgressDots({ active, count }: { active: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            backgroundColor: i === active ? GOLD : GOLD + "33",
            width: i === active ? 18 : 6,
            height: 6,
          }}
        />
      ))}
    </div>
  );
}

function Spark() {
  return (
    <motion.span
      animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.15, 0.95, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      style={{ color: GOLD, fontSize: 11, lineHeight: 1 }}
    >
      ✦
    </motion.span>
  );
}

function RadialGlow() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${GOLD}10 0%, transparent 50%)`,
      }}
    />
  );
}
