import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { BrotherEventsScreen as BrotherEventsScreenModel } from "../brother-screens.js";
import type { BrotherScreenAction } from "../brother-screen-contracts.js";
import { CalendarIcon } from "./shared/CalendarIcon.js";
import { ClockIcon } from "./shared/ClockIcon.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { FilterIcon } from "./shared/FilterIcon.js";
import { MobileBottomNav } from "./shared/MobileBottomNav.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { PinIcon } from "./shared/PinIcon.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";

export interface BrotherEventsScreenProps {
  screen: BrotherEventsScreenModel;
  onAction?: (action: BrotherScreenAction) => void;
}

export function BrotherEventsScreen({ screen, onAction }: BrotherEventsScreenProps) {
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
            <View style={styles.heroCopy}>
              <Text style={styles.title}>{screen.title}</Text>
              <Text style={styles.subtitle}>Formation, meetings, and actions visible to brothers.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filter brother events"
              style={styles.filterButton}
            >
              <FilterIcon />
              <Text style={styles.filterText}>Filter</Text>
            </Pressable>
          </View>

          {screen.state === "ready" ? (
            <View style={styles.cardStack}>
              {screen.eventCards.map((event) => (
                <View key={event.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleStack}>
                      <Text style={styles.cardTitle}>{event.title}</Text>
                      <Text style={styles.eventType}>{event.typeLabel}</Text>
                    </View>
                    <View style={styles.visibilityBadge}>
                      <Text style={styles.visibilityText}>{event.visibilityLabel}</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <CalendarIcon emphasized />
                    <Text style={styles.metaText}>{event.dateLabel}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <ClockIcon />
                    <Text style={styles.metaText}>{event.timeLabel}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <PinIcon tone="brown" />
                    <Text style={styles.metaText}>{event.locationLabel}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardActions}>
                    <Text style={styles.privacyText}>No attendee list shown</Text>
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
                  id: "today",
                  label: "Dashboard",
                  targetRoute: "BrotherToday"
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
                  id: "prayers",
                  label: "Prayer",
                  targetRoute: "BrotherPrayers"
                })
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
    borderLeftColor: colors.brand.gold,
    borderLeftWidth: 4,
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
  titleStack: {
    flex: 1,
    gap: designTokens.space[1]
  },
  cardTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: 27
  },
  eventType: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  visibilityBadge: {
    alignItems: "center",
    backgroundColor: colors.brand.gold,
    borderRadius: designTokens.radius.sm,
    justifyContent: "center",
    maxWidth: 96,
    minHeight: 28,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  visibilityText: {
    color: colors.brand.goldDeep,
    flexShrink: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 10,
    fontWeight: designTokens.typography.weight.medium,
    letterSpacing: 0,
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
    gap: designTokens.space[4],
    justifyContent: "space-between"
  },
  privacyText: {
    color: colors.text.muted,
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: 16
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
    letterSpacing: 0
  },
  statePanelOffset: {
    marginHorizontal: designTokens.space[8]
  }
});
