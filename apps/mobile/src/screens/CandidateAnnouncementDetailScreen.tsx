import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { CandidateAnnouncementDetailScreen as CandidateAnnouncementDetailScreenModel } from "../candidate-screens.js";
import type { CandidateScreenAction } from "../candidate-screen-contracts.js";
import { CandidateBottomNav } from "./shared/CandidateBottomNav.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { MegaphoneIcon } from "./shared/MegaphoneIcon.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";

export interface CandidateAnnouncementDetailScreenProps {
  screen: CandidateAnnouncementDetailScreenModel;
  onAction?: (action: CandidateScreenAction) => void;
}

export function CandidateAnnouncementDetailScreen({
  screen,
  onAction
}: CandidateAnnouncementDetailScreenProps) {
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

          {screen.state === "ready" ? (
            <View style={[styles.detailCard, screen.pinned ? styles.pinnedCard : null]}>
              <View style={styles.headerRow}>
                <View style={styles.iconWrap}>
                  <MegaphoneIcon emphasized={screen.pinned} />
                </View>
                <View style={styles.titleGroup}>
                  <Text style={styles.eyebrow}>
                    {screen.pinned ? "Pinned announcement" : "Announcement"}
                  </Text>
                  <Text style={styles.title}>{screen.title}</Text>
                  {screen.publishedLabel ? (
                    <Text style={styles.date}>{screen.publishedLabel}</Text>
                  ) : null}
                </View>
              </View>

              <Text style={styles.body}>{screen.body}</Text>
              <Text style={styles.privacyText}>One-way announcement</Text>

              <View style={styles.actionRow}>
                {screen.actions.map((action) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    key={action.id}
                    onPress={() => onAction?.(action)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionButtonText}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.statePanelOffset}>
              <ScreenStatePanel title={screen.title} body={screen.body} />
            </View>
          )}
        </ScrollView>

        <CandidateBottomNav
          active="announcements"
          onAction={onAction}
          secondaryItem="announcements"
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
  detailCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
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
  pinnedCard: {
    borderLeftColor: colors.status.danger,
    borderLeftWidth: 4
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[4]
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderRadius: designTokens.radius.md,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  titleGroup: {
    flex: 1,
    gap: designTokens.space[1]
  },
  eyebrow: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: 0,
    lineHeight: designTokens.typography.lineHeight.label
  },
  title: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.screenTitle,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: 0,
    lineHeight: designTokens.typography.lineHeight.screenTitle
  },
  date: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.medium,
    lineHeight: designTokens.typography.lineHeight.label
  },
  body: {
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
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[3]
  },
  actionButton: {
    backgroundColor: colors.action.secondary,
    borderRadius: designTokens.radius.sm,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[2]
  },
  actionButtonText: {
    color: colors.action.secondaryText,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: 0,
    lineHeight: designTokens.typography.lineHeight.label
  },
  statePanelOffset: {
    paddingTop: designTokens.space[8]
  }
});
