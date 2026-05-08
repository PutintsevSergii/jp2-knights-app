import { StyleSheet, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export function ClockIcon() {
  return (
    <View accessibilityElementsHidden style={styles.root}>
      <View style={styles.handVertical} />
      <View style={styles.handHorizontal} />
    </View>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    borderColor: colors.brand.brown,
    borderRadius: 6,
    borderWidth: 1,
    height: 12,
    width: 12
  },
  handVertical: {
    backgroundColor: colors.brand.brown,
    height: 4,
    left: 5,
    position: "absolute",
    top: 2,
    width: 1
  },
  handHorizontal: {
    backgroundColor: colors.brand.brown,
    height: 1,
    left: 5,
    position: "absolute",
    top: 6,
    width: 4
  }
});
