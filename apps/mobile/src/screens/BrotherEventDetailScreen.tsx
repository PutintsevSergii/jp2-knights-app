import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { BrotherEventDetailScreen as BrotherEventDetailScreenModel } from "../brother-screens.js";
import type { BrotherScreenAction } from "../brother-screen-contracts.js";
import { CalendarIcon } from "./shared/CalendarIcon.js";
import { ClockIcon } from "./shared/ClockIcon.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { MobileBottomNav } from "./shared/MobileBottomNav.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { PinIcon } from "./shared/PinIcon.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";
import { StatusDot } from "./shared/StatusDot.js";

export interface BrotherEventDetailScreenProps {
  screen: BrotherEventDetailScreenModel;
  onAction?: (action: BrotherScreenAction) => void;
}

export function BrotherEventDetailScreen({
  screen,
  onAction
}: BrotherEventDetailScreenProps) {
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

          {screen.state === "ready" ? (
            <>
              <View style={styles.hero}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{screen.typeLabel}</Text>
                </View>
                <Text style={styles.title}>{screen.title}</Text>
                <View style={[styles.statusBadge, statusBadgeStyle[screen.statusTone]]}>
                  <StatusDot tone={screen.statusTone} />
                  <Text style={[styles.statusText, statusTextStyle[screen.statusTone]]}>
                    {screen.statusLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaCard}>
                  <CalendarIcon emphasized />
                  <View style={styles.metaCopy}>
                    <Text style={styles.metaLabel}>Date</Text>
                    <Text style={styles.metaText}>{screen.dateLabel}</Text>
                  </View>
                </View>
                <View style={styles.metaCard}>
                  <ClockIcon />
                  <View style={styles.metaCopy}>
                    <Text style={styles.metaLabel}>Time</Text>
                    <Text style={styles.metaText}>{screen.timeLabel}</Text>
                  </View>
                </View>
                <View style={styles.metaCard}>
                  <PinIcon tone="brown" />
                  <View style={styles.metaCopy}>
                    <Text style={styles.metaLabel}>Location</Text>
                    <Text style={styles.metaText}>{screen.locationLabel}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.descriptionCard}>
                <Text style={styles.sectionTitle}>Details</Text>
                <Text style={styles.descriptionText}>{screen.description}</Text>
                <Text style={styles.privacyText}>No attendee list shown</Text>
              </View>

              <View style={styles.actionRow}>
                {screen.backAction ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={screen.backAction.label}
                    onPress={() => onAction?.(screen.backAction!)}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>{screen.backAction.label}</Text>
                  </Pressable>
                ) : null}
                {screen.primaryAction ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={screen.primaryAction.label}
                    onPress={() => onAction?.(screen.primaryAction!)}
                    style={[
                      styles.primaryButton,
                      screen.primaryAction.id === "cancel-participation"
                        ? styles.cancelButton
                        : null
                    ]}
                  >
                    <Text style={styles.primaryButtonText}>{screen.primaryAction.label}</Text>
                  </Pressable>
                ) : null}
              </View>
            </>
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
              active: true,
              onPress: () => {
                if (screen.backAction) {
                  onAction?.(screen.backAction);
                }
              }
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

const colors = designTokens.color;

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
    gap: designTokens.space[6],
    paddingBottom: 112,
    paddingHorizontal: designTokens.space[8],
    paddingTop: designTokens.space[8]
  },
  bannerOffset: {
    alignSelf: "flex-start"
  },
  hero: {
    gap: designTokens.space[3]
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  typeBadgeText: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.medium,
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
  statusBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: designTokens.radius.sm,
    flexDirection: "row",
    gap: designTokens.space[1],
    minHeight: 28,
    paddingHorizontal: designTokens.space[2],
    paddingVertical: designTokens.space[1]
  },
  statusText: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: 10,
    fontWeight: designTokens.typography.weight.medium,
    letterSpacing: 0,
    lineHeight: 11,
    textTransform: "uppercase"
  },
  metaGrid: {
    gap: designTokens.space[3]
  },
  metaCard: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: designTokens.space[3],
    minHeight: 74,
    padding: designTokens.space[4]
  },
  metaCopy: {
    flex: 1,
    gap: designTokens.space[1]
  },
  metaLabel: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.medium,
    lineHeight: designTokens.typography.lineHeight.label
  },
  metaText: {
    color: colors.text.primary,
    flexShrink: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.regular,
    lineHeight: designTokens.typography.lineHeight.body
  },
  descriptionCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[2],
    padding: designTokens.space[6]
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  descriptionText: {
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
    gap: designTokens.space[3]
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.action.primary,
    borderRadius: designTokens.radius.md,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: designTokens.space[4]
  },
  cancelButton: {
    backgroundColor: colors.status.danger
  },
  primaryButtonText: {
    color: colors.action.primaryText,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.button
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: designTokens.space[4]
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.medium,
    lineHeight: designTokens.typography.lineHeight.button
  },
  statePanelOffset: {
    paddingTop: designTokens.space[8]
  }
});
