import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { JoinRequestFormDraft } from "../public-candidate-request.js";
import type {
  JoinRequestFieldId,
  JoinRequestFormField,
  JoinRequestFormScreen as JoinRequestFormScreenModel
} from "../public-screens.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { PublicScreenTopBar } from "./shared/PublicScreenTopBar.js";

export interface JoinRequestFormScreenProps {
  screen: JoinRequestFormScreenModel;
  draft: JoinRequestFormDraft;
  consentAccepted: boolean;
  onChangeField?: (field: JoinRequestFieldId, value: string) => void;
  onConsentAcceptedChange?: (accepted: boolean) => void;
  onSubmit?: () => void;
  onNavigate?: (route: JoinRequestFormScreenModel["actions"][number]["targetRoute"]) => void;
}

export function JoinRequestFormScreen({
  screen,
  draft,
  consentAccepted,
  onChangeField,
  onConsentAcceptedChange,
  onSubmit,
  onNavigate
}: JoinRequestFormScreenProps) {
  const fieldsById = new Map(screen.fields.map((field) => [field.id, field]));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <PublicScreenTopBar title="Request to Join" onBack={() => onNavigate?.("PublicHome")} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {screen.demoChromeVisible ? <DemoModeBanner /> : null}

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Candidate Request</Text>
          <Text style={styles.title}>{screen.title}</Text>
          <Text style={styles.subtitle}>{screen.body}</Text>
        </View>

        {screen.errorMessage ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {screen.errorMessage}
          </Text>
        ) : null}

        {screen.steps.map((step) => {
          const stepFields = step.fieldIds
            .map((fieldId) => fieldsById.get(fieldId))
            .filter((field): field is JoinRequestFormField => Boolean(field));

          return (
            <View key={step.id} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>{step.stepNumber}</Text>
                <View style={styles.stepTitleGroup}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                </View>
              </View>
              {stepFields.map((field) => (
                <View key={field.id} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{fieldLabel(field)}</Text>
                  <TextInput
                    accessibilityLabel={field.label}
                    autoCapitalize={field.id === "email" ? "none" : "sentences"}
                    keyboardType={field.keyboardType}
                    multiline={field.multiline}
                    onChangeText={(value) => onChangeField?.(field.id, value)}
                    style={[styles.input, field.multiline ? styles.messageInput : undefined]}
                    value={draft[field.id]}
                  />
                </View>
              ))}
            </View>
          );
        })}

        {screen.state === "ready" ? (
          <View style={styles.consentCard}>
            <Text style={styles.stepNumber}>05</Text>
            <Text style={styles.stepTitle}>Consent and submission</Text>
            <Pressable
              accessibilityLabel="Consent"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: consentAccepted }}
              onPress={() => onConsentAcceptedChange?.(!consentAccepted)}
              style={styles.consentRow}
            >
              <View style={[styles.checkbox, consentAccepted ? styles.checkboxChecked : undefined]}>
                <Text style={styles.checkboxMark}>{consentAccepted ? "✓" : ""}</Text>
              </View>
              <Text style={styles.consentText}>{screen.consent.label}</Text>
            </Pressable>
            <Text style={styles.consentFinePrint}>
              This request does not create an account or promise membership.
            </Text>
            <Pressable
              accessibilityLabel="Submit Request"
              accessibilityRole="button"
              onPress={onSubmit}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function fieldLabel(field: JoinRequestFormField): string {
  if (field.id === "firstName") return "First Name";
  if (field.id === "lastName") return "Last Name";
  if (field.id === "phone") return "Phone (Optional)";

  return field.label;
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  content: {
    gap: designTokens.space[4],
    padding: designTokens.space[4],
    paddingBottom: 112
  },
  hero: {
    alignItems: "center",
    gap: designTokens.space[2],
    paddingTop: designTokens.space[2]
  },
  eyebrow: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.screenTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.screenTitle,
    textAlign: "center"
  },
  subtitle: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body,
    textAlign: "center"
  },
  errorText: {
    color: colors.status.danger,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  stepCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[4],
    shadowColor: designTokens.elevation.subtle.color,
    shadowOffset: {
      width: designTokens.elevation.subtle.offsetX,
      height: designTokens.elevation.subtle.offsetY
    },
    shadowOpacity: designTokens.elevation.subtle.opacity,
    shadowRadius: designTokens.elevation.subtle.radius
  },
  stepHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: designTokens.space[3]
  },
  stepNumber: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  stepTitleGroup: {
    flex: 1,
    gap: designTokens.space[1]
  },
  stepTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  stepBody: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  fieldGroup: {
    gap: designTokens.space[1]
  },
  fieldLabel: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  input: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    height: 28,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: 0
  },
  messageInput: {
    height: 64,
    textAlignVertical: "top"
  },
  consentCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[4]
  },
  consentRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  checkbox: {
    alignItems: "center",
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    height: 16,
    justifyContent: "center",
    width: 16
  },
  checkboxChecked: {
    backgroundColor: colors.brand.gold
  },
  checkboxMark: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  consentText: {
    color: colors.text.muted,
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  consentFinePrint: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.brand.gold,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    paddingVertical: designTokens.space[2]
  },
  submitButtonText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.button
  }
});
