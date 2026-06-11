import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type {
  PublicContentListScreen as PublicContentListScreenModel,
  PublicEventsListScreen as PublicEventsListScreenModel,
  PublicScreenSection
} from "../public-screens.js";
import { CalendarIcon } from "./shared/CalendarIcon.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { EventStatusBadge } from "./shared/EventStatusBadge.js";
import { PinIcon } from "./shared/PinIcon.js";
import { PublicScreenTopBar } from "./shared/PublicScreenTopBar.js";

export interface PublicContentListScreenProps {
  screen: PublicContentListScreenModel;
  onNavigate?: (
    route: PublicContentListScreenModel["actions"][number]["targetRoute"],
    targetId: PublicContentListScreenModel["actions"][number]["targetId"]
  ) => void;
}

export function PublicContentListScreen({ screen, onNavigate }: PublicContentListScreenProps) {
  if (screen.route === "PublicEventsList") {
    return renderPublicEventsList(screen, onNavigate);
  }

  return renderPrayerLibrary(screen, onNavigate);
}

function renderPrayerLibrary(
  screen: PublicContentListScreenModel,
  onNavigate: PublicContentListScreenProps["onNavigate"]
) {
  const categorySections = screen.sections.filter((section) => section.id.startsWith("category-"));
  const prayerSections = screen.sections.filter((section) => section.id.startsWith("prayer-"));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <PublicScreenTopBar title="Prayer Library" onBack={() => onNavigate?.("PublicHome", undefined)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {screen.demoChromeVisible ? <DemoModeBanner /> : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <View style={[styles.chip, styles.chipActive]}>
            <Text style={styles.chipActiveText}>All</Text>
          </View>
          {categorySections.map((section) => (
            <View key={section.id} style={styles.chip}>
              <Text style={styles.chipText}>{section.title}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.cardStack}>
          {prayerSections.map((section) => (
            <View key={section.id}>{renderPrayerCard(section, screen, onNavigate)}</View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function renderPublicEventsList(
  screen: PublicEventsListScreenModel,
  onNavigate: PublicContentListScreenProps["onNavigate"]
) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <PublicScreenTopBar title="Public Events" onBack={() => onNavigate?.("PublicHome", undefined)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {screen.demoChromeVisible ? <DemoModeBanner /> : null}

        <Text style={styles.eventsIntro}>
          Discover upcoming gatherings open to families and the wider community. Join us in our
          ongoing commitment to faith and fellowship.
        </Text>

        <View style={styles.cardStack}>
          {screen.eventCards.map((event) => (
            <View key={event.id}>{renderEventCard(event, onNavigate)}</View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function renderPrayerCard(
  section: PublicScreenSection,
  screen: PublicContentListScreenModel,
  onNavigate: PublicContentListScreenProps["onNavigate"]
) {
  const action = actionForSection(screen, section, "PublicPrayerDetail");

  return (
    <View style={styles.prayerCard}>
      <View style={styles.cardTitleRow}>
        <Text style={styles.cardTitle}>{section.title}</Text>
        <View style={styles.smallBadge}>
          <Text style={styles.smallBadgeText}>Devotional</Text>
        </View>
      </View>
      <Text style={styles.cardBody}>{section.body}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.metaText}>Latin/English</Text>
        <Pressable
          accessibilityLabel={action?.label ?? `Read ${section.title}`}
          accessibilityRole="button"
          onPress={() =>
            action ? onNavigate?.(action.targetRoute, action.targetId) : undefined
          }
          style={styles.readButton}
        >
          <Text style={styles.readButtonText}>Read →</Text>
        </Pressable>
      </View>
    </View>
  );
}

function renderEventCard(
  event: PublicEventsListScreenModel["eventCards"][number],
  onNavigate: PublicContentListScreenProps["onNavigate"]
) {
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventCardHeader}>
        <Text style={styles.eventCardTitle}>{event.title}</Text>
        <EventStatusBadge label={event.statusLabel} tone="needed" style={styles.publicEventBadge} />
      </View>
      <Text style={styles.eventKind}>{event.typeLabel}</Text>
      <View style={styles.eventMetaRow}>
        <CalendarIcon />
        <Text style={styles.eventMeta}>{event.dateLabel}</Text>
      </View>
      <View style={styles.eventMetaRow}>
        <PinIcon />
        <Text style={styles.eventMeta}>{event.locationLabel}</Text>
      </View>
      <View style={styles.eventDivider} />
      <Pressable
        accessibilityLabel={event.detailAction.label}
        accessibilityRole="button"
        onPress={() => onNavigate?.(event.detailAction.targetRoute, event.detailAction.targetId)}
        style={styles.detailsButton}
      >
        <Text style={styles.detailsButtonText}>{event.detailAction.label}</Text>
      </Pressable>
    </View>
  );
}

function actionForSection(
  screen: PublicContentListScreenModel,
  section: PublicScreenSection,
  targetRoute: "PublicPrayerDetail" | "PublicEventDetail"
) {
  const targetId = section.id.replace(/^prayer-|^event-/, "");

  return (
    screen.actions.find(
      (action) => action.targetRoute === targetRoute && action.targetId === targetId
    ) ?? screen.actions.find((action) => action.targetRoute === targetRoute)
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  listContent: {
    gap: designTokens.space[4],
    padding: designTokens.space[4],
    paddingBottom: 112
  },
  chipRow: {
    gap: designTokens.space[2],
    paddingRight: designTokens.space[4]
  },
  chip: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    paddingHorizontal: designTokens.space[4],
    paddingVertical: designTokens.space[2]
  },
  chipActive: {
    backgroundColor: colors.brand.gold
  },
  chipText: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  chipActiveText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  cardStack: {
    gap: designTokens.space[4]
  },
  prayerCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[4]
  },
  eventCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderLeftColor: colors.brand.gold,
    borderLeftWidth: 4,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[4],
    padding: designTokens.space[4],
    shadowColor: designTokens.elevation.subtle.color,
    shadowOffset: {
      width: designTokens.elevation.subtle.offsetX,
      height: designTokens.elevation.subtle.offsetY
    },
    shadowOpacity: designTokens.elevation.subtle.opacity,
    shadowRadius: designTokens.elevation.subtle.radius
  },
  cardTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2],
    justifyContent: "space-between"
  },
  cardTitle: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.body
  },
  cardBody: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  metaText: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  smallBadge: {
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  smallBadgeText: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  readButton: {
    backgroundColor: colors.brand.gold,
    borderRadius: designTokens.radius.sm,
    paddingHorizontal: designTokens.space[4],
    paddingVertical: designTokens.space[2]
  },
  readButtonText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  eventsIntro: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  eventCardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: designTokens.space[3],
    justifyContent: "space-between"
  },
  eventCardTitle: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  publicEventBadge: {
    maxWidth: 112
  },
  eventKind: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  eventMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  eventMeta: {
    color: colors.brand.brown,
    flex: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  eventDivider: {
    backgroundColor: colors.border.soft,
    height: 1
  },
  detailsButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    borderColor: colors.brand.goldDark,
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    minHeight: 28,
    paddingHorizontal: designTokens.space[4],
    paddingVertical: designTokens.space[2]
  },
  detailsButtonText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.button
  }
});
