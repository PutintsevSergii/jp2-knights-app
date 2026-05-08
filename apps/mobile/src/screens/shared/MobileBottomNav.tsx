import { StyleSheet, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import { MobileBottomNavItem } from "./MobileBottomNavItem.js";

export interface MobileBottomNavEntry {
  id: string;
  label: string;
  active: boolean;
  disabled?: boolean | undefined;
  onPress?: (() => void) | undefined;
}

export interface MobileBottomNavProps {
  items: MobileBottomNavEntry[];
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  return (
    <View style={styles.root}>
      {items.map((item) => (
        <MobileBottomNavItem
          key={item.id}
          label={item.label}
          active={item.active}
          disabled={item.disabled}
          onPress={item.onPress}
        />
      ))}
    </View>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderTopColor: colors.border.chrome,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    height: 74,
    justifyContent: "space-around",
    left: 0,
    paddingBottom: designTokens.space[2],
    paddingHorizontal: designTokens.space[2],
    position: "absolute",
    right: 0
  }
});
