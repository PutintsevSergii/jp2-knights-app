import { StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import { MenuIcon } from "./MenuIcon.js";

export interface MobileTopBarProps {
  title: string;
  avatarText: string;
  tone?: "default" | "gold";
}

export function MobileTopBar({ title, avatarText, tone = "default" }: MobileTopBarProps) {
  return (
    <View style={styles.root}>
      <MenuIcon />
      <Text style={[styles.brand, tone === "gold" ? styles.brandGold : styles.brandDefault]}>
        {title}
      </Text>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{avatarText}</Text>
      </View>
    </View>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    backgroundColor: colors.background.app,
    borderBottomColor: colors.border.chrome,
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 56,
    justifyContent: "space-between",
    paddingHorizontal: designTokens.space[6]
  },
  brand: {
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 21,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: 28,
    marginLeft: designTokens.space[6]
  },
  brandDefault: {
    color: colors.text.primary
  },
  brandGold: {
    color: colors.brand.goldDark,
    textAlign: "center"
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.text.primary,
    borderColor: colors.border.subtle,
    borderRadius: 15,
    borderWidth: 2,
    height: 30,
    justifyContent: "center",
    width: 30
  },
  avatarText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: designTokens.typography.weight.bold
  }
});
