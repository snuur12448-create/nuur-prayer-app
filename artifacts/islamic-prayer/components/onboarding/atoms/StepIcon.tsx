import React, { memo } from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GOLD } from "../_constants";
import { s } from "../_styles";

function StepIconInner({ icon, size = 52 }: { icon: string; size?: number }) {
  return (
    <View style={s.iconWrap}>
      <View style={s.iconGlow} />
      <View style={s.iconRing}>
        <MaterialCommunityIcons name={icon as any} size={size} color={GOLD} />
      </View>
    </View>
  );
}

export const StepIcon = memo(StepIconInner);
