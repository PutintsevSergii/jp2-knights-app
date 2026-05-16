import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { MyOrganizationUnitsScreen as MyOrganizationUnitsScreenModel } from "../brother-screens.js";
import type { BrotherScreenAction } from "../brother-screen-contracts.js";
import { BrotherBottomNav } from "./shared/BrotherBottomNav.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { FlagIcon } from "./shared/FlagIcon.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { PinIcon } from "./shared/PinIcon.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";

export interface MyOrganizationUnitsScreenProps {
  screen: MyOrganizationUnitsScreenModel;
  onAction?: (action: BrotherScreenAction) => void;
}

export function MyOrganizationUnitsScreen({ screen, onAction }: MyOrganizationUnitsScreenProps) {
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
            <Text style={styles.title}>{screen.title}</Text>
            <Text style={styles.subtitle}>
              Your active organization units and public-safe local details.
            </Text>
          </View>

          {screen.state === "ready" ? (
            <View style={styles.cardStack}>
              {screen.organizationUnitCards.map((unit) => (
                <Pressable
                  key={unit.id}
                  accessibilityRole="button"
                  accessibilityLabel={unit.detailAction.label}
                  onPress={() => onAction?.(unit.detailAction)}
                  style={styles.card}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.iconCircle}>
                      <FlagIcon />
                    </View>
                    <View style={styles.cardTitleStack}>
                      <Text style={styles.cardTitle}>{unit.title}</Text>
                      <Text style={styles.typeLabel}>{unit.typeLabel}</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <PinIcon tone="brown" />
                    <Text style={styles.metaText}>{unit.locationLabel}</Text>
                  </View>
                  <Text style={styles.parishText}>{unit.parishLabel}</Text>
                  <Text style={styles.bodyText}>{unit.body}</Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.privacyText}>Read-only details</Text>
                    <Text style={styles.detailText}>Open</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.statePanelOffset}>
              <ScreenStatePanel title={screen.title} body={screen.body} />
            </View>
          )}
        </ScrollView>

        <BrotherBottomNav active="choragiew" onAction={onAction} />
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
    gap: designTokens.space[2]
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
    lineHeight: designTokens.typography.lineHeight.body
  },
  cardStack: {
    gap: designTokens.space[4]
  },
  card: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderLeftColor: colors.brand.gold,
    borderLeftWidth: 4,
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
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[3]
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: colors.background.app,
    borderColor: colors.brand.gold,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  cardTitleStack: {
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
  typeLabel: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  metaText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  parishText: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  bodyText: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  cardFooter: {
    alignItems: "center",
    borderTopColor: colors.border.subtle,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: designTokens.space[3]
  },
  privacyText: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  detailText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  statePanelOffset: {
    marginTop: designTokens.space[4]
  }
});
