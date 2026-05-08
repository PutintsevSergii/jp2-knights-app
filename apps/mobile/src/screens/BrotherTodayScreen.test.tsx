import { describe, expect, it, vi } from "vitest";
import { fallbackBrotherToday } from "../brother-companion.js";
import { buildBrotherTodayScreen } from "../brother-screens.js";
import { BrotherTodayScreen } from "./BrotherTodayScreen.js";

describe("BrotherTodayScreen", () => {
  it("renders the Figma dashboard structure and forwards quick/event actions", () => {
    const onAction = vi.fn();
    const screen = buildBrotherTodayScreen({
      state: "ready",
      response: fallbackBrotherToday,
      runtimeMode: "demo"
    });
    const element = BrotherTodayScreen({ screen, onAction });

    expect(findText(element, "JP2 Knights")).toBe(true);
    expect(findText(element, "Good morning, Brother")).toBe(true);
    expect(findText(element, "Demo Brother")).toBe(true);
    expect(findText(element, "First Degree")).toBe(true);
    expect(findText(element, "Upcoming Action")).toBe(true);
    expect(findText(element, "Brother Gathering")).toBe(true);
    expect(findText(element, "Announcements")).toBe(true);

    findPressableByLabel(element, "Review profile")?.props.onPress?.();
    findPressableByLabel(element, "Open event")?.props.onPress?.();
    findPressableByLabel(element, "View all brother events")?.props.onPress?.();

    expect(onAction).toHaveBeenNthCalledWith(1, {
      id: "profile",
      label: "Review profile",
      targetRoute: "BrotherProfile"
    });
    expect(onAction).toHaveBeenNthCalledWith(2, {
      id: "open-event",
      label: "Open event",
      targetRoute: "BrotherEventDetail",
      targetId: fallbackBrotherToday.upcomingEvents[0]!.id
    });
    expect(onAction).toHaveBeenNthCalledWith(3, {
      id: "view-all-events",
      label: "View All",
      targetRoute: "BrotherEvents"
    });
  });

  it("renders non-ready state copy without private dashboard cards", () => {
    const screen = buildBrotherTodayScreen({
      state: "forbidden",
      runtimeMode: "api"
    });
    const element = BrotherTodayScreen({ screen });

    expect(findText(element, "Access Denied")).toBe(true);
    expect(findText(element, "An active brother profile is required.")).toBe(true);
    expect(findText(element, "Good morning, Brother")).toBe(false);
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
