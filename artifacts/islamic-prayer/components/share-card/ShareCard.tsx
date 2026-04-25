import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Path, Polygon } from "react-native-svg";

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
 * Two layout families are supported:
 *
 *   1. **Default chrome** (gradient + SVG ornaments) — used by the legacy
 *      themes (Midnight Compass, Starry Sky, Garden Emerald, Rose, Sepia,
 *      Manuscript). The theme provides a Background SVG; this file renders
 *      the eyebrow / Arabic / divider / body / NUUR signature on top.
 *
 *   2. **Frame chrome** (painted ornate arch) — used exclusively by the
 *      dua / adhkar `frame01..frame06` themes. The theme provides a square
 *      panel image and a per-panel "safe area" inside the arch; this file
 *      renders all content (eyebrow, Arabic, English, attribution, NUUR
 *      lockup) tucked inside that arch interior, with a solid letterbox
 *      band of `bgFill` filling above/below the square panel.
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
 * Frame-mode Arabic sizing — tighter than default because the arch's safe
 * area is narrower than the full card width. Sized against `safeWidth`
 * (the inner-arch width), not the full card width.
 */
function fitArabicForFrame(text: string | undefined, safeWidth: number): number {
  if (!text) return 0;
  const len = text.length;
  const base = safeWidth * 0.115;       // ≈ 33 px on a 290 dp safe width
  if (len < 50)   return base;
  if (len < 100)  return base * 0.86;
  if (len < 180)  return base * 0.72;
  if (len < 280)  return base * 0.60;
  return base * 0.50;
}

function fitBodyForFrame(text: string, safeWidth: number): number {
  const len = text.length;
  const base = safeWidth * 0.062;       // ≈ 18 px on a 290 dp safe width
  if (len < 100)  return base;
  if (len < 200)  return base * 0.92;
  if (len < 360)  return base * 0.84;
  if (len < 540)  return base * 0.76;
  return base * 0.70;
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
 * marks, and a tiny ن-style dot in the centre.
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
      <Circle cx={cx} cy={cy + r * 0.04} r={r * 0.10} fill={color} opacity={0.95} />
    </Svg>
  );
}

/**
 * 8-point gold starburst mark used in the frame-style Nuur lockup. Echoes
 * the in-app `NuurLogo` (ن inside a sun of rays), miniaturised.
 */
