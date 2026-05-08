import { StyleSheet, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export interface CalendarIconProps {
  emphasized?: boolean | undefined;
  size?: "compact" | "regular";
}

export function CalendarIcon({ emphasized, size = "compact" }: CalendarIconProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        size === "regular" ? styles.regularRoot : styles.compactRoot,
        emphasized ? styles.emphasizedBorder : null
      ]}
    >
      <View
        style={[
          size === "regular" ? styles.regularTop : styles.compactTop,
          emphasized ? styles.emphasizedFill : null
        ]}
      />
      <View style={styles.body} />
    </View>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  compactRoot: {
    borderColor: colors.brand.taupe,
    borderRadius: 2,
    borderWidth: 1,
    height: 14,
    overflow: "hidden",
    width: 14
  },
  regularRoot: {
    borderColor: colors.brand.goldDark,
    borderRadius: 2,
    borderWidth: 1,
    height: 16,
    overflow: "hidden",
    width: 16
  },
  compactTop: {
    backgroundColor: colors.brand.taupe,
    height: 3
  },
  regularTop: {
    backgroundColor: colors.brand.goldDark,
    height: 4
  },
  body: {
    flex: 1
  },
  emphasizedBorder: {
    borderColor: colors.status.danger
  },
  emphasizedFill: {
    backgroundColor: colors.status.danger
  }
});
