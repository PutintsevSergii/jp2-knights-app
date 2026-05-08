import { StyleSheet, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export interface StatusDotProps {
  tone: "planning" | "needed" | "cancelled";
}

export function StatusDot({ tone }: StatusDotProps) {
  return <View style={[styles.root, toneStyle[tone]]} />;
}

const toneStyle = StyleSheet.create({
  planning: {
    backgroundColor: designTokens.color.brand.goldDark
  },
  needed: {
    backgroundColor: designTokens.color.brand.taupe
  },
  cancelled: {
    backgroundColor: designTokens.color.status.danger
  }
});

const styles = StyleSheet.create({
  root: {
    borderRadius: 4,
    height: 7,
    width: 7
  }
});
