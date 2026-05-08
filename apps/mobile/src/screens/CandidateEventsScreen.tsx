import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { CandidateEventsScreen as CandidateEventsScreenModel } from "../candidate-screens.js";
import type { CandidateScreenAction } from "../candidate-screen-contracts.js";

export interface CandidateEventsScreenProps {
  screen: CandidateEventsScreenModel;
  onAction?: (action: CandidateScreenAction) => void;
}

export function CandidateEventsScreen({ screen, onAction }: CandidateEventsScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <MenuIcon />
          <Text style={styles.brand}>JP2 Knights</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JP</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {screen.demoChromeVisible ? (
            <View style={styles.demoBanner} accessibilityRole="text">
              <Text style={styles.demoText}>Demo mode</Text>
            </View>
          ) : null}

          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.title}>{screen.title}</Text>
              <Text style={styles.subtitle}>Formation and action for candidates.</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Filter events" style={styles.filterButton}>
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
            <View style={styles.statePanel}>
              <Text style={styles.stateTitle}>{screen.title}</Text>
              <Text style={styles.stateBody}>{screen.body}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomNav}>
          <NavItem
            label="Dashboard"
            active={false}
            onPress={() =>
              onAction?.({
                id: "dashboard",
                label: "Dashboard",
                targetRoute: "CandidateDashboard"
              })
            }
          />
          <NavItem label="Events" active />
          <NavItem
            label="Prayer"
            active={false}
            onPress={() =>
              onAction?.({
                id: "dashboard",
                label: "Dashboard",
                targetRoute: "CandidateDashboard"
              })
            }
          />
          <NavItem
            label="Choragiew"
            active={false}
            onPress={() =>
              onAction?.({
                id: "dashboard",
                label: "Dashboard",
                targetRoute: "CandidateDashboard"
              })
            }
          />
          <NavItem
            label="Account"
            active={false}
            onPress={() =>
              onAction?.({
                id: "dashboard",
                label: "Dashboard",
                targetRoute: "CandidateDashboard"
              })
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function NavItem({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.navItem}
    >
      <View style={[styles.navIcon, active ? styles.navIconActive : styles.navIconIdle]}>
        <View style={[styles.navIconMark, active ? styles.navIconMarkActive : styles.navIconMarkIdle]} />
      </View>
      <Text style={[styles.navLabel, active ? styles.navLabelActive : styles.navLabelIdle]}>
        {label}
      </Text>
    </Pressable>
  );
}

function MenuIcon() {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.menuIcon}>
      <View style={styles.menuLine} />
      <View style={styles.menuLine} />
      <View style={styles.menuLine} />
    </View>
  );
}

function FilterIcon() {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.filterIcon}>
      <View style={styles.filterLineWide} />
      <View style={styles.filterLineNarrow} />
    </View>
  );
}

function CalendarIcon() {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.calendarIcon}>
      <View style={styles.calendarTop} />
      <View style={styles.calendarBody} />
    </View>
  );
}

function PinIcon() {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.pinIcon}>
      <View style={styles.pinCircle} />
      <View style={styles.pinStem} />
    </View>
  );
}

function StatusDot({ tone }: { tone: "planning" | "needed" | "cancelled" }) {
  return <View style={[styles.statusDot, statusDotStyle[tone]]} />;
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

const statusDotStyle = StyleSheet.create({
  planning: {
    backgroundColor: colors.brand.goldDark
  },
  needed: {
    backgroundColor: colors.brand.taupe
  },
  cancelled: {
    backgroundColor: colors.status.danger
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
  topBar: {
    alignItems: "center",
    backgroundColor: colors.background.app,
    borderBottomColor: colors.border.chrome,
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 56,
    justifyContent: "space-between",
    paddingHorizontal: designTokens.space[6]
  },
  brand: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 21,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: 28,
    marginLeft: designTokens.space[6]
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.text.primary,
    borderColor: colors.border.subtle,
    borderRadius: 15,
    borderWidth: 2,
    height: 30,
    justifyContent: "center",
    width: 30
  },
  avatarText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: designTokens.typography.weight.bold
  },
  scrollContent: {
    paddingBottom: 112
  },
  demoBanner: {
    alignSelf: "flex-start",
    backgroundColor: colors.brand.gold,
    borderRadius: designTokens.radius.pill,
    marginLeft: designTokens.space[8],
    marginTop: designTokens.space[4],
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  demoText: {
    color: colors.text.primary,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.semibold
  },
  hero: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: designTokens.space[4],
    justifyContent: "space-between",
    paddingHorizontal: designTokens.space[8],
    paddingTop: designTokens.space[8],
    paddingBottom: 42
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
  statusDot: {
    borderRadius: 4,
    height: 7,
    width: 7
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
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: designTokens.space[4]
  },
  rsvpText: {
    color: colors.text.inverse,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.semibold
  },
  detailButton: {
    minHeight: 28,
    justifyContent: "center"
  },
  detailText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: designTokens.typography.letterSpacing.compactLabel
  },
  statePanel: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[2],
    marginHorizontal: designTokens.space[8],
    padding: designTokens.space[6]
  },
  stateTitle: {
    color: colors.text.primary,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  stateBody: {
    color: colors.text.muted,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  bottomNav: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderTopColor: colors.border.chrome,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    height: 74,
    justifyContent: "space-around",
    left: 0,
    paddingBottom: designTokens.space[2],
    paddingHorizontal: designTokens.space[2],
    position: "absolute",
    right: 0
  },
  navItem: {
    alignItems: "center",
    flex: 1,
    gap: 3,
    minWidth: 0
  },
  navIcon: {
    alignItems: "center",
    borderRadius: designTokens.radius.md,
    height: 30,
    justifyContent: "center",
    width: 52
  },
  navIconActive: {
    backgroundColor: colors.brand.gold
  },
  navIconIdle: {
    backgroundColor: colors.background.surface
  },
  navIconMark: {
    borderRadius: 4,
    height: 12,
    width: 12
  },
  navIconMarkActive: {
    backgroundColor: colors.text.primary
  },
  navIconMarkIdle: {
    borderColor: colors.brand.brown,
    borderWidth: 2
  },
  navLabel: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 10,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: 1,
    lineHeight: 12
  },
  navLabelActive: {
    color: colors.text.primary
  },
  navLabelIdle: {
    color: colors.brand.brown
  },
  menuIcon: {
    gap: 3,
    width: 18
  },
  menuLine: {
    backgroundColor: colors.text.primary,
    height: 2,
    width: 16
  },
  filterIcon: {
    gap: 3,
    width: 12
  },
  filterLineWide: {
    backgroundColor: colors.text.primary,
    height: 1,
    width: 12
  },
  filterLineNarrow: {
    alignSelf: "center",
    backgroundColor: colors.text.primary,
    height: 1,
    width: 6
  },
  calendarIcon: {
    borderColor: colors.brand.taupe,
    borderRadius: 2,
    borderWidth: 1,
    height: 14,
    overflow: "hidden",
    width: 14
  },
  calendarTop: {
    backgroundColor: colors.brand.taupe,
    height: 3
  },
  calendarBody: {
    flex: 1
  },
  pinIcon: {
    alignItems: "center",
    height: 16,
    justifyContent: "center",
    width: 14
  },
  pinCircle: {
    borderColor: colors.brand.taupe,
    borderRadius: 5,
    borderWidth: 1,
    height: 10,
    width: 10
  },
  pinStem: {
    backgroundColor: colors.brand.taupe,
    height: 5,
    width: 1
  }
});
