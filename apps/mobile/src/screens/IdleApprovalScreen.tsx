import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { IdleApprovalScreen as IdleApprovalScreenModel } from "../public-screens.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { MaterialSymbol } from "./shared/MaterialSymbol.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";

export interface IdleApprovalScreenProps {
  screen: IdleApprovalScreenModel;
  onNavigate?: (route: IdleApprovalScreenModel["actions"][number]["targetRoute"]) => void;
}

export function IdleApprovalScreen({ screen, onNavigate }: IdleApprovalScreenProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <View style={styles.root}>
        <MobileTopBar title="JP2 Knights" avatarText="ID" tone="gold" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {screen.demoChromeVisible ? <DemoModeBanner /> : null}

          <View style={styles.statusPanel}>
            <View style={styles.statusIcon}>
              <MaterialSymbol name="hourglass_empty" size={32} color={colors.text.primary} />
            </View>
            <Text style={styles.title}>{screen.title}</Text>
            <Text style={styles.body}>{screen.body}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign Out"
              style={styles.signOutButton}
            >
              <MaterialSymbol name="logout" size={18} color={colors.text.primary} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </View>

          <View style={styles.publicActionGrid}>
            {publicActions().map((action) => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={() => onNavigate?.(action.route)}
                style={styles.publicActionCard}
              >
                <View style={styles.publicActionIcon}>
                  <MaterialSymbol name={action.icon} size={24} />
                </View>
                <Text style={styles.publicActionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.lockNote}>
            <MaterialSymbol name="lock" size={16} color={colors.text.subdued} />
            <Text style={styles.lockNoteText}>
              Private candidate and brother areas stay locked until approval.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function publicActions(): Array<{
  label: string;
  route: IdleApprovalScreenModel["actions"][number]["targetRoute"];
  icon: string;
}> {
  return [
    { label: "Return Home", route: "PublicHome", icon: "home" },
    { label: "Prayer Library", route: "PublicPrayerCategories", icon: "auto_stories" },
    { label: "Public Events", route: "PublicEventsList", icon: "calendar_month" }
  ];
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  root: {
    flex: 1,
    backgroundColor: colors.background.app
  },
  content: {
    gap: designTokens.space[4],
    padding: designTokens.space[4],
    paddingBottom: 112
  },
  statusPanel: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[6]
  },
  statusIcon: {
    alignItems: "center",
    backgroundColor: colors.action.secondary,
    borderRadius: designTokens.radius.pill,
    height: 64,
    justifyContent: "center",
    width: 64
  },
  title: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle,
    textAlign: "center"
  },
  body: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body,
    textAlign: "center"
  },
  signOutButton: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: designTokens.space[2],
    paddingHorizontal: designTokens.space[6],
    paddingVertical: designTokens.space[3]
  },
  signOutText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  publicActionGrid: {
    gap: designTokens.space[3]
  },
  publicActionCard: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[6]
  },
  publicActionIcon: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.pill,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  publicActionLabel: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle,
    textAlign: "center"
  },
  lockNote: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.lg,
    flexDirection: "row",
    gap: designTokens.space[2],
    justifyContent: "center",
    padding: designTokens.space[4]
  },
  lockNoteText: {
    color: colors.text.subdued,
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontStyle: "italic",
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textAlign: "center"
  }
});
