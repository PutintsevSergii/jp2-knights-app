import { designTokens } from "@jp2/shared-design-tokens";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { SignInScreen as SignInScreenModel } from "../public-screens.js";

export interface SignInScreenProps {
  screen: SignInScreenModel;
  onSubmit?: () => void;
  onNavigate?: (route: SignInScreenModel["actions"][number]["targetRoute"]) => void;
}

export function SignInScreen({
  screen,
  onSubmit,
  onNavigate
}: SignInScreenProps) {
  const createAccountAction = screen.actions.find((action) => action.id === "create-account");
  const homeAction = screen.actions.find((action) => action.id === "home");

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {screen.demoChromeVisible ? (
          <View
            style={[
              styles.demoBanner,
              {
                backgroundColor: screen.theme.primaryAction,
                borderRadius: screen.theme.radius,
                paddingHorizontal: screen.theme.spacing,
                paddingVertical: screen.theme.spacing / 2
              }
            ]}
            accessibilityRole="text"
          >
            <Text style={{ color: screen.theme.primaryActionText }}>Demo mode</Text>
          </View>
        ) : null}

        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoCross}>JP2</Text>
          </View>
          <Text style={[styles.title, { color: screen.theme.text }]}>{screen.title}</Text>
          <Text style={[styles.body, { color: screen.theme.mutedText }]}>{screen.body}</Text>
        </View>

        <View style={styles.formCard}>
          {screen.providerAction ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={screen.providerAction.accessibilityLabel}
              onPress={onSubmit}
              style={[
                styles.action,
                {
                  backgroundColor: screen.theme.primaryAction,
                  borderRadius: screen.theme.radius
                }
              ]}
            >
              <View style={styles.providerMark}>
                <Text style={styles.providerMarkText}>G</Text>
              </View>
              <Text style={[styles.actionText, { color: screen.theme.primaryActionText }]}>
                {screen.providerAction.label}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {screen.sections.map((section) => (
          <View key={section.id} style={styles.supportingCopy}>
            <Text style={[styles.sectionTitle, { color: screen.theme.text }]}>{section.title}</Text>
            <Text style={[styles.body, { color: screen.theme.mutedText }]}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          {createAccountAction ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={createAccountAction.label}
              onPress={() => onNavigate?.(createAccountAction.targetRoute)}
              style={styles.footerAction}
            >
              <Text style={[styles.footerText, { color: screen.theme.mutedText }]}>
                Don't have an account?{" "}
                <Text style={[styles.footerLink, { color: screen.theme.text }]}>
                  {createAccountAction.label}
                </Text>
              </Text>
            </Pressable>
          ) : null}
          {homeAction ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={homeAction.label}
              onPress={() => onNavigate?.(homeAction.targetRoute)}
              style={styles.footerAction}
            >
              <Text style={[styles.footerLink, { color: screen.theme.text }]}>
                {homeAction.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  content: {
    alignItems: "center",
    gap: 48,
    paddingHorizontal: 32,
    paddingVertical: 80
  },
  demoBanner: {
    alignSelf: "flex-start"
  },
  header: {
    alignItems: "center",
    gap: designTokens.space[4],
    width: "100%"
  },
  logo: {
    alignItems: "center",
    backgroundColor: designTokens.color.brand.ink,
    borderRadius: designTokens.radius.lg,
    height: 80,
    justifyContent: "center",
    shadowColor: designTokens.elevation.subtle.color,
    shadowOffset: {
      width: designTokens.elevation.subtle.offsetX,
      height: designTokens.elevation.subtle.offsetY
    },
    shadowOpacity: designTokens.elevation.subtle.opacity,
    shadowRadius: designTokens.elevation.subtle.radius,
    width: 80
  },
  logoCross: {
    color: designTokens.color.brand.gold,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  title: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.display,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: 0,
    lineHeight: designTokens.typography.lineHeight.display,
    textAlign: "center"
  },
  body: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.regular,
    lineHeight: designTokens.typography.lineHeight.body,
    textAlign: "center"
  },
  formCard: {
    backgroundColor: designTokens.color.background.surface,
    borderColor: designTokens.color.border.subtle,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    gap: 24,
    padding: 48,
    shadowColor: designTokens.elevation.subtle.color,
    shadowOffset: {
      width: designTokens.elevation.subtle.offsetX,
      height: designTokens.elevation.subtle.offsetY
    },
    shadowOpacity: designTokens.elevation.subtle.opacity,
    shadowRadius: designTokens.elevation.subtle.radius,
    width: "100%"
  },
  providerMark: {
    alignItems: "center",
    backgroundColor: designTokens.color.background.app,
    borderRadius: designTokens.radius.md,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  providerMarkText: {
    color: designTokens.color.brand.ink,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.body
  },
  action: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2],
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: designTokens.space[4],
    paddingVertical: 14
  },
  actionText: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.semibold,
    letterSpacing: 0,
    lineHeight: designTokens.typography.lineHeight.button
  },
  supportingCopy: {
    display: "none"
  },
  sectionTitle: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary,
    textAlign: "center"
  },
  footer: {
    alignItems: "center",
    gap: designTokens.space[2]
  },
  footerAction: {
    padding: designTokens.space[1]
  },
  footerText: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body,
    textAlign: "center"
  },
  footerLink: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body,
    textDecorationLine: "underline"
  }
});
