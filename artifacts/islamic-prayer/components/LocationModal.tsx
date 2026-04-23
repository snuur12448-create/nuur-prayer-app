import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LocationData } from "@/context/AppContext";
import { ThemeColors } from "@/constants/themes";

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

function buildCityLabel(r: NominatimResult): string {
  const a = r.address;
  const city = a.city || a.town || a.village || a.county || a.state || "";
  const country = a.country || "";
  if (city && country) return `${city}, ${country}`;
  return r.display_name.split(",").slice(0, 2).join(",").trim();
}

async function nominatimSearch(query: string): Promise<NominatimResult[]> {
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
    `&format=json&limit=6&addressdetails=1&featuretype=city`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return [];
  return res.json();
}

async function getTimezoneOffset(lat: number, lon: number): Promise<number> {
  try {
    const res = await fetch(
      `https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lon}`
    );
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    const seconds: number = data?.currentUtcOffset?.seconds ?? 0;
    return seconds / 3600;
  } catch {
    return Math.round(lon / 15);
  }
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onRequestGps: () => Promise<void>;
  onSelectManual: (loc: LocationData) => Promise<void>;
  colors: ThemeColors;
  isLoadingGps: boolean;
}

export function LocationModal({
  visible,
  onClose,
  onRequestGps,
  onSelectManual,
  colors,
  isLoadingGps,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) {
      setQuery("");
      setResults([]);
    }
  }, [visible]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await nominatimSearch(query.trim());
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleGps = async () => {
    setGpsLoading(true);
    try {
      await onRequestGps();
      onClose();
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSelect = async (r: NominatimResult) => {
    setSelectingId(r.place_id);
    Keyboard.dismiss();
    try {
      const lat = parseFloat(r.lat);
      const lon = parseFloat(r.lon);
      const tz = await getTimezoneOffset(lat, lon);
      const city = buildCityLabel(r);
      await onSelectManual({ latitude: lat, longitude: lon, city, timezone: tz });
      onClose();
    } finally {
      setSelectingId(null);
    }
  };

  const showResults = results.length > 0 && query.trim().length >= 2;

  const dismissPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderRelease: (_, g) => {
        if (g.dy > 50 || g.vy > 0.5) onClose();
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable onPress={onClose} hitSlop={16} style={styles.handleArea} {...dismissPan.panHandlers}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </Pressable>

        {/* Header */}
        <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Change Location</Text>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { borderColor: colors.border }]}
          >
            <Feather name="x" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* GPS button */}
        <TouchableOpacity
          onPress={handleGps}
          disabled={gpsLoading || isLoadingGps}
          style={[styles.gpsBtn, { backgroundColor: colors.tint + "18", borderColor: colors.tint + "40" }]}
          activeOpacity={0.7}
        >
          {gpsLoading || isLoadingGps ? (
            <ActivityIndicator size="small" color={colors.tint} />
          ) : (
            <Feather name="navigation" size={18} color={colors.tint} />
          )}
          <Text style={[styles.gpsBtnText, { color: colors.tint }]}>
            {gpsLoading || isLoadingGps ? "Detecting location…" : "Use My Current Location"}
          </Text>
        </TouchableOpacity>

        <View style={[styles.dividerRow, { marginVertical: 16 }]}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or search manually</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Search input */}
        <View style={[styles.searchRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="City, town or country…"
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); setResults([]); }} hitSlop={10}>
              <Feather name="x-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {searching && <ActivityIndicator size="small" color={colors.tint} style={{ marginLeft: 8 }} />}
        </View>

        {/* Results */}
        {showResults && (
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.place_id)}
            style={styles.resultList}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => (
              <View style={[styles.itemSep, { backgroundColor: colors.border }]} />
            )}
            renderItem={({ item }) => {
              const isLoading = selectingId === item.place_id;
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  disabled={selectingId !== null}
                  style={[styles.resultRow, { opacity: selectingId !== null && !isLoading ? 0.4 : 1 }]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.pinDot, { backgroundColor: colors.tint + "20" }]}>
                    <Feather name="map-pin" size={13} color={colors.tint} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resultCity, { color: colors.text }]} numberOfLines={1}>
                      {buildCityLabel(item)}
                    </Text>
                    <Text style={[styles.resultDetail, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.display_name}
                    </Text>
                  </View>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.tint} />
                  ) : (
                    <Feather name="chevron-right" size={15} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}

        {!showResults && !searching && query.trim().length >= 2 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No locations found for "{query}"
            </Text>
          </View>
        )}

        <View style={{ height: Platform.OS === "ios" ? 34 : 20 }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "82%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
  },
  handleArea: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 60,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gpsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  gpsBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  resultList: {
    maxHeight: 280,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
  },
  pinDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  resultCity: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  resultDetail: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  itemSep: {
    height: 1,
    marginLeft: 44,
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
