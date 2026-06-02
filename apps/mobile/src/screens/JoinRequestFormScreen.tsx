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
  const visibleFields = screen.fields.filter((field) => field.id !== "preferredLanguage");

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <PublicScreenTopBar title="Request to Join" onBack={() => onNavigate?.("PublicHome")} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {screen.demoChromeVisible ? <DemoModeBanner /> : null}

        <View style={styles.introBand}>
          <Text style={styles.introText}>
            Membership in the JP2 Knights is a commitment to fraternity and spiritual formation.
            Please submit this request for review by a local officer.
          </Text>
        </View>

        <View style={styles.formCard}>
          {screen.errorMessage ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {screen.errorMessage}
            </Text>
          ) : null}

          {visibleFields.map((field) => (
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

          {screen.state === "ready" ? (
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
              <Text style={styles.consentText}>
                I understand this is a request for information and does not guarantee membership.
              </Text>
            </Pressable>
          ) : null}

          {screen.state === "ready" ? (
            <Pressable
              accessibilityLabel="Submit Request"
              accessibilityRole="button"
              onPress={onSubmit}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </Pressable>
          ) : null}
        </View>
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
    paddingBottom: 112
  },
  introBand: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: designTokens.space[4],
    paddingVertical: designTokens.space[3]
  },
  introText: {
    color: colors.border.chrome,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary,
    textAlign: "center"
  },
  formCard: {
    backgroundColor: colors.background.surface,
    gap: designTokens.space[1],
    margin: designTokens.space[4],
    padding: designTokens.space[3]
  },
  errorText: {
    color: colors.status.danger,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
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
