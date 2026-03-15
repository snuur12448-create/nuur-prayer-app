import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Ellipse, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";

// ── Haversine distance in km ──────────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

// ── Overpass API ──────────────────────────────────────────────────────────────
interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface Mosque {
  id: number;
  name: string;
  nameAr: string;
  lat: number;
  lon: number;
  distance: number;
  address: string;
}

async function fetchNearbyMosques(
  lat: number,
  lon: number,
  radiusM = 8000
): Promise<Mosque[]> {
  const query = `
    [out:json][timeout:30];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lon});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lon});
      relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lon});
    );
    out center tags;
  `.trim();

  const resp = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!resp.ok) throw new Error(`Overpass error ${resp.status}`);
  const json = await resp.json();

  const elements: OsmElement[] = json.elements ?? [];
  const mosques: Mosque[] = elements
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (elLat === undefined || elLon === undefined) return null;
      const tags = el.tags ?? {};
      const name =
        tags["name:en"] || tags.name || tags["name:ar"] || "Unnamed Mosque";
      const nameAr = tags["name:ar"] || "";
      const city = tags["addr:city"] || tags["addr:suburb"] || "";
      const street = tags["addr:street"] || "";
      const address = [street, city].filter(Boolean).join(", ");
      return {
        id: el.id,
        name,
        nameAr,
        lat: elLat,
        lon: elLon,
        distance: haversineKm(lat, lon, elLat, elLon),
        address,
      } as Mosque;
    })
    .filter((m): m is Mosque => m !== null)
    .sort((a, b) => a.distance - b.distance);

  return mosques;
}

