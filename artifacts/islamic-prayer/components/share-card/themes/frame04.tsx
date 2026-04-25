import type { ShareTheme } from "../types";
import { FrameNoopBackground, makeFramePalette } from "./_frameShared";

export const Frame04Theme: ShareTheme = {
  id: "frame04",
  label: "Sage Watercolor",
  blurb: "Soft sage · leaves",
  chrome: "frame",
  palette: makeFramePalette({ ink: true, bgFill: "#D3CFBB" }),
  frame: {
    image: require("../../../assets/images/share-frames/frame04.png"),
    tone: "ink",
    bgFill: "#D3CFBB",
    safe: { t: 138, r: 130, b: 90, l: 130 },
  },
  Background: FrameNoopBackground,
};
