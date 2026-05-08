import { Pressable, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export interface MobileBottomNavItemProps {
  label: string;
  active: boolean;
  disabled?: boolean | undefined;
  onPress?: (() => void) | undefined;
}

export function MobileBottomNavItem({
  label,
  active,
  disabled,
  onPress
}: MobileBottomNavItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.root}
    >
      <View style={[styles.icon, active ? styles.iconActive : styles.iconIdle]}>
        <View style={[styles.iconMark, active ? styles.iconMarkActive : styles.iconMarkIdle]} />
      </View>
      <Text
        style={[
          styles.label,
          active ? styles.labelActive : styles.labelIdle,
          disabled ? styles.labelDisabled : null
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    flex: 1,
    gap: 3,
    minWidth: 0
  },
  icon: {
    alignItems: "center",
    borderRadius: designTokens.radius.md,
    height: 30,
    justifyContent: "center",
    width: 52
  },
  iconActive: {
    backgroundColor: colors.brand.gold
  },
  iconIdle: {
    backgroundColor: colors.background.surface
  },
  iconMark: {
    borderRadius: 4,
    height: 12,
    width: 12
  },
  iconMarkActive: {
    backgroundColor: colors.text.primary
  },
  iconMarkIdle: {
    borderColor: colors.brand.brown,
    borderWidth: 2
  },
  label: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 10,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: 0,
    lineHeight: 12
  },
  labelActive: {
    color: colors.text.primary
  },
  labelIdle: {
    color: colors.brand.brown
  },
  labelDisabled: {
    color: colors.text.subdued
  }
});
