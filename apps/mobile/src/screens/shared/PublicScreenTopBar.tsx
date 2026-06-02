import { Pressable, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export interface PublicScreenTopBarProps {
  title: string;
  onBack?: (() => void) | undefined;
}

export function PublicScreenTopBar({ title, onBack }: PublicScreenTopBarProps) {
  return (
    <View style={styles.root}>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={onBack}
        style={styles.backButton}
      >
        <Text style={styles.backText}>‹</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.endSpacer} />
    </View>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderBottomColor: colors.border.chrome,
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 56,
    justifyContent: "space-between",
    paddingHorizontal: designTokens.space[4]
  },
  backButton: {
    alignItems: "center",
    borderRadius: designTokens.radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  backText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  title: {
    color: colors.brand.goldDark,
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.body,
    textAlign: "center"
  },
  endSpacer: {
    width: 40
  }
});
