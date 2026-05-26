import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { PublicSilentPrayerScreen as PublicSilentPrayerScreenModel } from "../public-screens.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";

export interface PublicSilentPrayerScreenProps {
  screen: PublicSilentPrayerScreenModel;
  onAction?: (action: PublicSilentPrayerScreenModel["actions"][number]) => void;
}

export function PublicSilentPrayerScreen({ screen, onAction }: PublicSilentPrayerScreenProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <ScrollView
        contentContainerStyle={{
          gap: screen.theme.spacing,
          padding: screen.theme.spacing,
          paddingTop: screen.theme.spacing * 2
        }}
      >
        {screen.demoChromeVisible ? <DemoModeBanner /> : null}

        <View
          style={[
            styles.hero,
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
          {screen.joinedPresence ? (
            <Text style={[styles.joinedText, { color: screen.theme.text }]}>
              {screen.joinedPresence}
            </Text>
          ) : null}
        </View>

        {screen.sessionCards.map((session) => (
          <View
            key={session.id}
            style={[
              styles.card,
              {
                borderColor: screen.theme.border,
                backgroundColor: screen.theme.surface,
                borderRadius: screen.theme.radius,
                gap: screen.theme.spacing / 2,
                padding: screen.theme.spacing
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.sectionTitle, { color: screen.theme.text }]}>
                {session.title}
              </Text>
              <Text style={styles.visibility}>{session.visibilityLabel}</Text>
            </View>
            <Text style={{ color: screen.theme.mutedText }}>{session.intention}</Text>
            <Text style={{ color: screen.theme.mutedText }}>{session.timeLabel}</Text>
            <Text style={[styles.countText, { color: screen.theme.text }]}>
              {session.activeCountLabel}
            </Text>
            <Text style={{ color: screen.theme.mutedText }}>Aggregate counter only</Text>
          </View>
        ))}

        <View style={{ gap: screen.theme.spacing - screen.theme.spacing / 4 }}>
          {screen.actions.map((action) => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => onAction?.(action)}
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

const colors = designTokens.color;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  hero: {
    borderWidth: 1
  },
  title: {
    fontSize: designTokens.typography.size.screenTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.screenTitle
  },
  joinedText: {
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.body
  },
  card: {
    borderLeftColor: colors.brand.gold,
    borderLeftWidth: 4,
    borderWidth: 1
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sectionTitle: {
    flex: 1,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  visibility: {
    color: colors.brand.goldDark,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  countText: {
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.body
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
