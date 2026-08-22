import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Text as SvgText } from "react-native-svg";

import { getTheme } from "./themes";
import type {
  PremiumTheme,
  ShareCardContent,
  ShareCardMode,
  ShareThemeId,
  ThemeOverlay,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
 * ShareCard — premium photo-card renderer.
 *
 * Visual pipeline (bottom → top):
 *   1. Solid fallback colour (matches the photo's outer edge)
 *   2. Bundled photo plate (cover-fit, fills the entire card)
 *   3. Optional overlay layers (linear or radial gradient scrims)
 *   4. Optional arched ornament border (Names only)
 *   5. Centred typographic cluster (kind-aware layout)
 *   6. NUUR brand mark + wordmark + tagline pinned to the bottom
 *
 * Aspect ratios:
 *   • card       — 1 : 1 (Instagram square / general purpose)
 *   • wallpaper  — 9 : 16 (lock-screen / story)
 *
 * Output sizes (used by `captureRef`):
 *   • card       — 1080 × 1080
 *   • wallpaper  — 1170 × 2535  (true 9:19.5 modern iPhone aspect)
 *
 * Layout per kind (after eyebrow if present):
 *   dua / adhkar : Arabic → rule → English → source-caps
 *   ayah / quran : Arabic → rule → English → "Surah X · Y:Z"
 *   hadith       : English (top) → rule → Arabic → source-caps
 *   name         : Arabic name → Latin name → meaning italic
 * ──────────────────────────────────────────────────────────────────────── */

export interface ShareCardProps extends ShareCardContent {
  themeId: ShareThemeId;
  mode: ShareCardMode;
  /** Render width in dp. Height is derived from mode aspect. */
  width: number;
  /** Original kind — needed because adhkar maps to dua themes. */
  kind?: "dua" | "adhkar" | "quran" | "ayah" | "hadith" | "name";
}

const CARD_ASPECT      = 1;          // 1:1
const WALLPAPER_ASPECT = 19.5 / 9;   // 2.1667 — true modern iPhone aspect

/* ── Font fitters ───────────────────────────────────────────────────────── */

function fitArabic(
  text: string | undefined,
  width: number,
  isWallpaper: boolean,
  arabicOnly: boolean = false,
): number {
  if (!text) return 0;
  const len = text.length;
  // Shares: 432 design width → 28-36 px arabic. Scale linearly with width.
  // When the English copy is hidden the Arabic gets the full cluster band,
  // so we boost the base size ~30% to fill the now-open space.
  const boost = arabicOnly ? 1.30 : 1.0;
  const base = (isWallpaper ? width * 0.080 : width * 0.075) * boost;
  if (len < 50)   return base;
  if (len < 100)  return base * 0.85;
  if (len < 180)  return base * 0.72;
  if (len < 280)  return base * 0.60;
  if (len < 400)  return base * 0.52;
  return base * 0.46;
}

function fitEnglish(
  text: string,
  width: number,
  isWallpaper: boolean,
  englishOnly: boolean = false,
): number {
  const len = text.length;
  // English-only mode (Arabic toggled off): boost the base size so the
  // English fills the now-open cluster band, mirroring what we already do
  // for arabicOnly. Long-ayah steps go further down so e.g. Ayat al-Kursi
  // (~620 chars) doesn't need to truncate; iOS adjustsFontSizeToFit
  // handles the final squeeze on the rare overflow.
  const boost = englishOnly ? 1.20 : 1.0;
  const base = (isWallpaper ? width * 0.046 : width * 0.044) * boost;
  if (len < 80)   return base;
  if (len < 160)  return base * 0.92;
  if (len < 280)  return base * 0.84;
  if (len < 440)  return base * 0.76;
  if (len < 600)  return base * 0.66;
  if (len < 800)  return base * 0.58;
  return base * 0.50;
}

function fitName(width: number, isWallpaper: boolean, arabicOnly: boolean = false): number {
  // Names of Allah are short — go big. Wallpaper a bit larger.
  // Arabic-only mode (English hidden) → boost so the single glyph fills space.
  const boost = arabicOnly ? 1.40 : 1.0;
  return (isWallpaper ? width * 0.165 : width * 0.150) * boost;
}

/* ── Inline NUUR mark — react-native-svg port of NuurMarkSVG ──────────── */

function NuurMarkSVG({ size, color }: { size: number; color: string }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={34} fill="none" stroke={color} strokeWidth={1.1} opacity={0.55} />
      <Circle cx={50} cy={50} r={18} fill="none" stroke={color} strokeWidth={1.1} opacity={0.85} />
      <G>
        {rays.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 50 + Math.cos(rad) * 38;
          const y1 = 50 + Math.sin(rad) * 38;
          const x2 = 50 + Math.cos(rad) * 46;
          const y2 = 50 + Math.sin(rad) * 46;
          return (
            <Line
              key={deg}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={color}
              strokeWidth={2.2}
              strokeLinecap="round"
              opacity={0.9}
            />
          );
        })}
      </G>
      <SvgText
        x={50}
        y={59}
        textAnchor="middle"
        fontFamily="AmiriQuran_400Regular"
        fontSize={20}
        fill={color}
      >
        ن
      </SvgText>
    </Svg>
  );
}

