import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { CandidateScreenAction } from "../candidate-screen-contracts.js";
import type { CandidateContactScreen as CandidateContactScreenModel } from "../candidate-screens.js";
import { CandidateBottomNav } from "./shared/CandidateBottomNav.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { MaterialSymbol } from "./shared/MaterialSymbol.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";

export interface CandidateContactScreenProps {
  screen: CandidateContactScreenModel;
  onAction?: (action: CandidateScreenAction) => void;
  onOpenUrl?: (url: string) => void;
}

export function CandidateContactScreen({
  screen,
  onAction,
  onOpenUrl = (url) => {
    void Linking.openURL(url);
  }
}: CandidateContactScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <MobileTopBar title="JP2 Knights" avatarText="C" tone="gold" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {screen.demoChromeVisible ? <DemoModeBanner /> : null}

          {screen.state === "ready" && screen.officer ? (
            <>
              <View style={styles.hero}>
                <View style={styles.iconCircle}>
                  <MaterialSymbol name="contacts" size={28} fill />
                </View>
                <View style={styles.heroCopy}>
                  <Text style={styles.eyebrow}>Responsible Officer</Text>
                  <Text style={styles.title}>{screen.officer.displayName}</Text>
                  <Text style={styles.subtitle}>Read-only candidate support contact.</Text>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <MaterialSymbol name="mail" size={20} color={colors.brand.brown} />
                  <View style={styles.infoCopy}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{screen.officer.email}</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <MaterialSymbol name="contacts" size={20} color={colors.brand.brown} />
                  <View style={styles.infoCopy}>
                    <Text style={styles.label}>Phone</Text>
                    <Text style={styles.value}>{screen.officer.phoneLabel}</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <MaterialSymbol name="map" size={20} color={colors.brand.brown} />
                  <View style={styles.infoCopy}>
                    <Text style={styles.label}>Assignment</Text>
                    <Text style={styles.value}>{screen.officer.assignmentLabel}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionStack}>
                {screen.contactActions.map((action) => (
                  <Pressable
                    key={action.id}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    onPress={() => onOpenUrl(action.url)}
                    style={action.id === "email" ? styles.primaryButton : styles.secondaryButton}
                  >
                    <MaterialSymbol
                      name={action.id === "email" ? "mail" : "contacts"}
                      size={20}
                      color={action.id === "email" ? colors.action.primaryText : colors.brand.goldDark}
                    />
                    <Text
                      style={
                        action.id === "email" ? styles.primaryButtonText : styles.secondaryButtonText
                      }
                    >
                      {action.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to dashboard"
                onPress={() =>
                  onAction?.({
                    id: "dashboard",
                    label: "Dashboard",
                    targetRoute: "CandidateDashboard"
                  })
                }
                style={styles.backCard}
              >
                <Text style={styles.backText}>Back to Candidate Home</Text>
                <Text style={styles.inlineAction}>Open ›</Text>
              </Pressable>
            </>
          ) : (
            <ScreenStatePanel title={screen.title} body={screen.body} />
          )}
        </ScrollView>

        <CandidateBottomNav active="account" onAction={onAction} />
      </View>
    </SafeAreaView>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.app
  },
  root: {
    flex: 1,
    backgroundColor: colors.background.app
  },
  content: {
    gap: designTokens.space[6],
    paddingBottom: 112,
    paddingHorizontal: designTokens.space[8],
    paddingTop: designTokens.space[8]
  },
  hero: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: designTokens.space[4],
    padding: designTokens.space[6]
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderColor: colors.brand.gold,
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56
  },
  heroCopy: {
    flex: 1,
    gap: designTokens.space[1]
  },
  eyebrow: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.screenTitle,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: 0,
    lineHeight: designTokens.typography.lineHeight.screenTitle
  },
  subtitle: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  card: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[4],
    padding: designTokens.space[6]
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[3]
  },
  infoCopy: {
    flex: 1,
    gap: designTokens.space[1]
  },
  label: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  value: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.body
  },
  actionStack: {
    gap: designTokens.space[3]
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.action.primary,
    borderRadius: designTokens.radius.md,
    flexDirection: "row",
    gap: designTokens.space[2],
    justifyContent: "center",
    paddingHorizontal: designTokens.space[4],
    paddingVertical: designTokens.space[3]
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.brand.gold,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: designTokens.space[2],
    justifyContent: "center",
    paddingHorizontal: designTokens.space[4],
    paddingVertical: designTokens.space[3]
  },
  primaryButtonText: {
    color: colors.action.primaryText,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.button
  },
  secondaryButtonText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.button
  },
  backCard: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: designTokens.space[4]
  },
  backText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.body
  },
  inlineAction: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary
  }
});
