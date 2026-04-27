import React from "react";
import { FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";

/* ----------------------------- Botanical sprig ----------------------------- */
/**
 * A delicate sprig of leaves on a curved stem. Used as a corner accent.
 * Designed in a 200x300 viewBox; caller scales/rotates with `transform`.
 */
export function BotanicalSprig({
  fill = "#8FA078",
  stroke = "#6E7F58",
  opacity = 1,
  transform,
  blur = 0,
}: {
  fill?: string;
  stroke?: string;
  opacity?: number;
  transform?: string;
  blur?: number;
}) {
  return (
    <g transform={transform} opacity={opacity} style={{ filter: blur ? `blur(${blur}px)` : undefined }}>
      {/* main stem */}
      <path
        d="M 100 290 C 96 240 88 190 84 150 C 80 110 78 70 86 30"
        stroke={stroke}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      {/* leaves: pairs of teardrops alternating along stem */}
      <Leaf cx={84} cy={50} rx={8} ry={20} rot={-25} fill={fill} stroke={stroke} />
      <Leaf cx={94} cy={70} rx={10} ry={26} rot={45} fill={fill} stroke={stroke} />
      <Leaf cx={78} cy={100} rx={9} ry={24} rot={-40} fill={fill} stroke={stroke} />
      <Leaf cx={96} cy={125} rx={12} ry={32} rot={55} fill={fill} stroke={stroke} />
      <Leaf cx={76} cy={155} rx={11} ry={30} rot={-50} fill={fill} stroke={stroke} />
      <Leaf cx={102} cy={185} rx={13} ry={36} rot={62} fill={fill} stroke={stroke} />
      <Leaf cx={74} cy={215} rx={12} ry={32} rot={-58} fill={fill} stroke={stroke} />
      <Leaf cx={106} cy={245} rx={14} ry={38} rot={70} fill={fill} stroke={stroke} />
      {/* small secondary stem with leaves */}
      <path
        d="M 90 200 C 70 215 50 220 30 215"
        stroke={stroke}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <Leaf cx={50} cy={216} rx={9} ry={22} rot={-85} fill={fill} stroke={stroke} />
      <Leaf cx={32} cy={212} rx={8} ry={18} rot={-95} fill={fill} stroke={stroke} />
    </g>
  );
}

function Leaf({
  cx, cy, rx, ry, rot, fill, stroke,
}: { cx: number; cy: number; rx: number; ry: number; rot: number; fill: string; stroke: string }) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <ellipse cx="0" cy="0" rx={rx} ry={ry} fill={fill} fillOpacity="0.85" stroke={stroke} strokeWidth="0.6" />
      {/* central vein */}
      <line x1="0" y1={-ry + 2} x2="0" y2={ry - 2} stroke={stroke} strokeWidth="0.5" opacity="0.6" />
    </g>
  );
}

/* ------------------------------- Pointed arch ------------------------------- */
/** Thin pointed Mughal-style arch, full height. */
export function PointedArch({
  stroke = "#C9933A",
  strokeWidth = 1.4,
  inset = 24,
  topInset = 60,
  opacity = 0.85,
}: {
  stroke?: string;
  strokeWidth?: number;
  inset?: number;
  topInset?: number;
  opacity?: number;
}) {
  const left = inset;
  const right = 432 - inset;
  const bottom = 768 - inset;
  const apex = topInset;
  const springY = topInset + 140;
  const cx = 216;
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid meet"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <path
        d={`
          M ${left} ${bottom}
          L ${left} ${springY}
          C ${left} ${springY - 80} ${cx - 60} ${apex + 40} ${cx} ${apex}
          C ${cx + 60} ${apex + 40} ${right} ${springY - 80} ${right} ${springY}
          L ${right} ${bottom}
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
    </svg>
  );
}

/* ------------------------------- Leaf shadow ------------------------------- */
/**
 * A large soft leafy branch silhouette used as a low-opacity overlay
 * (mimicking dappled sunlight through leaves). Drifts in from a corner.
 */
export function LeafShadow({
  fill = "#8B9277",
  opacity = 0.28,
  transform,
  blur = 6,
}: {
  fill?: string;
  opacity?: number;
  transform?: string;
  blur?: number;
}) {
  return (
    <svg
      viewBox="0 0 432 768"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        filter: `blur(${blur}px)`,
        opacity,
      }}
    >
      <g transform={transform} fill={fill}>
        {/* main branch stem */}
        <path d="M 0 0 C 80 60 140 130 200 220 C 230 270 260 330 280 400" stroke={fill} strokeWidth="3" fill="none" />
        {/* large leaves */}
        <ellipse cx="40" cy="80"  rx="38" ry="14" transform="rotate(15 40 80)" />
        <ellipse cx="100" cy="50" rx="46" ry="16" transform="rotate(-10 100 50)" />
        <ellipse cx="160" cy="100" rx="50" ry="18" transform="rotate(20 160 100)" />
        <ellipse cx="80" cy="160" rx="44" ry="16" transform="rotate(-30 80 160)" />
        <ellipse cx="200" cy="180" rx="52" ry="20" transform="rotate(35 200 180)" />
        <ellipse cx="140" cy="240" rx="46" ry="18" transform="rotate(-20 140 240)" />
        <ellipse cx="240" cy="280" rx="54" ry="20" transform="rotate(45 240 280)" />
        <ellipse cx="180" cy="340" rx="40" ry="14" transform="rotate(-15 180 340)" />
        <ellipse cx="280" cy="380" rx="48" ry="18" transform="rotate(50 280 380)" />
      </g>
    </svg>
  );
}

/* --------------------------- Paper / grain texture --------------------------- */
export function GrainOverlay({ opacity = 0.35 }: { opacity?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "repeating-linear-gradient(45deg, rgba(0,0,0,0.025) 0 1px, transparent 1px 4px), " +
          "repeating-linear-gradient(-45deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 5px)",
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
}

/* --------------------------- Template base wrapper --------------------------- */
/**
 * Empty-bodied base for dua/adhkar templates. Renders the FullBleed background,
 * plus the `decor` (botanical/arch/etc) and the Nuur emblem at the bottom.
 * Body content (the dua text) can be added later via `children`.
 */
export function DuaTemplateBase({
  background,
  decor,
  emblemColor = "#C9933A",
  emblemDim = "rgba(0,0,0,0.5)",
  children,
}: {
  background: string;
  decor: React.ReactNode;
  emblemColor?: string;
  emblemDim?: string;
  children?: React.ReactNode;
}) {
  return (
    <FullBleed background={background} ratio="9/16">
      {decor}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "120px 50px 38px 50px",
        }}
      >
        <div style={{ flex: 1 }}>{children}</div>
        <NuurMark color={emblemColor} dim={emblemDim} />
      </div>
    </FullBleed>
  );
}

export { SERIF_FONT, SANS_FONT };
