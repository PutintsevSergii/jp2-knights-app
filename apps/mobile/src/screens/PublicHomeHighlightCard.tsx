import { Pressable, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { PublicRoute, PublicScreenAction, PublicScreenSection } from "../public-screens.js";
import { MaterialSymbol } from "./shared/MaterialSymbol.js";

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
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <MaterialSymbol name={isEvent ? "event" : "wb_sunny"} size={22} />
          <Text style={styles.title}>{section.title}</Text>
          {isEvent ? (
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>Family Open</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.body, isEvent ? styles.eventBody : undefined]}>{section.body}</Text>
        {isEvent ? (
          <View style={styles.metaRow}>
            <MaterialSymbol name="info" size={18} color={colors.text.subdued} />
            <Text style={styles.metaText}>Guests may attend</Text>
          </View>
        ) : null}
        {action ? <Text style={styles.link}>{isEvent ? "View Details" : "Read Prayer"}</Text> : null}
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
    backgroundColor: colors.background.surface,
    minHeight: 148
  },
  content: {
    flex: 1,
    gap: designTokens.space[2]
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[2]
  },
  title: {
    color: colors.text.primary,
    flexShrink: 1,
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
    color: colors.text.subdued
  },
  eventBadge: {
    backgroundColor: colors.action.secondary,
    borderRadius: designTokens.radius.pill,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  eventBadgeText: {
    color: colors.text.inverse,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 10,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: 12
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  metaText: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
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
