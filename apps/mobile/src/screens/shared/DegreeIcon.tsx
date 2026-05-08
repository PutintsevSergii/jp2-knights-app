import { StyleSheet, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export function DegreeIcon() {
  return <View accessibilityElementsHidden style={styles.root} />;
}

const styles = StyleSheet.create({
  root: {
    borderColor: designTokens.color.brand.taupe,
    borderRadius: 5,
    borderWidth: 1,
    height: 9,
    width: 9
  }
});
