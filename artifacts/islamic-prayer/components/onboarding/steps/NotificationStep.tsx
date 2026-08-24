import React from "react";
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StepIcon } from "../atoms/StepIcon";
import { Dots } from "../atoms/Dots";
import { ON_GOLD } from "../_constants";
import { s } from "../_styles";

export interface NotificationStepProps {
  width: number;
  topInset: number;
  bottomInset: number;
  notifPermBlocked: boolean;
  notifDone: boolean;
  notifLoading: boolean;
  onEnableNotif: () => void;
  onSkip: () => void;
}

export function NotificationStep({
  width, topInset, bottomInset, notifPermBlocked, notifDone, notifLoading,
  onEnableNotif, onSkip,
}: NotificationStepProps) {
  return (
    <View style={[s.slide, { width, paddingTop: topInset + 56, paddingBottom: bottomInset + 24 }]}>
      <View style={s.upper}>
        <StepIcon icon="bell-ring-outline" />
        <Text style={s.title}>Never Miss a Prayer</Text>
        <Text style={s.subtitle}>Stay connected to your prayers every day</Text>
        <View style={s.divider} />
        <Text style={s.body}>
          Get notified at each prayer time, receive a Jummah reminder every Friday, and celebrate your prayer streak milestones.
        </Text>
      </View>

      <View style={s.lower}>
        {notifPermBlocked && !notifDone ? (
          <>
            <View style={s.deniedCard}>
              <View style={s.deniedIcon}>
                <Feather name="bell-off" size={16} color="#E8B86A" />
              </View>
              <Text style={s.deniedText}>
                Notifications are blocked for Nuur. Open Settings to enable prayer alerts.
              </Text>
            </View>
            <TouchableOpacity
              style={s.primary}
              onPress={() => Linking.openSettings().catch(() => {})}
              activeOpacity={0.82}
            >
              <Feather name="external-link" size={16} color={ON_GOLD} />
              <Text style={s.primaryText}>Open Settings</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[s.primary, notifDone && s.primaryDone]}
            onPress={onEnableNotif}
            disabled={notifLoading || notifDone}
            activeOpacity={0.82}
          >
            {notifLoading ? (
              <ActivityIndicator color={notifDone ? "#fff" : ON_GOLD} size="small" />
            ) : (
              <>
                <Feather name={notifDone ? "check" : "bell"} size={16} color={notifDone ? "#fff" : ON_GOLD} />
                <Text style={[s.primaryText, notifDone && s.primaryDoneText]}>
                  {notifDone ? "Notifications enabled" : "Enable Notifications"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.ghost} onPress={onSkip}>
          <Text style={s.ghostText}>{notifPermBlocked ? "Continue without alerts" : "Maybe later"}</Text>
        </TouchableOpacity>

        <Dots current={1} />
      </View>
    </View>
  );
}
