import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface MosqueMapViewProps {
  mosques: any[];
  userLat: number;
  userLon: number;
  colors: any;
  bottomPad: number;
}

export default function MosqueMapView({ colors }: MosqueMapViewProps) {
  return (
    <View style={styles.wrap}>
      <Feather name="map" size={44} color={colors.textSecondary} />
      <Text style={[styles.title, { color: colors.text }]}>
        Map view isn't available on web
      </Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Open the app on your phone to see the map
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 36,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
  },
});
