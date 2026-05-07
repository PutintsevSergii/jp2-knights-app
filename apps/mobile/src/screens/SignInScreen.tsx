import { designTokens } from "@jp2/shared-design-tokens";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { SignInScreen as SignInScreenModel, SignInFieldId } from "../public-screens.js";

export interface SignInScreenProps {
  screen: SignInScreenModel;
  values: Record<SignInFieldId, string>;
  onChangeField?: (field: SignInFieldId, value: string) => void;
  onSubmit?: () => void;
  onNavigate?: (route: SignInScreenModel["actions"][number]["targetRoute"]) => void;
}

export function SignInScreen({
  screen,
  values,
  onChangeField,
  onSubmit,
  onNavigate
}: SignInScreenProps) {
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
            styles.panel,
            {
              borderColor: screen.theme.border,
              backgroundColor: screen.theme.surface,
              borderRadius: screen.theme.radius,
              gap: screen.theme.spacing / 2,
              padding: screen.theme.spacing
            }
          ]}
        >
          <Text style={[styles.title, { color: screen.theme.text }]}>{screen.title}</Text>
          <Text style={{ color: screen.theme.mutedText }}>{screen.body}</Text>
        </View>

        {screen.fields.map((field) => (
          <View
            key={field.id}
            style={[
              styles.panel,
              {
                borderColor: screen.theme.border,
                backgroundColor: screen.theme.surface,
                borderRadius: screen.theme.radius,
                gap: screen.theme.spacing / 2,
                padding: screen.theme.spacing
              }
            ]}
          >
            <Text style={[styles.fieldLabel, { color: screen.theme.text }]}>{field.label}</Text>
            <TextInput
              accessibilityLabel={field.label}
              autoCapitalize="none"
              keyboardType={field.keyboardType}
              onChangeText={(value) => onChangeField?.(field.id, value)}
              secureTextEntry={field.secureTextEntry}
              style={[
                styles.input,
                {
                  borderColor: screen.theme.border,
                  borderRadius: screen.theme.radius,
                  color: screen.theme.text,
                  minHeight: screen.theme.spacing * 3,
                  padding: screen.theme.spacing / 2
                }
              ]}
              value={values[field.id]}
            />
          </View>
        ))}

        {screen.sections.map((section) => (
          <View
            key={section.id}
            style={[
              styles.panel,
              {
                borderColor: screen.theme.border,
                backgroundColor: screen.theme.surface,
                borderRadius: screen.theme.radius,
                gap: screen.theme.spacing / 2,
                padding: screen.theme.spacing
              }
            ]}
          >
            <Text style={[styles.sectionTitle, { color: screen.theme.text }]}>{section.title}</Text>
            <Text style={{ color: screen.theme.mutedText }}>{section.body}</Text>
          </View>
        ))}

        <View style={{ gap: screen.theme.spacing - screen.theme.spacing / 4 }}>
          {screen.state === "ready" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in"
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
                Sign In
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
  panel: {
    borderWidth: 1
  },
  title: {
    fontSize: designTokens.typography.size.screenTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.screenTitle
  },
  sectionTitle: {
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  fieldLabel: {
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.body
  },
  input: {
    borderWidth: 1
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
