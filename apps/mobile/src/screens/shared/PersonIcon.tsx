import { StyleSheet, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export interface PersonIconProps {
  emphasized?: boolean | undefined;
}

export function PersonIcon({ emphasized }: PersonIconProps) {
  return (
    <View style={styles.root}>
      <View style={[styles.head, emphasized ? styles.emphasis : null]} />
      <View style={[styles.body, emphasized ? styles.emphasis : null]} />
    </View>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    gap: 1
  },
  head: {
    backgroundColor: colors.brand.goldDark,
    borderRadius: 4,
    height: 8,
    width: 8
  },
  body: {
    backgroundColor: colors.brand.goldDark,
    borderRadius: 4,
    height: 6,
    width: 14
  },
  emphasis: {
    backgroundColor: colors.status.danger
  }
});
