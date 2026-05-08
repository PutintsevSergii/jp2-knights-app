import { designTokens } from "@jp2/shared-design-tokens";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { SignInScreen as SignInScreenModel, SignInFieldId } from "../public-screens.js";

export interface SignInScreenProps {
  screen: SignInScreenModel;
  values: Record<SignInFieldId, string>;
  onChangeField?: (field: SignInFieldId, value: string) => void;
  onSubmit?: () => void;
  onNavigate?: (route: SignInScreenModel["actions"][number]["targetRoute"]) => void;
  passwordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
}

export function SignInScreen({
  screen,
  values,
  onChangeField,
  onSubmit,
  onNavigate,
  passwordVisible = false,
  onTogglePasswordVisibility
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
          {screen.fields.map((field) => (
            <View key={field.id} style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.fieldLabel, { color: screen.theme.text }]}>
                  {field.label.toUpperCase()}
                </Text>
                {field.id === "password" ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Forgot password"
                    disabled
                  >
                    <Text style={[styles.forgotPassword, { color: screen.theme.text }]}>
                      FORGOT PASSWORD?
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              <View
                style={[
                  styles.inputShell,
                  {
                    borderColor: screen.theme.border,
                    borderRadius: screen.theme.radius
                  }
                ]}
              >
                <Text style={styles.inputIcon}>{field.id === "email" ? "@" : "#"}</Text>
                <TextInput
                  accessibilityLabel={field.label}
                  autoCapitalize="none"
                  keyboardType={field.keyboardType}
                  onChangeText={(value) => onChangeField?.(field.id, value)}
                  placeholder={field.id === "email" ? "brother@domain.com" : "Password"}
                  placeholderTextColor={designTokens.color.text.subdued}
                  secureTextEntry={field.secureTextEntry && !passwordVisible}
                  style={[styles.input, { color: screen.theme.text }]}
                  value={values[field.id]}
                />
                {field.id === "password" ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      passwordVisible ? "Hide password" : "Show password"
                    }
                    onPress={onTogglePasswordVisibility}
                    style={styles.passwordToggle}
                  >
                    <Text style={styles.inputIcon}>{passwordVisible ? "Hide" : "Show"}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}

          {screen.state === "ready" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              onPress={onSubmit}
              style={[
                styles.action,
                {
                  backgroundColor: screen.theme.primaryAction,
                  borderRadius: screen.theme.radius
                }
              ]}
            >
              <Text style={[styles.actionText, { color: screen.theme.primaryActionText }]}>
                SIGN IN -&gt;
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
  fieldGroup: {
    gap: designTokens.space[2]
  },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sectionTitle: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary,
    textAlign: "center"
  },
  fieldLabel: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.semibold,
    letterSpacing: designTokens.typography.letterSpacing.label,
    lineHeight: designTokens.typography.lineHeight.label
  },
  forgotPassword: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: designTokens.typography.letterSpacing.label,
    lineHeight: designTokens.typography.lineHeight.label,
    textDecorationLine: "underline"
  },
  inputShell: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    gap: designTokens.space[2],
    minHeight: 56,
    paddingHorizontal: designTokens.space[3]
  },
  inputIcon: {
    color: designTokens.color.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.medium
  },
  input: {
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 18,
    lineHeight: 24,
    minWidth: 0
  },
  passwordToggle: {
    padding: designTokens.space[1]
  },
  action: {
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: designTokens.space[4],
    paddingVertical: 14
  },
  actionText: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.semibold,
    letterSpacing: designTokens.typography.letterSpacing.button,
    lineHeight: designTokens.typography.lineHeight.button
  },
  supportingCopy: {
    display: "none"
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
