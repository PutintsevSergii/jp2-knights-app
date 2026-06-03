import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { CandidateScreenAction } from "../candidate-screen-contracts.js";
import type { CandidateDashboardScreen as CandidateDashboardScreenModel } from "../candidate-screens.js";
import { CandidateBottomNav } from "./shared/CandidateBottomNav.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { MaterialSymbol } from "./shared/MaterialSymbol.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";

export interface CandidateDashboardScreenProps {
  screen: CandidateDashboardScreenModel;
  onNavigate?: (route: CandidateDashboardScreenModel["actions"][number]["targetRoute"]) => void;
}

export function CandidateDashboardScreen({ screen, onNavigate }: CandidateDashboardScreenProps) {
  const nextStep = sectionById(screen, "next-step");
  const assignment = sectionByPrefix(screen, "assignment");
  const officer = sectionById(screen, "responsible-officer");
  const events = sectionsByPrefix(screen, "event-").slice(0, 2);
  const announcements = sectionsByPrefix(screen, "announcement-").slice(0, 1);
  const profileName = candidateName(screen.body);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <MobileTopBar title="JP2 Knights" avatarText={profileName[0] ?? "C"} tone="gold" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {screen.demoChromeVisible ? <DemoModeBanner /> : null}

          {screen.state === "ready" ? (
            <>
              <View style={styles.greetingBlock}>
                <View style={styles.greetingRow}>
                  <Text style={styles.greeting}>Peace, {profileName}</Text>
                  <View style={styles.statusChip}>
                    <Text style={styles.statusChipText}>Candidate</Text>
                  </View>
                </View>
                <Text style={styles.screenLabel}>Candidate Home</Text>
              </View>

              <View style={styles.liturgicalCard}>
                <View style={styles.watermark}>
                  <MaterialSymbol name="church" size={64} color={colors.text.subdued} />
                </View>
                <View style={styles.metaRow}>
                  <MaterialSymbol name="calendar_today" size={20} color={colors.text.subdued} />
                  <Text style={styles.metaText}>October 12</Text>
                </View>
                <Text style={styles.sectionTitle}>Pray with the Church today</Text>
                <Text style={styles.bodyText}>28th Sunday in Ordinary Time</Text>
                <View style={styles.chipRow}>
                  <View style={styles.surfaceChip}>
                    <Text style={styles.surfaceChipText}>Green Vestments</Text>
                  </View>
                  <View style={styles.surfaceChip}>
                    <Text style={styles.surfaceChipText}>Ordinary Time</Text>
                  </View>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Roadmap"
                onPress={() => onNavigate?.("CandidateRoadmap")}
                style={styles.nextStepCard}
              >
                <View style={styles.nextStepShade} />
                <View style={styles.nextHeader}>
                  <Text style={styles.nextTitle}>Next formation step</Text>
                  <View style={styles.nextBadge}>
                    <Text style={styles.nextBadgeText}>In review</Text>
                  </View>
                </View>
                <Text style={styles.nextBody}>{nextStep?.title ?? "Formation path"}</Text>
                <Text style={styles.nextDescription}>{nextStep?.body ?? screen.body}</Text>
                <Text style={styles.nextButton}>Open Roadmap</Text>
              </Pressable>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View all candidate events"
                  onPress={() => onNavigate?.("CandidateEvents")}
                >
                  <Text style={styles.viewAll}>View All</Text>
                </Pressable>
              </View>
              <View style={styles.eventGrid}>
                {events.length > 0 ? (
                  events.map((event, index) => renderEventCard(event, index, onNavigate))
                ) : (
                  <ScreenStatePanel title="Upcoming Events" body="No candidate-visible events yet." />
                )}
              </View>

              <View style={styles.sideStack}>
                <View style={styles.panel}>
                  <Text style={styles.eyebrow}>Assignment</Text>
                  <Text style={styles.cardTitle}>{assignment?.title ?? "Assignment pending"}</Text>
                  <View style={styles.metaRow}>
                    <MaterialSymbol name="map" size={20} color={colors.text.subdued} />
                    <Text style={styles.metaText}>{assignment?.body ?? "Officer review in progress"}</Text>
                  </View>
                  <View style={styles.surfaceChip}>
                    <Text style={styles.surfaceChipText}>Status: Active Candidate</Text>
                  </View>
                </View>

                {officer ? (
                  <View style={styles.officerCard}>
                    <View style={styles.officerIdentity}>
                      <View style={styles.personCircle}>
                        <MaterialSymbol name="person" size={24} color={colors.text.subdued} />
                      </View>
                      <View style={styles.officerCopy}>
                        <Text style={styles.cardTitle}>{officer.title}</Text>
                        <Text style={styles.metaText}>{officer.body}</Text>
                      </View>
                    </View>
                    <View style={styles.mailButton}>
                      <MaterialSymbol name="mail" size={20} />
                    </View>
                  </View>
                ) : null}

                <View style={styles.panel}>
                  <View style={styles.eyebrowRow}>
                    <MaterialSymbol name="campaign" size={16} color={colors.text.subdued} />
                    <Text style={styles.eyebrow}>Announcements</Text>
                  </View>
                  {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                      <View key={announcement.id} style={styles.announcementCard}>
                        <View style={styles.pinRow}>
                          <MaterialSymbol name="push_pin" size={16} />
                          <Text style={styles.pinText}>Pinned</Text>
                        </View>
                        <Text style={styles.bodyText}>{announcement.title}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.bodyText}>No candidate announcements are listed yet.</Text>
                  )}
                </View>

                <View style={styles.quickGrid}>
                  {quickActions().map((action) => (
                    <Pressable
                      key={action.id}
                      accessibilityRole="button"
                      accessibilityLabel={action.label}
                      onPress={() => onNavigate?.(action.targetRoute)}
                      style={styles.quickCard}
                    >
                      <MaterialSymbol name={action.icon} size={24} />
                      <Text style={styles.quickLabel}>{action.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <ScreenStatePanel title={screen.title} body={screen.body} />
          )}
        </ScrollView>

        <CandidateBottomNav active="dashboard" onAction={(action) => onNavigate?.(action.targetRoute)} />
      </View>
    </SafeAreaView>
  );
}

function renderEventCard(
  section: CandidateDashboardScreenModel["sections"][number],
  index: number,
  onNavigate: CandidateDashboardScreenProps["onNavigate"]
) {
  const detail = eventDetails(section.body);

  return (
    <Pressable
      key={section.id}
      accessibilityRole="button"
      accessibilityLabel={section.title}
      onPress={() => onNavigate?.("CandidateEvents")}
      style={styles.eventCard}
    >
      <View style={styles.eventTop}>
        <Text style={styles.eventDate}>{detail.date || (index === 0 ? "Oct 15" : "Oct 20")}</Text>
        <View style={index === 0 ? styles.planningBadge : styles.noResponseBadge}>
          <Text style={index === 0 ? styles.planningBadgeText : styles.noResponseBadgeText}>
            {index === 0 ? "Planning" : "No response"}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{section.title}</Text>
      <View style={styles.metaRow}>
        <MaterialSymbol name="location_on" size={18} color={colors.text.subdued} />
        <Text style={styles.metaText}>{detail.location || "TBD"}</Text>
      </View>
    </Pressable>
  );
}

function sectionById(screen: CandidateDashboardScreenModel, id: string) {
  return screen.sections.find((section) => section.id === id);
}

function sectionByPrefix(screen: CandidateDashboardScreenModel, prefix: string) {
  return screen.sections.find((section) => section.id.startsWith(prefix));
}

function sectionsByPrefix(screen: CandidateDashboardScreenModel, prefix: string) {
  return screen.sections.filter((section) => section.id.startsWith(prefix));
}

function candidateName(body: string): string {
  return body.split(" - ")[0] || "Candidate";
}

function eventDetails(body: string): { date: string; location: string } {
  const [date = "", location = ""] = body.split(" - ");

  return { date, location };
}

function quickActions(): Array<{ id: string; label: string; targetRoute: CandidateScreenAction["targetRoute"]; icon: string }> {
  return [
    { id: "roadmap", label: "Roadmap", targetRoute: "CandidateRoadmap", icon: "map" },
    { id: "events", label: "Events", targetRoute: "CandidateEvents", icon: "event" },
    { id: "contact", label: "Contact", targetRoute: "CandidateContact", icon: "contacts" },
    {
      id: "announcements",
      label: "News",
      targetRoute: "CandidateAnnouncements",
      icon: "campaign"
    }
  ];
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
  greetingRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[2]
  },
  greeting: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.screenTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.screenTitle
  },
  statusChip: {
    backgroundColor: colors.brand.linen,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  statusChipText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  screenLabel: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  liturgicalCard: {
    backgroundColor: colors.brand.linen,
    borderColor: colors.border.soft,
    borderRadius: 20,
    borderWidth: 1,
    gap: designTokens.space[3],
    overflow: "hidden",
    padding: designTokens.space[6]
  },
  watermark: {
    opacity: 0.12,
    position: "absolute",
    right: designTokens.space[4],
    top: designTokens.space[4]
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  metaText: {
    color: colors.text.subdued,
    flexShrink: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  bodyText: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[2]
  },
  surfaceChip: {
    alignSelf: "flex-start",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  surfaceChipText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  nextStepCard: {
    backgroundColor: colors.brand.gold,
    borderRadius: 20,
    gap: designTokens.space[3],
    overflow: "hidden",
    padding: designTokens.space[6]
  },
  nextStepShade: {
    backgroundColor: colors.text.primary,
    bottom: 0,
    left: 0,
    opacity: 0.08,
    position: "absolute",
    right: 0,
    top: 0
  },
  nextHeader: {
    flexDirection: "row",
    gap: designTokens.space[3],
    justifyContent: "space-between"
  },
  nextTitle: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  nextBadge: {
    backgroundColor: colors.background.surface,
    borderRadius: designTokens.radius.pill,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  nextBadgeText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  nextBody: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  nextDescription: {
    color: colors.brand.goldDeep,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  nextButton: {
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
    paddingVertical: designTokens.space[3],
    textTransform: "uppercase"
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  viewAll: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  eventGrid: {
    gap: designTokens.space[3]
  },
  eventCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[4]
  },
  eventTop: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: designTokens.space[3]
  },
  eventDate: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  planningBadge: {
    backgroundColor: colors.action.secondary,
    borderRadius: designTokens.radius.sm,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  planningBadgeText: {
    color: colors.text.inverse,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  noResponseBadge: {
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.sm,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  noResponseBadgeText: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  sideStack: {
    gap: designTokens.space[4]
  },
  panel: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[4]
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
  officerCard: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: designTokens.space[4]
  },
  officerIdentity: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: designTokens.space[3]
  },
  personCircle: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.pill,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  officerCopy: {
    flex: 1
  },
  mailButton: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  eyebrowRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[1]
  },
  announcementCard: {
    backgroundColor: colors.brand.linen,
    borderLeftColor: colors.brand.gold,
    borderLeftWidth: 4,
    borderRadius: designTokens.radius.lg,
    gap: designTokens.space[1],
    padding: designTokens.space[3]
  },
  pinRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[1]
  },
  pinText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[2]
  },
  quickCard: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    gap: designTokens.space[2],
    padding: designTokens.space[4]
  },
  quickLabel: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  }
});
