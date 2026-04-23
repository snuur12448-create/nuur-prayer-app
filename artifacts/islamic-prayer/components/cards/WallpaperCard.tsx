import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

import {
  categoryAccents,
  categoryBackgrounds,
  categoryLabels,
} from "@/constants/cardBackgrounds";

import { BrandLockup } from "./BrandLockup";
import { InfoStrip } from "./InfoStrip";
import { Masthead } from "./Masthead";
import { AyahContent } from "./content/AyahContent";
import { DuaContent } from "./content/DuaContent";
import { HadithContent } from "./content/HadithContent";
import { NameContent } from "./content/NameContent";
import { CardData } from "./types";

export interface WallpaperCardProps {
  card: CardData;
  width: number;
}

const ASPECT = 19.5 / 9; // 9:19.5 portrait

export function WallpaperCard({ card, width }: WallpaperCardProps) {
  const height = width * ASPECT;
  // Reference width is 1170 (full export), so scale based on that.
  const scale = width / 1170 * 1.6;
  const padding = 40 * scale * 1.6;
  const padTop = height * 0.35;        // Masthead at ~35% from top
  const padBottom = height * 0.04;
  const accent = categoryAccents[card.category];
  const bg = categoryBackgrounds[card.category];
  const categoryLabel = categoryLabels[card.category];

  return (
    <View style={[styles.outer, { width, height }]} collapsable={false}>
      <ImageBackground source={bg} style={[styles.bg, { width, height }]} resizeMode="cover">
        <LinearGradient
          colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0)", "rgba(0,0,0,0.65)"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View
          style={[
            styles.content,
            { paddingTop: padTop, paddingBottom: padBottom, paddingHorizontal: padding },
          ]}
        >
          <Masthead
            category={categoryLabel}
            refNumber={card.refNumber}
            accent={accent}
            scale={scale}
          />

          <View style={[styles.contentBlock, { paddingVertical: 30 * scale }]}>
            <CardBody card={card} accent={accent} scale={scale} />
          </View>

          <InfoStrip cells={card.info} cardPadding={padding} scale={scale} />

          <BrandLockup accent={accent} scale={scale} />
        </View>
      </ImageBackground>
    </View>
  );
}

function CardBody({ card, accent, scale }: { card: CardData; accent: string; scale: number }) {
  switch (card.kind) {
    case "name":
      return (
        <NameContent
          arabic={card.arabic}
          pronunciation={card.pronunciation}
          meaning={card.meaning}
          hook={card.hook}
          accent={accent}
          scale={scale}
        />
      );
    case "dua":
      return (
        <DuaContent
          arabic={card.arabic}
          transliteration={card.transliteration}
          translation={card.translation}
          hook={card.hook}
          accent={accent}
          scale={scale}
          sourceType={card.sourceType}
        />
      );
    case "hadith":
      return (
        <HadithContent
          arabic={card.arabic}
          translation={card.translation}
          hook={card.hook}
          accent={accent}
          scale={scale}
        />
      );
    case "ayah":
      return (
        <AyahContent
          arabic={card.arabic}
          transliteration={card.transliteration}
          translation={card.translation}
          hook={card.hook}
          accent={accent}
          scale={scale}
        />
      );
  }
}

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
    backgroundColor: "#08110C",
  },
  bg: { flex: 1 },
  content: {
    flex: 1,
    width: "100%",
  },
  contentBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
