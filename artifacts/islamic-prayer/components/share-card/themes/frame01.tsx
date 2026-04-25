import type { ShareTheme } from "../types";
import { FrameNoopBackground, makeFramePalette } from "./_frameShared";

export const Frame01Theme: ShareTheme = {
  id: "frame01",
  label: "Cream Vase",
  blurb: "Beige · botanical",
  chrome: "frame",
  palette: makeFramePalette({ ink: true, bgFill: "#E2D9C7" }),
  frame: {
    image: require("../../../assets/images/share-frames/frame01.png"),
    tone: "ink",
    bgFill: "#E2D9C7",
    safe: { t: 138, r: 130, b: 86, l: 130 },
  },
  Background: FrameNoopBackground,
};
