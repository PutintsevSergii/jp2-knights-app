import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fallbackPublicEvents, fallbackPublicPrayers } from "../public-content.js";
import {
  buildPublicEventsListScreen,
  buildPublicPrayerCategoriesScreen
} from "../public-screens.js";
import { PublicContentListScreen } from "./PublicContentListScreen.js";

describe("PublicContentListScreen", () => {
  it("creates a React Native public prayers list element from the screen model", () => {
    const element = PublicContentListScreen({
      screen: buildPublicPrayerCategoriesScreen({
        state: "ready",
        response: fallbackPublicPrayers,
        runtimeMode: "api"
      })
    }) as ReactElement<{ style?: unknown }>;

    expect(element).toBeTruthy();
    expect(element.props.style).toBeDefined();
    expect(findText(element, "Prayer Library")).toBe(true);
    expect(findText(element, "Morning Offering")).toBe(true);
  });

  it("creates public events list elements and invokes navigation actions", () => {
    const onNavigate = vi.fn();
    const element = PublicContentListScreen({
      screen: buildPublicEventsListScreen({
        state: "ready",
        response: fallbackPublicEvents,
        runtimeMode: "demo"
      }),
      onNavigate
    });
    const pressable = findElementByType(element, "Pressable");

    expect(findText(element, "Demo mode")).toBe(true);
    expect(findText(element, "Open Evening")).toBe(true);
    expect(findText(element, "View Details ›")).toBe(true);
    pressable?.props.onPress?.();
    expect(onNavigate).toHaveBeenCalledWith(
      "PublicEventDetail",
      "00000000-0000-0000-0000-000000000008"
    );
  });
});

interface TestElement {
  type: unknown;
  props: {
    children?: TestNode;
    onPress?: () => void;
    style?: unknown;
  };
}

type TestNode = TestElement | string | number | boolean | null | undefined | readonly TestNode[];
type TestComponent = (props: TestElement["props"]) => TestNode;

function findElementByType(node: TestNode, type: string): TestElement | undefined {
  if (isTestNodeArray(node)) {
    for (const child of node) {
      const match = findElementByType(child, type);

      if (match) {
        return match;
      }
    }

    return undefined;
  }

  if (!isTestElement(node)) {
    return undefined;
  }

  if (node.type === type) {
    return node;
  }

  return findElementByType(node.props.children, type);
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
