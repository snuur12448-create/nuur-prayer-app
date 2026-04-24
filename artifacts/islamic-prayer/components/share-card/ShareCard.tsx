import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Polygon } from "react-native-svg";

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
 *   • Card mode      — 4 : 5     → 1080 × 1350 export
 *   • Wallpaper mode — 9 : 19.5  → 1170 × 2535 export
 *
 * Wallpaper layout reserves the top ~30 % for the iOS lock-screen clock
 * (no clock is rendered) and seats the content cluster in the lower
 * half (~55–85 %) with the NUUR signature at the very bottom — matching
 * the reference mock-ups (IMG_7895 / 7897 / 7899 / 7902 / 7904).
 *
 * Arabic uses `AmiriQuran_400Regular` (already loaded at app boot),
 * Latin script uses the Inter family. No additional fonts are loaded.
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
  const base = isWallpaper ? width * 0.072 : width * 0.085;
  if (len < 70)   return base;
  if (len < 140)  return base * 0.86;
  if (len < 220)  return base * 0.74;
  if (len < 320)  return base * 0.62;
  return base * 0.54;
}

function fitBody(text: string, width: number, isWallpaper: boolean): number {
  const len = text.length;
  const base = isWallpaper ? width * 0.032 : width * 0.038;
  if (len < 140)  return base;
  if (len < 280)  return base * 0.92;
  if (len < 480)  return base * 0.84;
  return base * 0.78;
}

/**
 * Soft horizontal divider — short hairline, centred diamond, short hairline.
 * Width scales with the card width. Matches the references closely.
 */
function StarDivider({ color, width }: { color: string; width: number }) {
  const ruleLen = width * 0.10;
  const dia = width * 0.012;
  const total = ruleLen * 2 + dia * 2 + 16;
  const h = Math.max(dia * 2.4, 8);
  const cy = h / 2;
  const cx = total / 2;
  return (
    <Svg width={total} height={h} viewBox={`0 0 ${total} ${h}`}>
      <Line x1={0} y1={cy} x2={cx - dia - 6} y2={cy} stroke={color} strokeWidth={0.7} opacity={0.7} />
      <Polygon
        points={`${cx} ${cy - dia}, ${cx + dia} ${cy}, ${cx} ${cy + dia}, ${cx - dia} ${cy}`}
        fill={color}
        opacity={0.95}
      />
      <Line x1={cx + dia + 6} y1={cy} x2={total} y2={cy} stroke={color} strokeWidth={0.7} opacity={0.7} />
    </Svg>
  );
}

/**
 * Nuur signature mark — a small clock-face: outer circle, 12 short tick
 * marks, and a tiny ن-style dot in the centre. Matches the medallion
 * shown in IMG_7894 / 7898 / 7900 / 7901 / 7903.
 */
