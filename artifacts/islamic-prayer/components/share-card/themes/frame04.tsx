import type { ShareTheme } from "../types";
import { FrameNoopBackground, makeFramePalette } from "./_frameShared";

export const Frame04Theme: ShareTheme = {
  id: "frame04",
  label: "Sage Watercolor",
  blurb: "Soft sage · leaves",
  chrome: "frame",
  palette: makeFramePalette({ ink: true, bgFill: "#C8D2BB" }),
  frame: {
    image: require("../../../assets/images/share-frames/frame04.png"),
    tone: "ink",
    bgFill: "#C8D2BB",
    safe: { t: 138, r: 130, b: 90, l: 130 },
  },
  Background: FrameNoopBackground,
};
