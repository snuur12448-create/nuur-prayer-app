import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Polygon } from "react-native-svg";

import { getTheme } from "./themes";
import type {
  ShareCardContent,
  ShareCardMode,
  ShareThemeId,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
 * ShareCard
 *
 * Unified renderer for one share card OR one wallpaper.
 *
 *   • Card mode      — 4 : 5  → 1080 × 1350 export
 *   • Wallpaper mode — 9 : 19.5 → 1170 × 2535 export
 *
 * The wallpaper layout reserves ~33% empty space at the top for the iOS
 * lock-screen clock — we DO NOT render an actual clock; the content
 * simply starts further down.
 *
 * Arabic uses the existing `AmiriQuran_400Regular` font (already loaded
 * at app boot), Latin script uses the Inter family. No additional fonts
 * are loaded by this component.
 * ──────────────────────────────────────────────────────────────────────── */

const CARD_ASPECT      = 1350 / 1080;   // 1.25
const WALLPAPER_ASPECT = 2535 / 1170;   // ≈ 2.167

export interface ShareCardProps extends ShareCardContent {
  themeId: ShareThemeId;
  mode: ShareCardMode;
  /** Render width in dp. Height is derived from mode aspect. */
  width: number;
}

/** Tunable Arabic font size — shrinks gracefully for very long text. */
function fitArabic(text: string | undefined, width: number, isWallpaper: boolean): number {
  if (!text) return 0;
  const len = text.length;
  // Base size scales with width; shrink for long verses.
  const base = isWallpaper ? width * 0.075 : width * 0.085;
  if (len < 70)   return base;
  if (len < 140)  return base * 0.86;
  if (len < 220)  return base * 0.74;
  if (len < 320)  return base * 0.62;
  return base * 0.54;
}

function fitBody(text: string, width: number, isWallpaper: boolean): number {
  const len = text.length;
  const base = isWallpaper ? width * 0.034 : width * 0.039;
  if (len < 140)  return base;
  if (len < 280)  return base * 0.92;
  if (len < 480)  return base * 0.84;
  return base * 0.78;
}

function StarDivider({ color, width }: { color: string; width: number }) {
  // Diamond / 4-point star centred on the rule.
  const s = width * 0.012;
  return (
    <Svg width={s * 6} height={s * 2.2} viewBox={`0 0 ${s * 6} ${s * 2.2}`}>
      <Line x1={0} y1={s * 1.1} x2={s * 2.4} y2={s * 1.1} stroke={color} strokeWidth={0.7} opacity={0.7} />
      <Polygon
        points={`${s * 3} 0, ${s * 3 + s} ${s * 1.1}, ${s * 3} ${s * 2.2}, ${s * 3 - s} ${s * 1.1}`}
        fill={color}
        opacity={0.95}
      />
      <Line x1={s * 3.6 + s} y1={s * 1.1} x2={s * 6} y2={s * 1.1} stroke={color} strokeWidth={0.7} opacity={0.7} />
    </Svg>
  );
}

/** Tiny 8-point glyph used as a Nuur signature mark. */
function NuurMark({ color, size }: { color: string; size: number }) {
  const s = size;
  const c = s * 0.4142;
  return (
    <Svg width={s * 2} height={s * 2} viewBox={`0 0 ${s * 2} ${s * 2}`}>
      <Polygon
        points={`${s} 0, ${s + c} ${s - c}, ${s * 2} ${s}, ${s + c} ${s + c}, ${s} ${s * 2}, ${s - c} ${s + c}, 0 ${s}, ${s - c} ${s - c}`}
        fill="none"
        stroke={color}
        strokeWidth={1.3}
        opacity={0.85}
      />
    </Svg>
  );
}

export function ShareCard({
  themeId, mode, width,
  eyebrow, arabic, transliteration, body, caption, attribution,
}: ShareCardProps) {
  const theme = getTheme(themeId);
  const p = theme.palette;
  const isWallpaper = mode === "wallpaper";
  const height = width * (isWallpaper ? WALLPAPER_ASPECT : CARD_ASPECT);

  // Layout: wallpaper reserves the top ~33% for the OS clock.
  const topPadding = isWallpaper ? height * 0.36 : height * 0.10;
  const sidePadding = Math.max(28, width * 0.08);
  const bottomPadding = height * (isWallpaper ? 0.06 : 0.06);

  const arabicSize = useMemo(() => fitArabic(arabic, width, isWallpaper), [arabic, width, isWallpaper]);
  const bodySize   = useMemo(() => fitBody(body,    width, isWallpaper), [body,   width, isWallpaper]);

  const eyebrowSize     = width * 0.026;
  const captionSize     = width * 0.034;
  const transliterSize  = width * 0.030;
  const attributionSize = width * 0.022;
  const signatureSize   = width * 0.024;

  // Convert eyebrow to small-caps style: split on " · " and render parts.
  const eyebrowParts = eyebrow.split(/\s*[·•]\s*/).filter(Boolean);

  return (
    <View
      style={{
        width,
        height,
        position: "relative",
        backgroundColor: p.bgMid,
        overflow: "hidden",
      }}
    >
      <theme.Background width={width} height={height} mode={mode} palette={p} />

      <View
        style={{
          position: "absolute",
          top: topPadding,
          left: sidePadding,
          right: sidePadding,
          bottom: bottomPadding,
          alignItems: "center",
          justifyContent: arabic ? "space-between" : "center",
        }}
      >
        {/* TOP — eyebrow */}
        <View style={{ alignItems: "center", width: "100%" }}>
          <View style={styles.eyebrowRow}>
            {eyebrowParts.map((part, i) => (
              <React.Fragment key={`eb_${i}`}>
                {i > 0 && (
                  <Text
                    style={[
                      styles.eyebrowDot,
                      { color: p.accent, fontSize: eyebrowSize },
                    ]}
                  >
                    {"  ·  "}
                  </Text>
                )}
                <Text
                  style={[
                    styles.eyebrowText,
                    {
                      color: i === 0 ? p.accent : p.textMuted,
                      fontSize: eyebrowSize,
                    },
                  ]}
                >
                  {part}
                </Text>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* MIDDLE — Arabic + caption (if any) */}
        <View style={{ alignItems: "center", width: "100%", flexShrink: 1 }}>
          {arabic ? (
            <Text
              numberOfLines={6}
              adjustsFontSizeToFit={false}
              style={{
                fontFamily: "AmiriQuran_400Regular",
                color: p.accent,
                fontSize: arabicSize,
                lineHeight: arabicSize * 1.6,
                textAlign: "center",
                writingDirection: "rtl",
                width: "100%",
                marginTop: width * 0.04,
              }}
            >
              {arabic}
            </Text>
          ) : null}

          {caption ? (
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                color: p.text,
                fontSize: captionSize,
                marginTop: width * 0.03,
                textAlign: "center",
                letterSpacing: 0.3,
              }}
              numberOfLines={2}
            >
              {caption}
            </Text>
          ) : null}
        </View>

        {/* DIVIDER */}
        <StarDivider color={p.rule} width={width} />

        {/* BODY — transliteration (italic) + body (regular) */}
        <View style={{ alignItems: "center", width: "100%", paddingHorizontal: width * 0.02 }}>
          {transliteration ? (
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontStyle: "italic",
                color: p.textMuted,
                fontSize: transliterSize,
                lineHeight: transliterSize * 1.45,
                textAlign: "center",
                marginBottom: width * 0.018,
              }}
              numberOfLines={3}
            >
              {transliteration}
            </Text>
          ) : null}

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              color: p.text,
              fontSize: bodySize,
              lineHeight: bodySize * 1.55,
              textAlign: "center",
              fontStyle: arabic ? "italic" : "normal",
            }}
            numberOfLines={9}
          >
            {body}
          </Text>
        </View>

        {/* BOTTOM — attribution + Nuur signature */}
        <View style={{ alignItems: "center", width: "100%", marginTop: width * 0.02 }}>
          {attribution ? (
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                color: p.textMuted,
                fontSize: attributionSize,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                textAlign: "center",
              }}
              numberOfLines={2}
            >
              — {attribution}
            </Text>
          ) : null}

          <View style={[styles.signatureRow, { marginTop: width * 0.025 }]}>
            <NuurMark color={p.accent} size={signatureSize * 0.6} />
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                color: p.accent,
                fontSize: signatureSize,
                letterSpacing: 6,
                marginLeft: width * 0.012,
              }}
            >
              NUUR
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  eyebrowText: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    textAlign: "center",
  },
  eyebrowDot: {
    fontFamily: "Inter_400Regular",
    opacity: 0.7,
  },
  signatureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ShareCard;