/* ── Overlay rendering ─────────────────────────────────────────────────── */

function renderOverlay(overlay: ThemeOverlay, key: string) {
  if (overlay.type === "linear") {
    const colors = overlay.stops.map(([c]) => c) as unknown as readonly [string, string, ...string[]];
    const locations = overlay.stops.map(([, p]) => p) as unknown as readonly [number, number, ...number[]];
    return (
      <LinearGradient
        key={key}
        colors={colors}
        locations={locations}
        style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
      />
    );
  }
  // Radial scrim faked with a vertical → centre fade. Two stacked gradients
  // create a soft elliptical glow that focuses attention on the middle.
  const cy = overlay.centerY ?? 0.5;
  const colors = [overlay.outerColor, overlay.innerColor, overlay.outerColor] as unknown as readonly [string, string, string];
  return (
    <LinearGradient
      key={key}
      colors={colors}
      locations={[0, cy, 1] as unknown as readonly [number, number, number]}
      style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
    />
  );
}

/* ── Main renderer ─────────────────────────────────────────────────────── */

export function ShareCard({
  themeId, mode, width, kind,
  eyebrow, arabic, transliteration, body, caption, attribution,
}: ShareCardProps) {
  const baseTheme = getTheme(themeId);
  const isWallpaper = mode === "wallpaper";
  const height = width * (isWallpaper ? WALLPAPER_ASPECT : CARD_ASPECT);

  // Resolve per-mode palette: some themes (e.g. name-v4) ship a dark card
  // plate AND a bright wallpaper plate, so the cluster ink needs to flip
  // between modes while the brand colour stays constant.
  const theme = useMemo<PremiumTheme>(() => {
    if (isWallpaper) return baseTheme;
    if (
      !baseTheme.cardInk &&
      !baseTheme.cardInkDim &&
      !baseTheme.cardRuleColor &&
      !baseTheme.cardTextShadow
    ) return baseTheme;
    return {
      ...baseTheme,
      ink: baseTheme.cardInk ?? baseTheme.ink,
      inkDim: baseTheme.cardInkDim ?? baseTheme.inkDim,
      ruleColor: baseTheme.cardRuleColor ?? baseTheme.ruleColor,
      textShadow: baseTheme.cardTextShadow ?? baseTheme.textShadow,
    };
  }, [baseTheme, isWallpaper]);

  // "Arabic-only" mode: user toggled English off in the share sheet, so
  // body/transliteration/caption/attribution are all stripped before render.
  // We use this flag to (a) boost Arabic sizing to fill the open space, and
  // (b) push the wallpaper cluster a little higher so the larger Arabic
  // doesn't crowd the bottom brand mark.
  const arabicOnly = !!arabic && !body && !transliteration && !caption && !attribution;
  // "English-only" mode: user toggled Arabic off. Symmetric treatment —
  // boost English sizing + allow many more lines so long ayahs flow without
  // truncating to "…".
  const englishOnly = !arabic && !!(body || transliteration || caption);

  const arabicSize  = useMemo(() => fitArabic(arabic, width, isWallpaper, arabicOnly), [arabic, width, isWallpaper, arabicOnly]);
  const englishSize = useMemo(() => fitEnglish(body, width, isWallpaper, englishOnly), [body, width, isWallpaper, englishOnly]);
  const nameSize    = useMemo(() => fitName(width, isWallpaper, arabicOnly), [width, isWallpaper, arabicOnly]);

  const maxArabicLines  = isWallpaper ? (arabicOnly ? 6 : 4) : (arabicOnly ? 5 : 3);
  // English-only: lift the cap dramatically so long ayahs (Ayat al-Kursi
  // sits ~620 chars / ~12 lines at the small size) flow to completion.
  const maxEnglishLines = englishOnly ? (isWallpaper ? 16 : 14) : 3;

  // Resolve effective layout kind from theme (prevents quran→ayah and adhkar→dua mismatch)
  const layoutKind: "dua" | "ayah" | "hadith" | "name" = theme.kind;

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: theme.fallbackBg,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Photo plate */}
      <Image
        source={isWallpaper ? theme.wallpaperBg : theme.cardBg}
        style={{ position: "absolute", top: 0, left: 0, width, height }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        priority="high"
      />

      {/* Overlays */}
      {(theme.overlays ?? []).map((o, i) => renderOverlay(o, `o_${i}`))}

      {/* Arch ornament (Names only) */}
      {theme.arch ? (
        <View
          style={{
            pointerEvents: "none",
            position: "absolute",
            top: width * 0.04,
            left: width * 0.05,
            right: width * 0.05,
            bottom: isWallpaper ? width * 0.18 : width * 0.18,
            borderWidth: 1,
            borderColor: "rgba(212, 175, 55, 0.28)",
            borderTopLeftRadius: width * 0.42,
            borderTopRightRadius: width * 0.42,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        />
      ) : null}

      {/* Content cluster */}
      <ContentCluster
        layoutKind={layoutKind}
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
        arabicSize={arabicSize}
        englishSize={englishSize}
        nameSize={nameSize}
        maxArabicLines={maxArabicLines}
        maxEnglishLines={maxEnglishLines}
        arabicOnly={arabicOnly}
        englishOnly={englishOnly}
      />

      {/* Brand contrast scrim — soft veil behind the footer so the NUUR
          mark + tagline reads against busy backgrounds (e.g. mosque
          silhouettes at the bottom of Names wallpapers). Wallpaper-only:
          1:1 cards usually have enough bottom contrast already. */}
      {theme.brandScrim && isWallpaper ? (
        <LinearGradient
          colors={
            (theme.brandScrim === "light"
              ? ["rgba(248,242,232,0)", "rgba(248,242,232,0.78)"]
              : ["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]) as unknown as readonly [string, string]
          }
          locations={[0, 1] as unknown as readonly [number, number]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: height * 0.18,
            pointerEvents: "none",
          }}
        />
      ) : null}

      {/* Brand footer */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: isWallpaper ? height * 0.045 : height * 0.055,
          alignItems: "center",
        }}
      >
        <BrandFooter
          theme={theme}
          iconSize={width * (isWallpaper ? 0.080 : 0.085)}
        />
      </View>
    </View>
  );
}

/* ── ContentCluster — kind-specific typographic layout ─────────────────── */

interface ContentClusterProps extends ShareCardContent {
  layoutKind: "dua" | "ayah" | "hadith" | "name";
  theme: PremiumTheme;
  width: number;
  height: number;
  isWallpaper: boolean;
  arabicSize: number;
  englishSize: number;
  nameSize: number;
  maxArabicLines: number;
  maxEnglishLines: number;
  arabicOnly: boolean;
  englishOnly: boolean;
}

function ContentCluster(p: ContentClusterProps) {
  const {
    layoutKind, theme, width, height, isWallpaper,
    eyebrow, arabic, transliteration, body, caption, attribution,
    arabicSize, englishSize, nameSize,
    maxArabicLines, maxEnglishLines, arabicOnly, englishOnly,
  } = p;

  const sidePad = Math.max(28, width * 0.085);
  // Wallpaper: text sits in the upper-mid third (clear of clock + footer).
  // Card: vertically centred. When Arabic stands alone we open up the cluster
  // band — the calligraphy needs more vertical breathing room.
  // Open up the cluster band whenever one side stands alone so the surviving
  // language can use the full height — Arabic calligraphy needs vertical
  // breathing room; long English ayahs need every line of body height.
  const soloMode = arabicOnly || (!arabic && !!body);
  const top    = isWallpaper
    ? (soloMode ? height * 0.24 : height * 0.32)
    : (soloMode ? height * 0.06 : height * 0.10);
  const bottom = isWallpaper
    ? (soloMode ? height * 0.15 : height * 0.18)
    : (soloMode ? height * 0.15 : height * 0.18);

  const textShadowProps = theme.textShadow
    ? {
        textShadowColor: theme.textShadow.color,
        textShadowOffset: { width: 0, height: theme.textShadow.offsetY ?? 1 },
        textShadowRadius: theme.textShadow.radius,
      }
    : {};

  const eyebrowSize     = width * 0.026;
  const sourceSize      = width * (isWallpaper ? 0.020 : 0.022);
  const meaningSize     = width * (isWallpaper ? 0.037 : 0.040);
  const ruleWidth       = width * 0.10;

  const eyebrowEl = eyebrow ? (
    <Text
      numberOfLines={1}
      style={[
        styles.eyebrow,
        {
          color: theme.inkDim,
          fontSize: eyebrowSize,
          letterSpacing: eyebrowSize * 0.32,
        },
        textShadowProps,
      ]}
    >
      {eyebrow.toUpperCase()}
    </Text>
  ) : null;

  const ruleEl = (
    <View
      style={{
        height: 1,
        width: ruleWidth,
        backgroundColor: theme.ruleColor,
        marginVertical: width * 0.030,
      }}
    />
  );

  const arabicEl = arabic ? (
    <Text
      style={[
        {
          fontFamily: "AmiriQuran_400Regular",
          color: theme.ink,
          fontSize: arabicSize,
          lineHeight: arabicSize * 1.7,
          textAlign: "center",
          writingDirection: "rtl",
          width: "100%",
        },
        textShadowProps,
      ]}
      numberOfLines={maxArabicLines}
    >
      {arabic}
    </Text>
  ) : null;

  // Translation. The web mockups render the English body in serif italic
  // — there is no separate transliteration row. Per-kind callers may still
  // pass `transliteration`; we deliberately ignore it for dua/ayah/hadith
  // to match the visual contract of the premium frames.
  const englishEl = (
    <Text
      style={[
        {
          fontFamily: "CormorantGaramond_400Regular_Italic",
          color: theme.ink,
          fontSize: englishSize,
          // Tighter leading for long English-only blocks so 600+ char
          // ayahs (Ayat al-Kursi) actually fit the cluster band.
          lineHeight: englishSize * (englishOnly && body.length > 280 ? 1.32 : 1.45),
          textAlign: "center",
          width: "100%",
        },
        textShadowProps,
      ]}
      numberOfLines={maxEnglishLines}
      // English-only: let iOS auto-shrink as a safety net so the very
      // longest verses (Baqarah 282, etc.) never truncate to "…".
      adjustsFontSizeToFit={englishOnly}
      minimumFontScale={englishOnly ? 0.55 : 1}
    >
      {body}
    </Text>
  );

  const sourceEl = attribution ? (
    <Text
      style={[
        {
          fontFamily: "Inter_500Medium",
          color: theme.inkDim,
          fontSize: sourceSize,
          letterSpacing: sourceSize * 0.22,
          marginTop: width * 0.030,
          textAlign: "center",
        },
        textShadowProps,
      ]}
      numberOfLines={2}
    >
      {attribution.toUpperCase()}
    </Text>
  ) : null;

  /* ── Names of Allah layout (Arabic name → Latin → meaning) ──────────── */
  if (layoutKind === "name") {
    const latin = transliteration ?? body;
    const meaning = caption ?? attribution ?? "";
    return (
      <View
        style={[styles.clusterAbsolute, { top, bottom, paddingHorizontal: sidePad }]}
      >
        <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
          {arabic ? (
            <Text
              style={[
                {
                  fontFamily: "AmiriQuran_400Regular",
                  color: theme.ink,
                  fontSize: nameSize,
                  // AmiriQuran needs ~1.6 to keep the upper diacritics
                  // (fatha/damma/sukun) from getting clipped on iOS.
                  lineHeight: nameSize * 1.6,
                  textAlign: "center",
                  writingDirection: "rtl",
                  // Visual top padding so the cluster centres on the
                  // glyph body, not the diacritic strip above it.
                  paddingTop: nameSize * 0.18,
                  marginBottom: width * 0.030,
                },
                textShadowProps,
              ]}
              numberOfLines={1}
            >
              {arabic}
            </Text>
          ) : null}

          {latin ? (
            <Text
              style={[
                {
                  fontFamily: "CormorantGaramond_600SemiBold",
                  color: theme.ink,
                  fontSize: width * (isWallpaper ? 0.060 : 0.060),
                  letterSpacing: 0.5,
                  marginBottom: width * 0.018,
                  textAlign: "center",
                },
                textShadowProps,
              ]}
              numberOfLines={1}
            >
              {latin}
            </Text>
          ) : null}

          {meaning ? (
            <Text
              style={[
                {
                  fontFamily: "CormorantGaramond_400Regular_Italic",
                  color: theme.inkDim,
                  fontSize: meaningSize,
                  lineHeight: meaningSize * 1.4,
                  textAlign: "center",
                  opacity: 0.95,
                },
                textShadowProps,
              ]}
              numberOfLines={3}
            >
              {meaning}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  /* ── Hadith layout (English on top → rule → Arabic → source) ────────── */
  if (layoutKind === "hadith") {
    return (
      <View
        style={[styles.clusterAbsolute, { top, bottom, paddingHorizontal: sidePad }]}
      >
        <View style={{ alignItems: "center", justifyContent: "center", flex: 1, width: "100%" }}>
          {eyebrowEl}
          {eyebrow ? <View style={{ height: width * 0.020 }} /> : null}

          {/* Hadith: English first, larger, semi-bold serif. */}
          <Text
            style={[
              {
                fontFamily: "CormorantGaramond_500Medium",
                color: theme.ink,
                fontSize: englishSize * 1.22,
                lineHeight: englishSize * 1.58,
                textAlign: "center",
                width: "100%",
              },
              textShadowProps,
            ]}
            numberOfLines={maxEnglishLines}
          >
            {body}
          </Text>

          {arabic ? ruleEl : null}
          {arabic ? (
            <Text
              style={[
                {
                  fontFamily: "AmiriQuran_400Regular",
                  color: theme.ink,
                  fontSize: arabicSize * 0.88,
                  lineHeight: arabicSize * 1.7,
                  paddingTop: arabicSize * 0.18,
                  textAlign: "center",
                  writingDirection: "rtl",
                  width: "100%",
                  opacity: 0.94,
                },
                textShadowProps,
              ]}
              numberOfLines={Math.max(1, maxArabicLines - 1)}
            >
              {arabic}
            </Text>
          ) : null}

          {sourceEl}
        </View>
      </View>
    );
  }

  /* ── Default: dua / ayah (Arabic on top → rule → English → source) ── */
  return (
    <View
      style={[styles.clusterAbsolute, { top, bottom, paddingHorizontal: sidePad }]}
    >
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1, width: "100%" }}>
        {eyebrowEl}
        {eyebrow ? <View style={{ height: width * 0.020 }} /> : null}

        {arabicEl}
        {/* Rule sits between Arabic and English. With Arabic-only mode the
            rule has no second clause to separate from, so we hide it. */}
        {arabic && !arabicOnly ? ruleEl : null}

        {arabicOnly ? null : englishEl}

        {sourceEl}
      </View>
    </View>
  );
}

/* ── BrandFooter ──────────────────────────────────────────────────────── */

function BrandFooter({ theme, iconSize }: { theme: PremiumTheme; iconSize: number }) {
  const wordmarkSize = iconSize * 0.36;
  const taglineSize  = wordmarkSize * 0.92;
  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <NuurMarkSVG size={iconSize} color={theme.brandColor} />
      <Text
        style={{
          fontFamily: "CormorantGaramond_600SemiBold",
          fontSize: wordmarkSize,
          letterSpacing: wordmarkSize * 0.5,
          paddingLeft: wordmarkSize * 0.5,
          color: theme.brandColor,
        }}
      >
        NUUR
      </Text>
      <Text
        style={{
          fontFamily: "CormorantGaramond_400Regular_Italic",
          fontSize: taglineSize,
          letterSpacing: 0.4,
          color: theme.brandDim,
        }}
      >
        Light for your daily deen
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  clusterAbsolute: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    overflow: "hidden",
  },
  eyebrow: {
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    textAlign: "center",
  },
});
