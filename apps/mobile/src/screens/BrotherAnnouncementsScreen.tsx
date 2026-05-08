import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { BrotherAnnouncementsScreen as BrotherAnnouncementsScreenModel } from "../brother-screens.js";
import type { BrotherScreenAction } from "../brother-screen-contracts.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { MegaphoneIcon } from "./shared/MegaphoneIcon.js";
import { MobileBottomNav } from "./shared/MobileBottomNav.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";

export interface BrotherAnnouncementsScreenProps {
  screen: BrotherAnnouncementsScreenModel;
  onAction?: (action: BrotherScreenAction) => void;
}

export function BrotherAnnouncementsScreen({
  screen,
  onAction
}: BrotherAnnouncementsScreenProps) {
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
            <View style={styles.heroIcon}>
              <MegaphoneIcon emphasized={screen.announcementCards.some((card) => card.pinned)} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.title}>{screen.title}</Text>
              <Text style={styles.subtitle}>{screen.body}</Text>
            </View>
          </View>

          {screen.state === "ready" ? (
            <View style={styles.cardStack}>
              {screen.announcementCards.map((announcement) => (
                <View
                  key={announcement.id}
                  style={[styles.card, announcement.pinned ? styles.pinnedCard : null]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <MegaphoneIcon emphasized={announcement.pinned} />
                    </View>
                    <View style={styles.cardTitleGroup}>
                      <Text style={styles.cardTitle}>{announcement.title}</Text>
                      <Text style={styles.cardDate}>{announcement.publishedLabel}</Text>
                    </View>
                    {announcement.pinned ? (
                      <View style={styles.pinBadge}>
                        <Text style={styles.pinBadgeText}>Pinned</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.cardBody}>{announcement.body}</Text>
                  <Text style={styles.privacyText}>One-way announcement</Text>
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
              id: "announcements",
              label: "News",
              active: true
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
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[4]
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  heroCopy: {
    flex: 1,
    gap: designTokens.space[1]
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
  cardStack: {
    gap: designTokens.space[4]
  },
  card: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[6],
    shadowColor: designTokens.elevation.subtle.color,
    shadowOffset: {
      width: designTokens.elevation.subtle.offsetX,
      height: designTokens.elevation.subtle.offsetY
    },
    shadowOpacity: designTokens.elevation.subtle.opacity,
    shadowRadius: designTokens.elevation.subtle.radius
  },
  pinnedCard: {
    borderLeftColor: colors.status.danger,
    borderLeftWidth: 4
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[3]
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.sm,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  cardTitleGroup: {
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
  cardDate: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.medium,
    lineHeight: designTokens.typography.lineHeight.label
  },
  pinBadge: {
    backgroundColor: colors.brand.gold,
    borderRadius: designTokens.radius.sm,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  pinBadgeText: {
    color: colors.brand.goldDeep,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: 0,
    lineHeight: designTokens.typography.lineHeight.label
  },
  cardBody: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.regular,
    lineHeight: designTokens.typography.lineHeight.body
  },
  privacyText: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.medium,
    lineHeight: designTokens.typography.lineHeight.label
  },
  statePanelOffset: {
    paddingTop: designTokens.space[8]
  }
});
