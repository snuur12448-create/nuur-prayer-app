import React from "react";
import { ARABIC_FONT, FullBleed, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";

const TAGLINE_FONT = "'Cormorant Garamond', Georgia, serif";

/**
 * Parse a CSS color string (#RGB, #RRGGBB, rgb(), rgba()) into [r,g,b] 0–255.
 * Returns null for unrecognised input.
 */
function parseColor(input: string): [number, number, number] | null {
  const s = input.trim();
  if (s.startsWith("#")) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return [r, g, b];
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return [r, g, b];
    }
  }
  const m = s.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  return null;
}

/** Perceived luminance 0..1 (Rec. 709). */
function luminance(input: string): number {
  const rgb = parseColor(input);
  if (!rgb) return 0.5;
  const [r, g, b] = rgb;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Parse the alpha channel out of a CSS rgba() / hex string. */
function parseAlpha(input: string): number {
  const s = input.trim();
  if (s.startsWith("#")) return 1;
  const m = s.match(/rgba?\(\s*\d+[\s,]+\d+[\s,]+\d+[\s,/]+([0-9.]+)/);
  if (m) return Math.min(1, Math.max(0, parseFloat(m[1])));
  return 1;
}

/**
 * Ensure a CSS color has at least `min` alpha. If it's already opaque enough,
 * the original is returned. Used to keep the tagline from disappearing when a
 * variant passes a too-faint `dim` color.
 */
function ensureMinAlpha(input: string, min: number): string {
  const rgb = parseColor(input);
  if (!rgb) return input;
  const a = parseAlpha(input);
  if (a >= min) return input;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${min})`;
}

/**
 * Halo text-shadow that auto-flips polarity based on the ink color.
 * Dark ink → soft white glow (for dark text on light backgrounds).
 * Light ink → soft dark glow (for light text on dark backgrounds).
 * The result is layered (tight + diffuse) for a subtle "punch".
 */
export function autoHalo(inkColor: string, strength: 1 | 2 = 1): string {
  const isDarkInk = luminance(inkColor) < 0.55;
  const haloRgb = isDarkInk ? "255,255,255" : "0,0,0";
  const a1 = strength === 2 ? 0.85 : 0.7;
  const a2 = strength === 2 ? 0.55 : 0.35;
  return `0 0 1px rgba(${haloRgb},${a1}), 0 1px 3px rgba(${haloRgb},${a2}), 0 0 8px rgba(${haloRgb},${a2 * 0.5})`;
}

/**
 * Build a single CSS drop-shadow value that contrasts with the ink, suitable
 * for use inside `filter: drop-shadow(...)`. Unlike `autoHalo` (which produces
 * a multi-layer text-shadow string), this returns one well-formed shadow.
 */
function autoDropShadow(inkColor: string): string {
  const isDarkInk = luminance(inkColor) < 0.55;
  const haloRgb = isDarkInk ? "255,255,255" : "0,0,0";
  return `0 1px 2px rgba(${haloRgb},0.55)`;
}

/**
 * Inline SVG of the Nuur mark — gold sun-rays around an Arabic ن.
 * Transparent background (no dark squircle), tints to whatever color is passed.
 * Drop-in replacement for the previous PNG logo: it picks up the surrounding
 * card's ink so it blends into pastel skies, deep blues, parchment, etc.
 */
export function NuurMarkSVG({ size, color }: { size: number; color: string }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: "block", color, overflow: "visible" }}
      aria-hidden="true"
    >
      {/* Outer thin ring */}
      <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
      {/* Inner ring (around the noon) */}
      <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.85" />
      {/* 8 sun rays */}
      {rays.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 50 + Math.cos(rad) * 38;
        const y1 = 50 + Math.sin(rad) * 38;
        const x2 = 50 + Math.cos(rad) * 46;
        const y2 = 50 + Math.sin(rad) * 46;
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.9"
          />
        );
      })}
      {/* ن (noon) */}
      <text
        x="50"
        y="59"
        textAnchor="middle"
        fontFamily="'Amiri Quran', 'Amiri', serif"
        fontSize="20"
        fill="currentColor"
        fontWeight="500"
      >
        ن
      </text>
    </svg>
  );
}

/**
 * Nuur brand mark + wordmark + tagline footer used on every Nuur share card.
 * The mark is rendered as inline SVG so it has a transparent background and
 * automatically picks up the `color` prop — no more dark squircle that fights
 * with the underlying photo. `color` drives both the mark and the wordmark;
 * `dim` is used as the tagline tint. Both lines get an auto-flipping halo
 * so they stay legible on busy or light backgrounds.
 */
export function NuurBrandFooter({
  color,
  dim,
  iconSize = 36,
  scrim = false,
}: {
  /** primary brand ink for the mark + NUUR wordmark */
  color: string;
  /** dim secondary tone for the tagline */
  dim: string;
  /** logo size in px (default 36) */
  iconSize?: number;
  /** Render a soft contrast scrim behind the footer for variants where the
   *  bottom of the photo has a busy/focal subject (lanterns, palms, mosque
   *  silhouette). Auto-flips polarity based on ink luminance. */
  scrim?: boolean;
}) {
  const halo = autoHalo(color, 1);
  const dropShadow = autoDropShadow(color);
  const isDarkInk = luminance(color) < 0.55;
  // Scrim color matches the halo polarity: light scrim under dark ink, dark
  // scrim under light ink. Radial gradient so edges fade out invisibly.
  const scrimRgb = isDarkInk ? "255,255,255" : "0,0,0";
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: scrim ? "14px 32px 12px" : 0,
      }}
    >
      {scrim ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 70% 80% at 50% 60%, rgba(${scrimRgb},0.35) 0%, rgba(${scrimRgb},0.18) 55%, rgba(${scrimRgb},0) 100%)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ) : null}
      {/* Mark — inline SVG, transparent, tinted to match the card's ink */}
      <div style={{ filter: `drop-shadow(${dropShadow})`, position: "relative", zIndex: 1 }}>
        <NuurMarkSVG size={iconSize} color={color} />
      </div>

      {/* Wordmark */}
      <div
        style={{
          fontFamily: TAGLINE_FONT,
          fontSize: 12,
          letterSpacing: "0.5em",
          paddingLeft: "0.5em",
          color: color,
          fontWeight: 600,
          textShadow: halo,
          position: "relative",
          zIndex: 1,
        }}
      >
        NUUR
      </div>

      {/* Tagline — clamped to a minimum alpha so it stays readable even when
          a variant passes a faint `dim` color (the dark-bg variants used to
          set 0.3–0.55 which became invisible against busy photography). */}
      <div
        style={{
          fontFamily: TAGLINE_FONT,
          fontSize: 11,
          fontStyle: "italic",
          letterSpacing: "0.14em",
          color: ensureMinAlpha(dim, 0.78),
          textShadow: halo,
          position: "relative",
          zIndex: 1,
        }}
      >
        Light for your daily deen
      </div>
    </div>
  );
}

const RAW_BASE = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "/";
const BASE = RAW_BASE.endsWith("/") ? RAW_BASE : `${RAW_BASE}/`;
export const imageUrl = (file: string) => `${BASE}dua-images/${file}`;

export interface DuaContent {
  arabic: string;
  english: string;
  source?: string;
}

export interface BodyBox {
  /** absolute top in 432x768 coords */
  top: number;
  /** absolute left in 432x768 coords */
  left: number;
  /** absolute width */
  width: number;
  /** absolute height (for vertical centering) */
  height: number;
  /** justify content vertically */
  justify?: "start" | "center" | "end";
  /** text alignment */
  align?: "left" | "center" | "right";
}

export interface DuaImageTheme {
  /** filename in /public/dua-images */
  image: string;
  /** ink color for the Arabic dua text and the English translation */
  ink: string;
  /** softer secondary text color used for the source caption */
  inkDim: string;
  /** Arabic font size (default 38) */
  arabicSize?: number;
  /** English font size (default 16) */
  englishSize?: number;
  /** Arabic line-height multiplier */
  arabicLineHeight?: number;
  /** Optional shadow on text for legibility on busy bg */
  textShadow?: string;
  /** Box for body text positioning */
  body: BodyBox;
  /** Nuur emblem gold dot color */
  emblemColor: string;
  /** Nuur emblem text color */
  emblemDim: string;
  /** Optional subtle vignette overlay (0..1) for text legibility — defaults to 0 */
  vignette?: number;
  /** Optional gradient overlay behind text (any CSS background) */
  textHalo?: string;
}

export function DuaImageCard({
  theme,
  content,
}: {
  theme: DuaImageTheme;
  content: DuaContent;
}) {
  const arabicSize = theme.arabicSize ?? 38;
  const englishSize = theme.englishSize ?? 16;
  const arabicLh = theme.arabicLineHeight ?? 1.6;

  // All `top/left/width/height` values below are pixels in a fixed
  // 432×768 design canvas. The outer ScaleToFit wrapper letterboxes that
  // canvas to whatever iframe size the host gives us, so absolute coords
  // stay correct at any iframe dimensions (including non-9:16 ones).
  return (
    <FullBleed background="#000" ratio="9/16">
     <ScaleToFit designW={432} designH={768}>
      <img
        src={imageUrl(theme.image)}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          pointerEvents: "none",
        }}
      />
      {theme.vignette ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0," +
              theme.vignette +
              ") 100%)",
            pointerEvents: "none",
          }}
        />
      ) : null}

      {theme.textHalo ? (
        <div
          style={{
            position: "absolute",
            top: theme.body.top - 20,
            left: theme.body.left - 20,
            width: theme.body.width + 40,
            height: theme.body.height + 40,
            background: theme.textHalo,
            pointerEvents: "none",
            borderRadius: 24,
          }}
        />
      ) : null}

      {/* Body text box */}
      <div
        style={{
          position: "absolute",
          top: theme.body.top,
          left: theme.body.left,
          width: theme.body.width,
          height: theme.body.height,
          display: "flex",
          flexDirection: "column",
          justifyContent:
            theme.body.justify === "start"
              ? "flex-start"
              : theme.body.justify === "end"
              ? "flex-end"
              : "center",
          alignItems:
            theme.body.align === "left"
              ? "flex-start"
              : theme.body.align === "right"
              ? "flex-end"
              : "center",
          textAlign: theme.body.align ?? "center",
          color: theme.ink,
          textShadow: theme.textShadow,
        }}
      >
        <div
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: arabicSize,
            lineHeight: arabicLh,
            direction: "rtl",
            color: theme.ink,
            width: "100%",
            whiteSpace: "pre-line",
          }}
        >
          {content.arabic}
        </div>

        <div
          style={{
            marginTop: 22,
            width: "100%",
            height: 1,
            background: theme.inkDim,
            opacity: 0.35,
            maxWidth: 60,
            alignSelf:
              theme.body.align === "left"
                ? "flex-start"
                : theme.body.align === "right"
                ? "flex-end"
                : "center",
          }}
        />

        <div
          style={{
            marginTop: 18,
            fontFamily: SERIF_FONT,
            fontSize: englishSize,
            fontStyle: "italic",
            lineHeight: 1.45,
            color: theme.ink,
            opacity: 0.92,
            width: "100%",
          }}
        >
          {content.english}
        </div>

        {content.source ? (
          <div
            style={{
              marginTop: 12,
              fontFamily: SANS_FONT,
              fontSize: 9.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: theme.inkDim,
              width: "100%",
            }}
          >
            {content.source}
          </div>
        ) : null}
      </div>

      {/* Nuur brand footer at bottom */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 28,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <NuurBrandFooter color={theme.emblemColor} dim={theme.emblemDim} />
      </div>
     </ScaleToFit>
    </FullBleed>
  );
}

/**
 * Letterboxes a fixed-size design canvas to fit any parent dimensions.
 * Uses CSS container query units (`cqw`/`cqh`) so scaling reacts to the
 * nearest size container — here, the FullBleed root which fills the iframe.
 *
 * This means children can use absolute pixel coordinates in a known
 * `designW × designH` reference, and the layout stays correct whether the
 * iframe is 432×768, 200×400, or 1280×720.
 */
function ScaleToFit({
  designW,
  designH,
  children,
}: {
  designW: number;
  designH: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        containerType: "size",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: designW,
          height: designH,
          transform: `translate(-50%, -50%) scale(min(calc(100cqw / ${designW}px), calc(100cqh / ${designH}px)))`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export { ARABIC_FONT, SERIF_FONT, SANS_FONT };
