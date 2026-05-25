import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { BrotherRoadmapScreen as BrotherRoadmapScreenModel } from "../brother-screens.js";
import type { BrotherScreenAction } from "../brother-screen-contracts.js";
import { BrotherBottomNav } from "./shared/BrotherBottomNav.js";
import { DegreeIcon } from "./shared/DegreeIcon.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { MobileTopBar } from "./shared/MobileTopBar.js";
import { ScreenStatePanel } from "./shared/ScreenStatePanel.js";

export interface BrotherRoadmapScreenProps {
  screen: BrotherRoadmapScreenModel;
  onAction?: (action: BrotherScreenAction) => void;
}

export function BrotherRoadmapScreen({ screen, onAction }: BrotherRoadmapScreenProps) {
  const [submissionBodies, setSubmissionBodies] = useState<Record<string, string>>({});

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <MobileTopBar title="Formation" avatarText="JP" tone="gold" />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {screen.demoChromeVisible ? <DemoModeBanner /> : null}

          {screen.state === "ready" ? (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <DegreeIcon />
                </View>
                <Text style={styles.title}>{screen.title}</Text>
                <Text style={styles.body}>{screen.body}</Text>
              </View>

              <View style={styles.stepStack}>
                {screen.stepCards.map((step) => {
                  const draftBody = submissionBodies[step.id] ?? "";
                  const submissionAction = step.submissionAction;

                  return (
                    <View key={step.id} style={styles.stepCard}>
                      <Text style={styles.stageLabel}>{step.stageTitle}</Text>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepBody}>{step.body}</Text>
                      <View style={styles.statusRow}>
                        <Text style={styles.requirementLabel}>
                          {step.submissionRequired ? "Submission required" : "Read-only step"}
                        </Text>
                        <Text style={styles.statusLabel}>{step.statusLabel}</Text>
                      </View>

                      {submissionAction ? (
                        <View style={styles.formStack}>
                          <TextInput
                            accessibilityLabel={`Reflection for ${step.title}`}
                            multiline
                            onChangeText={(value) =>
                              setSubmissionBodies((current) => ({
                                ...current,
                                [step.id]: value
                              }))
                            }
                            placeholder="Write your reflection for officer review."
                            placeholderTextColor={colors.text.muted}
                            style={styles.input}
                            value={draftBody}
                          />
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Submit reflection for ${step.title}`}
                            onPress={() => {
                              const submissionBody = draftBody.trim();

                              if (submissionBody.length === 0) {
                                return;
                              }

                              onAction?.({
                                ...submissionAction,
                                submissionBody
                              });
                            }}
                            style={styles.submitButton}
                          >
                            <Text style={styles.submitText}>{submissionAction.label}</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
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
    paddingHorizontal: designTokens.space[6],
    paddingTop: designTokens.space[4]
  },
  summaryCard: {
    alignItems: "flex-start",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[4],
    shadowColor: designTokens.elevation.subtle.color,
    shadowOffset: {
      width: designTokens.elevation.subtle.offsetX,
      height: designTokens.elevation.subtle.offsetY
    },
    shadowOpacity: designTokens.elevation.subtle.opacity,
    shadowRadius: designTokens.elevation.subtle.radius
  },
  summaryIcon: {
    alignItems: "center",
    backgroundColor: colors.brand.linen,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  title: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.screenTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.screenTitle
  },
  body: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  stepStack: {
    gap: designTokens.space[4]
  },
  stepCard: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.space[3],
    padding: designTokens.space[4]
  },
  stageLabel: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.medium,
    lineHeight: designTokens.typography.lineHeight.label,
    textTransform: "uppercase"
  },
  stepTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle
  },
  stepBody: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.space[2],
    justifyContent: "space-between"
  },
  requirementLabel: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  statusLabel: {
    color: colors.status.warning,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    fontWeight: designTokens.typography.weight.medium,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  formStack: {
    gap: designTokens.space[3]
  },
  input: {
    backgroundColor: colors.brand.linen,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    lineHeight: designTokens.typography.lineHeight.body,
    minHeight: 116,
    padding: designTokens.space[3],
    textAlignVertical: "top"
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.action.primary,
    borderRadius: designTokens.radius.md,
    paddingHorizontal: designTokens.space[4],
    paddingVertical: designTokens.space[3]
  },
  submitText: {
    color: colors.action.primaryText,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.medium,
    lineHeight: designTokens.typography.lineHeight.button
  }
});