// ── Mosque silhouette SVG header ──────────────────────────────────────────────
function MosqueSilhouette({
  width,
  height,
  color,
}: {
  width: number;
  height: number;
  color: string;
}) {
  const w = width;
  const h = height;
  const baseY = h * 0.85;
  const groundY = h;

  // Main dome
  const domeR = w * 0.14;
  const domeCX = w * 0.5;
  const domeCY = baseY - h * 0.28;

  // Secondary domes
  const sDomeR = w * 0.075;
  const leftDomeCX = w * 0.32;
  const rightDomeCX = w * 0.68;
  const sDomeCY = baseY - h * 0.18;

  // Minarets
  const minW = w * 0.03;
  const minH = h * 0.52;
  const leftMinX = w * 0.14;
  const rightMinX = w * 0.83;
  const minY = baseY - minH;

  // Minaret caps
  const capH = h * 0.08;

  // Main building body
  const bodyX = w * 0.2;
  const bodyW = w * 0.6;
  const bodyH = h * 0.3;
  const bodyY = baseY - bodyH;

  // Arches on body
  const archW = bodyW / 5;
  const archH = bodyH * 0.55;

  const arches = Array.from({ length: 5 }, (_, i) => {
    const ax = bodyX + i * archW + archW / 2;
    const ay = baseY;
    const ar = archW * 0.42;
    return { ax, ay, ar };
  });

  return (
    <Svg width={w} height={h}>
      {/* Ground line */}
      <Rect x={0} y={groundY - 2} width={w} height={2} fill={color} opacity={0.3} />

      {/* Left minaret */}
      <Rect x={leftMinX - minW / 2} y={minY} width={minW} height={minH} fill={color} opacity={0.7} rx={minW / 2} />
      <Path
        d={`M ${leftMinX - minW} ${minY} Q ${leftMinX} ${minY - capH * 1.6} ${leftMinX + minW} ${minY} Z`}
        fill={color} opacity={0.85}
      />
      {/* Minaret balcony */}
      <Rect x={leftMinX - minW * 1.4} y={minY + capH * 1.8} width={minW * 2.8} height={minW * 0.6} fill={color} opacity={0.6} rx={1} />
      {/* Left minaret crescent */}
      <Path
        d={`M ${leftMinX - 3} ${minY - capH * 1.4} A 4 4 0 1 1 ${leftMinX + 3} ${minY - capH * 1.4} A 2.5 2.5 0 1 0 ${leftMinX - 3} ${minY - capH * 1.4} Z`}
        fill={color} opacity={0.9}
      />

      {/* Right minaret */}
      <Rect x={rightMinX - minW / 2} y={minY} width={minW} height={minH} fill={color} opacity={0.7} rx={minW / 2} />
      <Path
        d={`M ${rightMinX - minW} ${minY} Q ${rightMinX} ${minY - capH * 1.6} ${rightMinX + minW} ${minY} Z`}
        fill={color} opacity={0.85}
      />
      <Rect x={rightMinX - minW * 1.4} y={minY + capH * 1.8} width={minW * 2.8} height={minW * 0.6} fill={color} opacity={0.6} rx={1} />
      <Path
        d={`M ${rightMinX - 3} ${minY - capH * 1.4} A 4 4 0 1 1 ${rightMinX + 3} ${minY - capH * 1.4} A 2.5 2.5 0 1 0 ${rightMinX - 3} ${minY - capH * 1.4} Z`}
        fill={color} opacity={0.9}
      />

      {/* Main building body */}
      <Rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} fill={color} opacity={0.5} />

      {/* Arched windows */}
      {arches.map(({ ax, ay, ar }, i) => (
        <Path
          key={i}
          d={`M ${ax - ar} ${ay} L ${ax - ar} ${ay - archH * 0.5} A ${ar} ${archH * 0.5} 0 0 1 ${ax + ar} ${ay - archH * 0.5} L ${ax + ar} ${ay} Z`}
          fill={color}
          opacity={0.25}
        />
      ))}

      {/* Left secondary dome */}
      <Ellipse cx={leftDomeCX} cy={sDomeCY} rx={sDomeR} ry={sDomeR * 0.8} fill={color} opacity={0.6} />
      <Path
        d={`M ${leftDomeCX - sDomeR * 0.35} ${sDomeCY - sDomeR * 0.75} Q ${leftDomeCX} ${sDomeCY - sDomeR * 1.35} ${leftDomeCX + sDomeR * 0.35} ${sDomeCY - sDomeR * 0.75}`}
        fill="none" stroke={color} strokeWidth={1.5} opacity={0.5}
      />

      {/* Right secondary dome */}
      <Ellipse cx={rightDomeCX} cy={sDomeCY} rx={sDomeR} ry={sDomeR * 0.8} fill={color} opacity={0.6} />
      <Path
        d={`M ${rightDomeCX - sDomeR * 0.35} ${sDomeCY - sDomeR * 0.75} Q ${rightDomeCX} ${sDomeCY - sDomeR * 1.35} ${rightDomeCX + sDomeR * 0.35} ${sDomeCY - sDomeR * 0.75}`}
        fill="none" stroke={color} strokeWidth={1.5} opacity={0.5}
      />

      {/* Main dome */}
      <Ellipse cx={domeCX} cy={domeCY} rx={domeR} ry={domeR * 0.82} fill={color} opacity={0.75} />
      {/* Dome ribbing */}
      {[-0.5, 0, 0.5].map((offset, i) => (
        <Path
          key={i}
          d={`M ${domeCX + offset * domeR * 0.6} ${domeCY} Q ${domeCX + offset * domeR * 0.6} ${domeCY - domeR * 0.7} ${domeCX} ${domeCY - domeR * 0.8}`}
          fill="none" stroke={color} strokeWidth={0.7} opacity={0.3}
        />
      ))}
      {/* Dome finial + crescent */}
      <Rect x={domeCX - 1.5} y={domeCY - domeR * 0.85 - 14} width={3} height={14} fill={color} opacity={0.8} />
      <Path
        d={`M ${domeCX - 5} ${domeCY - domeR * 0.85 - 22} A 6 6 0 1 1 ${domeCX + 5} ${domeCY - domeR * 0.85 - 22} A 3.5 3.5 0 1 0 ${domeCX - 5} ${domeCY - domeR * 0.85 - 22} Z`}
        fill={color} opacity={0.85}
      />
    </Svg>
  );
}

