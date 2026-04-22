import React from "react";
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StepIcon } from "../atoms/StepIcon";
import { Dots } from "../atoms/Dots";
import { s } from "../_styles";

export interface LocationStepProps {
  width: number;
  topInset: number;
  bottomInset: number;
  isLocationPermDenied: boolean;
  locDone: boolean;
  locLoading: boolean;
  onAllowLocation: () => void;
  onPickCity: () => void;
  onSkip: () => void;
}

export function LocationStep({
  width, topInset, bottomInset, isLocationPermDenied, locDone, locLoading,
  onAllowLocation, onPickCity, onSkip,
}: LocationStepProps) {
  return (
    <View style={[s.slide, { width, paddingTop: topInset + 56, paddingBottom: bottomInset + 24 }]}>
      <View style={s.upper}>
        <StepIcon icon="mosque" />
        <Text style={s.nuurLogo}>نور</Text>
        <Text style={s.title}>Welcome to Nuur</Text>
        <Text style={s.subtitle}>Your complete Islamic companion</Text>
        <View style={s.divider} />
        <Text style={s.body}>
          Accurate prayer times are calculated using your location. It stays on your device and is never sent to any server.
        </Text>
      </View>

      <View style={s.lower}>
        {isLocationPermDenied && !locDone ? (
          <>
            {/* Denial recovery card — the primary button would otherwise just
                sit there doing nothing once iOS/Android has permanently
                denied. */}
            <View style={s.deniedCard}>
              <View style={s.deniedIcon}>
                <Feather name="alert-circle" size={16} color="#E8B86A" />
              </View>
              <Text style={s.deniedText}>
                Location is blocked for Nuur. Open Settings to allow it, or pick your city manually.
              </Text>
            </View>
            <TouchableOpacity
              style={s.primary}
              onPress={() => Linking.openSettings().catch(() => {})}
              activeOpacity={0.82}
            >
              <Feather name="external-link" size={16} color="#fff" />
              <Text style={s.primaryText}>Open Settings</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[s.primary, locDone && s.primaryDone]}
            onPress={onAllowLocation}
            disabled={locLoading || locDone}
            activeOpacity={0.82}
          >
            {locLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name={locDone ? "check" : "map-pin"} size={16} color="#fff" />
                <Text style={s.primaryText}>{locDone ? "Location set" : "Allow Location Access"}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={s.ghost}
          onPress={onPickCity}
          disabled={locDone}
        >
          <Text style={s.ghostLink}>Pick city manually</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.ghostSmall} onPress={onSkip}>
          <Text style={s.ghostText}>Skip for now</Text>
        </TouchableOpacity>

        <Dots current={0} />
      </View>
    </View>
  );
}
