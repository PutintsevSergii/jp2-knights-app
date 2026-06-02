import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { PublicScreenAction, PublicScreenSection } from "../public-screens.js";
import type { PublicHomeScreen as PublicHomeScreenModel } from "../public-screens.js";
import { PublicHomeHighlightCard } from "./PublicHomeHighlightCard.js";
import { PublicHomeQuickActionCard } from "./PublicHomeQuickActionCard.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";

export interface PublicHomeScreenProps {
  screen: PublicHomeScreenModel;
  onNavigate?: (route: PublicHomeScreenModel["actions"][number]["targetRoute"]) => void;
}

export function PublicHomeScreen({ screen, onNavigate }: PublicHomeScreenProps) {
  const joinAction = screen.actions.find((action) => action.targetRoute === "JoinRequestForm");
  const aboutAction = screen.actions.find((action) => action.targetRoute === "AboutOrder");
  const prayerSections = screen.sections.filter((section) => section.id.includes("prayer"));
  const eventSections = screen.sections.filter((section) => section.id.includes("event"));
  const quickActions = orderedPublicActions(screen.actions);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {screen.demoChromeVisible ? <DemoModeBanner /> : null}

        <View style={styles.appHeader}>
          <Pressable accessibilityLabel="Menu" accessibilityRole="button" style={styles.headerIcon}>
            <Text style={styles.headerIconText}>≡</Text>
          </Pressable>
          <Text style={styles.headerTitle}>JP2 Knights</Text>
          <Pressable
            accessibilityLabel="Member profile"
            accessibilityRole="button"
            style={styles.headerAvatar}
          >
            <Text style={styles.headerAvatarText}>J</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>{screen.title}</Text>
          <Text style={styles.heroBody}>{screen.body}</Text>
        </View>

        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <PublicHomeQuickActionCard
              key={action.id}
              action={action}
              featured={action.id === joinAction?.id}
              onNavigate={onNavigate}
              wide={action.id === aboutAction?.id}
            />
          ))}
        </View>

        <View style={styles.dailyPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>☼</Text>
            </View>
            <Text style={styles.sectionTitle}>Daily Prayers</Text>
          </View>
          <View style={styles.highlightGrid}>
            {prayerSections.map((section) => (
              <PublicHomeHighlightCard
                key={section.id}
                section={section}
                action={actionForSection(section, screen.actions)}
                onNavigate={onNavigate}
              />
            ))}
          </View>
        </View>

        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.secondarySectionIcon}>
              <Text style={styles.secondarySectionIconText}>□</Text>
            </View>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
          </View>
          <View style={styles.eventGrid}>
            {eventSections.map((section) => (
              <PublicHomeHighlightCard
                key={section.id}
                section={section}
                action={actionForSection(section, screen.actions)}
                onNavigate={onNavigate}
                variant="event"
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function actionForSection(
  section: PublicScreenSection,
  actions: PublicHomeScreenModel["actions"]
): PublicScreenAction | undefined {
  if (section.id.includes("prayer")) {
    return actions.find((action) => action.targetRoute === "PublicPrayerCategories");
  }

  if (section.id.includes("event")) {
    return actions.find((action) => action.targetRoute === "PublicEventsList");
  }

  return undefined;
}

function orderedPublicActions(actions: PublicHomeScreenModel["actions"]) {
  const routeOrder = new Map<PublicScreenAction["targetRoute"], number>([
    ["AboutOrder", 0],
    ["JoinRequestForm", 1],
    ["PublicPrayerCategories", 2],
    ["PublicEventsList", 3],
    ["Login", 4],
    ["PublicSilentPrayer", 5],
    ["IdleApproval", 6]
  ]);

  return [...actions].sort(
    (first, second) =>
      (routeOrder.get(first.targetRoute) ?? 99) - (routeOrder.get(second.targetRoute) ?? 99)
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    gap: designTokens.space[4],
    padding: designTokens.space[4],
    paddingBottom: 104,
    paddingTop: designTokens.space[2]
  },
  appHeader: {
    alignItems: "center",
    backgroundColor: colors.background.app,
    borderBottomColor: colors.border.chrome,
    borderBottomWidth: 1,
    borderBottomLeftRadius: designTokens.radius.lg,
    borderBottomRightRadius: designTokens.radius.lg,
    flexDirection: "row",
    height: 56,
    justifyContent: "space-between",
    marginHorizontal: -designTokens.space[4],
    paddingHorizontal: designTokens.space[4]
  },
  headerTitle: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  headerIcon: {
    alignItems: "center",
    borderRadius: designTokens.radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  headerIconText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  headerAvatar: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.chrome,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  headerAvatarText: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  hero: {
    alignItems: "center",
    gap: designTokens.space[2],
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[6]
  },
  title: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle,
    textAlign: "center"
  },
  heroBody: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body,
    textAlign: "center"
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[3]
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  sectionIcon: {
    alignItems: "center",
    backgroundColor: colors.brand.gold,
    borderRadius: designTokens.radius.pill,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  sectionIconText: {
    color: colors.brand.goldDeep,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.body
  },
  secondarySectionIcon: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  secondarySectionIconText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.body
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  dailyPanel: {
    backgroundColor: colors.brand.linen,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    gap: designTokens.space[4],
    padding: designTokens.space[4]
  },
  highlightGrid: {
    gap: designTokens.space[3]
  },
  eventsSection: {
    gap: designTokens.space[3]
  },
  eventGrid: {
    gap: designTokens.space[2],
    paddingHorizontal: designTokens.space[1]
  }
});
