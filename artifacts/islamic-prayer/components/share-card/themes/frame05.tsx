import type { ShareTheme } from "../types";
import { FrameNoopBackground, makeFramePalette } from "./_frameShared";

export const Frame05Theme: ShareTheme = {
  id: "frame05",
  label: "Teal Crescent",
  blurb: "Night · crescent",
  chrome: "frame",
  palette: makeFramePalette({
    ink: false,
    bgFill: "#1F322F",
    accent: "#E8C77A",
  }),
  frame: {
    image: require("../../../assets/images/share-frames/frame05.png"),
    tone: "cream",
    accent: "#E8C77A",
    bgFill: "#1F322F",
    safe: { t: 144, r: 130, b: 90, l: 130 },
  },
  Background: FrameNoopBackground,
};
