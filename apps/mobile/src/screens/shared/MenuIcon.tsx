import { StyleSheet, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export function MenuIcon() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.root}
    >
      <View style={styles.line} />
      <View style={styles.line} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 3,
    width: 18
  },
  line: {
    backgroundColor: designTokens.color.text.primary,
    height: 2,
    width: 16
  }
});
