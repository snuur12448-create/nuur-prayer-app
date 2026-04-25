import type { ShareTheme } from "../types";
import { FrameNoopBackground, makeFramePalette } from "./_frameShared";

export const Frame06Theme: ShareTheme = {
  id: "frame06",
  label: "Beige Mosque",
  blurb: "Warm cream · minaret",
  chrome: "frame",
  palette: makeFramePalette({ ink: true, bgFill: "#DEC9A4" }),
  frame: {
    image: require("../../../assets/images/share-frames/frame06.png"),
    tone: "ink",
    bgFill: "#DEC9A4",
    safe: { t: 138, r: 150, b: 90, l: 130 },
  },
  Background: FrameNoopBackground,
};