function NuurMark({ color, size }: { color: string; size: number }) {
  const r  = size;
  const cx = r;
  const cy = r;
  const ticks = Array.from({ length: 12 }).map((_, i) => {
    const a  = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(a) * r * 0.78;
    const y1 = cy + Math.sin(a) * r * 0.78;
    const x2 = cx + Math.cos(a) * r * 0.92;
    const y2 = cy + Math.sin(a) * r * 0.92;
    return (
      <Line
        key={`t_${i}`}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={i % 3 === 0 ? 1.0 : 0.7}
        opacity={0.85}
      />
    );
  });
  return (
    <Svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`}>
      <Circle cx={cx} cy={cy} r={r * 0.95} fill="none" stroke={color} strokeWidth={1.0} opacity={0.9} />
      <G>{ticks}</G>
      {/* tiny center dot — stand-in for the ن glyph */}
      <Circle cx={cx} cy={cy + r * 0.04} r={r * 0.10} fill={color} opacity={0.95} />
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

  /* ── Layout boxes ─────────────────────────────────────────────────────
   * Card mode:
   *   eyebrow ~  10 %
   *   middle  ~  10 – 60 %  (Arabic + caption)
   *   divider ~  62 %
   *   body    ~  64 – 80 %
   *   NUUR    ~  88 % – bottom
   *
   * Wallpaper mode (more breathing room, content packed lower):
   *   0 – 30 %                empty (iOS clock zone)
   *   30 – 55 %               empty (theme decoration sits in upper third)
   *   55 – 85 %               content cluster
   *   85 – 100 %              NUUR signature
   * ──────────────────────────────────────────────────────────────────── */

  const sidePadding = Math.max(28, width * 0.085);
  // Wallpaper: 50–87 % gives a 37 % band — enough headroom for long
  // verses without clipping while still keeping the upper third clear
  // for the iOS clock.
  const contentTop    = isWallpaper ? height * 0.50 : height * 0.10;
  const contentBottom = isWallpaper ? height * 0.87 : height * 0.85;

  const arabicSize = useMemo(() => fitArabic(arabic, width, isWallpaper), [arabic, width, isWallpaper]);
  const bodySize   = useMemo(() => fitBody(body,    width, isWallpaper), [body,   width, isWallpaper]);

  const eyebrowSize     = width * (isWallpaper ? 0.024 : 0.026);
  const captionSize     = width * 0.034;
  const transliterSize  = width * (isWallpaper ? 0.026 : 0.030);
  const attributionSize = width * (isWallpaper ? 0.020 : 0.022);
  const signatureSize   = width * (isWallpaper ? 0.022 : 0.024);
  const taglineSize     = width * (isWallpaper ? 0.016 : 0.018);

  // Convert eyebrow to small-caps style: split on " · " / " • " and render parts.
  const eyebrowParts = eyebrow.split(/\s*[·•]\s*/).filter(Boolean);

  const renderEyebrow = () => (
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
                color: p.accent,
                fontSize: eyebrowSize,
                opacity: i === 0 ? 1 : 0.85,
              },
            ]}
          >
            {part}
          </Text>
        </React.Fragment>
      ))}
    </View>
  );

  const renderArabic = () =>
    arabic ? (
      <Text
        numberOfLines={5}
        adjustsFontSizeToFit={false}
        style={{
          fontFamily: "AmiriQuran_400Regular",
          color: themeId === "rose" ? p.text : p.accent,
          fontSize: arabicSize,
          lineHeight: arabicSize * 1.6,
          textAlign: "center",
          writingDirection: "rtl",
          width: "100%",
          marginTop: width * (isWallpaper ? 0.035 : 0.045),
          textShadowColor: themeId === "rose" || themeId === "starry"
            ? "rgba(255,240,210,0.45)"
            : "transparent",
          textShadowRadius: themeId === "rose" || themeId === "starry" ? 18 : 0,
        }}
      >
        {arabic}
      </Text>
    ) : null;

  const renderCaption = () =>
    caption ? (
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          color: p.text,
          fontSize: captionSize,
          marginTop: width * 0.025,
          textAlign: "center",
          letterSpacing: 0.3,
        }}
        numberOfLines={2}
      >
        {caption}
      </Text>
    ) : null;

  const renderBody = () => (
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
            marginBottom: width * 0.015,
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
          lineHeight: bodySize * 1.5,
          textAlign: "center",
          fontStyle: arabic ? "italic" : "normal",
        }}
        numberOfLines={isWallpaper ? 7 : 9}
      >
        {body}
      </Text>

      {attribution ? (
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            color: p.textMuted,
            fontSize: attributionSize,
            letterSpacing: 1.8,
            textTransform: "uppercase",
            textAlign: "center",
            marginTop: width * 0.035,
          }}
          numberOfLines={2}
        >
          {attribution}
        </Text>
      ) : null}
    </View>
  );

  const renderSignature = () => (
    <View style={{ alignItems: "center", width: "100%" }}>
      <NuurMark color={p.accent} size={signatureSize * 0.82} />
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          color: p.accent,
          fontSize: signatureSize,
          letterSpacing: 7,
          marginTop: width * 0.012,
        }}
      >
        NUUR
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontStyle: "italic",
          color: p.textMuted,
          fontSize: taglineSize,
          marginTop: width * 0.005,
          letterSpacing: 0.4,
        }}
      >
        Light for your daily deen
      </Text>
    </View>
  );

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

      {/* CONTENT CLUSTER ─────────────────────────────────────────── */}
      <View
        style={{
          position: "absolute",
          top: contentTop,
          bottom: height - contentBottom,
          left: sidePadding,
          right: sidePadding,
          alignItems: "center",
          justifyContent: arabic ? "space-between" : "center",
          overflow: "hidden",
        }}
      >
        <View style={{ alignItems: "center", width: "100%" }}>
          {renderEyebrow()}
          {renderArabic()}
          {renderCaption()}
        </View>

        <View style={{ alignItems: "center", width: "100%", marginTop: width * 0.02 }}>
          <StarDivider color={p.rule} width={width} />
          <View style={{ height: width * 0.025 }} />
          {renderBody()}
        </View>
      </View>

      {/* NUUR SIGNATURE — pinned to bottom ────────────────────────── */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: height * (isWallpaper ? 0.045 : 0.055),
          alignItems: "center",
        }}
      >
        {renderSignature()}
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
    letterSpacing: 3.0,
    textTransform: "uppercase",
    textAlign: "center",
  },
  eyebrowDot: {
    fontFamily: "Inter_400Regular",
    opacity: 0.7,
  },
});

export default ShareCard;
