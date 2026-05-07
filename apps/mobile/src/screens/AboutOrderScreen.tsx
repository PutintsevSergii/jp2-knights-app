import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { AboutOrderScreen as AboutOrderScreenModel } from "../public-screens.js";

export interface AboutOrderScreenProps {
  screen: AboutOrderScreenModel;
  onNavigate?: (route: AboutOrderScreenModel["actions"][number]["targetRoute"]) => void;
}

export function AboutOrderScreen({ screen, onNavigate }: AboutOrderScreenProps) {
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
        </View>

        {screen.sections.map((section) => (
          <View
            key={section.id}
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
            <Text style={[styles.sectionTitle, { color: screen.theme.text }]}>{section.title}</Text>
            <Text style={{ color: screen.theme.mutedText }}>{section.body}</Text>
          </View>
        ))}

        <View style={{ gap: screen.theme.spacing - screen.theme.spacing / 4 }}>
          {screen.actions.map((action) => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => onNavigate?.(action.targetRoute)}
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
                {action.label}
              </Text>
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
  sectionTitle: {
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  action: {
    alignItems: "center"
  },
  actionText: {
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.medium,
    lineHeight: designTokens.typography.lineHeight.button
  }
});
