import { Pressable, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { PublicRoute, PublicScreenAction, PublicScreenSection } from "../public-screens.js";

export interface PublicHomeHighlightCardProps {
  section: PublicScreenSection;
  action?: PublicScreenAction | undefined;
  onNavigate?: ((route: PublicRoute) => void) | undefined;
  variant?: "prayer" | "event" | undefined;
}

export function PublicHomeHighlightCard({
  section,
  action,
  onNavigate,
  variant = "prayer"
}: PublicHomeHighlightCardProps) {
  const isEvent = variant === "event";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={section.title}
      disabled={!action}
      onPress={() => (action ? onNavigate?.(action.targetRoute) : undefined)}
      style={[styles.root, isEvent ? styles.eventRoot : undefined]}
    >
      {isEvent ? (
        <View style={styles.eventDate}>
          <Text style={styles.eventDateMonth}>Soon</Text>
          <Text style={styles.eventDateDay}>--</Text>
        </View>
      ) : null}
      <View style={styles.content}>
        <Text style={styles.title}>{section.title}</Text>
        <Text style={[styles.body, isEvent ? styles.eventBody : undefined]}>{section.body}</Text>
        {action && !isEvent ? <Text style={styles.link}>Read Full</Text> : null}
      </View>
    </Pressable>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    gap: designTokens.space[2],
    minHeight: 132,
    padding: designTokens.space[4]
  },
  eventRoot: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    flexDirection: "row",
    gap: designTokens.space[4],
    minHeight: 96
  },
  eventDate: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.lg,
    minWidth: 70,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[3]
  },
  eventDateMonth: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  eventDateDay: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  content: {
    flex: 1,
    gap: designTokens.space[2]
  },
  title: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  body: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  eventBody: {
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.pill,
    color: colors.text.subdued,
    overflow: "hidden",
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  link: {
    color: colors.brand.goldDark,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.button,
    overflow: "hidden",
    paddingHorizontal: designTokens.space[4],
    paddingVertical: designTokens.space[3],
    textAlign: "center",
    textTransform: "uppercase"
  }
});
