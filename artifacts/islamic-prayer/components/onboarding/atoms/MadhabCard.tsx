import React, { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BORDER_DIM, GOLD, SURFACE, SURFACE_ACTIVE, TEXT, TEXT_DIM } from "../_constants";
import { s } from "../_styles";

export interface MadhabCardProps {
  name: string;
  arabicName: string;
  desc: string;
  timing: string;
  selected: boolean;
  isAuto?: boolean;
  onPress: () => void;
}

function MadhabCardInner({
  name, arabicName, desc, timing, selected, isAuto, onPress,
}: MadhabCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        s.madhabCard,
        selected
          ? { borderColor: GOLD, backgroundColor: SURFACE_ACTIVE }
          : { borderColor: BORDER_DIM, backgroundColor: SURFACE },
      ]}
    >
      {selected && (
        <View style={s.madhabCheck}>
          <Feather name="check" size={10} color={GOLD} />
        </View>
      )}
      {isAuto && (
        <View style={s.madhabAutoBadge}>
          <Feather name="zap" size={8} color={GOLD} />
          <Text style={s.madhabAutoBadgeText}>Auto</Text>
        </View>
      )}
      <Text style={[s.madhabAr, { color: selected ? GOLD : TEXT_DIM, marginTop: isAuto ? 14 : 0 }]}>{arabicName}</Text>
      <Text style={[s.madhabEn, { color: selected ? TEXT : TEXT_DIM }]}>{name}</Text>
      <View style={s.madhabDivider} />
      <Text style={[s.madhabDesc, { color: selected ? TEXT_DIM : "rgba(240,237,228,0.25)" }]}>
        {desc}
      </Text>
      <Text style={[s.madhabTiming, { color: selected ? GOLD : GOLD + "50" }]}>{timing}</Text>
    </TouchableOpacity>
  );
}

export const MadhabCard = memo(MadhabCardInner);
