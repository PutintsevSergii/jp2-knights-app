import { Pressable, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { PublicRoute, PublicScreenAction } from "../public-screens.js";
import { MaterialSymbol } from "./shared/MaterialSymbol.js";

export interface PublicHomeQuickActionCardProps {
  action: PublicScreenAction;
  featured?: boolean | undefined;
  onNavigate?: ((route: PublicRoute) => void) | undefined;
  wide?: boolean | undefined;
}

export function PublicHomeQuickActionCard({
  action,
  featured = false,
  onNavigate,
  wide = false
}: PublicHomeQuickActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={() => onNavigate?.(action.targetRoute)}
      style={[
        styles.root,
        wide ? styles.wideRoot : undefined,
        featured ? styles.featuredRoot : undefined
      ]}
    >
      <View style={styles.icon}>
        <MaterialSymbol
          name={actionIcon(action)}
          size={24}
          color={featured ? colors.text.primary : colors.brand.goldDark}
        />
      </View>
      <Text style={[styles.title, featured ? styles.featuredTitle : undefined]}>
        {friendlyActionLabel(action)}
      </Text>
    </Pressable>
  );
}

function friendlyActionLabel(action: PublicScreenAction): string {
  if (action.targetRoute === "AboutOrder") return "About the Order";
  if (action.targetRoute === "PublicPrayerCategories") return "Prayer Library";
  if (action.targetRoute === "PublicSilentPrayer") return "Silent Prayer";
  if (action.targetRoute === "PublicEventsList") return "Events";
  if (action.targetRoute === "Login") return "Sign In";

  return action.label;
}

function actionIcon(action: PublicScreenAction): string {
  if (action.targetRoute === "AboutOrder") return "info";
  if (action.targetRoute === "PublicPrayerCategories") return "menu_book";
  if (action.targetRoute === "PublicSilentPrayer") return "self_improvement";
  if (action.targetRoute === "PublicEventsList") return "event";
  if (action.targetRoute === "Login") return "login";
  if (action.targetRoute === "JoinRequestForm") return "add_circle";

  return "info";
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    alignItems: "center",
    gap: designTokens.space[3],
    justifyContent: "center",
    minHeight: 112,
    padding: designTokens.space[4]
  },
  wideRoot: {
    flexBasis: "100%"
  },
  featuredRoot: {
    backgroundColor: colors.brand.gold,
    borderColor: colors.brand.goldDark
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  title: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary,
    textAlign: "center"
  },
  featuredTitle: {
    color: colors.text.primary
  }
});
