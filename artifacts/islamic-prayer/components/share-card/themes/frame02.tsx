import type { ShareTheme } from "../types";
import { FrameNoopBackground, makeFramePalette } from "./_frameShared";

export const Frame02Theme: ShareTheme = {
  id: "frame02",
  label: "Dark Green",
  blurb: "Olive · botanical",
  chrome: "frame",
  palette: makeFramePalette({
    ink: false,
    bgFill: "#4B5B3C",
    accent: "#E2C788",
  }),
  frame: {
    image: require("../../../assets/images/share-frames/frame02.png"),
    tone: "cream",
    accent: "#E2C788",
    bgFill: "#4B5B3C",
    safe: { t: 138, r: 130, b: 88, l: 130 },
  },
  Background: FrameNoopBackground,
};
