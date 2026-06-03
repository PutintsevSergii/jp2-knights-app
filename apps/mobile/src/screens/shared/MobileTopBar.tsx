import { StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import { MaterialSymbol } from "./MaterialSymbol.js";

export interface MobileTopBarProps {
  title: string;
  avatarText: string;
  tone?: "default" | "gold";
}

export function MobileTopBar({ title, avatarText, tone = "default" }: MobileTopBarProps) {
  return (
    <View style={styles.root}>
      <View style={styles.iconButton}>
        <MaterialSymbol name="menu" size={24} />
      </View>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    height: 64,
    justifyContent: "space-between",
    paddingHorizontal: designTokens.space[4]
  },
  iconButton: {
    alignItems: "center",
    borderRadius: designTokens.radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  brand: {
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 21,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: 28,
    marginLeft: designTokens.space[4]
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
