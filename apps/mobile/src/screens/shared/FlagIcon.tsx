import { StyleSheet, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export function FlagIcon() {
  return (
    <View accessibilityElementsHidden style={styles.root}>
      <View style={styles.banner} />
      <View style={styles.pole} />
    </View>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    height: 10,
    width: 10
  },
  banner: {
    borderColor: colors.brand.taupe,
    borderRadius: 1,
    borderWidth: 1,
    height: 6,
    marginLeft: 2,
    width: 7
  },
  pole: {
    backgroundColor: colors.brand.taupe,
    height: 9,
    left: 1,
    position: "absolute",
    top: 1,
    width: 1
  }
});
