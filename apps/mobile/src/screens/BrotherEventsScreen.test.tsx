import { describe, expect, it, vi } from "vitest";
import { fallbackBrotherEvents } from "../brother-companion.js";
import { buildBrotherEventsScreen } from "../brother-screens.js";
import { BrotherEventsScreen } from "./BrotherEventsScreen.js";

describe("BrotherEventsScreen", () => {
  it("renders brother-visible event cards and forwards detail/navigation actions", () => {
    const onAction = vi.fn();
    const screen = buildBrotherEventsScreen({
      state: "ready",
      response: fallbackBrotherEvents,
      runtimeMode: "demo"
    });
    const element = BrotherEventsScreen({ screen, onAction });

    expect(findText(element, "JP2 Knights")).toBe(true);
    expect(findText(element, "Brother Events")).toBe(true);
    expect(findText(element, "Brother Gathering")).toBe(true);
    expect(findText(element, "Formation")).toBe(true);
    expect(findText(element, "Choragiew")).toBe(true);
    expect(findText(element, "No attendee list shown")).toBe(true);

    findPressableByLabel(element, "View Details")?.props.onPress?.();
    findPressableByLabel(element, "Dashboard")?.props.onPress?.();
    findPressableByLabel(element, "Account")?.props.onPress?.();

    expect(onAction).toHaveBeenNthCalledWith(1, {
      id: "view-event-detail",
      label: "View Details",
      targetRoute: "BrotherEventDetail",
      targetId: fallbackBrotherEvents.events[0]!.id
    });
    expect(onAction).toHaveBeenNthCalledWith(2, {
      id: "today",
      label: "Dashboard",
      targetRoute: "BrotherToday"
    });
    expect(onAction).toHaveBeenNthCalledWith(3, {
      id: "profile",
      label: "Account",
      targetRoute: "BrotherProfile"
    });
    expect(findPressableByLabel(element, "Prayer")?.props.disabled).toBe(true);
  });

  it("renders non-ready state copy without brother event cards", () => {
    const screen = buildBrotherEventsScreen({
      state: "forbidden",
      runtimeMode: "api"
    });
    const element = BrotherEventsScreen({ screen });

    expect(findText(element, "Access Denied")).toBe(true);
    expect(findText(element, "An active brother profile is required.")).toBe(true);
    expect(findText(element, "Brother Gathering")).toBe(false);
  });
});

interface TestElement {
  type: string | TestComponent;
  props: {
    accessibilityLabel?: string;
    children?: TestNode;
    disabled?: boolean;
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
