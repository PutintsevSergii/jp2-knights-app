import { StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export function DemoModeBanner() {
  return (
    <View style={styles.root} accessibilityRole="text">
      <Text style={styles.text}>Demo mode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "flex-start",
    backgroundColor: designTokens.color.brand.gold,
    borderRadius: designTokens.radius.pill,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  text: {
    color: designTokens.color.text.primary,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.semibold
  }
});
