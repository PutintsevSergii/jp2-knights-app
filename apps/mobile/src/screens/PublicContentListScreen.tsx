import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type {
  PublicContentListScreen as PublicContentListScreenModel,
  PublicScreenSection
} from "../public-screens.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
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
  screen: PublicContentListScreenModel,
  onNavigate: PublicContentListScreenProps["onNavigate"]
) {
  const eventSections = screen.sections.filter((section) => section.id.startsWith("event-"));

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
          {eventSections.map((section) => (
            <View key={section.id}>{renderEventCard(section, screen, onNavigate)}</View>
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
  section: PublicScreenSection,
  screen: PublicContentListScreenModel,
  onNavigate: PublicContentListScreenProps["onNavigate"]
) {
  const action = actionForSection(screen, section, "PublicEventDetail");
  const parts = section.body.split(" - ");
  const date = parts[0] ?? section.body;
  const location = parts.slice(1).join(" - ") || "Public location";

  return (
    <View style={styles.eventCard}>
      <View style={styles.badgeRow}>
        <View style={styles.blueBadge}>
          <Text style={styles.blueBadgeText}>Family Open</Text>
        </View>
        <Text style={styles.eventKind}>Prayer</Text>
      </View>
      <Text style={styles.cardTitle}>{section.title}</Text>
      <Text style={styles.eventMeta}>□ {date}</Text>
      <Text style={styles.eventMeta}>⌖ {location}</Text>
      <Pressable
        accessibilityLabel={action?.label ?? `View ${section.title}`}
        accessibilityRole="button"
        onPress={() => (action ? onNavigate?.(action.targetRoute, action.targetId) : undefined)}
        style={styles.detailsButton}
      >
        <Text style={styles.detailsButtonText}>View Details ›</Text>
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
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    gap: designTokens.space[2],
    padding: designTokens.space[4]
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
  badgeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  blueBadge: {
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.sm,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  blueBadgeText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  eventKind: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  eventMeta: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  detailsButton: {
    alignItems: "center",
    borderColor: colors.text.primary,
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    marginTop: designTokens.space[2],
    paddingVertical: designTokens.space[3]
  },
  detailsButtonText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.button
  }
});
