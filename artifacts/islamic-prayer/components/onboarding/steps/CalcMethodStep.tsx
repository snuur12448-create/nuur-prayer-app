import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import type { CalcMethodId, MadhabId } from "@/utils/prayerTimes";
import { CALC_METHODS } from "@/utils/prayerTimes";
import { GOLD } from "../_constants";
import { s } from "../_styles";
import { StepIcon } from "../atoms/StepIcon";
import { Dots } from "../atoms/Dots";
import { MadhabCard } from "../atoms/MadhabCard";

export interface CalcMethodStepProps {
  width: number;
  topInset: number;
  bottomInset: number;
  selectedMethod: CalcMethodId;
  calcMethod: CalcMethodId;
  calcMethodAutoSetLabel: string | null;
  selectedMadhab: MadhabId;
  madhab: MadhabId;
  madhabAutoSetLabel: string | null;
  locationCity?: string;
  finishing: boolean;
  onOpenMethodSheet: () => void;
  onSelectMadhab: (m: MadhabId) => void;
  onDone: () => void;
}

export function CalcMethodStep({
  width, topInset, bottomInset, selectedMethod, calcMethod, calcMethodAutoSetLabel,
  selectedMadhab, madhab, madhabAutoSetLabel, locationCity, finishing,
  onOpenMethodSheet, onSelectMadhab, onDone,
}: CalcMethodStepProps) {
  const currentMethodInfo = CALC_METHODS.find((m) => m.id === selectedMethod);

  return (
    <View style={[s.slide, { width, paddingTop: topInset + 56, paddingBottom: bottomInset + 24 }]}>
      <View style={s.upper}>
        <StepIcon icon="star-crescent" size={48} />
        <Text style={s.title}>Prayer Calculation</Text>
        <Text style={s.subtitle}>Tune Nuur to your region</Text>
        <View style={s.divider} />

        {/* ── Calculation method picker ── */}
        <Text style={s.sectionLabel}>Calculation Method</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpenMethodSheet}
          style={s.methodPickerRow}
        >
          <View style={{ flex: 1 }}>
            <View style={s.methodPickerLabelRow}>
              <Text style={s.methodPickerName} numberOfLines={1}>
                {currentMethodInfo?.label ?? selectedMethod}
              </Text>
              {calcMethodAutoSetLabel && selectedMethod === calcMethod && (
                <View style={s.autoBadge}>
                  <Feather name="zap" size={9} color={GOLD} />
                  <Text style={s.autoBadgeText}>Auto</Text>
                </View>
              )}
            </View>
            <Text style={s.methodPickerRegion} numberOfLines={1}>
              {currentMethodInfo?.region ?? ""}
            </Text>
          </View>
          <Feather name="chevron-down" size={18} color={GOLD} />
        </TouchableOpacity>

        {/* ── Madhab section ── */}
        <Text style={[s.sectionLabel, { marginTop: 18 }]}>Asr Madhab</Text>
        {madhabAutoSetLabel && selectedMadhab === madhab && locationCity && (
          <View style={s.madhabDetectedPill}>
            <Feather name="map-pin" size={10} color={GOLD} />
            <Text style={s.madhabDetectedText}>
              Detected:{" "}
              <Text style={s.madhabDetectedCity}>{locationCity}</Text>
            </Text>
          </View>
        )}
        <View style={s.madhabRow}>
          <MadhabCard
            name="Hanafi"
            arabicName="حنفي"
            desc="Shadow = 2× height"
            timing="Later Asr"
            selected={selectedMadhab === "Hanafi"}
            isAuto={!!madhabAutoSetLabel && madhab === "Hanafi" && selectedMadhab === "Hanafi"}
            onPress={() => onSelectMadhab("Hanafi")}
          />
          <MadhabCard
            name="Shafi'i"
            arabicName="شافعي"
            desc="Shadow = 1× height"
            timing="Earlier Asr"
            selected={selectedMadhab === "Shafi"}
            isAuto={!!madhabAutoSetLabel && madhab === "Shafi" && selectedMadhab === "Shafi"}
            onPress={() => onSelectMadhab("Shafi")}
          />
        </View>
        {madhabAutoSetLabel && (
          <Text style={s.madhabHint}>
            Not sure? Keep the suggestion — you can change it any time in Settings.
          </Text>
        )}
      </View>

      <View style={s.lower}>
        <TouchableOpacity
          style={[s.primary, finishing && s.primaryDone]}
          onPress={onDone}
          disabled={finishing}
          activeOpacity={0.82}
        >
          {finishing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
              <Text style={s.primaryText}>Get Started</Text>
            </>
          )}
        </TouchableOpacity>

        <Dots current={2} />
      </View>
    </View>
  );
}
