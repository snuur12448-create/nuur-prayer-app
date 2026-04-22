import { motion } from "framer-motion";

const GOLD = "#C9933A";
const GOLD_SOFT = "#E0B968";
const BG = "#0F0E0C";
const PARCHMENT = "#F2E8D5";
const DIM = "#A89C84";

export function Welcome() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center overflow-hidden relative"
      style={{ backgroundColor: BG }}
    >
      <RadialGlow />
      <Stars />

      <div className="relative z-10 flex flex-col items-center justify-center px-8 w-full">
        <motion.div
          key="bismillah-loop"
          initial={{ opacity: 0, scale: 0.88, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative"
        >
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 -m-12 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${GOLD}33 0%, transparent 70%)` }}
          />
          <div
            className="font-['Amiri_Quran'] text-center relative"
            style={{ color: GOLD, fontSize: 64, lineHeight: 1, textShadow: `0 0 40px ${GOLD}55` }}
          >
            ﷽
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 text-center"
        >
          <div
            className="font-['Amiri'] text-3xl"
            style={{ color: PARCHMENT, letterSpacing: "0.02em" }}
          >
            السَّلَامُ عَلَيْكُمْ
          </div>
          <div
            className="mt-3 font-['Inter'] text-sm tracking-[0.22em] uppercase"
            style={{ color: DIM }}
          >
            Assalamu alaikum
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 2.2 }}
          className="mt-14 flex items-center gap-3"
        >
          <Hairline />
          <ShimmerWord text="Nuur" />
          <Hairline />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.6 }}
          className="mt-3 font-['Inter'] text-[11px] tracking-[0.3em] uppercase"
          style={{ color: DIM }}
        >
          Light · Prayer · Quran
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 3.0 }}
        className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-4 z-10"
      >
        <motion.button
          animate={{
            boxShadow: [
              `0 0 0 0 ${GOLD}66`,
              `0 0 0 14px ${GOLD}00`,
              `0 0 0 0 ${GOLD}00`,
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          className="font-['Inter'] text-sm tracking-[0.18em] uppercase rounded-full px-10 py-3.5"
          style={{
            background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD})`,
            color: BG,
            fontWeight: 600,
          }}
        >
          Begin
        </motion.button>
        <div className="font-['Inter'] text-[10px] tracking-[0.25em] uppercase" style={{ color: DIM }}>
          Tap to enter
        </div>
      </motion.div>
    </div>
  );
}

function Hairline() {
  return (
    <div
      className="h-px w-12"
      style={{ background: `linear-gradient(90deg, transparent, ${GOLD}88, transparent)` }}
    />
  );
}

function ShimmerWord({ text }: { text: string }) {
  return (
    <div className="relative font-['Playfair_Display'] text-3xl tracking-wider" style={{ color: GOLD }}>
      {text}
      <motion.div
        initial={{ x: "-120%" }}
        animate={{ x: "120%" }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 30%, ${PARCHMENT}cc 50%, transparent 70%)`,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}

function RadialGlow() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at 50% 38%, ${GOLD}10 0%, transparent 55%)`,
      }}
    />
  );
}

function Stars() {
  const positions = [
    { left: "12%", top: "18%", d: 0 },
    { left: "82%", top: "22%", d: 1.2 },
    { left: "20%", top: "78%", d: 0.6 },
    { left: "78%", top: "70%", d: 1.8 },
    { left: "50%", top: "12%", d: 2.4 },
    { left: "30%", top: "55%", d: 3.0 },
    { left: "70%", top: "45%", d: 0.9 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none">
      {positions.map((p, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.15, 0.6, 0.15] }}
          transition={{ duration: 4, delay: p.d, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-[2px] w-[2px] rounded-full"
          style={{ left: p.left, top: p.top, backgroundColor: GOLD_SOFT, boxShadow: `0 0 6px ${GOLD}` }}
        />
      ))}
    </div>
  );
}
