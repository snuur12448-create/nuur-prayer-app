import React from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CALC_METHODS, type CalcMethodId } from "@/utils/prayerTimes";
import { GOLD, TEXT } from "./_constants";
import { s } from "./_styles";

export interface CalcMethodSheetProps {
  visible: boolean;
  bottomInset: number;
  selectedMethod: CalcMethodId;
  onClose: () => void;
  onSelect: (id: CalcMethodId) => void;
}

export function CalcMethodSheet({
  visible, bottomInset, selectedMethod, onClose, onSelect,
}: CalcMethodSheetProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={s.sheetBackdrop} onPress={onClose} />
      <View style={[s.sheet, { paddingBottom: bottomInset + 16 }]}>
        <View style={s.sheetHandle} />
        <View style={s.sheetHeader}>
          <View style={{ flex: 1 }}>
            <Text style={s.sheetTitle}>Calculation Method</Text>
            <Text style={s.sheetSub}>طريقة الحساب</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={s.sheetClose}>
            <Feather name="x" size={16} color={GOLD} />
          </TouchableOpacity>
        </View>
        <View style={s.sheetRule} />
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
          {CALC_METHODS.map((m, i) => {
            const active = m.id === selectedMethod;
            return (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.85}
                onPress={() => onSelect(m.id)}
                style={[
                  s.methodRow,
                  i === CALC_METHODS.length - 1 && { borderBottomWidth: 0 },
                  active && { backgroundColor: GOLD + "0E" },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.methodName, { color: active ? GOLD : TEXT }]} numberOfLines={1}>
                    {m.label}
                  </Text>
                  <Text style={s.methodRegion} numberOfLines={1}>{m.region}</Text>
                  <Text style={s.methodDetail} numberOfLines={1}>{m.detail}</Text>
                </View>
                {active ? (
                  <View style={s.methodCheck}>
                    <Feather name="check" size={12} color={GOLD} />
                  </View>
                ) : (
                  <View style={s.methodRadio} />
                )}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

