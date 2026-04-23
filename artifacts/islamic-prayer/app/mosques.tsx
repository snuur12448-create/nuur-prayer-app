import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Ellipse, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useMiniPlayerHeight } from "@/context/QuranPlayerContext";
import MosqueMapView from "@/components/MosqueMapView";
import { useSavedItems } from "@/utils/useSavedItems";

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
  phone?: string;
  website?: string;
  denomination?: string;
  openingHours?: string;
  wheelchair?: string;
}

// Pretty-print the OSM denomination tag (e.g. "sunni" → "Sunni").
function prettyDenomination(d?: string): string | undefined {
  if (!d) return undefined;
  return d
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// Multiple Overpass endpoints tried in order until one succeeds.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

function buildQuery(lat: number, lon: number, radiusM: number, nodesOnly = false) {
  if (nodesOnly) {
    // Lightweight fallback — nodes only, faster to compute server-side.
    return `[out:json][timeout:25];node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lon});out tags;`;
  }
  return (
    `[out:json][timeout:25];` +
    `(` +
    `node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lon});` +
    `way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lon});` +
    `relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lon});` +
    `);out center tags;`
  );
}

function parseElements(elements: OsmElement[], lat: number, lon: number): Mosque[] {
  return elements
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (elLat === undefined || elLon === undefined) return null;
      const tags = el.tags ?? {};
      const name = tags["name:en"] || tags.name || tags["name:ar"] || "Unnamed Mosque";
      const nameAr = tags["name:ar"] || "";
      const housenumber = tags["addr:housenumber"] || "";
      const street     = tags["addr:street"] || "";
      const suburb     = tags["addr:suburb"] || tags["addr:neighbourhood"] || tags["addr:quarter"] || "";
      const city       = tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || "";
      const postcode   = tags["addr:postcode"] || "";
      const streetLine = [housenumber, street].filter(Boolean).join(" ");
      const areaLine   = [suburb, city].filter(Boolean).join(", ");
      const address    = [streetLine, areaLine, postcode].filter(Boolean).join(", ");
      const phone        = tags["contact:phone"] || tags["phone"] || undefined;
      const website      = tags["contact:website"] || tags["website"] || undefined;
      const denomination = prettyDenomination(tags["denomination"]);
      const openingHours = tags["opening_hours"] || undefined;
      const wheelchair   = tags["wheelchair"] || undefined;
      return {
        id: el.id, name, nameAr, lat: elLat, lon: elLon,
        distance: haversineKm(lat, lon, elLat, elLon),
        address, phone, website, denomination, openingHours, wheelchair,
      } as Mosque;
    })
    .filter((m): m is Mosque => m !== null)
    .sort((a, b) => a.distance - b.distance);
}

async function tryEndpoint(url: string, query: string, timeoutMs: number): Promise<OsmElement[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    return json.elements ?? [];
  } finally {
    clearTimeout(timer);
  }
}

async function fetchNearbyMosques(
  lat: number,
  lon: number,
  radiusM = 8000
): Promise<Mosque[]> {
  // Round 1: full query (nodes + ways + relations) across all mirrors.
  const fullQuery = buildQuery(lat, lon, radiusM);
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const elements = await tryEndpoint(endpoint, fullQuery, 18000);
      return parseElements(elements, lat, lon);
    } catch (_) {
      // Try next mirror.
    }
  }

  // Round 2: lightweight nodes-only query as last resort.
  const liteQuery = buildQuery(lat, lon, radiusM, true);
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const elements = await tryEndpoint(endpoint, liteQuery, 15000);
      return parseElements(elements, lat, lon);
    } catch (_) {
      // Try next mirror.
    }
  }

  throw new Error("All Overpass endpoints failed");
}

