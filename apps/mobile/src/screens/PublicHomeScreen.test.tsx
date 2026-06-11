import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { resolveMobileLaunchState } from "../navigation.js";
import { buildPublicHomeScreen } from "../public-screens.js";
import { PublicHomeScreen } from "./PublicHomeScreen.js";

describe("PublicHomeScreen", () => {
  it("creates a React Native public home element from the screen model", () => {
    const element = PublicHomeScreen({
      screen: buildPublicHomeScreen(resolveMobileLaunchState(null))
    }) as ReactElement<{ style?: unknown }>;

    expect(element).toBeTruthy();
    expect(element.props.style).toBeDefined();
  });

  it("shows demo chrome and invokes public route navigation actions", () => {
    const onNavigate = vi.fn();
    const element = PublicHomeScreen({
      screen: buildPublicHomeScreen(resolveMobileLaunchState(null, { runtimeMode: "demo" })),
      onNavigate
    });
    const joinButton = findElementByAccessibilityLabel(element, "Join");
    const aboutCard = findElementByAccessibilityLabel(element, "Learn");

    expect(findText(element, "Demo mode")).toBe(true);
    expect(findText(element, "JP2 Knights")).toBe(true);
    expect(findText(element, "Prayer, fraternity, and formation")).toBe(true);
    expect(findText(element, "Morning Office Intention")).toBe(true);
    expect(findText(element, "The Path to Membership")).toBe(true);
    expect(joinButton).toBeDefined();
    expect(aboutCard).toBeDefined();

    joinButton?.props.onPress?.();
    aboutCard?.props.onPress?.();

    expect(onNavigate).toHaveBeenCalledWith("JoinRequestForm");
    expect(onNavigate).toHaveBeenCalledWith("AboutOrder");
  });

  it("renders tabbed highlights and quick cards for implemented public routes", () => {
    const onNavigate = vi.fn();
    const element = PublicHomeScreen({
      screen: buildPublicHomeScreen(
        resolveMobileLaunchState(null, {
          publicHome: {
            intro: {
              title: "JP2 Knights",
              body: "A public welcome for men discerning prayer, service, and formation."
            },
            today: {
              civilDate: {
                date: "2026-06-11",
                displayLabel: "Thursday, June 11"
              },
              liturgicalDay: {
                name: "Liturgical calendar unavailable",
                season: null,
                rank: null,
                color: null,
                source: "local-fallback",
                state: "fallback"
              }
            },
            prayerOfDay: {
              title: "Prayer of the Day",
              body: "Lord, guide our work today."
            },
            nextEvents: [
              {
                id: "11111111-1111-4111-8111-111111111111",
                title: "Public Family Event",
                startAt: "2026-06-01T10:00:00.000Z",
                locationLabel: "Parish Hall",
                visibility: "FAMILY_OPEN"
              }
            ],
            ctas: [
              {
                id: "learn",
                label: "Learn",
                action: "learn",
                targetRoute: "AboutOrder"
              },
              {
                id: "pray",
                label: "Pray",
                action: "pray",
                targetRoute: "PublicPrayerCategories"
              },
              {
                id: "events",
                label: "Events",
                action: "events",
                targetRoute: "PublicEventsList"
              },
              {
                id: "silent-prayer",
                label: "Silent Prayer",
                action: "pray",
                targetRoute: "PublicSilentPrayer"
              },
              {
                id: "join",
                label: "Join",
                action: "join",
                targetRoute: "JoinRequestForm"
              },
              {
                id: "login",
                label: "Login",
                action: "login",
                targetRoute: "Login"
              }
            ]
          }
        })
      ),
      onNavigate
    });

    expect(findText(element, "JP2 Knights")).toBe(true);
    expect(findText(element, "Thursday, June 11")).toBe(true);
    expect(findText(element, "Liturgical calendar unavailable")).toBe(true);
    expect(findText(element, "Wednesday, June 3")).toBe(false);
    expect(findText(element, "Prayer, fraternity, and formation")).toBe(true);
    expect(findText(element, "Morning Office Intention")).toBe(true);
    expect(findText(element, "The Path to Membership")).toBe(true);
    expect(findText(element, "About the Order")).toBe(true);
    expect(findText(element, "Prayer Library")).toBe(true);
    expect(findText(element, "Read Prayer")).toBe(true);
    expect(findText(element, "View Details")).toBe(true);

    findElementByAccessibilityLabel(element, "Prayer of the Day")?.props.onPress?.();
    findElementByAccessibilityLabel(element, "Public Family Event")?.props.onPress?.();
    findElementByAccessibilityLabel(element, "Events")?.props.onPress?.();

    expect(onNavigate).toHaveBeenCalledWith("PublicPrayerCategories");
    expect(onNavigate).toHaveBeenCalledWith("PublicEventsList");
  });
});

interface TestElement {
  type: unknown;
  props: {
    accessibilityLabel?: string;
    children?: TestNode;
    onPress?: () => void;
    style?: unknown;
  };
}

type TestNode = TestElement | string | number | boolean | null | undefined | readonly TestNode[];
type TestComponent = (props: TestElement["props"]) => TestNode;

function findElementByAccessibilityLabel(
  node: TestNode,
  label: string
): TestElement | undefined {
  const resolved = resolveElement(node);

  if (resolved !== node) {
    return findElementByAccessibilityLabel(resolved, label);
  }

  if (isTestNodeArray(node)) {
    for (const child of node) {
      const match = findElementByAccessibilityLabel(child, label);

      if (match) {
        return match;
      }
    }

    return undefined;
  }

  if (!isTestElement(node)) {
    return undefined;
  }

  if (node.props.accessibilityLabel === label) {
    return node;
  }

  return findElementByAccessibilityLabel(node.props.children, label);
}

function findText(node: TestNode, text: string): boolean {
  const resolved = resolveElement(node);

  if (resolved !== node) {
    return findText(resolved, text);
  }

  if (isTestNodeArray(node)) {
    return node.some((child) => findText(child, text));
  }

  if (node === text) {
    return true;
  }

  if (!isTestElement(node)) {
    return false;
  }

  return findText(node.props.children, text);
}

function isTestElement(node: TestNode): node is TestElement {
  return typeof node === "object" && node !== null && "type" in node && "props" in node;
}

function isTestNodeArray(node: TestNode): node is readonly TestNode[] {
  return Array.isArray(node);
}

function resolveElement(node: TestNode): TestNode {
  if (!isTestElement(node) || typeof node.type !== "function") {
    return node;
  }

  const renderElement = node.type as TestComponent;

  return renderElement(node.props);
}