// ── Mosque card ───────────────────────────────────────────────────────────────
function MosqueCard({
  mosque,
  colors,
  index,
}: {
  mosque: Mosque;
  colors: any;
  index: number;
}) {
  const isClose = mosque.distance < 0.5;
  const isNear = mosque.distance < 2;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: index === 0 ? colors.gold + "55" : colors.border },
      ]}
    >
      {/* Distance badge */}
      <View
        style={[
          styles.distBadge,
          {
            backgroundColor: isClose
              ? colors.tint + "20"
              : isNear
              ? colors.gold + "18"
              : colors.surfaceElevated,
            borderColor: isClose
              ? colors.tint + "55"
              : isNear
              ? colors.gold + "44"
              : colors.border,
          },
        ]}
      >
        <Feather
          name="map-pin"
          size={10}
          color={isClose ? colors.tint : isNear ? colors.gold : colors.textSecondary}
        />
        <Text
          style={[
            styles.distText,
            { color: isClose ? colors.tint : isNear ? colors.gold : colors.textSecondary },
          ]}
        >
          {fmtDist(mosque.distance)}
        </Text>
      </View>

      {/* Rank */}
      <View style={[styles.rankWrap, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={[styles.rankText, { color: colors.textSecondary }]}>
          {index + 1}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
          {mosque.name}
        </Text>
        {mosque.nameAr ? (
          <Text style={[styles.cardArabic, { color: colors.gold }]} numberOfLines={1}>
            {mosque.nameAr}
          </Text>
        ) : null}
        {mosque.address ? (
          <View style={styles.addrRow}>
            <Feather name="navigation" size={10} color={colors.textSecondary} />
            <Text style={[styles.cardAddr, { color: colors.textSecondary }]} numberOfLines={1}>
              {mosque.address}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Closest badge */}
      {index === 0 && (
        <View style={[styles.closestBadge, { backgroundColor: colors.gold + "20", borderColor: colors.gold + "50" }]}>
          <Text style={[styles.closestText, { color: colors.gold }]}>Nearest</Text>
        </View>
      )}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MosquesScreen() {
  const { themeColors: colors, location, isLoadingLocation, requestLocation, usingDefaultLocation } =
    useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [radiusKm, setRadiusKm] = useState(8);

  const search = useCallback(
    async (km = radiusKm) => {
      if (!location) return;
      setLoading(true);
      setError(null);
      setSearched(true);
      try {
        const results = await fetchNearbyMosques(
          location.latitude,
          location.longitude,
          km * 1000
        );
        setMosques(results);
      } catch (e: any) {
        setError("Could not load mosques. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [location, radiusKm]
  );

  // Auto-search when location is available
  useEffect(() => {
    if (location && !usingDefaultLocation && !searched) {
      search();
    }
  }, [location, usingDefaultLocation, searched]);

  const HEADER_H = 200;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with mosque silhouette */}
      <View style={[styles.header, { paddingTop: topPad, height: HEADER_H + topPad, backgroundColor: colors.surface }]}>
        {/* Silhouette decorative background */}
        <View style={styles.silhouetteWrap} pointerEvents="none">
          <MosqueSilhouette
            width={400}
            height={HEADER_H}
            color={colors.tint}
          />
        </View>

        {/* Overlay gradient */}
        <View style={[styles.headerOverlay, { backgroundColor: colors.surface + "BB" }]} />

        {/* Header text */}
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.navigate("/(tabs)/more")} hitSlop={10} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color={colors.tint} />
          </Pressable>
          <Text style={[styles.headerArabic, { color: colors.gold }]}>المساجد القريبة</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Mosque Finder</Text>
          {location && !usingDefaultLocation && (
            <View style={styles.locRow}>
              <Feather name="map-pin" size={11} color={colors.textSecondary} />
              <Text style={[styles.locText, { color: colors.textSecondary }]}>
                {location.city || "Your location"} · {radiusKm} km radius
              </Text>
            </View>
          )}
        </View>

        {/* Location / refresh button */}
        <Pressable
          onPress={usingDefaultLocation || !location ? requestLocation : () => search()}
          style={[styles.refreshBtn, { backgroundColor: colors.tint + "20", borderColor: colors.tint + "55" }]}
        >
          <Feather
            name={usingDefaultLocation || !location ? "crosshair" : "refresh-cw"}
            size={14}
            color={colors.tint}
          />
          <Text style={[styles.refreshText, { color: colors.tint }]}>
            {usingDefaultLocation || !location ? "Detect Location" : "Refresh"}
          </Text>
        </Pressable>
      </View>

      {/* Radius chips */}
      <View style={[styles.radiusRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.radiusLabel, { color: colors.textSecondary }]}>Search radius:</Text>
        {[2, 5, 8, 15, 25].map((km) => (
          <Pressable
            key={km}
            onPress={() => {
              setRadiusKm(km);
              if (location && !usingDefaultLocation) search(km);
            }}
            style={[
              styles.radiusChip,
              {
                backgroundColor: radiusKm === km ? colors.tint + "20" : colors.surfaceElevated,
                borderColor: radiusKm === km ? colors.tint : colors.border,
              },
            ]}
          >
            <Text style={[styles.radiusChipText, { color: radiusKm === km ? colors.tint : colors.textSecondary }]}>
              {km} km
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {isLoadingLocation || (loading && mosques.length === 0) ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            {isLoadingLocation ? "Detecting your location…" : "Searching for mosques…"}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centred}>
          <Feather name="wifi-off" size={36} color={colors.textSecondary} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>{error}</Text>
          <Pressable
            onPress={() => search()}
            style={[styles.retryBtn, { backgroundColor: colors.tint + "20", borderColor: colors.tint + "55" }]}
          >
            <Text style={[styles.retryText, { color: colors.tint }]}>Try Again</Text>
          </Pressable>
        </View>
      ) : usingDefaultLocation || !location ? (
        <View style={styles.centred}>
          <Feather name="map-pin" size={40} color={colors.textSecondary} />
          <Text style={[styles.stateTitle, { color: colors.text }]}>Location needed</Text>
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            Allow location access to find mosques near you
          </Text>
          <Pressable
            onPress={requestLocation}
            style={[styles.retryBtn, { backgroundColor: colors.tint + "20", borderColor: colors.tint + "55" }]}
          >
            <Feather name="crosshair" size={14} color={colors.tint} />
            <Text style={[styles.retryText, { color: colors.tint }]}>Enable Location</Text>
          </Pressable>
        </View>
      ) : searched && mosques.length === 0 ? (
        <View style={styles.centred}>
          <Text style={{ fontSize: 40 }}>🕌</Text>
          <Text style={[styles.stateTitle, { color: colors.text }]}>No mosques found</Text>
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            Try increasing the search radius
          </Text>
        </View>
      ) : (
        <FlatList
          data={mosques}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            mosques.length > 0 ? (
              <View style={styles.listHeader}>
                <Text style={[styles.listHeaderText, { color: colors.textSecondary }]}>
                  {mosques.length} mosque{mosques.length !== 1 ? "s" : ""} within {radiusKm} km
                </Text>
                {loading && <ActivityIndicator size="small" color={colors.tint} />}
              </View>
            ) : null
          }
          renderItem={({ item, index }) => (
            <MosqueCard mosque={item} colors={colors} index={index} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { alignSelf: "flex-start", marginBottom: 6 },

  /* Header */
  header: {
    overflow: "hidden",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  silhouetteWrap: {
    position: "absolute",
    bottom: 0,
    left: -10,
    right: -10,
    opacity: 0.18,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    gap: 3,
    zIndex: 1,
  },
  headerArabic: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  locText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  refreshBtn: {
    position: "absolute",
    right: 20,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 1,
  },
  refreshText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  /* Radius row */
  radiusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexWrap: "wrap",
  },
  radiusLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginRight: 2,
  },
  radiusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  radiusChipText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  /* States */
  centred: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 36,
  },
  stateTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  stateText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  retryText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },

  /* List */
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listHeaderText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  /* Card */
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  rankWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rankText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  cardArabic: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  addrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardAddr: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  distBadge: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 50,
    flexShrink: 0,
  },
  distText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  closestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
  },
  closestText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