// ── Open external maps for directions ────────────────────────────────────────
function openGoogleMapsDir(lat: number, lon: number) {
  const dest = `${lat},${lon}`;
  Linking.openURL(`comgooglemaps://?daddr=${dest}&directionsmode=driving`).catch(
    () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dest}`),
  );
}
function openAppleMapsDir(lat: number, lon: number) {
  const dest = `${lat},${lon}`;
  Linking.openURL(`maps://?daddr=${dest}&dirflg=d`).catch(() =>
    Linking.openURL(`https://maps.apple.com/?daddr=${dest}`),
  );
}
function showDirectionsSheet(lat: number, lon: number, name: string) {
  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      { title: "Get Directions", message: name, options: ["Google Maps", "Apple Maps", "Cancel"], cancelButtonIndex: 2 },
      (i) => { if (i === 0) openGoogleMapsDir(lat, lon); else if (i === 1) openAppleMapsDir(lat, lon); },
    );
  } else if (Platform.OS === "android") {
    Alert.alert("Get Directions", name, [
      { text: "Google Maps", onPress: () => openGoogleMapsDir(lat, lon) },
      { text: "Apple Maps", onPress: () => openAppleMapsDir(lat, lon) },
      { text: "Cancel", style: "cancel" },
    ]);
  } else {
    // Web — just open Google Maps directions in a new tab.
    openGoogleMapsDir(lat, lon);
  }
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
  saved,
  onPress,
  onToggleSave,
}: {
  mosque: Mosque;
  colors: any;
  index: number;
  saved: boolean;
  onPress: () => void;
  onToggleSave: () => void;
}) {
  const isClose = mosque.distance < 0.5;
  const isNear = mosque.distance < 2;
  const distColor = isClose ? colors.tint : isNear ? colors.gold : colors.textSecondary;
  const open247 = (mosque.openingHours || "").trim() === "24/7";

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.tint + "12" }}
      accessibilityRole="button"
      accessibilityLabel={`${mosque.name}, ${fmtDist(mosque.distance)}. Tap for details.`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: index === 0 ? colors.gold + "55" : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {/* Rank */}
      <View style={[styles.rankWrap, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={[styles.rankText, { color: colors.textSecondary }]}>
          {index + 1}
        </Text>
      </View>

      {/* Info — name → arabic → address → distance + chips */}
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
          <Text style={[styles.cardAddr, { color: colors.textSecondary }]} numberOfLines={2}>
            {mosque.address}
          </Text>
        ) : null}
        {/* Distance row — always shown, below address */}
        <View style={styles.distRow}>
          <Feather name="map-pin" size={10} color={distColor} />
          <Text style={[styles.distInline, { color: distColor }]}>
            {fmtDist(mosque.distance)}
          </Text>
          {index === 0 && (
            <View style={[styles.nearestPill, { backgroundColor: colors.gold + "20", borderColor: colors.gold + "50" }]}>
              <Text style={[styles.nearestText, { color: colors.gold }]}>Nearest</Text>
            </View>
          )}
          {mosque.denomination ? (
            <View style={[styles.metaPill, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}>
              <Text style={[styles.metaPillText, { color: colors.textSecondary }]}>
                {mosque.denomination}
              </Text>
            </View>
          ) : null}
          {open247 ? (
            <View style={[styles.metaPill, { borderColor: colors.tint + "55", backgroundColor: colors.tint + "18" }]}>
              <Text style={[styles.metaPillText, { color: colors.tint }]}>24/7</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Save toggle */}
      <Pressable
        onPress={(e) => { e.stopPropagation?.(); onToggleSave(); }}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={saved ? "Remove from saved" : "Save mosque"}
        accessibilityState={{ selected: saved }}
        style={styles.cardSaveBtn}
      >
        <Feather
          name="bookmark"
          size={18}
          color={saved ? colors.gold : colors.textSecondary}
          style={saved ? { opacity: 1 } : { opacity: 0.6 }}
        />
      </Pressable>
    </Pressable>
  );
}

// ── Detail bottom sheet ──────────────────────────────────────────────────────
function MosqueDetailSheet({
  mosque,
  visible,
  onClose,
  colors,
  saved,
  onToggleSave,
}: {
  mosque: Mosque | null;
  visible: boolean;
  onClose: () => void;
  colors: any;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (!visible) setCopied(false); }, [visible]);

  const dismissPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderRelease: (_, g) => {
        if (g.dy > 50 || g.vy > 0.5) onClose();
      },
    })
  ).current;

  if (!mosque) return null;

  const onCopyAddress = async () => {
    const text = mosque.address || `${mosque.lat.toFixed(5)}, ${mosque.lon.toFixed(5)}`;
    try {
      if (Platform.OS === "web") await navigator.clipboard?.writeText(text);
      else await Clipboard.setStringAsync(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const onShareMosque = async () => {
    const dest = `${mosque.lat},${mosque.lon}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
    const lines = [
      mosque.name,
      mosque.nameAr || null,
      mosque.address || null,
      `${fmtDist(mosque.distance)} away`,
      mapsUrl,
      "",
      "Shared from Nuur · نور",
    ].filter(Boolean) as string[];
    try {
      await Share.share({ message: lines.join("\n"), url: mapsUrl, title: mosque.name });
    } catch {}
  };

  const onCall = () => {
    if (!mosque.phone) return;
    const tel = mosque.phone.replace(/[^\d+]/g, "");
    Linking.openURL(`tel:${tel}`).catch(() => {});
  };
  const onWeb = () => {
    if (!mosque.website) return;
    let url = mosque.website.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    Linking.openURL(url).catch(() => {});
  };

  const open247 = (mosque.openingHours || "").trim() === "24/7";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={sheetStyles.backdrop}
        onPress={onClose}
        accessibilityLabel="Close mosque details"
      >
        {/* Inner Pressable explicitly consumes the event so taps inside the
            sheet (buttons, links, scroll) never bubble up and dismiss the
            modal. RN Web bubbles synthetic events to the backdrop without
            this stopPropagation. */}
        <Pressable
          onPress={(e) => { e.stopPropagation?.(); }}
          accessibilityViewIsModal
          style={[
            sheetStyles.sheet,
            { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
        >
          {/* Drag handle */}
          <Pressable
            onPress={onClose}
            hitSlop={16}
            style={sheetStyles.handleArea}
            {...dismissPan.panHandlers}
          >
            <View style={[sheetStyles.handle, { backgroundColor: colors.border }]} />
          </Pressable>

          {/* Header */}
          <View style={sheetStyles.header}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[sheetStyles.title, { color: colors.text }]} numberOfLines={2}>
                {mosque.name}
              </Text>
              {mosque.nameAr ? (
                <Text style={[sheetStyles.titleAr, { color: colors.gold }]} numberOfLines={1}>
                  {mosque.nameAr}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onToggleSave}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={saved ? "Remove from saved" : "Save mosque"}
              accessibilityState={{ selected: saved }}
              style={[sheetStyles.iconBtn, { borderColor: colors.border }]}
            >
              <Feather name="bookmark" size={18} color={saved ? colors.gold : colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={[sheetStyles.iconBtn, { borderColor: colors.border }]}
            >
              <Feather name="x" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Distance + chips */}
          <View style={sheetStyles.metaRow}>
            <View style={[sheetStyles.distChip, { backgroundColor: colors.tint + "1A", borderColor: colors.tint + "55" }]}>
              <Feather name="navigation" size={11} color={colors.tint} />
              <Text style={[sheetStyles.distChipText, { color: colors.tint }]}>{fmtDist(mosque.distance)} away</Text>
            </View>
            {mosque.denomination ? (
              <View style={[sheetStyles.chip, { borderColor: colors.border }]}>
                <Text style={[sheetStyles.chipText, { color: colors.textSecondary }]}>{mosque.denomination}</Text>
              </View>
            ) : null}
            {open247 ? (
              <View style={[sheetStyles.chip, { backgroundColor: colors.tint + "1A", borderColor: colors.tint + "55" }]}>
                <Feather name="clock" size={11} color={colors.tint} />
                <Text style={[sheetStyles.chipText, { color: colors.tint }]}>Open 24/7</Text>
              </View>
            ) : null}
            {mosque.wheelchair === "yes" ? (
              <View style={[sheetStyles.chip, { borderColor: colors.border }]}>
                <Feather name="check" size={11} color={colors.textSecondary} />
                <Text style={[sheetStyles.chipText, { color: colors.textSecondary }]}>Step-free access</Text>
              </View>
            ) : null}
          </View>

          <ScrollView
            style={{ maxHeight: 320 }}
            contentContainerStyle={{ paddingBottom: 4 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Address */}
            {mosque.address ? (
              <View style={sheetStyles.detailRow}>
                <Feather name="map-pin" size={14} color={colors.textSecondary} style={{ marginTop: 2 }} />
                <Text style={[sheetStyles.detailText, { color: colors.text }]}>{mosque.address}</Text>
              </View>
            ) : null}

            {/* Opening hours (only when not 24/7 and tag is not just generic) */}
            {!open247 && mosque.openingHours ? (
              <View style={sheetStyles.detailRow}>
                <Feather name="clock" size={14} color={colors.textSecondary} style={{ marginTop: 2 }} />
                <Text style={[sheetStyles.detailText, { color: colors.text }]}>{mosque.openingHours}</Text>
              </View>
            ) : null}

            {/* Phone — tappable */}
            {mosque.phone ? (
              <Pressable onPress={onCall} style={sheetStyles.detailRow} accessibilityRole="link" accessibilityLabel={`Call ${mosque.phone}`}>
                <Feather name="phone" size={14} color={colors.tint} style={{ marginTop: 2 }} />
                <Text style={[sheetStyles.detailText, { color: colors.tint }]}>{mosque.phone}</Text>
              </Pressable>
            ) : null}

            {/* Website — tappable */}
            {mosque.website ? (
              <Pressable onPress={onWeb} style={sheetStyles.detailRow} accessibilityRole="link" accessibilityLabel={`Open website ${mosque.website}`}>
                <Feather name="globe" size={14} color={colors.tint} style={{ marginTop: 2 }} />
                <Text style={[sheetStyles.detailText, { color: colors.tint }]} numberOfLines={1}>
                  {mosque.website.replace(/^https?:\/\//i, "")}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>

          {/* Primary action */}
          <Pressable
            onPress={() => showDirectionsSheet(mosque.lat, mosque.lon, mosque.name)}
            style={[sheetStyles.primaryBtn, { backgroundColor: colors.tint }]}
            accessibilityRole="button"
            accessibilityLabel="Get directions"
          >
            <Feather name="navigation" size={15} color="#fff" />
            <Text style={sheetStyles.primaryBtnText}>Get Directions</Text>
          </Pressable>

          {/* Secondary actions */}
          <View style={sheetStyles.actionGrid}>
            <Pressable
              onPress={onCopyAddress}
              style={[sheetStyles.actionBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel={copied ? "Copied" : "Copy address"}
            >
              <Feather name={copied ? "check" : "copy"} size={14} color={copied ? colors.gold : colors.textSecondary} />
              <Text style={[sheetStyles.actionBtnText, { color: copied ? colors.gold : colors.text }]}>
                {copied ? "Copied" : "Copy address"}
              </Text>
            </Pressable>
            <Pressable
              onPress={onShareMosque}
              style={[sheetStyles.actionBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Share mosque"
            >
              <Feather name="share-2" size={14} color={colors.textSecondary} />
              <Text style={[sheetStyles.actionBtnText, { color: colors.text }]}>Share</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MosquesScreen() {
  const { themeColors: colors, location, isLoadingLocation, requestLocation, usingDefaultLocation } =
    useAppContext();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const miniPlayerH = useMiniPlayerHeight();
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;

  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [radiusKm, setRadiusKm] = useState(8);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [savedOnly, setSavedOnly] = useState(false);
  const [activeMosque, setActiveMosque] = useState<Mosque | null>(null);
  // Bumped when user explicitly hits Refresh so the effect fires even if coords didn't change yet
  const [refreshTick, setRefreshTick] = useState(0);

  // Persistent saved mosques — IDs are OSM element ids stringified.
  const { savedIds, toggle: toggleSaved } = useSavedItems("nuur_saved_mosques");
  const visibleMosques = useMemo(
    () => (savedOnly ? mosques.filter((m) => savedIds.has(String(m.id))) : mosques),
    [mosques, savedOnly, savedIds],
  );
  const savedCount = useMemo(
    () => mosques.reduce((n, m) => n + (savedIds.has(String(m.id)) ? 1 : 0), 0),
    [mosques, savedIds],
  );

  const search = useCallback(
    async (lat: number, lon: number, km = radiusKm) => {
      setLoading(true);
      setError(null);
      setSearched(true);
      try {
        const results = await fetchNearbyMosques(lat, lon, km * 1000);
        setMosques(results);
      } catch (e: any) {
        setError("Could not reach mosque data servers. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [radiusKm]
  );

  // Re-search whenever the GPS coordinates actually change, or the user taps Refresh
  const prevCoordsRef = useRef<string>("");
  useEffect(() => {
    if (!location || usingDefaultLocation) return;
    const coordKey = `${location.latitude.toFixed(5)},${location.longitude.toFixed(5)},${radiusKm}`;
    // Always run on refreshTick bump; otherwise only when coords/radius changed
    if (coordKey === prevCoordsRef.current && refreshTick === 0) return;
    prevCoordsRef.current = coordKey;
    search(location.latitude, location.longitude, radiusKm);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.latitude, location?.longitude, usingDefaultLocation, radiusKm, refreshTick]);

  // Refresh: ask device for a fresh GPS fix → location updates in context → effect above fires
  const handleRefresh = useCallback(() => {
    requestLocation();
    // Also bump tick so a re-search fires even if the coords haven't changed yet
    setRefreshTick((n) => n + 1);
  }, [requestLocation]);

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
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
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
          onPress={usingDefaultLocation || !location ? requestLocation : handleRefresh}
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
              if (location && !usingDefaultLocation) search(location.latitude, location.longitude, km);
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
        {/* Saved-only filter — only meaningful in list mode */}
        {viewMode === "list" && (savedCount > 0 || savedOnly) ? (
          <Pressable
            onPress={() => setSavedOnly((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={savedOnly ? "Show all mosques" : "Show saved mosques only"}
            style={[
              styles.radiusChip,
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginLeft: "auto",
                backgroundColor: savedOnly ? colors.gold + "20" : colors.surfaceElevated,
                borderColor: savedOnly ? colors.gold : colors.border,
              },
            ]}
          >
            <Feather name="bookmark" size={11} color={savedOnly ? colors.gold : colors.textSecondary} />
            <Text style={[styles.radiusChipText, { color: savedOnly ? colors.gold : colors.textSecondary }]}>
              Saved {savedCount > 0 ? `· ${savedCount}` : ""}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* List / Map toggle */}
      <View style={[styles.toggleRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.toggleWrap, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          {(["list", "map"] as const).map((mode) => {
            const active = viewMode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => setViewMode(mode)}
                style={[
                  styles.toggleBtn,
                  active && { backgroundColor: colors.tint },
                ]}
              >
                <Feather
                  name={mode === "list" ? "list" : "map"}
                  size={13}
                  color={active ? "#fff" : colors.textSecondary}
                />
                <Text style={[styles.toggleBtnText, { color: active ? "#fff" : colors.textSecondary }]}>
                  {mode === "list" ? "List" : "Map"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Content */}
      {isLoadingLocation || (loading && mosques.length === 0) ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            {isLoadingLocation ? "Detecting your location…" : "Searching nearby mosques…"}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centred}>
          <Feather name="wifi-off" size={36} color={colors.textSecondary} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>{error}</Text>
          <Pressable
            onPress={() => location && search(location.latitude, location.longitude)}
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
      ) : searched && visibleMosques.length === 0 && viewMode === "list" ? (
        <View style={styles.centred}>
          <Text style={{ fontSize: 40 }}>🕌</Text>
          <Text style={[styles.stateTitle, { color: colors.text }]}>
            {savedOnly ? "No saved mosques in range" : "No mosques found"}
          </Text>
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            {savedOnly
              ? "Bookmark a mosque from the list to see it here."
              : "Try increasing the search radius"}
          </Text>
          {savedOnly && (
            <Pressable
              onPress={() => setSavedOnly(false)}
              style={[styles.retryBtn, { backgroundColor: colors.tint + "20", borderColor: colors.tint + "55" }]}
            >
              <Text style={[styles.retryText, { color: colors.tint }]}>Show all</Text>
            </Pressable>
          )}
        </View>
      ) : viewMode === "map" && location && !usingDefaultLocation ? (
        <MosqueMapView
          mosques={mosques}
          userLat={location.latitude}
          userLon={location.longitude}
          colors={colors}
          bottomPad={insets.bottom + miniPlayerH}
        />
      ) : (
        <FlatList
          data={visibleMosques}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 + miniPlayerH },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            visibleMosques.length > 0 ? (
              <View style={styles.listHeader}>
                <Text style={[styles.listHeaderText, { color: colors.textSecondary }]}>
                  {savedOnly
                    ? `${visibleMosques.length} saved within ${radiusKm} km`
                    : `${visibleMosques.length} mosque${visibleMosques.length !== 1 ? "s" : ""} within ${radiusKm} km`}
                </Text>
                {loading && <ActivityIndicator size="small" color={colors.tint} />}
              </View>
            ) : null
          }
          renderItem={({ item, index }) => (
            <MosqueCard
              mosque={item}
              colors={colors}
              index={index}
              saved={savedIds.has(String(item.id))}
              onPress={() => setActiveMosque(item)}
              onToggleSave={() => toggleSaved(String(item.id))}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListFooterComponent={
            visibleMosques.length > 0 ? (
              <Pressable
                onPress={() => Linking.openURL("https://www.openstreetmap.org/copyright").catch(() => {})}
                accessibilityRole="link"
                style={{ paddingVertical: 18, alignItems: "center" }}
              >
                <Text style={[styles.attribText, { color: colors.textSecondary }]}>
                  Mosque data © OpenStreetMap contributors
                </Text>
              </Pressable>
            ) : null
          }
        />
      )}

      {/* Detail sheet */}
      <MosqueDetailSheet
        mosque={activeMosque}
        visible={!!activeMosque}
        onClose={() => setActiveMosque(null)}
        colors={colors}
        saved={activeMosque ? savedIds.has(String(activeMosque.id)) : false}
        onToggleSave={() => activeMosque && toggleSaved(String(activeMosque.id))}
      />
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

  /* View toggle */
  toggleRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  toggleWrap: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    alignSelf: "center",
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
  toggleBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
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
  cardAddr: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 1,
  },
  distInline: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  nearestPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
    borderWidth: 1,
    marginLeft: 4,
  },
  nearestText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  metaPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
    borderWidth: 1,
    marginLeft: 4,
  },
  metaPillText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  cardSaveBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  attribText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    opacity: 0.85,
    textDecorationLine: "underline",
  },
});

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  handleArea: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 6,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  titleAr: {
    fontSize: 14,
    fontFamily: "AmiriQuran_400Regular",
    marginTop: 2,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  distChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  distChipText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 10,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  actionGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