function FrameNuurMark({ color, size }: { color: string; size: number }) {
  const r = size;
  const cx = r;
  const cy = r;
  const rays = [0, 45, 90, 135].flatMap((a) => {
    const rad = (a * Math.PI) / 180;
    const dx = Math.cos(rad - Math.PI / 2);
    const dy = Math.sin(rad - Math.PI / 2);
    return [
      <Line
        key={`r_${a}_in`}
        x1={cx + dx * r * 0.35}
        y1={cy + dy * r * 0.35}
        x2={cx + dx * r * 0.55}
        y2={cy + dy * r * 0.55}
        stroke={color}
        strokeWidth={Math.max(0.8, r * 0.05)}
      />,
      <Line
        key={`r_${a}_out`}
        x1={cx - dx * r * 0.35}
        y1={cy - dy * r * 0.35}
        x2={cx - dx * r * 0.55}
        y2={cy - dy * r * 0.55}
        stroke={color}
        strokeWidth={Math.max(0.8, r * 0.05)}
      />,
    ];
  });
  return (
    <Svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`}>
      <Circle cx={cx} cy={cy} r={r * 0.27} fill={color} opacity={0.18} stroke={color} strokeWidth={Math.max(0.6, r * 0.04)} />
      <G>{rays}</G>
    </Svg>
  );
}

export function ShareCard({
  themeId, mode, width,
  eyebrow, arabic, transliteration, body, caption, attribution,
}: ShareCardProps) {
  const theme = getTheme(themeId);
  const isWallpaper = mode === "wallpaper";
  const height = width * (isWallpaper ? WALLPAPER_ASPECT : CARD_ASPECT);

  // NOTE: All hooks must be declared above any conditional return below,
  // so React's hook-order is stable when the *same* ShareCard instance
  // switches between a frame theme and a default theme (which happens in
  // the picker's pager).
  const arabicSize = useMemo(
    () => fitArabic(arabic, width, isWallpaper),
    [arabic, width, isWallpaper],
  );
  const bodySize = useMemo(
    () => fitBody(body, width, isWallpaper),
    [body, width, isWallpaper],
  );

  /* ── Frame-chrome render path ──────────────────────────────────────── */
  if (theme.chrome === "frame" && theme.frame) {
    return (
      <FrameLayout
        theme={theme}
        width={width}
        height={height}
        isWallpaper={isWallpaper}
        eyebrow={eyebrow}
        arabic={arabic}
        transliteration={transliteration}
        body={body}
        caption={caption}
        attribution={attribution}
      />
    );
  }

  /* ── Default chrome render path ────────────────────────────────────── */

  const p = theme.palette;

  const sidePadding = Math.max(28, width * 0.085);
  const contentTop    = isWallpaper ? height * 0.50 : height * 0.10;
  const contentBottom = isWallpaper ? height * 0.87 : height * 0.85;

  const eyebrowSize     = width * (isWallpaper ? 0.024 : 0.026);
  const captionSize     = width * 0.034;
  const transliterSize  = width * (isWallpaper ? 0.026 : 0.030);
  const attributionSize = width * (isWallpaper ? 0.020 : 0.022);
  const signatureSize   = width * (isWallpaper ? 0.022 : 0.024);
  const taglineSize     = width * (isWallpaper ? 0.016 : 0.018);

  const eyebrowParts = eyebrow.split(/\s*[·•]\s*/).filter(Boolean);

  const renderEyebrow = () => (
    <View style={styles.eyebrowRow}>
      {eyebrowParts.map((part, i) => (
        <React.Fragment key={`eb_${i}`}>
          {i > 0 && (
            <Text style={[styles.eyebrowDot, { color: p.accent, fontSize: eyebrowSize }]}>
              {"  ·  "}
            </Text>
          )}
          <Text
            style={[
              styles.eyebrowText,
              { color: p.accent, fontSize: eyebrowSize, opacity: i === 0 ? 1 : 0.85 },
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

/* ─────────────────────────────────────────────────────────────────────────
 * FrameLayout — the painted-arch render path (dua / adhkar exclusive).
 *
 * Layout strategy:
 *
 *   • The square panel image fills the card width and is centred vertically
 *     in card mode. In wallpaper mode it sits in the lower 70 % of the
 *     screen — the upper third is reserved for the iOS lock-screen clock.
 *   • Letterbox bands above and below the square are filled with the
 *     theme's `bgFill` colour, harmonising with the panel.
 *   • Content is laid out inside the arch's "safe area" — the rectangle
 *     within the painted decoration where text won't collide with the
 *     leaves / columns / apex ornament.
 *   • The NUUR lockup (8-point mark + wordmark + tagline) lives at the
 *     bottom of the safe area, inside the arch.
 *   • All text uses `numberOfLines` clamps + ellipsis as a final safety
 *     net for unusually long content; the font-size fitter handles the
 *     common case.
 * ──────────────────────────────────────────────────────────────────────── */

interface FrameLayoutProps extends ShareCardContent {
  theme: ReturnType<typeof getTheme>;
  width: number;
  height: number;
  isWallpaper: boolean;
}

function FrameLayout({
  theme, width, height, isWallpaper,
  eyebrow, arabic, body, caption, attribution,
}: FrameLayoutProps) {
  const meta = theme.frame!;
  const tone = meta.tone;
  const ink = tone === "ink";
  const fg = ink ? "#2A2018" : "#F4ECD8";
  const fgDim = ink ? "rgba(42,32,24,0.74)" : "rgba(244,236,216,0.78)";
  const accent = meta.accent ?? (ink ? "#7A5A2E" : "#D4A24A");
  const shadowColor = ink ? "transparent" : "rgba(0,0,0,0.55)";
  const shadowRadius = ink ? 0 : 6;

  /* ── Panel placement ───────────────────────────────────────────────────
   *  CARD MODE (4:5):     The painted panel covers the entire 4:5 area
   *                       (resizeMode="cover"), so there are no cream/white
   *                       letterbox bands. The panel is square (1:1) so
   *                       cover-scaling crops a small slice off each side
   *                       (~10% of source); the painted decoration is
   *                       concentrated inside the safe arch so this is
   *                       cosmetic.
   *
   *  WALLPAPER MODE (9:19.5):
   *                       The painted panel is too tall to "cover" without
   *                       cropping nearly all of the leaves and arch, so we
   *                       keep it as a centred 1:1 element under the iOS
   *                       clock. The bgFill is sampled from the panel's
   *                       outer edge so the seam between panel and band is
   *                       invisible.
   * ──────────────────────────────────────────────────────────────────── */

  let panelLeft: number;
  let panelTop: number;
  let panelRenderedSize: number;
  let visibleSrcLeft: number;
  let visibleSrcTop: number;
  let srcToScreen: number;

  if (isWallpaper) {
    panelRenderedSize = width;
    panelLeft         = 0;
    panelTop          = height * 0.32;
    visibleSrcLeft    = 0;
    visibleSrcTop     = 0;
    srcToScreen       = panelRenderedSize / 512;
  } else {
    // cover-fit a 512×512 image into a width × height card.
    srcToScreen       = Math.max(width / 512, height / 512);
    panelRenderedSize = 512 * srcToScreen;
    panelLeft         = (width - panelRenderedSize) / 2;
    panelTop          = (height - panelRenderedSize) / 2;
    // How much of the source PNG is actually visible after cover-cropping.
    visibleSrcLeft    = -panelLeft / srcToScreen;
    visibleSrcTop     = -panelTop / srcToScreen;
  }

  // Safe-area rectangle in source coords, clipped to the visible region.
  const srcSafeLeft   = Math.max(meta.safe.l, visibleSrcLeft);
  const srcSafeTop    = Math.max(meta.safe.t, visibleSrcTop);
  const srcSafeRight  = Math.min(512 - meta.safe.r, 512 - visibleSrcLeft);
  const srcSafeBottom = Math.min(512 - meta.safe.b, 512 - visibleSrcTop);

  // Convert to screen coords.
  const safeLeft   = panelLeft + srcSafeLeft   * srcToScreen;
  const safeTop    = panelTop  + srcSafeTop    * srcToScreen;
  const safeWidth  = (srcSafeRight  - srcSafeLeft) * srcToScreen;
  const safeHeight = (srcSafeBottom - srcSafeTop)  * srcToScreen;

  const arabicSize       = fitArabicForFrame(arabic, safeWidth);
  const bodySize         = fitBodyForFrame(body, safeWidth);
  const eyebrowSize      = Math.max(9,  safeWidth * 0.038);
  const captionSize      = Math.max(10, safeWidth * 0.044);
  const attributionSize  = Math.max(8,  safeWidth * 0.034);
  const lockupName       = Math.max(10, safeWidth * 0.044);
  const lockupTag        = Math.max(9,  safeWidth * 0.036);
  const lockupMark       = Math.max(11, safeWidth * 0.052);

  const textShadow = ink
    ? {}
    : {
        textShadowColor: shadowColor,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: shadowRadius,
      };

  return (
    <View
      style={{
        width,
        height,
        position: "relative",
        backgroundColor: meta.bgFill,
        overflow: "hidden",
      }}
    >
      {/* Painted arch panel */}
      <Image
        source={meta.image}
        style={{
          position: "absolute",
          left: panelLeft,
          top: panelTop,
          width: panelRenderedSize,
          height: panelRenderedSize,
        }}
        resizeMode="cover"
      />

      {/* Content cluster, pinned inside the arch's safe rectangle */}
      <View
        style={{
          position: "absolute",
          left: safeLeft,
          top: safeTop,
          width: safeWidth,
          height: safeHeight,
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Top eyebrow — sits below the apex ornament */}
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            {
              fontFamily: "Inter_700Bold",
              color: accent,
              fontSize: eyebrowSize,
              letterSpacing: eyebrowSize * 0.32,
              paddingLeft: eyebrowSize * 0.32,
              textTransform: "uppercase",
              textAlign: "center",
              maxWidth: "100%",
            },
            textShadow,
          ]}
        >
          {eyebrow}
        </Text>

        <View style={{ flex: 1 }} />

        {/* Arabic */}
        {arabic ? (
          <Text
            numberOfLines={6}
            ellipsizeMode="tail"
            style={[
              {
                fontFamily: "AmiriQuran_400Regular",
                color: fg,
                fontSize: arabicSize,
                lineHeight: arabicSize * 1.85,
                textAlign: "center",
                writingDirection: "rtl",
                width: "100%",
              },
              textShadow,
            ]}
          >
            {arabic}
          </Text>
        ) : null}

        {/* Caption (e.g. the meaning of an Asma'ul Husna) — used very
            rarely on dua/adhkar but rendered for completeness. */}
        {caption ? (
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[
              {
                marginTop: safeHeight * 0.025,
                fontFamily: "Inter_600SemiBold",
                color: fg,
                fontSize: captionSize,
                letterSpacing: 0.3,
                textAlign: "center",
              },
              textShadow,
            ]}
          >
            {caption}
          </Text>
        ) : null}

        {/* English / translation body
            (Per design: dua/adhkar frames render Arabic + translation
            only — transliteration is intentionally omitted.) */}
        {body ? (
          <Text
            numberOfLines={6}
            ellipsizeMode="tail"
            style={[
              {
                marginTop: safeHeight * 0.04,
                fontFamily: "Inter_400Regular",
                fontStyle: arabic ? "italic" : "normal",
                color: fgDim,
                fontSize: bodySize,
                lineHeight: bodySize * 1.5,
                textAlign: "center",
                width: "100%",
              },
              textShadow,
            ]}
          >
            {body}
          </Text>
        ) : null}

        {/* Reference / attribution */}
        {attribution ? (
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[
              {
                marginTop: safeHeight * 0.04,
                fontFamily: "Inter_500Medium",
                color: fgDim,
                fontSize: attributionSize,
                letterSpacing: attributionSize * 0.32,
                paddingLeft: attributionSize * 0.32,
                textTransform: "uppercase",
                textAlign: "center",
              },
              textShadow,
            ]}
          >
            {attribution}
          </Text>
        ) : null}

        <View style={{ flex: 1 }} />

        {/* Hairline divider above the brand lockup */}
        <View
          style={{
            width: safeWidth * 0.18,
            height: 1,
            backgroundColor: accent,
            opacity: 0.55,
            marginBottom: safeHeight * 0.022,
          }}
        />

        {/* NUUR lockup — mark + wordmark + tagline */}
        <FrameNuurMark color={accent} size={lockupMark / 2} />
        <Text
          style={[
            {
              marginTop: 4,
              fontFamily: "Inter_700Bold",
              color: accent,
              fontSize: lockupName,
              letterSpacing: lockupName * 0.55,
              paddingLeft: lockupName * 0.55,
            },
            textShadow,
          ]}
        >
          NUUR
        </Text>
        <Text
          style={[
            {
              marginTop: 2,
              fontFamily: "Inter_400Regular",
              fontStyle: "italic",
              color: fgDim,
              fontSize: lockupTag,
              letterSpacing: 0.4,
            },
            textShadow,
          ]}
        >
          Light for your daily deen
        </Text>
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
