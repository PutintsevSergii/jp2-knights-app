import { designTokens } from "@jp2/shared-design-tokens";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { IdleApprovalScreen as IdleApprovalScreenModel } from "../public-screens.js";

export interface IdleApprovalScreenProps {
  screen: IdleApprovalScreenModel;
  onNavigate?: (route: IdleApprovalScreenModel["actions"][number]["targetRoute"]) => void;
}

export function IdleApprovalScreen({ screen, onNavigate }: IdleApprovalScreenProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
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
          {screen.sections.map((section) => (
            <View key={section.id} style={styles.statusSection}>
              <Text style={[styles.sectionTitle, { color: screen.theme.text }]}>
                {section.title}
              </Text>
              <Text style={[styles.body, { color: screen.theme.mutedText }]}>{section.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          {screen.actions.map((action) => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => onNavigate?.(action.targetRoute)}
              style={styles.footerAction}
            >
              <Text style={[styles.footerLink, { color: screen.theme.text }]}>{action.label}</Text>
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
    letterSpacing: -1.2,
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
  statusSection: {
    gap: designTokens.space[2]
  },
  sectionTitle: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle,
    textAlign: "center"
  },
  footer: {
    alignItems: "center",
    gap: designTokens.space[2]
  },
  footerAction: {
    padding: designTokens.space[1]
  },
  footerLink: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body,
    textDecorationLine: "underline"
  }
});
