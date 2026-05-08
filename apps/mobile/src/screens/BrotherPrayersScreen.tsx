import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { BrotherPrayersScreen as BrotherPrayersScreenModel } from "../brother-screens.js";
import type { BrotherScreenAction } from "../brother-screen-contracts.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { MobileBottomNav } from "./shared/MobileBottomNav.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";

export interface BrotherPrayersScreenProps {
  screen: BrotherPrayersScreenModel;
  onAction?: (action: BrotherScreenAction) => void;
}

export function BrotherPrayersScreen({ screen, onAction }: BrotherPrayersScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <MobileTopBar title="JP2 Knights" avatarText="JP" tone="gold" />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {screen.demoChromeVisible ? (
            <View style={styles.bannerOffset}>
              <DemoModeBanner />
            </View>
          ) : null}

          <View style={styles.hero}>
            <Text style={styles.title}>{screen.title}</Text>
            <Text style={styles.subtitle}>
              Public, brother, and own choragiew prayers visible to you.
            </Text>
          </View>

          {screen.state === "ready" ? (
            <>
              {screen.categoryChips.length > 0 ? (
                <View style={styles.categoryRow}>
                  {screen.categoryChips.map((category) => (
                    <View key={category.id} style={styles.categoryChip}>
                      <Text style={styles.categoryText}>{category.label}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.cardStack}>
                {screen.prayerCards.map((prayer) => (
                  <View key={prayer.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.titleStack}>
                        <Text style={styles.cardTitle}>{prayer.title}</Text>
                        <Text style={styles.categoryLabel}>{prayer.categoryLabel}</Text>
                      </View>
                      <View style={styles.languageBadge}>
                        <Text style={styles.languageText}>{prayer.languageLabel}</Text>
                      </View>
                    </View>

                    <Text style={styles.excerpt}>{prayer.excerpt}</Text>

                    <View style={styles.metaRow}>
                      <View style={styles.visibilityBadge}>
                        <Text style={styles.visibilityText}>{prayer.visibilityLabel}</Text>
                      </View>
                      <Text style={styles.scopeText}>{prayer.scopeLabel}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.statePanelOffset}>
              <ScreenStatePanel title={screen.title} body={screen.body} />
            </View>
          )}
        </ScrollView>

        <MobileBottomNav
          items={[
            {
              id: "dashboard",
              label: "Dashboard",
              active: false,
              onPress: () =>
                onAction?.({
                  id: "today",
                  label: "Dashboard",
                  targetRoute: "BrotherToday"
                })
            },
            {
              id: "events",
              label: "Events",
              active: false,
              onPress: () =>
                onAction?.({
                  id: "events",
                  label: "Events",
                  targetRoute: "BrotherEvents"
                })
            },
            {
              id: "prayer",
              label: "Prayer",
              active: true
            },
            {
              id: "choragiew",
              label: "Choragiew",
              active: false,
              onPress: () =>
                onAction?.({
                  id: "organization-units",
                  label: "Choragiew",
                  targetRoute: "MyOrganizationUnits"
                })
            },
            {
              id: "account",
              label: "Account",
              active: false,
              onPress: () =>
                onAction?.({
                  id: "profile",
                  label: "Account",
                  targetRoute: "BrotherProfile"
                })
            }
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.app
  },
  root: {
    flex: 1,
    backgroundColor: colors.background.app
  },
  scrollContent: {
    gap: designTokens.space[6],
    paddingBottom: 112,
    paddingHorizontal: designTokens.space[8],
    paddingTop: designTokens.space[8]
  },
  bannerOffset: {
    alignSelf: "flex-start"
  },
  hero: {
    gap: designTokens.space[2]
  },
  title: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.screenTitle,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: 0,
    lineHeight: designTokens.typography.lineHeight.screenTitle
  },
  subtitle: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.regular,
    lineHeight: designTokens.typography.lineHeight.body
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[2]
  },
  categoryChip: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[2]
  },
  categoryText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  cardStack: {
    gap: designTokens.space[4]
  },
  card: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderLeftColor: colors.brand.gold,
    borderLeftWidth: 4,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[4],
    padding: designTokens.space[6],
    shadowColor: designTokens.elevation.subtle.color,
    shadowOffset: {
      width: designTokens.elevation.subtle.offsetX,
      height: designTokens.elevation.subtle.offsetY
    },
    shadowOpacity: designTokens.elevation.subtle.opacity,
    shadowRadius: designTokens.elevation.subtle.radius
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: designTokens.space[3],
    justifyContent: "space-between"
  },
  titleStack: {
    flex: 1,
    gap: designTokens.space[1]
  },
  cardTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  categoryLabel: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  languageBadge: {
    backgroundColor: colors.brand.gold,
    borderRadius: designTokens.radius.sm,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  languageText: {
    color: colors.brand.goldDeep,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  excerpt: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[2]
  },
  visibilityBadge: {
    backgroundColor: colors.border.soft,
    borderRadius: designTokens.radius.pill,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  visibilityText: {
    color: colors.brand.goldDark,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  scopeText: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  statePanelOffset: {
    marginTop: designTokens.space[4]
  }
});
