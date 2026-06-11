import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { BrotherScreenAction } from "../brother-screen-contracts.js";
import type { BrotherProfileScreen as BrotherProfileScreenModel } from "../brother-screens.js";
import { BrotherBottomNav } from "./shared/BrotherBottomNav.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { MaterialSymbol } from "./shared/MaterialSymbol.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";

export interface BrotherProfileScreenProps {
  screen: BrotherProfileScreenModel;
  onAction?: (action: BrotherScreenAction) => void;
}

export function BrotherProfileScreen({ screen, onAction }: BrotherProfileScreenProps) {
  const organizationUnitAction = screen.actions.find(
    (action) => action.targetRoute === "MyOrganizationUnits"
  );

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

          {screen.state === "ready" && screen.profileSummary ? (
            <>
              <View style={styles.hero}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{screen.profileSummary.initials}</Text>
                </View>
                <View style={styles.heroCopy}>
                  <Text style={styles.title}>{screen.profileSummary.displayName}</Text>
                  <Text style={styles.subtitle}>{screen.profileSummary.email}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {screen.profileSummary.currentDegreeLabel}
                      </Text>
                    </View>
                    <View style={styles.secondaryBadge}>
                      <Text style={styles.secondaryBadgeText}>
                        {screen.profileSummary.organizationUnitLabel}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Contact Basics</Text>
                <View style={styles.contactCard}>
                  {screen.contactRows.map((row) => (
                    <View key={row.id} style={styles.contactRow}>
                      <View style={styles.contactIcon}>
                        <MaterialSymbol name={contactIcon(row.id)} size={18} />
                      </View>
                      <View style={styles.contactTextStack}>
                        <Text style={styles.label}>{row.label}</Text>
                        <Text style={styles.value}>{row.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Membership</Text>
                  <Text style={styles.readOnlyText}>Read-only</Text>
                </View>

                <View style={styles.cardStack}>
                  {screen.membershipCards.map((membership) => (
                    <View key={membership.id} style={styles.membershipCard}>
                      <View style={styles.membershipHeader}>
                        <View style={styles.membershipIcon}>
                          <MaterialSymbol name="flag" size={22} fill />
                        </View>
                        <View style={styles.membershipTitleStack}>
                          <Text style={styles.cardTitle}>{membership.organizationUnitName}</Text>
                          <Text style={styles.typeLabel}>{membership.typeLabel}</Text>
                        </View>
                      </View>

                      <View style={styles.metaGrid}>
                        <View style={styles.metaItem}>
                          <Text style={styles.label}>Degree</Text>
                          <Text style={styles.value}>{membership.currentDegreeLabel}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Text style={styles.label}>Joined</Text>
                          <Text style={styles.value}>{membership.joinedLabel}</Text>
                        </View>
                      </View>

                      <View style={styles.locationRow}>
                        <MaterialSymbol name="location_on" size={18} color={colors.brand.brown} />
                        <Text style={styles.locationText}>{membership.locationLabel}</Text>
                      </View>
                      <Text style={styles.parishText}>{membership.parishLabel}</Text>
                      <Text style={styles.bodyText}>{membership.description}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {organizationUnitAction ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={organizationUnitAction.label}
                  onPress={() => onAction?.(organizationUnitAction)}
                  style={styles.actionCard}
                >
                  <View style={styles.actionCopy}>
                    <MaterialSymbol name="menu_book" size={22} />
                    <Text style={styles.actionText}>Open choragiew details</Text>
                  </View>
                  <Text style={styles.inlineAction}>Open ›</Text>
                </Pressable>
              ) : null}
            </>
          ) : (
            <ScreenStatePanel title={screen.title} body={screen.body} />
          )}
        </ScrollView>

        <BrotherBottomNav active="account" onAction={onAction} />
      </View>
    </SafeAreaView>
  );
}

function contactIcon(id: "email" | "phone" | "language"): string {
  if (id === "email") return "mail";
  if (id === "phone") return "contacts";

  return "public";
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
    gap: designTokens.space[6],
    paddingBottom: 112,
    paddingHorizontal: designTokens.space[8],
    paddingTop: designTokens.space[8]
  },
  hero: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    flexDirection: "row",
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
  avatar: {
    alignItems: "center",
    backgroundColor: colors.brand.gold,
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60
  },
  avatarText: {
    color: colors.background.surface,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    letterSpacing: 0,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  heroCopy: {
    flex: 1,
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
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[2]
  },
  badge: {
    backgroundColor: colors.brand.linen,
    borderColor: colors.brand.gold,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  badgeText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  secondaryBadge: {
    backgroundColor: colors.background.app,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.pill,
    borderWidth: 1,
    paddingHorizontal: designTokens.space[3],
    paddingVertical: designTokens.space[1]
  },
  secondaryBadgeText: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  sectionBlock: {
    gap: designTokens.space[3]
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  readOnlyText: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  contactCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[4],
    padding: designTokens.space[4]
  },
  contactRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[3]
  },
  contactIcon: {
    alignItems: "center",
    backgroundColor: colors.background.app,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  contactTextStack: {
    flex: 1,
    gap: designTokens.space[1]
  },
  label: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    lineHeight: designTokens.typography.lineHeight.compactLabel
  },
  value: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.body
  },
  cardStack: {
    gap: designTokens.space[4]
  },
  membershipCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderLeftColor: colors.brand.gold,
    borderLeftWidth: 4,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[4],
    padding: designTokens.space[6]
  },
  membershipHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[3]
  },
  membershipIcon: {
    alignItems: "center",
    backgroundColor: colors.background.app,
    borderColor: colors.brand.gold,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  membershipTitleStack: {
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
  metaGrid: {
    flexDirection: "row",
    gap: designTokens.space[3]
  },
  metaItem: {
    backgroundColor: colors.background.app,
    borderRadius: designTokens.radius.sm,
    flex: 1,
    gap: designTokens.space[1],
    padding: designTokens.space[3]
  },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: designTokens.space[2]
  },
  locationText: {
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
  actionCard: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: designTokens.space[4]
  },
  actionCopy: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: designTokens.space[3]
  },
  actionText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.semibold,
    lineHeight: designTokens.typography.lineHeight.body
  },
  inlineAction: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.secondary
  }
});
