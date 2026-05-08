import { StyleSheet, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export interface MegaphoneIconProps {
  emphasized?: boolean | undefined;
}

export function MegaphoneIcon({ emphasized }: MegaphoneIconProps) {
  return (
    <View style={styles.root}>
      <View style={[styles.horn, emphasized ? styles.emphasisBorder : null]} />
      <View style={[styles.handle, emphasized ? styles.emphasisFill : null]} />
      {emphasized ? <View style={styles.noticeDot} /> : null}
    </View>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    height: 18,
    width: 22
  },
  horn: {
    borderColor: colors.brand.goldDark,
    borderRadius: 2,
    borderWidth: 2,
    height: 12,
    left: 2,
    position: "absolute",
    top: 2,
    width: 14
  },
  handle: {
    backgroundColor: colors.brand.goldDark,
    height: 7,
    left: 12,
    position: "absolute",
    top: 10,
    transform: [{ rotate: "18deg" }],
    width: 3
  },
  emphasisBorder: {
    borderColor: colors.status.danger
  },
  emphasisFill: {
    backgroundColor: colors.status.danger
  },
  noticeDot: {
    backgroundColor: colors.status.danger,
    borderRadius: 3,
    height: 6,
    position: "absolute",
    right: 0,
    top: 0,
    width: 6
  }
});
