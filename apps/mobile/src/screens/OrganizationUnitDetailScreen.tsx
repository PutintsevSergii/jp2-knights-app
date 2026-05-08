import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { OrganizationUnitDetailScreen as OrganizationUnitDetailScreenModel } from "../brother-screens.js";
import type { BrotherScreenAction } from "../brother-screen-contracts.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { FlagIcon } from "./shared/FlagIcon.js";
import { MobileBottomNav } from "./shared/MobileBottomNav.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { PinIcon } from "./shared/PinIcon.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";

export interface OrganizationUnitDetailScreenProps {
  screen: OrganizationUnitDetailScreenModel;
  onAction?: (action: BrotherScreenAction) => void;
}

export function OrganizationUnitDetailScreen({
  screen,
  onAction
}: OrganizationUnitDetailScreenProps) {
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
              <View style={styles.heroCard}>
                <View style={styles.heroIcon}>
                  <FlagIcon />
                </View>
                <Text style={styles.title}>{screen.title}</Text>
                <View style={styles.locationRow}>
                  <PinIcon tone="brown" />
                  <Text style={styles.subtitle}>{screen.body}</Text>
                </View>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.detailRows}>
                  {screen.detailRows.map((row) => (
                    <View key={row.id} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{row.label}</Text>
                      <Text style={styles.detailValue}>{row.value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.descriptionCard}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <Text style={styles.description}>{screen.description}</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to choragiew"
                onPress={() => onAction?.(screen.actions[0]!)}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>Back to choragiew</Text>
              </Pressable>
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
              active: true,
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
    gap: designTokens.space[4],
    paddingBottom: 112,
    paddingHorizontal: designTokens.space[8],
    paddingTop: designTokens.space[8]
  },
  bannerOffset: {
    alignSelf: "flex-start"
  },
  heroCard: {
    alignItems: "center",
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
  heroIcon: {
    alignItems: "center",
    backgroundColor: colors.background.app,
    borderColor: colors.brand.gold,
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56
  },
  title: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.screenTitle,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: 0,
    lineHeight: designTokens.typography.lineHeight.screenTitle,
    textAlign: "center"
  },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[2],
    justifyContent: "center"
  },
  subtitle: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body,
    textAlign: "center"
  },
  detailCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderLeftColor: colors.brand.gold,
    borderLeftWidth: 4,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[4],
    padding: designTokens.space[6]
  },
  descriptionCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[6]
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  detailRows: {
    gap: designTokens.space[3]
  },
  detailRow: {
    borderBottomColor: colors.border.subtle,
    borderBottomWidth: 1,
    gap: designTokens.space[1],
    paddingBottom: designTokens.space[3]
  },
  detailLabel: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  detailValue: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  description: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  backButton: {
    alignItems: "center",
    backgroundColor: colors.action.primary,
    borderRadius: designTokens.radius.md,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: designTokens.space[4]
  },
  backButtonText: {
    color: colors.action.primaryText,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.button
  },
  statePanelOffset: {
    marginTop: designTokens.space[4]
  }
});
