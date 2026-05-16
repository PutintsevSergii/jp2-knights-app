import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import { StatusDot } from "./StatusDot.js";

export type EventStatusTone = "planning" | "needed" | "cancelled";

export interface EventStatusBadgeProps {
  label: string;
  tone: EventStatusTone;
  style?: StyleProp<ViewStyle> | undefined;
}

export function EventStatusBadge({ label, tone, style }: EventStatusBadgeProps) {
  return (
    <View style={[styles.root, badgeToneStyle[tone], style]}>
      <StatusDot tone={tone} />
      <Text style={[styles.text, textToneStyle[tone]]}>{label}</Text>
    </View>
  );
}

const colors = designTokens.color;

const badgeToneStyle = StyleSheet.create({
  planning: {
    backgroundColor: colors.brand.gold
  },
  needed: {
    backgroundColor: colors.brand.linen
  },
  cancelled: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderWidth: 1
  }
});

const textToneStyle = StyleSheet.create({
  planning: {
    color: colors.brand.goldDeep
  },
  needed: {
    color: colors.brand.brown
  },
  cancelled: {
    color: colors.brand.taupe
  }
});

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: designTokens.radius.sm,
    flexDirection: "row",
    gap: designTokens.space[1],
    minHeight: 28,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  text: {
    flexShrink: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 10,
    fontWeight: designTokens.typography.weight.medium,
    letterSpacing: 0,
    lineHeight: 11,
    textTransform: "uppercase"
  }
});
