import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { BrotherScreenAction } from "../brother-screen-contracts.js";
import type { BrotherTodayScreen as BrotherTodayScreenModel } from "../brother-screens.js";
import { BrotherBottomNav } from "./shared/BrotherBottomNav.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { MaterialSymbol } from "./shared/MaterialSymbol.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";

export interface BrotherTodayScreenProps {
  screen: BrotherTodayScreenModel;
  onAction?: (action: BrotherScreenAction) => void;
}

export function BrotherTodayScreen({ screen, onAction }: BrotherTodayScreenProps) {
  const roadmapAction = screen.quickActions.find((action) => action.targetRoute === "BrotherRoadmap");
  const prayerAction = screen.quickActions.find((action) => action.targetRoute === "BrotherPrayers");
  const event = screen.upcomingEventCards[0];
  const liturgicalChips = screen.today
    ? [
        screen.today.liturgicalDay.color,
        screen.today.liturgicalDay.season,
        screen.today.liturgicalDay.rank
      ].filter(isChipValue)
    : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <MobileTopBar
          title="JP2 Knights"
          avatarText={screen.profileSummary?.initials ?? "JP"}
          tone="gold"
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {screen.demoChromeVisible ? <DemoModeBanner /> : null}

          {screen.state === "ready" && screen.profileSummary && screen.today ? (
            <>
              <View style={styles.greetingBlock}>
                <Text style={styles.greeting}>Peace, {firstName(screen.profileSummary.displayName)}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{screen.profileSummary.currentDegreeLabel}</Text>
                  </View>
                  <View style={styles.secondaryBadge}>
                    <Text style={styles.secondaryBadgeText}>
                      {screen.profileSummary.organizationUnitLabel}
                    </Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Life Member</Text>
                  </View>
                </View>
              </View>

              <View style={styles.twoColumnStack}>
                <View style={styles.liturgicalCard}>
                  <View style={styles.watermark}>
                    <MaterialSymbol name="church" size={72} color={colors.text.subdued} fill />
                  </View>
                  <View style={styles.metaRow}>
                    <MaterialSymbol name="calendar_today" size={20} color={colors.text.subdued} />
                    <Text style={styles.metaText}>{screen.today.civilDate.displayLabel}</Text>
                  </View>
                  {liturgicalChips.length > 0 ? (
                    <View style={styles.badgeRow}>
                      {liturgicalChips.map((chip) => (
                        <View key={chip} style={styles.surfaceChip}>
                          <Text style={styles.surfaceChipText}>{chip}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  <View style={styles.rule} />
                  <Text style={styles.prayerCue}>{screen.today.liturgicalDay.name}</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Join Silent Prayer"
                  onPress={() =>
                    onAction?.({
                      id: "join-silent-prayer",
                      label: "Join Silent Prayer",
                      targetRoute: "SilentPrayer"
                    })
                  }
                  style={styles.focusCard}
                >
                  <View style={styles.focusIconRow}>
                    <View style={styles.focusIcon}>
                      <MaterialSymbol name="front_hand" size={16} color={colors.brand.goldDark} fill />
                    </View>
                    <Text style={styles.focusTitle}>Today's Focus</Text>
                  </View>
                  <Text style={styles.focusBody}>Brothers are currently praying for the sick.</Text>
                  <Text style={styles.focusButton}>Join Silent Prayer</Text>
                </Pressable>
              </View>

              <View style={styles.twoColumnStack}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={roadmapAction?.label ?? "Open Roadmap"}
                  onPress={() =>
                    roadmapAction ? onAction?.(screenAction(roadmapAction)) : undefined
                  }
                  style={styles.panel}
                >
                  <View style={styles.panelHeader}>
                    <View style={styles.panelTitleRow}>
                      <MaterialSymbol name="route" size={22} />
                      <Text style={styles.panelTitle}>Roadmap: Discipleship</Text>
                    </View>
                    <Text style={styles.progressText}>60%</Text>
                  </View>
                  <Text style={styles.eyebrow}>Next Module</Text>
                  <Text style={styles.cardTitle}>Theological Virtues</Text>
                  <View style={styles.progressTrack}>
                    <View style={styles.progressFill} />
                  </View>
                  <Text style={styles.outlineButton}>Open Roadmap</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={prayerAction?.label ?? "Read Prayer"}
                  onPress={() => (prayerAction ? onAction?.(screenAction(prayerAction)) : undefined)}
                  style={styles.panel}
                >
                  <View style={styles.panelTitleRow}>
                    <MaterialSymbol name="auto_stories" size={22} />
                    <Text style={styles.panelTitle}>Salve Regina</Text>
                  </View>
                  <Text style={styles.italicBody}>
                    Hail, holy Queen, Mother of Mercy, our life, our sweetness and our hope...
                  </Text>
                  <Text style={styles.primarySmallButton}>Read Prayer</Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Join active silent prayer"
                onPress={() =>
                  onAction?.({
                    id: "join-silent-prayer",
                    label: "Join",
                    targetRoute: "SilentPrayer"
                  })
                }
                style={styles.silentPrayerBanner}
              >
                <View style={styles.silentCopy}>
                  <View style={styles.liveIcon}>
                    <MaterialSymbol name="group" size={22} fill />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Vocations Intention</Text>
                    <Text style={styles.liveText}>24 praying now</Text>
                  </View>
                </View>
                <Text style={styles.inlineAction}>Join ›</Text>
              </Pressable>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Community Board</Text>
                <View style={styles.twoColumnStack}>
                  {event ? renderEventCard(event, onAction) : (
                    <ScreenStatePanel title="Events" body="No brother-visible events are listed yet." />
                  )}
                  <View style={styles.announcementCard}>
                    <View style={styles.announcementHeader}>
                      <MaterialSymbol name="campaign" size={20} color={colors.status.danger} fill />
                      <Text style={styles.announcementLabel}>Announcement</Text>
                    </View>
                    <Text style={styles.cardTitle}>New Chapter Elections approaching</Text>
                    <Text style={styles.inlineAction}>Read Details ›</Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickRow}>
                  {screen.quickActions.slice(0, 5).map((action) => (
                    <Pressable
                      key={action.id}
                      accessibilityRole="button"
                      accessibilityLabel={action.label}
                      onPress={() => onAction?.(screenAction(action))}
                      style={styles.quickAction}
                    >
                      <View style={styles.quickIcon}>
                        <MaterialSymbol name={quickActionSymbol(action.targetRoute)} size={24} />
                      </View>
                      <Text style={styles.quickLabel}>{shortQuickLabel(action.label)}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <ScreenStatePanel title={screen.title} body={screen.body} />
          )}
        </ScrollView>

        <BrotherBottomNav active="dashboard" onAction={onAction} />
      </View>
    </SafeAreaView>
  );
}

function renderEventCard(
  event: BrotherTodayScreenModel["upcomingEventCards"][number],
  onAction: BrotherTodayScreenProps["onAction"]
) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={event.detailAction.label}
      onPress={() => onAction?.(event.detailAction)}
      style={styles.eventCard}
    >
      <View style={styles.eventTop}>
        <View style={styles.metaRow}>
          <MaterialSymbol name="event" size={18} />
          <Text style={styles.eventDate}>{event.dateMonth} {event.dateDay}, {event.timeLabel}</Text>
        </View>
        <View style={styles.badgeRow}>
          <View style={styles.surfaceChip}>
            <Text style={styles.surfaceChipText}>{event.typeLabel}</Text>
          </View>
          <View style={styles.secondaryBadge}>
            <Text style={styles.secondaryBadgeText}>Planning</Text>
          </View>
        </View>
      </View>
      <Text style={styles.cardTitle}>{event.title}</Text>
      <View style={styles.metaRow}>
        <MaterialSymbol name="location_on" size={18} color={colors.text.subdued} />
        <Text style={styles.metaText}>{event.locationLabel}</Text>
      </View>
    </Pressable>
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

function firstName(displayName: string): string {
  return displayName.split(/\s+/)[0] || "Brother";
}

function quickActionSymbol(route: BrotherScreenAction["targetRoute"]): string {
  if (route === "BrotherProfile") return "person";
  if (route === "MyOrganizationUnits") return "flag";
  if (route === "BrotherPrayers") return "auto_stories";
  if (route === "BrotherEvents") return "calendar_month";
  if (route === "BrotherRoadmap") return "route";

  return "campaign";
}

function shortQuickLabel(label: string): string {
  if (label.includes("Chor")) return "Choragiew";
  if (label.includes("Prayer")) return "Prayers";
  if (label.includes("Roadmap")) return "Roadmap";
  if (label.includes("Event")) return "Events";
  if (label.includes("Profile")) return "Profile";

  return label;
}

function isChipValue(value: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
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
  content: {
    gap: designTokens.space[4],
    padding: designTokens.space[4],
    paddingBottom: 112
  },
  greetingBlock: {
    gap: designTokens.space[2]
  },
  greeting: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.screenTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.screenTitle
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[2]
  },
  badge: {
    backgroundColor: colors.brand.linen,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  badgeText: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  secondaryBadge: {
    backgroundColor: colors.action.secondary,
    borderRadius: designTokens.radius.pill,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  secondaryBadgeText: {
    color: colors.text.inverse,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  twoColumnStack: {
    gap: designTokens.space[3]
  },
  liturgicalCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    gap: designTokens.space[3],
    overflow: "hidden",
    padding: designTokens.space[4]
  },
  watermark: {
    opacity: 0.1,
    position: "absolute",
    right: designTokens.space[4],
    top: designTokens.space[4]
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[1]
  },
  metaText: {
    color: colors.text.subdued,
    flexShrink: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  surfaceChip: {
    alignSelf: "flex-start",
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.sm,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  surfaceChipText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  rule: {
    backgroundColor: colors.border.soft,
    height: 1
  },
  prayerCue: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontStyle: "italic",
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  focusCard: {
    backgroundColor: colors.brand.gold,
    borderRadius: 20,
    gap: designTokens.space[3],
    overflow: "hidden",
    padding: designTokens.space[6]
  },
  focusIconRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  focusIcon: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderRadius: designTokens.radius.pill,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  focusTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  focusBody: {
    color: colors.brand.goldDeep,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  focusButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.background.surface,
    borderRadius: designTokens.radius.pill,
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    overflow: "hidden",
    paddingHorizontal: designTokens.space[6],
    paddingVertical: designTokens.space[2],
    textTransform: "uppercase"
  },
  panel: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[4]
  },
  panelHeader: {
    borderBottomColor: colors.border.soft,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: designTokens.space[3],
    justifyContent: "space-between",
    paddingBottom: designTokens.space[2]
  },
  panelTitleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  panelTitle: {
    color: colors.text.primary,
    flexShrink: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  progressText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  eyebrow: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  cardTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  progressTrack: {
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.pill,
    height: 6
  },
  progressFill: {
    backgroundColor: colors.brand.gold,
    borderRadius: designTokens.radius.pill,
    height: 6,
    width: "60%"
  },
  outlineButton: {
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    overflow: "hidden",
    paddingVertical: designTokens.space[2],
    textAlign: "center",
    textTransform: "uppercase"
  },
  italicBody: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontStyle: "italic",
    lineHeight: designTokens.typography.lineHeight.body
  },
  primarySmallButton: {
    backgroundColor: colors.brand.gold,
    borderRadius: designTokens.radius.pill,
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    overflow: "hidden",
    paddingVertical: designTokens.space[2],
    textAlign: "center",
    textTransform: "uppercase"
  },
  silentPrayerBanner: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: designTokens.space[4]
  },
  silentCopy: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: designTokens.space[3]
  },
  liveIcon: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.pill,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  liveText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  inlineAction: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  sectionBlock: {
    gap: designTokens.space[3]
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  eventCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: designTokens.space[3],
    overflow: "hidden",
    padding: designTokens.space[4]
  },
  eventTop: {
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.lg,
    gap: designTokens.space[2],
    padding: designTokens.space[3]
  },
  eventDate: {
    color: colors.brand.goldDark,
    flexShrink: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  announcementCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: designTokens.space[2],
    padding: designTokens.space[4]
  },
  announcementHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  announcementLabel: {
    color: colors.status.danger,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[3]
  },
  quickAction: {
    alignItems: "center",
    gap: designTokens.space[2],
    minWidth: 70
  },
  quickIcon: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56
  },
  quickLabel: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textAlign: "center"
  }
});
