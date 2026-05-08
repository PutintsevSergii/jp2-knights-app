import { describe, expect, it, vi } from "vitest";
import { fallbackBrotherAnnouncements } from "../brother-companion.js";
import { buildBrotherAnnouncementsScreen } from "../brother-screens.js";
import { BrotherAnnouncementsScreen } from "./BrotherAnnouncementsScreen.js";

describe("BrotherAnnouncementsScreen", () => {
  it("renders Figma-style one-way announcement cards and forwards navigation actions", () => {
    const onAction = vi.fn();
    const screen = buildBrotherAnnouncementsScreen({
      state: "ready",
      response: fallbackBrotherAnnouncements,
      runtimeMode: "api"
    });
    const element = BrotherAnnouncementsScreen({ screen, onAction });

    expect(findText(element, "JP2 Knights")).toBe(true);
    expect(findText(element, "Brother Announcements")).toBe(true);
    expect(findText(element, "1 brother-visible announcement")).toBe(true);
    expect(findText(element, "Brother Formation Notice")).toBe(true);
    expect(findText(element, "Pinned")).toBe(true);
    expect(findText(element, "May 7, 2026, 12:00")).toBe(true);
    expect(findText(element, "One-way announcement")).toBe(true);
    expect(JSON.stringify(element)).not.toMatch(
      /chat|comment|read receipt|delivery|participants|roster|candidate/i
    );

    findPressableByLabel(element, "Dashboard")?.props.onPress?.();
    findPressableByLabel(element, "Events")?.props.onPress?.();
    findPressableByLabel(element, "Account")?.props.onPress?.();

    expect(onAction).toHaveBeenNthCalledWith(1, {
      id: "today",
      label: "Dashboard",
      targetRoute: "BrotherToday"
    });
    expect(onAction).toHaveBeenNthCalledWith(2, {
      id: "events",
      label: "Events",
      targetRoute: "BrotherEvents"
    });
    expect(onAction).toHaveBeenNthCalledWith(3, {
      id: "profile",
      label: "Account",
      targetRoute: "BrotherProfile"
    });
  });

  it("renders non-ready state copy without announcement cards", () => {
    const screen = buildBrotherAnnouncementsScreen({
      state: "offline",
      runtimeMode: "api"
    });
    const element = BrotherAnnouncementsScreen({ screen });

    expect(findText(element, "Offline")).toBe(true);
    expect(findText(element, "Reconnect to refresh brother announcements.")).toBe(true);
    expect(findText(element, "Pinned")).toBe(false);
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
