import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { CandidateEventsScreen as CandidateEventsScreenModel } from "../candidate-screens.js";
import type { CandidateScreenAction } from "../candidate-screen-contracts.js";
import { CalendarIcon } from "./shared/CalendarIcon.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { FilterIcon } from "./shared/FilterIcon.js";
import { MobileBottomNav } from "./shared/MobileBottomNav.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { PinIcon } from "./shared/PinIcon.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";
import { StatusDot } from "./shared/StatusDot.js";

export interface CandidateEventsScreenProps {
  screen: CandidateEventsScreenModel;
  onAction?: (action: CandidateScreenAction) => void;
}

export function CandidateEventsScreen({ screen, onAction }: CandidateEventsScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <MobileTopBar title="JP2 Knights" avatarText="JP" />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {screen.demoChromeVisible ? (
            <View style={styles.bannerOffset}>
              <DemoModeBanner />
            </View>
          ) : null}

          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.title}>{screen.title}</Text>
              <Text style={styles.subtitle}>Formation and action for candidates.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filter events"
              style={styles.filterButton}
            >
              <FilterIcon />
              <Text style={styles.filterText}>Filter</Text>
            </Pressable>
          </View>

          {screen.state === "ready" ? (
            <View style={styles.cardStack}>
              {screen.eventCards.map((event) => (
                <View key={event.id} style={[styles.card, statusBorderStyle[event.statusTone]]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{event.title}</Text>
                    <View style={[styles.statusBadge, statusBadgeStyle[event.statusTone]]}>
                      <StatusDot tone={event.statusTone} />
                      <Text style={[styles.statusText, statusTextStyle[event.statusTone]]}>
                        {event.statusLabel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <CalendarIcon />
                    <Text style={styles.metaText}>{event.dateLabel}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <PinIcon />
                    <Text style={styles.metaText}>{event.locationLabel}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardActions}>
                    {event.primaryAction ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={event.primaryAction.label}
                        onPress={() => onAction?.(event.primaryAction!)}
                        style={styles.rsvpButton}
                      >
                        <Text style={styles.rsvpText}>{event.primaryAction.label}</Text>
                      </Pressable>
                    ) : (
                      <View />
                    )}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={event.detailAction.label}
                      onPress={() => onAction?.(event.detailAction)}
                      style={styles.detailButton}
                    >
                      <Text style={styles.detailText}>{event.detailAction.label}</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
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
                  id: "dashboard",
                  label: "Dashboard",
                  targetRoute: "CandidateDashboard"
                })
            },
            {
              id: "events",
              label: "Events",
              active: true
            },
            {
              id: "prayer",
              label: "Prayer",
              active: false,
              onPress: () =>
                onAction?.({
                  id: "dashboard",
                  label: "Dashboard",
                  targetRoute: "CandidateDashboard"
                })
            },
            {
              id: "choragiew",
              label: "Choragiew",
              active: false,
              onPress: () =>
                onAction?.({
                  id: "dashboard",
                  label: "Dashboard",
                  targetRoute: "CandidateDashboard"
                })
            },
            {
              id: "account",
              label: "Account",
              active: false,
              onPress: () =>
                onAction?.({
                  id: "dashboard",
                  label: "Dashboard",
                  targetRoute: "CandidateDashboard"
                })
            }
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const colors = designTokens.color;

const statusBorderStyle = StyleSheet.create({
  planning: {
    borderLeftColor: colors.brand.gold,
    borderLeftWidth: 4
  },
  needed: {
    borderLeftColor: colors.border.subtle,
    borderLeftWidth: 1
  },
  cancelled: {
    borderLeftColor: colors.status.danger,
    borderLeftWidth: 4
  }
});

const statusBadgeStyle = StyleSheet.create({
  planning: {
    backgroundColor: colors.brand.gold
  },
  needed: {
    backgroundColor: colors.brand.linen
  },
  cancelled: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderWidth: 1
  }
});

const statusTextStyle = StyleSheet.create({
  planning: {
    color: colors.brand.goldDeep
  },
  needed: {
    color: colors.brand.brown
  },
  cancelled: {
    color: colors.brand.taupe
  }
});

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
    paddingBottom: 112
  },
  bannerOffset: {
    marginLeft: designTokens.space[8],
    marginTop: designTokens.space[4]
  },
  hero: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: designTokens.space[4],
    justifyContent: "space-between",
    paddingBottom: 42,
    paddingHorizontal: designTokens.space[8],
    paddingTop: designTokens.space[8]
  },
  heroCopy: {
    flex: 1,
    gap: designTokens.space[2]
  },
  title: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 28,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: 33
  },
  subtitle: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.regular,
    lineHeight: designTokens.typography.lineHeight.body
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: designTokens.space[2],
    minHeight: 32,
    paddingHorizontal: designTokens.space[3]
  },
  filterText: {
    color: colors.text.primary,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.semibold
  },
  cardStack: {
    gap: 20,
    paddingHorizontal: designTokens.space[8]
  },
  card: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[4],
    padding: 20,
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
  cardTitle: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: 27
  },
  statusBadge: {
    alignItems: "center",
    borderRadius: designTokens.radius.sm,
    flexDirection: "row",
    gap: designTokens.space[1],
    maxWidth: 96,
    minHeight: 28,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  statusText: {
    flexShrink: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 10,
    fontWeight: designTokens.typography.weight.medium,
    letterSpacing: 1,
    lineHeight: 11,
    textTransform: "uppercase"
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  metaText: {
    color: colors.brand.brown,
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  divider: {
    backgroundColor: colors.border.soft,
    height: 1
  },
  cardActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  rsvpButton: {
    alignItems: "center",
    backgroundColor: colors.text.primary,
    borderRadius: designTokens.radius.sm,
    justifyContent: "center",
    minHeight: 28,
    paddingHorizontal: designTokens.space[4]
  },
  rsvpText: {
    color: colors.text.inverse,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.semibold
  },
  detailButton: {
    justifyContent: "center",
    minHeight: 28
  },
  detailText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: designTokens.typography.letterSpacing.compactLabel
  },
  statePanelOffset: {
    marginHorizontal: designTokens.space[8]
  }
});
