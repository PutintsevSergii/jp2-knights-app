import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { BrotherTodayScreen as BrotherTodayScreenModel } from "../brother-screens.js";
import type { BrotherScreenAction } from "../brother-screen-contracts.js";
import { ClockIcon } from "./shared/ClockIcon.js";
import { DegreeIcon } from "./shared/DegreeIcon.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { FlagIcon } from "./shared/FlagIcon.js";
import { MobileBottomNav } from "./shared/MobileBottomNav.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { PinIcon } from "./shared/PinIcon.js";
import { QuickActionIcon } from "./shared/QuickActionIcon.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";

export interface BrotherTodayScreenProps {
  screen: BrotherTodayScreenModel;
  onAction?: (action: BrotherScreenAction) => void;
}

export function BrotherTodayScreen({ screen, onAction }: BrotherTodayScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <MobileTopBar
          title="JP2 Knights"
          avatarText={screen.profileSummary?.initials ?? "JP"}
          tone="gold"
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {screen.demoChromeVisible ? <DemoModeBanner /> : null}

          {screen.state === "ready" && screen.profileSummary ? (
            <>
              <View style={styles.profileCard}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>{screen.profileSummary.initials}</Text>
                </View>
                <Text style={styles.greeting}>Good morning, Brother</Text>
                <Text style={styles.profileName}>{screen.profileSummary.displayName}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <DegreeIcon />
                    <Text style={styles.badgeText}>{screen.profileSummary.currentDegreeLabel}</Text>
                  </View>
                  <View style={styles.badge}>
                    <FlagIcon />
                    <Text style={styles.badgeText}>
                      {screen.profileSummary.organizationUnitLabel}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.quickGrid}>
                {screen.quickActions.map((action) => (
                  <Pressable
                    key={action.id}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    onPress={() => onAction?.(screenAction(action))}
                    style={styles.quickCard}
                  >
                    <View style={styles.quickIconCircle}>
                      <QuickActionIcon icon={action.icon} emphasized={action.emphasized} />
                    </View>
                    <Text style={styles.quickLabel}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Action</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View all brother events"
                  onPress={() =>
                    onAction?.({
                      id: "view-all-events",
                      label: "View All",
                      targetRoute: "BrotherEvents"
                    })
                  }
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </Pressable>
              </View>

              {screen.upcomingEventCards.length > 0 ? (
                <View style={styles.eventStack}>
                  {screen.upcomingEventCards.map((event) => (
                    <Pressable
                      key={event.id}
                      accessibilityRole="button"
                      accessibilityLabel={event.detailAction.label}
                      onPress={() => onAction?.(event.detailAction)}
                      style={styles.eventCard}
                    >
                      <View style={styles.dateTile}>
                        <Text style={styles.dateMonth}>{event.dateMonth}</Text>
                        <Text style={styles.dateDay}>{event.dateDay}</Text>
                      </View>
                      <View style={styles.eventCopy}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <Text style={styles.eventType}>{event.typeLabel}</Text>
                        <View style={styles.metaRow}>
                          <ClockIcon />
                          <Text style={styles.metaText}>{event.timeLabel}</Text>
                        </View>
                        <View style={styles.metaRow}>
                          <PinIcon tone="brown" />
                          <Text style={styles.metaText}>{event.locationLabel}</Text>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <ScreenStatePanel
                  title="Upcoming Action"
                  body="No brother-visible events are listed yet."
                />
              )}

              {screen.organizationUnitCards.length > 0 ? (
                <View style={styles.unitStack}>
                  {screen.organizationUnitCards.map((unit) => (
                    <View key={unit.id} style={styles.unitCard}>
                      <Text style={styles.unitTitle}>{unit.title}</Text>
                      <Text style={styles.unitLocation}>{unit.locationLabel}</Text>
                      {unit.body ? <Text style={styles.unitBody}>{unit.body}</Text> : null}
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <ScreenStatePanel title={screen.title} body={screen.body} />
          )}
        </ScrollView>

        <MobileBottomNav
          items={[
            {
              id: "dashboard",
              label: "Dashboard",
              active: true
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
              active: false,
              disabled: true
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

function screenAction(action: BrotherScreenAction): BrotherScreenAction {
  return {
    id: action.id,
    label: action.label,
    targetRoute: action.targetRoute,
    targetId: action.targetId
  };
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
    gap: 36,
    paddingBottom: 112,
    paddingHorizontal: designTokens.space[8],
    paddingTop: 24
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    gap: designTokens.space[3],
    minHeight: 186,
    padding: 20,
    shadowColor: designTokens.elevation.subtle.color,
    shadowOffset: {
      width: designTokens.elevation.subtle.offsetX,
      height: designTokens.elevation.subtle.offsetY
    },
    shadowOpacity: designTokens.elevation.subtle.opacity,
    shadowRadius: designTokens.elevation.subtle.radius
  },
  profileAvatar: {
    alignItems: "center",
    backgroundColor: colors.text.primary,
    borderColor: colors.brand.goldDark,
    borderRadius: 46,
    borderWidth: 2,
    height: 92,
    justifyContent: "center",
    width: 92
  },
  profileAvatarText: {
    color: colors.text.inverse,
    fontSize: 26,
    fontWeight: designTokens.typography.weight.bold
  },
  greeting: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  profileName: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 26,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: 31,
    textAlign: "center"
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[2],
    justifyContent: "center"
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: designTokens.space[1],
    minHeight: 22,
    paddingHorizontal: designTokens.space[2]
  },
  badgeText: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 10,
    fontWeight: designTokens.typography.weight.medium,
    letterSpacing: 0.6,
    lineHeight: 12
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[3]
  },
  quickCard: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    gap: designTokens.space[3],
    justifyContent: "center",
    minHeight: 116,
    padding: designTokens.space[4],
    width: "47%"
  },
  quickIconCircle: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderRadius: 19,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  quickLabel: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: 18,
    textAlign: "center"
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: 24
  },
  viewAllButton: {
    justifyContent: "center",
    minHeight: 32
  },
  viewAllText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.label
  },
  eventStack: {
    gap: designTokens.space[3],
    marginTop: -24
  },
  eventCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: designTokens.space[4],
    padding: 18,
    shadowColor: designTokens.elevation.subtle.color,
    shadowOffset: {
      width: designTokens.elevation.subtle.offsetX,
      height: designTokens.elevation.subtle.offsetY
    },
    shadowOpacity: designTokens.elevation.subtle.opacity,
    shadowRadius: designTokens.elevation.subtle.radius
  },
  dateTile: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.brand.gold,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  dateMonth: {
    color: colors.brand.goldDeep,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 10,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: 12
  },
  dateDay: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: 19
  },
  eventCopy: {
    flex: 1,
    gap: designTokens.space[1]
  },
  eventTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: 20
  },
  eventType: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: 16
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[1]
  },
  metaText: {
    color: colors.brand.brown,
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  unitStack: {
    gap: designTokens.space[3],
    marginTop: -12
  },
  unitCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    gap: designTokens.space[1],
    padding: designTokens.space[4]
  },
  unitTitle: {
    color: colors.text.primary,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.body
  },
  unitLocation: {
    color: colors.brand.brown,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  unitBody: {
    color: colors.text.subdued,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  }
});
