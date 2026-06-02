import { describe, expect, it, vi } from "vitest";
import { PublicBottomNav } from "./PublicBottomNav.js";

describe("PublicBottomNav", () => {
  it("renders public tabs and routes between implemented public surfaces", () => {
    const onNavigate = vi.fn();
    const element = PublicBottomNav({
      activeRoute: "PublicEventsList",
      onNavigate
    }) as TestNode;

    expect(findText(element, "Home")).toBe(true);
    expect(findText(element, "About")).toBe(true);
    expect(findText(element, "Prayers")).toBe(true);
    expect(findText(element, "Events")).toBe(true);
    expect(findText(element, "Join")).toBe(true);

    findElementByAccessibilityLabel(element, "Home")?.props.onPress?.();
    findElementByAccessibilityLabel(element, "Prayers")?.props.onPress?.();
    findElementByAccessibilityLabel(element, "Join")?.props.onPress?.();

    expect(onNavigate).toHaveBeenCalledWith("PublicHome");
    expect(onNavigate).toHaveBeenCalledWith("PublicPrayerCategories");
    expect(onNavigate).toHaveBeenCalledWith("JoinRequestForm");
  });

  it("marks detail routes as active under their parent tab", () => {
    const prayerDetail = PublicBottomNav({ activeRoute: "PublicPrayerDetail" }) as TestNode;
    const eventDetail = PublicBottomNav({ activeRoute: "PublicEventDetail" }) as TestNode;

    expect(findElementByAccessibilityLabel(prayerDetail, "Prayers")?.props.accessibilityState).toEqual(
      {
        selected: true,
        disabled: undefined
      }
    );
    expect(findElementByAccessibilityLabel(eventDetail, "Events")?.props.accessibilityState).toEqual({
      selected: true,
      disabled: undefined
    });
  });
});

interface TestElement {
  type: unknown;
  props: {
    accessibilityLabel?: string;
    accessibilityState?: unknown;
    children?: TestNode;
    onPress?: () => void;
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
