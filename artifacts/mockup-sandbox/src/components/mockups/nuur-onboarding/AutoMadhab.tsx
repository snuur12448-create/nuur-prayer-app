import { motion } from "framer-motion";
import { useState } from "react";
import { Zap, Check, CheckCircle2, MapPin, ChevronDown, ChevronLeft, Moon } from "lucide-react";

const BG = "#09150D";
const GOLD = "#C9933A";
const TEXT = "#F0EDE4";
const TEXT_DIM = "rgba(240,237,228,0.5)";
const TEXT_DIM_STRONG = "rgba(240,237,228,0.85)";
const SURFACE = "rgba(255,255,255,0.05)";
const SURFACE_ACTIVE = "rgba(201,147,58,0.13)";
const BORDER_DIM = "rgba(255,255,255,0.1)";

const F_REG = "'Inter', system-ui, sans-serif";
const F_SEMI = "'Inter', system-ui, sans-serif";
const F_BOLD = "'Inter', system-ui, sans-serif";

type Madhab = "Hanafi" | "Shafi";

export function AutoMadhab() {
  const [selected, setSelected] = useState<Madhab>("Hanafi");

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-hidden relative"
      style={{ backgroundColor: BG, fontFamily: F_REG }}
    >
      {/* Back button */}
      <button
        className="absolute left-3 top-12 p-2.5 z-10"
        style={{ color: TEXT_DIM }}
      >
        <ChevronLeft size={22} strokeWidth={2} />
      </button>

      {/* Upper content */}
      <div className="flex-1 flex flex-col items-center px-6" style={{ paddingTop: 80 }}>
        {/* Step icon: glow + ring + crescent-star */}
        <div className="relative flex items-center justify-center mb-[22px]">
          <div
            className="absolute rounded-full"
            style={{ width: 130, height: 130, backgroundColor: GOLD + "14" }}
          />
          <div
            className="rounded-full flex items-center justify-center relative"
            style={{
              width: 96,
              height: 96,
              border: `1.5px solid ${GOLD}40`,
              backgroundColor: GOLD + "0E",
            }}
          >
            <CrescentStar size={48} color={GOLD} />
          </div>
        </div>

        {/* Title + subtitle */}
        <h1
          className="text-center"
          style={{
            fontFamily: F_BOLD,
            fontWeight: 700,
            fontSize: 26,
            color: TEXT,
            letterSpacing: -0.3,
            lineHeight: 1.15,
          }}
        >
          Asr Madhab
        </h1>
        <p
          className="text-center mt-1.5"
          style={{
            fontFamily: F_REG,
            fontSize: 15,
            color: TEXT_DIM,
          }}
        >
          When does the afternoon prayer begin?
        </p>

        {/* Divider */}
        <div
          className="rounded-sm"
          style={{
            width: 36,
            height: 1.5,
            backgroundColor: GOLD + "55",
            marginTop: 18,
            marginBottom: 18,
          }}
        />

        {/* Section label */}
        <div className="w-full">
          <div
            className="flex items-center justify-between"
            style={{
              fontFamily: F_SEMI,
              fontWeight: 600,
              fontSize: 11,
              color: TEXT_DIM,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            <span>School of Thought</span>
            <span style={{ color: GOLD + "AA", letterSpacing: 0.5, textTransform: "none", fontSize: 10 }}>
              tap to change
            </span>
          </div>

          {/* Detected pill */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-3"
            style={{
              backgroundColor: GOLD + "10",
              border: `1px solid ${GOLD}33`,
              width: "fit-content",
            }}
          >
            <MapPin size={11} color={GOLD} strokeWidth={2.2} />
            <span
              style={{
                fontFamily: F_REG,
                fontSize: 11,
                color: TEXT_DIM_STRONG,
                letterSpacing: 0.2,
              }}
            >
              Detected:&nbsp;
              <span style={{ color: GOLD, fontFamily: F_SEMI, fontWeight: 600 }}>Karachi, PK</span>
            </span>
          </motion.div>

          {/* Madhab row — matches real app's two-card layout */}
          <div className="flex gap-3 w-full mt-1">
            <MadhabCard
              isSelected={selected === "Hanafi"}
              isAuto
              arabic="حنفي"
              name="Hanafi"
              desc="Shadow = 2× height"
              timing="≈ 4:48 PM"
              onSelect={() => setSelected("Hanafi")}
            />
            <MadhabCard
              isSelected={selected === "Shafi"}
              isAuto={false}
              arabic="شافعي"
              name="Shafi'i"
              desc="Shadow = 1× height"
              timing="≈ 3:18 PM"
              onSelect={() => setSelected("Shafi")}
            />
          </div>

          {/* Reassurance */}
          <p
            className="mt-3.5"
            style={{
              fontFamily: F_REG,
              fontSize: 12,
              color: TEXT_DIM,
              lineHeight: 1.5,
            }}
          >
            Not sure? The suggestion is based on your region — most users keep it. You can change this any time in Settings.
          </p>
        </div>
      </div>

      {/* Lower CTA */}
      <div className="px-6 pb-10 flex flex-col items-center w-full" style={{ paddingBottom: 36 }}>
        <button
          className="w-full flex items-center justify-center gap-2 rounded-[14px]"
          style={{
            backgroundColor: GOLD,
            paddingTop: 15,
            paddingBottom: 15,
            marginBottom: 10,
          }}
        >
          <CheckCircle2 size={18} color="#fff" strokeWidth={2.2} />
          <span
            style={{
              color: "#fff",
              fontFamily: F_BOLD,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Get Started
          </span>
        </button>

        {/* Dots: matches real onboarding (3 dots, current=2 wider gold) */}
        <div className="flex items-center gap-1.5 mt-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                height: 8,
                width: i === 2 ? 22 : 8,
                backgroundColor: i === 2 ? GOLD : GOLD + "30",
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MadhabCard({
  isSelected,
  isAuto,
  arabic,
  name,
  desc,
  timing,
  onSelect,
}: {
  isSelected: boolean;
  isAuto: boolean;
  arabic: string;
  name: string;
  desc: string;
  timing: string;
  onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      animate={{
        borderColor: isSelected ? GOLD : BORDER_DIM,
        backgroundColor: isSelected ? SURFACE_ACTIVE : SURFACE,
      }}
      transition={{ duration: 0.25 }}
      className="relative flex-1 rounded-2xl flex flex-col items-center"
      style={{
        borderWidth: 1.5,
        borderStyle: "solid",
        padding: 16,
        gap: 3,
      }}
    >
      {/* Selected check (top right) */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="absolute rounded-full flex items-center justify-center"
          style={{
            top: 10,
            right: 10,
            width: 18,
            height: 18,
            border: `1px solid ${GOLD}`,
            backgroundColor: GOLD + "18",
          }}
        >
          <Check size={10} color={GOLD} strokeWidth={3} />
        </motion.div>
      )}

      {/* Auto badge (top left, only on suggested) */}
      {isAuto && (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="absolute flex items-center gap-1 rounded-full"
          style={{
            top: 8,
            left: 8,
            paddingLeft: 6,
            paddingRight: 7,
            paddingTop: 2,
            paddingBottom: 2,
            backgroundColor: GOLD + "1F",
            border: `1px solid ${GOLD}55`,
          }}
        >
          <Zap size={9} color={GOLD} fill={GOLD} strokeWidth={2} />
          <span
            style={{
              fontFamily: F_SEMI,
              fontWeight: 600,
              fontSize: 9,
              color: GOLD,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            Auto
          </span>
        </motion.div>
      )}

      {/* Arabic name */}
      <div
        style={{
          fontFamily: F_BOLD,
          fontWeight: 700,
          fontSize: 22,
          color: isSelected ? GOLD : TEXT_DIM,
          marginTop: 14,
        }}
      >
        {arabic}
      </div>

      {/* English name */}
      <div
        style={{
          fontFamily: F_SEMI,
          fontWeight: 600,
          fontSize: 14,
          color: isSelected ? TEXT : TEXT_DIM,
        }}
      >
        {name}
      </div>

      {/* Mini divider */}
      <div
        style={{
          width: 24,
          height: 1,
          backgroundColor: GOLD + "30",
          marginTop: 6,
          marginBottom: 6,
        }}
      />

      {/* Description */}
      <div
        style={{
          fontFamily: F_REG,
          fontSize: 11,
          color: isSelected ? TEXT_DIM : "rgba(240,237,228,0.25)",
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {desc}
      </div>

      {/* Timing */}
      <div
        style={{
          fontFamily: F_SEMI,
          fontWeight: 600,
          fontSize: 12,
          color: isSelected ? GOLD : GOLD + "50",
          marginTop: 2,
        }}
      >
        {timing}
      </div>
    </motion.button>
  );
}

function CrescentStar({ size = 48, color = GOLD }: { size?: number; color?: string }) {
  // Approximation of MaterialCommunityIcons "star-crescent": waxing crescent + small star.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Crescent: outer circle minus offset inner circle */}
      <defs>
        <mask id="crescent-mask">
          <rect width="24" height="24" fill="white" />
          <circle cx="14" cy="11" r="7.2" fill="black" />
        </mask>
      </defs>
      <circle cx="11" cy="12" r="9" fill={color} mask="url(#crescent-mask)" />
      {/* Small 5-point star to right */}
      <path
        d="M19 6.2 L19.65 7.7 L21.25 7.85 L20 8.95 L20.4 10.5 L19 9.65 L17.6 10.5 L18 8.95 L16.75 7.85 L18.35 7.7 Z"
        fill={color}
      />
    </svg>
  );
}
