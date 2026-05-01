import React from "react";
import { ARABIC_FONT, FullBleed, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";

const TAGLINE_FONT = "'Cormorant Garamond', Georgia, serif";

const RAW_BASE_URL = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "/";
const BASE_URL = RAW_BASE_URL.endsWith("/") ? RAW_BASE_URL : `${RAW_BASE_URL}/`;
const NUUR_LOGO_URL = `${BASE_URL}images/nuur-premium/nuur-logo.png`;

/**
 * Nuur brand mark + wordmark + tagline footer used on every Nuur share card.
 * Uses the real app icon: dark rounded square with gold ن and rays.
 * `color`/`dim` apply to the wordmark and tagline. The icon adapts via an
 * optional inverted treatment for darker cards.
 */
export function NuurBrandFooter({
  color,
  dim,
  iconSize = 36,
}: {
  /** primary brand ink for the NUUR wordmark */
  color: string;
  /** dim secondary tone for the tagline */
  dim: string;
  /** logo size in px (default 36) */
  iconSize?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* Logo mark — actual Nuur app icon */}
      <img
        src={NUUR_LOGO_URL}
        alt="Nuur"
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: iconSize * 0.22,
          display: "block",
        }}
      />

      {/* Wordmark */}
      <div
        style={{
          fontFamily: TAGLINE_FONT,
          fontSize: 11,
          letterSpacing: "0.5em",
          paddingLeft: "0.5em",
          color: color,
          fontWeight: 500,
        }}
      >
        NUUR
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily: TAGLINE_FONT,
          fontSize: 9.5,
          fontStyle: "italic",
          letterSpacing: "0.12em",
          color: dim,
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
