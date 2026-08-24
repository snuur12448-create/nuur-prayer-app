import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActionSheetIOS,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";

interface Mosque {
  id: number;
  name: string;
  nameAr: string;
  lat: number;
  lon: number;
  distance: number;
  address: string;
}

function fmtDist(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

function openGoogleMaps(lat: number, lon: number) {
  const dest = `${lat},${lon}`;
  // Try the Google Maps app first; fall back to the website.
  Linking.openURL(
    `comgooglemaps://?daddr=${dest}&directionsmode=driving`
  ).catch(() =>
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${dest}`
    )
  );
}

function openAppleMaps(lat: number, lon: number) {
  const dest = `${lat},${lon}`;
  Linking.openURL(`maps://?daddr=${dest}&dirflg=d`).catch(() =>
    Linking.openURL(`https://maps.apple.com/?daddr=${dest}`)
  );
}

function showDirectionsSheet(lat: number, lon: number, name: string) {
  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: "Get Directions",
        message: name,
        options: ["Google Maps", "Apple Maps", "Cancel"],
        cancelButtonIndex: 2,
      },
      (index) => {
        if (index === 0) openGoogleMaps(lat, lon);
        else if (index === 1) openAppleMaps(lat, lon);
      }
    );
  } else {
    // Android — use Alert as an action-sheet substitute.
    Alert.alert("Get Directions", name, [
      { text: "Google Maps", onPress: () => openGoogleMaps(lat, lon) },
      { text: "Apple Maps", onPress: () => openAppleMaps(lat, lon) },
      { text: "Cancel", style: "cancel" },
    ]);
  }
}

export interface MosqueMapViewProps {
  mosques: Mosque[];
  userLat: number;
  userLon: number;
  colors: any;
  bottomPad: number;
}

export default function MosqueMapView({
  mosques,
  userLat,
  userLon,
  colors,
  bottomPad,
}: MosqueMapViewProps) {
  const GOLD = (colors.gold ?? "#C9933A") as string;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: userLat,
          longitude: userLon,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {mosques.map((mosque) => (
          <Marker
            key={mosque.id}
            coordinate={{ latitude: mosque.lat, longitude: mosque.lon }}
            tracksViewChanges={false}
            onCalloutPress={() =>
              showDirectionsSheet(mosque.lat, mosque.lon, mosque.name)
            }
          >
            {/* Custom gold pin */}
            <View style={styles.pinOuter}>
              <View style={[styles.pinCircle, { backgroundColor: GOLD }]}>
                <MaterialCommunityIcons name="mosque" size={18} color="#20160A" />
              </View>
              <View style={[styles.pinTail, { borderTopColor: GOLD }]} />
            </View>

            <Callout
              tooltip
              onPress={() =>
                showDirectionsSheet(mosque.lat, mosque.lon, mosque.name)
              }
            >
              <View style={styles.callout}>
                <Text style={styles.calloutName} numberOfLines={2}>
                  {mosque.name}
                </Text>
                {mosque.nameAr ? (
                  <Text
                    style={[styles.calloutArabic, { color: GOLD }]}
                    numberOfLines={1}
                  >
                    {mosque.nameAr}
                  </Text>
                ) : null}
                {mosque.address ? (
                  <Text style={styles.calloutAddr} numberOfLines={3}>
                    {mosque.address}
                  </Text>
                ) : null}
                <View style={styles.calloutDistRow}>
                  <Feather name="map-pin" size={10} color="#777" />
                  <Text style={styles.calloutDist}>
                    {fmtDist(mosque.distance)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.calloutDirBtn, { backgroundColor: GOLD }]}
                  activeOpacity={0.8}
                  onPress={() =>
                    showDirectionsSheet(mosque.lat, mosque.lon, mosque.name)
                  }
                >
                  <Feather name="navigation" size={12} color="#20160A" />
                  <Text style={styles.calloutDirText}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {mosques.length === 0 && (
        <View style={styles.mapEmpty} pointerEvents="none">
          <View style={styles.mapEmptyCard}>
            <MaterialCommunityIcons name="mosque" size={28} color={GOLD} />
            <Text style={styles.mapEmptyText}>No mosques found nearby</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pinOuter: {
    alignItems: "center",
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -1,
  },
  callout: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  calloutName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    lineHeight: 19,
  },
  calloutArabic: {
    fontSize: 13,
    fontWeight: "500",
  },
  calloutAddr: {
    fontSize: 12,
    color: "#555",
    lineHeight: 17,
  },
  calloutDistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  calloutDist: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },
  calloutDirBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  calloutDirText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#20160A",
  },
  mapEmpty: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 80,
  },
  mapEmptyCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  mapEmptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
});
