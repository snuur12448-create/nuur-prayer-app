import React from "react";
import { ARABIC_FONT, FullBleed, NuurMark, SANS_FONT, SERIF_FONT } from "../nuur-templates/_shared";

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
  /** ink color for the dua text */
  ink: string;
  /** softer secondary text color (english/source) */
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

  return (
    <FullBleed background="#000" ratio="9/16">
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

      {/* Nuur emblem at bottom */}
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
        <NuurMark color={theme.emblemColor} dim={theme.emblemDim} />
      </div>
    </FullBleed>
  );
}

export { ARABIC_FONT, SERIF_FONT, SANS_FONT };
