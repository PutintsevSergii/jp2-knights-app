import { StyleSheet, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export interface PinIconProps {
  tone?: "taupe" | "brown";
}

export function PinIcon({ tone = "taupe" }: PinIconProps) {
  const markStyle = tone === "brown" ? styles.brownMark : styles.taupeMark;

  return (
    <View accessibilityElementsHidden style={styles.root}>
      <View style={[styles.circle, markStyle]} />
      <View style={[styles.stem, markStyle]} />
    </View>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    height: 16,
    justifyContent: "center",
    width: 14
  },
  circle: {
    borderRadius: 5,
    borderWidth: 1,
    height: 10,
    width: 10
  },
  stem: {
    height: 5,
    width: 1
  },
  taupeMark: {
    backgroundColor: colors.brand.taupe,
    borderColor: colors.brand.taupe
  },
  brownMark: {
    backgroundColor: colors.brand.brown,
    borderColor: colors.brand.brown
  }
});
