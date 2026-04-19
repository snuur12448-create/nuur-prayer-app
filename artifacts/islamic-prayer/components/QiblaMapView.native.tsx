import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import type { QiblaMapViewProps } from "./QiblaMapView";

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

/**
 * Native map view for the Qibla page.
 *
 * Shows the user, the Kaaba, and a true great-circle line between them
 * (`geodesic` polyline — the actual shortest path on the sphere, which is
 * exactly the line of Qibla). Reassures users that the compass bearing
 * isn't a guess — it's a real geographic direction.
 *
 * The initial camera frames both endpoints; users can pan/zoom freely
 * after that.
 */
export default function QiblaMapView({
  userLat,
  userLng,
  qiblaBearing,
  distanceKm,
  tintColor,
  goldColor,
  surfaceColor,
  textColor,
  textSecondaryColor,
}: QiblaMapViewProps) {
  const mapRef = useRef<MapView>(null);

  // Frame both points with comfortable padding. We use a generous span so
  // for short distances the map zooms out enough to show context.
  const region = useMemo(() => {
    const centerLat = (userLat + KAABA_LAT) / 2;
    // Longitude midpoint via shortest arc — handles antimeridian crossings.
    let dLng = KAABA_LNG - userLng;
    if (dLng > 180) dLng -= 360;
    if (dLng < -180) dLng += 360;
    const centerLng = ((userLng + dLng / 2 + 540) % 360) - 180;
    const latDelta = Math.max(Math.abs(KAABA_LAT - userLat) * 1.6, 4);
    const lngDelta = Math.max(Math.abs(dLng) * 1.6, 4);
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [userLat, userLng]);

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsCompass
        showsScale
        showsPointsOfInterest={false}
        rotateEnabled={false}
      >
        {/* True great-circle line from user → Kaaba. The `geodesic` flag
            tells the map to interpolate along the sphere rather than draw
            a straight rhumb line, so the curve matches reality. */}
        <Polyline
          coordinates={[
            { latitude: userLat, longitude: userLng },
            { latitude: KAABA_LAT, longitude: KAABA_LNG },
          ]}
          strokeColor={goldColor}
          strokeWidth={3}
          geodesic
          lineDashPattern={[6, 6]}
        />

        <Marker coordinate={{ latitude: userLat, longitude: userLng }} title="You">
          <View style={[styles.userMarker, { backgroundColor: tintColor, borderColor: surfaceColor }]} />
        </Marker>

        <Marker
          coordinate={{ latitude: KAABA_LAT, longitude: KAABA_LNG }}
          title="Kaaba"
          description="Mecca, Saudi Arabia"
        >
          <View style={[styles.kaabaMarker, { backgroundColor: goldColor, borderColor: surfaceColor }]}>
            <MaterialCommunityIcons name="cube" size={14} color="#0A1A0E" />
          </View>
        </Marker>
      </MapView>

      {/* Floating info pill bottom-left */}
      <View style={[styles.infoPill, { backgroundColor: surfaceColor + "EE", borderColor: goldColor + "55" }]}>
        <Text style={[styles.infoBearing, { color: textColor }]}>{Math.round(qiblaBearing)}° bearing</Text>
        <Text style={[styles.infoDistance, { color: textSecondaryColor }]}>
          {distanceKm.toLocaleString()} km to Kaaba
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 360,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  userMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
  },
  kaabaMarker: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  infoPill: {
    position: "absolute",
    left: 10,
    bottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoBearing: { fontSize: 12, fontFamily: "Inter_700Bold" },
  infoDistance: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 1 },
});
