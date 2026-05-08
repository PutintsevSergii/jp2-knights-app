import { StyleSheet, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export interface GroupIconProps {
  emphasized?: boolean | undefined;
}

export function GroupIcon({ emphasized }: GroupIconProps) {
  const emphasis = emphasized ? styles.emphasis : null;

  return (
    <View style={styles.root}>
      <View style={[styles.headCenter, emphasis]} />
      <View style={[styles.headLeft, emphasis]} />
      <View style={[styles.headRight, emphasis]} />
      <View style={[styles.body, emphasis]} />
    </View>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    height: 18,
    width: 22
  },
  headCenter: {
    backgroundColor: colors.brand.goldDark,
    borderRadius: 4,
    height: 8,
    left: 7,
    position: "absolute",
    top: 0,
    width: 8
  },
  headLeft: {
    backgroundColor: colors.brand.goldDark,
    borderRadius: 3,
    height: 6,
    left: 1,
    position: "absolute",
    top: 3,
    width: 6
  },
  headRight: {
    backgroundColor: colors.brand.goldDark,
    borderRadius: 3,
    height: 6,
    position: "absolute",
    right: 1,
    top: 3,
    width: 6
  },
  body: {
    backgroundColor: colors.brand.goldDark,
    borderRadius: 6,
    bottom: 1,
    height: 8,
    left: 2,
    position: "absolute",
    width: 18
  },
  emphasis: {
    backgroundColor: colors.status.danger
  }
});
