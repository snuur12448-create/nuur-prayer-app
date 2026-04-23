import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

/**
 * Parses a hook string with optional <em>...</em> markup and renders it as
 * a Fraunces italic line, with the em word(s) coloured in the accent.
 *
 * Example: "What makes the <em>same</em> action count for more?"
 */
export interface HookLineProps {
  hook: string;
  accent: string;
  scale?: number;
  style?: TextStyle;
}

const SEG_RE = /<em>(.*?)<\/em>/gi;

function parseSegments(hook: string): { text: string; em: boolean }[] {
  const parts: { text: string; em: boolean }[] = [];
  let last = 0;
  for (const m of hook.matchAll(SEG_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push({ text: hook.slice(last, idx), em: false });
    parts.push({ text: m[1], em: true });
    last = idx + m[0].length;
  }
  if (last < hook.length) parts.push({ text: hook.slice(last), em: false });
  return parts;
}

export function HookLine({ hook, accent, scale = 1, style }: HookLineProps) {
  const segments = parseSegments(hook);
  return (
    <Text style={[styles.line, { fontSize: 14 * scale, lineHeight: 22 * scale }, style]}>
      {segments.map((seg, i) =>
        seg.em ? (
          <Text key={i} style={{ color: accent }}>
            {seg.text}
          </Text>
        ) : (
          <Text key={i}>{seg.text}</Text>
        )
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  line: {
    fontFamily: "Fraunces_400Regular_Italic",
    fontStyle: "italic",
    color: "rgba(245,238,220,0.78)",
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
