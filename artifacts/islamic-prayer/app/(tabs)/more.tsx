import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { NuurLogo } from "@/components/NuurLogo";

const LOGO_GOLD = "#C9933A";

interface MoreItem {
  label: string;
  arabic: string;
  description: string;
  route: string;
  icon: React.ReactNode;
  accentColor: string;
}

export default function MoreScreen() {
  const { themeColors: colors } = useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const items: MoreItem[] = [
    {
      label: "Wudhu & Prayer Guide",
      arabic: "الوضوء والصلاة",
      description: "Step-by-step guides for performing wudhu and salah, with duas and tips",
      route: "/(tabs)/guide",
      icon: <MaterialCommunityIcons name="hand-water" size={26} color="#64B5F6" />,
      accentColor: "#64B5F6",
    },
    {
      label: "Sahih Hadiths",
      arabic: "الأحاديث الصحيحة",
      description: "Browse authentic hadiths from Bukhari & Muslim with live Sunnah.com content",
      route: "/(tabs)/hadiths",
      icon: <MaterialCommunityIcons name="book-open-page-variant" size={26} color="#A5D6A7" />,
      accentColor: "#A5D6A7",
    },
    {
      label: "Mosque Finder",
      arabic: "المساجد القريبة",
      description: "Find the nearest mosques to you, sorted by distance with addresses",
      route: "/(tabs)/mosques",
      icon: <MaterialCommunityIcons name="mosque" size={26} color="#4DB6AC" />,
      accentColor: "#4DB6AC",
    },
    {
      label: "Duas & Adhkar",
      arabic: "الأدعية والأذكار",
      description: "Daily supplications, morning & evening adhkar, and rotating authentic hadith",
      route: "/(tabs)/dua",
      icon: <Feather name="heart" size={26} color="#E8A87C" />,
      accentColor: "#E8A87C",
    },
    {
      label: "99 Names of Allah",
      arabic: "أسماء الله الحسنى",
      description: "The beautiful names of Allah with meanings, transliterations, and reflections",
      route: "/(tabs)/names",
      icon: <MaterialCommunityIcons name="star-circle-outline" size={26} color="#B39DDB" />,
      accentColor: "#B39DDB",
    },
    {
      label: "Tasbeeh Counter",
      arabic: "التسبيح",
      description: "Digital dhikr counter with preset phrases, round tracking, and haptic feedback",
      route: "/(tabs)/tasbeeh",
      icon: <MaterialCommunityIcons name="circle-multiple-outline" size={26} color="#80CBC4" />,
      accentColor: "#80CBC4",
    },
    {
      label: "Settings",
      arabic: "الإعدادات",
      description: "Calculation method, adhan style, theme, time format, and app preferences",
      route: "/(tabs)/settings",
      icon: <Feather name="settings" size={26} color="#90A4AE" />,
      accentColor: "#90A4AE",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: topPad + 12,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Nuur Logo — compact horizontal header */}
        <View style={[styles.logoBlock, { borderBottomColor: LOGO_GOLD + "30" }]}>
          <NuurLogo size={52} />
          <View style={styles.logoText}>
            <View style={styles.logoTitleRow}>
              <Text style={[styles.logoArabic, { color: LOGO_GOLD }]}>نُور</Text>
              <Text style={[styles.logoLatin, { color: LOGO_GOLD + "CC" }]}>  NUUR</Text>
            </View>
            <Text style={[styles.logoTagline, { color: colors.textSecondary }]}>Light for your daily deen</Text>
          </View>
        </View>

        {/* Section label */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>MORE FEATURES</Text>

        {/* Menu items */}
        <View style={styles.menuList}>
          {items.map((item, idx) => (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as any)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
                  borderColor: colors.border,
                  marginBottom: idx < items.length - 1 ? 12 : 0,
                },
              ]}
            >
              {/* Left accent bar */}
              <View style={[styles.accentBar, { backgroundColor: item.accentColor }]} />

              {/* Icon */}
              <View style={[styles.iconWrap, { backgroundColor: item.accentColor + "18" }]}>
                {item.icon}
              </View>

              {/* Text */}
              <View style={styles.cardText}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.cardArabic, { color: item.accentColor }]}>{item.arabic}</Text>
                </View>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>

              {/* Chevron */}
              <Feather name="chevron-right" size={18} color={colors.textSecondary} style={styles.chevron} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
  },

  /* Logo */
  logoBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  logoText: {
    flex: 1,
    gap: 3,
  },
  logoTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 0,
  },
  logoArabic: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    lineHeight: 28,
  },
  logoLatin: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 4,
  },
  logoTagline: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
    fontStyle: "italic",
    opacity: 0.7,
  },

  /* Section label */
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 14,
  },

  /* Cards */
  menuList: {},
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 18,
    paddingRight: 14,
  },
  accentBar: {
    width: 3,
    alignSelf: "stretch",
    marginRight: 14,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardText: {
    flex: 1,
    gap: 5,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap",
  },
  cardLabel: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  cardArabic: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  chevron: {
    marginLeft: 6,
  },
});
