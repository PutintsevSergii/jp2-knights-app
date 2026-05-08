import { StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export interface ScreenStatePanelProps {
  title: string;
  body: string;
  heading?: string | undefined;
}

export function ScreenStatePanel({ title, body, heading }: ScreenStatePanelProps) {
  return (
    <View style={styles.root}>
      {heading ? <Text style={styles.heading}>{heading}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[2],
    padding: designTokens.space[6]
  },
  heading: {
    color: colors.brand.goldDark,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.label,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text.primary,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  body: {
    color: colors.text.muted,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  }
});
