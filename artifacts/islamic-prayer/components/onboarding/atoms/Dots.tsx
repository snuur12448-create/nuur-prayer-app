import React, { memo } from "react";
import { View } from "react-native";
import { GOLD } from "../_constants";
import { s } from "../_styles";

function DotsInner({ current }: { current: number }) {
  return (
    <View style={s.dots}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            s.dot,
            i === current
              ? { backgroundColor: GOLD, width: 22 }
              : { backgroundColor: GOLD + "30", width: 8 },
          ]}
        />
      ))}
    </View>
  );
}

export const Dots = memo(DotsInner);
