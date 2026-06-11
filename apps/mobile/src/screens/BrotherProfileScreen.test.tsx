import { describe, expect, it, vi } from "vitest";
import { fallbackBrotherProfile } from "../brother-companion.js";
import { buildBrotherProfileScreen } from "../brother-screens.js";
import { BrotherProfileScreen } from "./BrotherProfileScreen.js";

describe("BrotherProfileScreen", () => {
  it("renders read-only contact basics and membership cards without roster features", () => {
    const onAction = vi.fn();
    const screen = buildBrotherProfileScreen({
      state: "ready",
      response: fallbackBrotherProfile,
      runtimeMode: "api"
    });
    const element = BrotherProfileScreen({ screen, onAction });

    expect(findText(element, "JP2 Knights")).toBe(true);
    expect(findText(element, "Demo Brother")).toBe(true);
    expect(findText(element, "brother@example.test")).toBe(true);
    expect(findText(element, "First Degree")).toBe(true);
    expect(findText(element, "Pilot Choragiew")).toBe(true);
    expect(findText(element, "Contact Basics")).toBe(true);
    expect(findText(element, "Phone")).toBe(true);
    expect(findText(element, "Not recorded")).toBe(true);
    expect(findText(element, "Membership")).toBe(true);
    expect(findText(element, "Joined Jan 15, 2026")).toBe(true);
    expect(findText(element, "Riga, Latvia")).toBe(true);
    expect(findText(element, "Read-only")).toBe(true);
    expect(JSON.stringify(element)).not.toMatch(
      /roster|member list|participant|candidate|chat|comment|edit|approve/i
    );

    findPressableByLabel(element, "My choragiew")?.props.onPress?.();
    findPressableByLabel(element, "Home")?.props.onPress?.();
    findPressableByLabel(element, "Events")?.props.onPress?.();
    findPressableByLabel(element, "Prayer")?.props.onPress?.();

    expect(onAction).toHaveBeenNthCalledWith(1, {
      id: "organization-units",
      label: "My choragiew",
      targetRoute: "MyOrganizationUnits"
    });
    expect(onAction).toHaveBeenNthCalledWith(2, {
      id: "today",
      label: "Home",
      targetRoute: "BrotherToday"
    });
    expect(onAction).toHaveBeenNthCalledWith(3, {
      id: "events",
      label: "Events",
      targetRoute: "BrotherEvents"
    });
    expect(onAction).toHaveBeenNthCalledWith(4, {
      id: "prayers",
      label: "Prayer",
      targetRoute: "BrotherPrayers"
    });
  });

  it("renders non-ready state copy without profile details", () => {
    const screen = buildBrotherProfileScreen({
      state: "offline",
      runtimeMode: "api"
    });
    const element = BrotherProfileScreen({ screen });

    expect(findText(element, "Offline")).toBe(true);
    expect(findText(element, "Reconnect to refresh brother profile.")).toBe(true);
    expect(findText(element, "Contact Basics")).toBe(false);
    expect(findText(element, "Membership")).toBe(false);
  });
});

interface TestElement {
  type: string | TestComponent;
  props: {
    accessibilityLabel?: string;
    children?: TestNode;
    onPress?: () => void;
  };
}

type TestNode = TestElement | string | number | boolean | null | undefined | readonly TestNode[];
type TestComponent = (props: TestElement["props"]) => TestNode;

function findPressableByLabel(node: TestNode, label: string): TestElement | undefined {
  const resolved = resolveElement(node);

  if (resolved !== node) {
    return findPressableByLabel(resolved, label);
  }

  if (isTestNodeArray(node)) {
    for (const child of node) {
      const match = findPressableByLabel(child, label);

      if (match) {
        return match;
      }
    }

    return undefined;
  }

  if (!isTestElement(node)) {
    return undefined;
  }

  if (node.type === "Pressable" && node.props.accessibilityLabel === label) {
    return node;
  }

  return findPressableByLabel(node.props.children, label);
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

  return node.type(node.props);
}
