import { Pressable, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { PublicRoute, PublicScreenAction } from "../public-screens.js";

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
        <Text style={[styles.iconText, featured ? styles.featuredIconText : undefined]}>
          {actionIcon(action)}
        </Text>
      </View>
      <Text style={[styles.title, featured ? styles.featuredTitle : undefined]}>
        {friendlyActionLabel(action)}
      </Text>
      <Text style={[styles.body, featured ? styles.featuredBody : undefined]}>
        {friendlyActionBody(action)}
      </Text>
      <Text style={[styles.arrow, featured ? styles.featuredArrow : undefined]}>›</Text>
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

function friendlyActionBody(action: PublicScreenAction): string {
  if (action.targetRoute === "AboutOrder") return "Discover our mission and history.";
  if (action.targetRoute === "PublicPrayerCategories") return "Access spiritual resources.";
  if (action.targetRoute === "PublicSilentPrayer") return "Join a live aggregate prayer count.";
  if (action.targetRoute === "PublicEventsList") return "Calendar of gatherings.";
  if (action.targetRoute === "Login") return "Member access.";
  if (action.targetRoute === "JoinRequestForm") return "Begin your journey.";

  return "Open this public area.";
}

function actionIcon(action: PublicScreenAction): string {
  if (action.targetRoute === "AboutOrder") return "□";
  if (action.targetRoute === "PublicPrayerCategories") return "◇";
  if (action.targetRoute === "PublicSilentPrayer") return "○";
  if (action.targetRoute === "PublicEventsList") return "▣";
  if (action.targetRoute === "Login") return "↗";
  if (action.targetRoute === "JoinRequestForm") return "+";

  return "•";
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
    gap: designTokens.space[2],
    minHeight: 126,
    padding: designTokens.space[3]
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
  iconText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  featuredIconText: {
    color: colors.text.primary
  },
  title: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  featuredTitle: {
    color: colors.text.primary
  },
  body: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  featuredBody: {
    color: colors.brand.goldDeep
  },
  arrow: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle,
    position: "absolute",
    right: designTokens.space[3],
    top: designTokens.space[3]
  },
  featuredArrow: {
    color: colors.brand.goldDeep
  }
});
