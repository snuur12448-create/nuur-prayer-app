import { ImageSourcePropType } from "react-native";

export type CardCategory =
  // Morning
  | "morning_adhkar" | "morning_dua"
  // Evening
  | "evening_adhkar" | "evening_dua"
  // Night
  | "night_dua" | "istighfar" | "isha_reflection"
  // Names of Allah — grouped by theme
  | "name_mercy"
  | "name_power"
  | "name_knowledge"
  | "name_general"
  // Ayahs — grouped by theme
  | "ayah_patience"
  | "ayah_mercy"
  | "ayah_general"
  // Hadiths — grouped by theme
  | "hadith_prayer"
  | "hadith_knowledge"
  | "hadith_intentions"
  | "hadith_general";

export const categoryBackgrounds: Record<CardCategory, ImageSourcePropType> = {
  morning_adhkar:    require("../assets/backgrounds/dawn-minaret.png"),
  morning_dua:       require("../assets/backgrounds/dawn-minaret.png"),
  evening_adhkar:    require("../assets/backgrounds/dusk-mosque.png"),
  evening_dua:       require("../assets/backgrounds/dusk-mosque.png"),
  night_dua:         require("../assets/backgrounds/night-mosque.png"),
  istighfar:         require("../assets/backgrounds/night-mosque.png"),
  isha_reflection:   require("../assets/backgrounds/night-mosque.png"),
  name_mercy:        require("../assets/backgrounds/warm-garden.png"),
  name_power:        require("../assets/backgrounds/starry-sky.png"),
  name_knowledge:    require("../assets/backgrounds/starry-sky.png"),
  name_general:      require("../assets/backgrounds/warm-garden.png"),
  ayah_patience:     require("../assets/backgrounds/misty-mountain.png"),
  ayah_mercy:        require("../assets/backgrounds/warm-garden.png"),
  ayah_general:      require("../assets/backgrounds/starry-sky.png"),
  hadith_prayer:     require("../assets/backgrounds/night-mosque.png"),
  hadith_knowledge:  require("../assets/backgrounds/starry-sky.png"),
  hadith_intentions: require("../assets/backgrounds/night-mosque.png"),
  hadith_general:    require("../assets/backgrounds/night-mosque.png"),
};

export const categoryAccents: Record<CardCategory, string> = {
  morning_adhkar:    "#F5C77E",
  morning_dua:       "#F5C77E",
  evening_adhkar:    "#D4A574",
  evening_dua:       "#D4A574",
  night_dua:         "#C9B896",
  istighfar:         "#A8B5C8",
  isha_reflection:   "#C9B896",
  name_mercy:        "#E8C88A",
  name_power:        "#B8A5D1",
  name_knowledge:    "#A8B5D8",
  name_general:      "#E8C88A",
  ayah_patience:     "#C8B89A",
  ayah_mercy:        "#E8C88A",
  ayah_general:      "#C9B896",
  hadith_prayer:     "#D4B27E",
  hadith_knowledge:  "#C9B896",
  hadith_intentions: "#D4B27E",
  hadith_general:    "#D4B27E",
};

export const categoryLabels: Record<CardCategory, string> = {
  morning_adhkar:    "Morning Adhkār",
  morning_dua:       "Morning Duʿāʾ",
  evening_adhkar:    "Evening Adhkār",
  evening_dua:       "Evening Duʿāʾ",
  night_dua:         "Night Duʿāʾ",
  istighfar:         "Istighfār",
  isha_reflection:   "Night · Reflection",
  name_mercy:        "The 99 Names",
  name_power:        "The 99 Names",
  name_knowledge:    "The 99 Names",
  name_general:      "The 99 Names",
  ayah_patience:     "Qurʾān · Ayah",
  ayah_mercy:        "Qurʾān · Ayah",
  ayah_general:      "Qurʾān · Ayah",
  hadith_prayer:     "Ḥadīth · Ṣalāh",
  hadith_knowledge:  "Ḥadīth · ʿIlm",
  hadith_intentions: "Ḥadīth · Niyyah",
  hadith_general:    "Ḥadīth · Ṣaḥīḥ",
};

/* ── Mercy-themed names (~25): use name_mercy. Power-themed (~25): name_power.
   Knowledge-themed (~25): name_knowledge. Rest: name_general. ── */
const NAME_MERCY_NUMBERS = new Set([
  1, 2, 14, 17, 25, 33, 34, 35, 47, 50, 67, 68, 79, 83, 84, 85, 88, 90, 91, 92,
]);
const NAME_POWER_NUMBERS = new Set([
  8, 10, 22, 23, 24, 36, 37, 39, 48, 51, 54, 56, 57, 60, 65, 66, 69, 70, 71, 73, 74, 89, 95, 99,
]);
const NAME_KNOWLEDGE_NUMBERS = new Set([
  19, 27, 31, 38, 40, 43, 46, 49, 52, 53, 58, 62, 64, 72, 75, 76, 77, 78, 80, 81, 82, 86, 87, 93, 96, 97,
]);

export function nameCategoryFor(nameNumber: number): CardCategory {
  if (NAME_MERCY_NUMBERS.has(nameNumber)) return "name_mercy";
  if (NAME_POWER_NUMBERS.has(nameNumber)) return "name_power";
  if (NAME_KNOWLEDGE_NUMBERS.has(nameNumber)) return "name_knowledge";
  return "name_general";
}

/** Map a free-form hadith topic string (e.g. "Intentions", "Prayer") to a category. */
export function hadithCategoryFor(topic: string | undefined): CardCategory {
  if (!topic) return "hadith_general";
  const t = topic.toLowerCase();
  if (t.includes("intent") || t.includes("niyyah") || t.includes("niyah")) return "hadith_intentions";
  if (t.includes("prayer") || t.includes("salah") || t.includes("salat")) return "hadith_prayer";
  if (t.includes("knowledge") || t.includes("ilm") || t.includes("learning")) return "hadith_knowledge";
  return "hadith_general";
}

/** Map a dua category name (e.g. "Morning", "Evening", "Forgiveness") to a card category. */
export function duaCategoryFor(catName: string | undefined): CardCategory {
  if (!catName) return "night_dua";
  const t = catName.toLowerCase();
  if (t.includes("morning")) return "morning_dua";
  if (t.includes("evening")) return "evening_dua";
  if (t.includes("istighfar") || t.includes("forgive")) return "istighfar";
  if (t.includes("night") || t.includes("sleep") || t.includes("tahajjud")) return "night_dua";
  return "night_dua";
}
