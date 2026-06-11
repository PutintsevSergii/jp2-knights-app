import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { PublicScreenAction, PublicScreenSection } from "../public-screens.js";
import type { PublicHomeScreen as PublicHomeScreenModel } from "../public-screens.js";
import { PublicHomeHighlightCard } from "./PublicHomeHighlightCard.js";
import { PublicHomeQuickActionCard } from "./PublicHomeQuickActionCard.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { MaterialSymbol } from "./shared/MaterialSymbol.js";

export interface PublicHomeScreenProps {
  screen: PublicHomeScreenModel;
  onNavigate?: (route: PublicHomeScreenModel["actions"][number]["targetRoute"]) => void;
}

export function PublicHomeScreen({ screen, onNavigate }: PublicHomeScreenProps) {
  const joinAction = screen.actions.find((action) => action.targetRoute === "JoinRequestForm");
  const prayerSections = screen.sections.filter((section) => section.id.includes("prayer"));
  const eventSections = screen.sections.filter((section) => section.id.includes("event"));
  const quickActions = orderedPublicActions(screen.actions);
  const silentPrayerAction = screen.actions.find(
    (action) => action.targetRoute === "PublicSilentPrayer"
  );
  const liturgicalChips = screen.today
    ? [screen.today.liturgicalDay.season, screen.today.liturgicalDay.rank].filter(isChipValue)
    : [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {screen.demoChromeVisible ? <DemoModeBanner /> : null}

        <View style={styles.appHeader}>
          <Pressable accessibilityLabel="Menu" accessibilityRole="button" style={styles.headerIcon}>
            <MaterialSymbol name="menu" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>JP2 Knights</Text>
          <Pressable
            accessibilityLabel="Sign in"
            accessibilityRole="button"
            style={styles.headerAvatar}
            onPress={() => onNavigate?.("Login")}
          >
            <MaterialSymbol name="login" size={22} />
          </Pressable>
        </View>

        {screen.today ? (
          <View style={styles.todayStrip}>
            <Text style={styles.todayDate}>{screen.today.civilDate.displayLabel}</Text>
            <Text style={styles.todayTitle}>{screen.today.liturgicalDay.name}</Text>
            {liturgicalChips.length > 0 || screen.today.liturgicalDay.color ? (
              <View style={styles.chipRow}>
                {liturgicalChips.map((chip) => (
                  <View key={chip} style={styles.chip}>
                    <Text style={styles.chipText}>{chip}</Text>
                  </View>
                ))}
                {screen.today.liturgicalDay.color ? (
                  <View style={styles.colorChip}>
                    <Text style={styles.colorChipText}>{screen.today.liturgicalDay.color}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.hero}>
          <View style={styles.heroWash} />
          <Text style={styles.title}>Prayer, fraternity, and formation</Text>
          <Text style={styles.heroBody}>{screen.body}</Text>
          <View style={styles.heroActions}>
            {joinAction ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Request to Join"
                onPress={() => onNavigate?.("JoinRequestForm")}
                style={styles.primaryHeroButton}
              >
                <Text style={styles.primaryHeroButtonText}>Request to Join</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign In"
              onPress={() => onNavigate?.("Login")}
              style={styles.secondaryHeroButton}
            >
              <Text style={styles.secondaryHeroButtonText}>Sign In</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <PublicHomeQuickActionCard
              key={action.id}
              action={action}
              onNavigate={onNavigate}
              wide={false}
            />
          ))}
        </View>

        <View style={styles.moduleGrid}>
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

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Join Prayer"
            onPress={() =>
              silentPrayerAction ? onNavigate?.(silentPrayerAction.targetRoute) : undefined
            }
            style={styles.silentPrayerCard}
          >
            <View style={styles.moduleTitleRow}>
              <MaterialSymbol name="candle" size={24} />
              <Text style={styles.moduleTitle}>Morning Office Intention</Text>
            </View>
            <View style={styles.counterRow}>
              <MaterialSymbol name="group" size={20} color={colors.text.subdued} />
              <Text style={styles.counterText}>18 praying now</Text>
            </View>
            <Text style={styles.silentPrayerButton}>Join Prayer</Text>
          </Pressable>

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

        <View style={styles.pathPanel}>
          <Text style={styles.pathTitle}>The Path to Membership</Text>
          <View style={styles.pathStack}>
            {["Request", "Officer Review", "Formation Begins"].map((label, index) => (
              <View key={label} style={styles.pathStep}>
                <View style={index === 0 ? styles.pathStepActive : styles.pathStepNumber}>
                  <Text style={styles.pathStepText}>{index + 1}</Text>
                </View>
                <Text style={styles.pathStepLabel}>{label}</Text>
                {index < 2 ? <MaterialSymbol name="arrow_downward" size={18} color={colors.text.subdued} /> : null}
              </View>
            ))}
          </View>
          <Text style={styles.pathFootnote}>* No guarantee of membership</Text>
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
    ["PublicPrayerCategories", 1],
    ["PublicEventsList", 2],
    ["PublicSilentPrayer", 3],
    ["JoinRequestForm", 4],
    ["Login", 5],
    ["IdleApproval", 6]
  ]);

  return [...actions].sort(
    (first, second) =>
      (routeOrder.get(first.targetRoute) ?? 99) - (routeOrder.get(second.targetRoute) ?? 99)
  );
}

function isChipValue(value: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
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
    paddingTop: 0
  },
  appHeader: {
    alignItems: "center",
    backgroundColor: colors.background.app,
    borderBottomColor: colors.border.chrome,
    borderBottomWidth: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    height: 64,
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
  todayStrip: {
    alignItems: "center",
    gap: designTokens.space[2],
    paddingTop: designTokens.space[4]
  },
  todayDate: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  todayTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.cardTitle,
    textAlign: "center"
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[2],
    justifyContent: "center"
  },
  chip: {
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.pill,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  chipText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  colorChip: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  colorChipText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  hero: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: designTokens.space[3],
    overflow: "hidden",
    padding: designTokens.space[6]
  },
  heroWash: {
    backgroundColor: colors.brand.gold,
    bottom: 0,
    left: 0,
    opacity: 0.08,
    position: "absolute",
    right: 0,
    top: 0
  },
  title: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.screenTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.screenTitle,
    textAlign: "center"
  },
  heroBody: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body,
    textAlign: "center"
  },
  heroActions: {
    gap: designTokens.space[3],
    width: "100%"
  },
  primaryHeroButton: {
    alignItems: "center",
    backgroundColor: colors.brand.gold,
    borderRadius: designTokens.radius.pill,
    paddingVertical: designTokens.space[3]
  },
  primaryHeroButtonText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  secondaryHeroButton: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    paddingVertical: designTokens.space[3]
  },
  secondaryHeroButtonText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[3]
  },
  moduleGrid: {
    gap: designTokens.space[3]
  },
  moduleTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  moduleTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  silentPrayerCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[4]
  },
  counterRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  counterText: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  silentPrayerButton: {
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.pill,
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    overflow: "hidden",
    paddingHorizontal: designTokens.space[4],
    paddingVertical: designTokens.space[2],
    textAlign: "center",
    textTransform: "uppercase"
  },
  highlightGrid: {
    gap: designTokens.space[3]
  },
  eventGrid: {
    gap: designTokens.space[2]
  },
  pathPanel: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: designTokens.space[4],
    padding: designTokens.space[6]
  },
  pathTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle,
    textAlign: "center"
  },
  pathStack: {
    alignItems: "center",
    gap: designTokens.space[2]
  },
  pathStep: {
    alignItems: "center",
    gap: designTokens.space[2]
  },
  pathStepActive: {
    alignItems: "center",
    backgroundColor: colors.brand.gold,
    borderRadius: designTokens.radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  pathStepNumber: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  pathStepText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  pathStepLabel: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary,
    textAlign: "center"
  },
  pathFootnote: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontStyle: "italic",
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textAlign: "center"
  }
});
