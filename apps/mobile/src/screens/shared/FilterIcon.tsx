import { StyleSheet, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export function FilterIcon() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.root}
    >
      <View style={styles.lineWide} />
      <View style={styles.lineNarrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 3,
    width: 12
  },
  lineWide: {
    backgroundColor: designTokens.color.text.primary,
    height: 1,
    width: 12
  },
  lineNarrow: {
    alignSelf: "center",
    backgroundColor: designTokens.color.text.primary,
    height: 1,
    width: 6
  }
});
