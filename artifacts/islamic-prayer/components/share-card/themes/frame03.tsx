import type { ShareTheme } from "../types";
import { FrameNoopBackground, makeFramePalette } from "./_frameShared";

export const Frame03Theme: ShareTheme = {
  id: "frame03",
  label: "Beige Palm",
  blurb: "Warm sand · palm",
  chrome: "frame",
  palette: makeFramePalette({ ink: true, bgFill: "#E0D0B5" }),
  frame: {
    image: require("../../../assets/images/share-frames/frame03.png"),
    tone: "ink",
    bgFill: "#E0D0B5",
    safe: { t: 138, r: 142, b: 86, l: 130 },
  },
  Background: FrameNoopBackground,
};
