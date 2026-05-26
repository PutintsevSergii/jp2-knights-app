import { describe, expect, it, vi } from "vitest";
import { buildBrotherSilentPrayerScreen } from "../brother-screens.js";
import {
  fallbackBrotherSilentPrayerJoin,
  fallbackBrotherSilentPrayerSessions
} from "../silent-prayer.js";
import { BrotherSilentPrayerScreen } from "./BrotherSilentPrayerScreen.js";

describe("BrotherSilentPrayerScreen", () => {
  it("renders brother aggregate counters and forwards join/navigation actions", () => {
    const onAction = vi.fn();
    const screen = buildBrotherSilentPrayerScreen({
      state: "ready",
      response: fallbackBrotherSilentPrayerSessions,
      joined: fallbackBrotherSilentPrayerJoin,
      runtimeMode: "demo"
    });
    const element = BrotherSilentPrayerScreen({ screen, onAction });

    expect(findText(element, "JP2 Knights")).toBe(true);
    expect(findText(element, "Brother Silent Prayer")).toBe(true);
    expect(findText(element, "8 praying now")).toBe(true);
    expect(findText(element, "No participant list shown")).toBe(true);
    expect(findText(element, "Your choragiew")).toBe(true);

    findPressableByLabel(element, "Refresh Counter")?.props.onPress?.();
    findPressableByLabel(element, "Dashboard")?.props.onPress?.();

    expect(onAction).toHaveBeenNthCalledWith(1, {
      id: "join-silent-prayer",
      label: "Refresh Counter",
      targetRoute: "SilentPrayer",
      targetId: fallbackBrotherSilentPrayerSessions.sessions[0]!.id
    });
    expect(onAction).toHaveBeenNthCalledWith(2, {
      id: "today",
      label: "Dashboard",
      targetRoute: "BrotherToday"
    });
  });

  it("renders non-ready state copy without session cards", () => {
    const screen = buildBrotherSilentPrayerScreen({
      state: "forbidden",
      runtimeMode: "api"
    });
    const element = BrotherSilentPrayerScreen({ screen });

    expect(findText(element, "Access Denied")).toBe(true);
    expect(findText(element, "An active brother profile is required.")).toBe(true);
    expect(findText(element, "Brother Silent Prayer")).toBe(false);
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
