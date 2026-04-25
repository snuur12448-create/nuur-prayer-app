import React from "react";

export const ARABIC_FONT = "'Amiri Quran', 'Amiri', serif";
export const SERIF_FONT = "'Cormorant Garamond', 'Libre Baskerville', serif";
export const SANS_FONT = "'Inter', system-ui, sans-serif";

export function NuurMark({
  color = "#C9933A",
  dim = "rgba(0,0,0,0.45)",
}: {
  color?: string;
  dim?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontFamily: SANS_FONT,
        fontSize: 9.5,
        letterSpacing: "0.5em",
        textTransform: "lowercase",
        color: dim,
        fontWeight: 500,
        paddingLeft: "0.5em",
      }}
    >
      <span>nuur</span>
      <span
        style={{
          width: 3,
          height: 3,
          borderRadius: 999,
          background: color,
          opacity: 0.95,
        }}
      />
    </div>
  );
}

/**
 * Fills the entire viewport with the given background. The hosting iframe
 * (1:1 for cards, 9:16 for wallpapers) controls aspect ratio externally;
 * the `ratio` prop is kept only for documentation/intent at the call site.
 */
export function FullBleed({
  background,
  ratio: _ratio,
  children,
}: {
  background: string;
  ratio: "1/1" | "9/16";
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        margin: 0,
        padding: 0,
        background,
        overflow: "hidden",
        color: "#1a1a1a",
      }}
    >
      {children}
    </div>
  );
}
