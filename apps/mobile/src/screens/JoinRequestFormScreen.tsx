import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { JoinRequestFormDraft } from "../public-candidate-request.js";
import type {
  JoinRequestFieldId,
  JoinRequestFormScreen as JoinRequestFormScreenModel
} from "../public-screens.js";

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
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <ScrollView
        contentContainerStyle={{
          gap: screen.theme.spacing,
          padding: screen.theme.spacing,
          paddingTop: screen.theme.spacing * 2
        }}
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

        <View
          style={[
            {
              borderColor: screen.theme.border,
              borderWidth: 1,
              backgroundColor: screen.theme.surface,
              borderRadius: screen.theme.radius,
              gap: screen.theme.spacing / 2,
              padding: screen.theme.spacing
            }
          ]}
        >
          <Text style={[styles.title, { color: screen.theme.text }]}>{screen.title}</Text>
          <Text style={{ color: screen.theme.mutedText }}>{screen.body}</Text>
          {screen.errorMessage ? (
            <Text accessibilityRole="alert" style={{ color: screen.theme.text }}>
              {screen.errorMessage}
            </Text>
          ) : null}
        </View>

        {screen.fields.map((field) => (
          <View
            key={field.id}
            style={[
              {
                borderColor: screen.theme.border,
                borderWidth: 1,
                backgroundColor: screen.theme.surface,
                borderRadius: screen.theme.radius,
                gap: screen.theme.spacing / 2,
                padding: screen.theme.spacing
              }
            ]}
          >
            <Text style={[styles.fieldLabel, { color: screen.theme.text }]}>
              {field.required ? `${field.label} *` : field.label}
            </Text>
            <TextInput
              accessibilityLabel={field.label}
              autoCapitalize={field.id === "email" ? "none" : "sentences"}
              keyboardType={field.keyboardType}
              multiline={field.multiline}
              onChangeText={(value) => onChangeField?.(field.id, value)}
              style={[
                styles.input,
                {
                  borderColor: screen.theme.border,
                  borderRadius: screen.theme.radius,
                  color: screen.theme.text,
                  minHeight: field.multiline ? screen.theme.spacing * 6 : screen.theme.spacing * 3,
                  padding: screen.theme.spacing / 2
                }
              ]}
              value={draft[field.id]}
            />
          </View>
        ))}

        {screen.state === "ready" ? (
          <View
            style={[
              {
                borderColor: screen.theme.border,
                borderWidth: 1,
                backgroundColor: screen.theme.surface,
                borderRadius: screen.theme.radius,
                gap: screen.theme.spacing / 2,
                padding: screen.theme.spacing
              }
            ]}
          >
            <View style={styles.consentRow}>
              <Switch value={consentAccepted} onValueChange={onConsentAcceptedChange} />
              <Text style={[styles.consentText, { color: screen.theme.mutedText }]}>
                {screen.consent.label}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={{ gap: screen.theme.spacing - screen.theme.spacing / 4 }}>
          {screen.state === "ready" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Submit interest"
              onPress={onSubmit}
              style={[
                styles.action,
                {
                  backgroundColor: screen.theme.primaryAction,
                  borderRadius: screen.theme.radius,
                  paddingHorizontal: screen.theme.spacing,
                  paddingVertical: screen.theme.spacing - screen.theme.spacing / 4
                }
              ]}
            >
              <Text style={[styles.actionText, { color: screen.theme.primaryActionText }]}>
                Submit Interest
              </Text>
            </Pressable>
          ) : null}
          {screen.actions.map((action) => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => onNavigate?.(action.targetRoute)}
              style={[
                styles.secondaryAction,
                {
                  borderColor: screen.theme.border,
                  borderRadius: screen.theme.radius,
                  paddingHorizontal: screen.theme.spacing,
                  paddingVertical: screen.theme.spacing - screen.theme.spacing / 4
                }
              ]}
            >
              <Text style={[styles.actionText, { color: screen.theme.text }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  demoBanner: {
    alignSelf: "flex-start"
  },
  title: {
    fontSize: designTokens.typography.size.screenTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.screenTitle
  },
  fieldLabel: {
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.body
  },
  input: {
    borderWidth: 1
  },
  consentRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  consentText: {
    flex: 1
  },
  action: {
    alignItems: "center"
  },
  secondaryAction: {
    alignItems: "center",
    borderWidth: 1
  },
  actionText: {
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.medium,
    lineHeight: designTokens.typography.lineHeight.button
  }
});
