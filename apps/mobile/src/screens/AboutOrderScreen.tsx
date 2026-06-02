import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import type { AboutOrderScreen as AboutOrderScreenModel } from "../public-screens.js";
import { DemoModeBanner } from "./shared/DemoModeBanner.js";
import { PublicScreenTopBar } from "./shared/PublicScreenTopBar.js";

export interface AboutOrderScreenProps {
  screen: AboutOrderScreenModel;
  onNavigate?: (route: AboutOrderScreenModel["actions"][number]["targetRoute"]) => void;
}

export function AboutOrderScreen({ screen, onNavigate }: AboutOrderScreenProps) {
  const joinAction = screen.actions.find((action) => action.targetRoute === "JoinRequestForm");
  const homeAction = screen.actions.find((action) => action.targetRoute === "PublicHome");
  const body = screen.sections[0]?.body ?? screen.body;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <PublicScreenTopBar title="About the Order" onBack={() => onNavigate?.("PublicHome")} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {screen.demoChromeVisible ? <DemoModeBanner /> : null}

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Foundational Principles</Text>
          <Text style={styles.title}>The Vision of the Order</Text>
        </View>

        <View style={styles.article}>
          {articleBlocks(body).map((block) =>
            block.kind === "heading" ? (
              <Text key={block.id} style={styles.articleHeading}>
                {block.text}
              </Text>
            ) : (
              <Text key={block.id} style={styles.articleBody}>
                {block.text}
              </Text>
            )
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Continue the Journey</Text>
          {joinAction ? (
            <Pressable
              accessibilityLabel={joinAction.label}
              accessibilityRole="button"
              onPress={() => onNavigate?.(joinAction.targetRoute)}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>View Membership Path</Text>
            </Pressable>
          ) : null}
          {homeAction ? (
            <Pressable
              accessibilityLabel={homeAction.label}
              accessibilityRole="button"
              onPress={() => onNavigate?.(homeAction.targetRoute)}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Return Home</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ArticleBlock {
  id: string;
  kind: "body" | "heading";
  text: string;
}

function articleBlocks(source: string): ArticleBlock[] {
  const paragraphs = source
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs.map((text, index) => ({
      id: `content-${index}`,
      kind: looksLikeHeading(text) ? "heading" : "body",
      text
    }));
  }

  return [
    {
      id: "intro-1",
      kind: "body",
      text: source
    },
    {
      id: "discipline-heading",
      kind: "heading",
      text: "Fraternal Discipline"
    },
    {
      id: "discipline-body",
      kind: "body",
      text:
        "Discipline within the Order is not restriction; it is a way to create the conditions for deeper fraternity, prayer, and service."
    },
    {
      id: "spiritual-heading",
      kind: "heading",
      text: "Spiritual Grounding"
    },
    {
      id: "spiritual-body",
      kind: "body",
      text:
        "The public path begins with approved information. Private formation, member details, and officer workflows open only after proper approval."
    }
  ];
}

function looksLikeHeading(text: string): boolean {
  return text.length < 60 && !text.endsWith(".");
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  content: {
    gap: designTokens.space[6],
    padding: designTokens.space[4],
    paddingBottom: 112
  },
  hero: {
    alignItems: "center",
    gap: designTokens.space[2],
    paddingTop: designTokens.space[4]
  },
  eyebrow: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.compactLabel,
    textTransform: "uppercase"
  },
  title: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.sectionTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.sectionTitle,
    textAlign: "center"
  },
  article: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.soft,
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    gap: designTokens.space[4],
    padding: designTokens.space[4]
  },
  articleHeading: {
    color: colors.brand.brown,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  articleBody: {
    color: colors.text.muted,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.secondary,
    lineHeight: designTokens.typography.lineHeight.secondary
  },
  footer: {
    alignItems: "center",
    gap: designTokens.space[3]
  },
  footerTitle: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.cardTitle,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.cardTitle
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.brand.gold,
    borderColor: colors.brand.goldDark,
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    minWidth: 190,
    paddingHorizontal: designTokens.space[4],
    paddingVertical: designTokens.space[3]
  },
  primaryButtonText: {
    color: colors.text.primary,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.button
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.brand.goldDark,
    borderRadius: designTokens.radius.sm,
    borderWidth: 1,
    minWidth: 190,
    paddingHorizontal: designTokens.space[4],
    paddingVertical: designTokens.space[3]
  },
  secondaryButtonText: {
    color: colors.brand.goldDark,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.button,
    fontWeight: designTokens.typography.weight.bold,
    lineHeight: designTokens.typography.lineHeight.button
  }
});
