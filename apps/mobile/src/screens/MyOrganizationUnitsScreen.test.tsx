import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fallbackMyOrganizationUnits } from "../brother-companion.js";
import { buildMyOrganizationUnitsScreen } from "../brother-screens.js";
import { MyOrganizationUnitsScreen } from "./MyOrganizationUnitsScreen.js";

describe("MyOrganizationUnitsScreen", () => {
  it("creates a React Native My Choragiew element from the screen model", () => {
    const element = MyOrganizationUnitsScreen({
      screen: buildMyOrganizationUnitsScreen({
        state: "ready",
        response: fallbackMyOrganizationUnits,
        runtimeMode: "api"
      })
    }) as ReactElement<{ style?: unknown }>;

    expect(element).toBeTruthy();
    expect(element.props.style).toBeDefined();
  });

  it("shows demo chrome and invokes brother route actions", () => {
    const onAction = vi.fn();
    const element = MyOrganizationUnitsScreen({
      screen: buildMyOrganizationUnitsScreen({
        state: "ready",
        response: fallbackMyOrganizationUnits,
        runtimeMode: "demo"
      }),
      onAction
    });
    const pressable = findPressableByLabel(element, "Open choragiew");

    expect(findText(element, "Demo mode")).toBe(true);
    expect(pressable).toBeDefined();
    pressable?.props.onPress?.();
    expect(onAction).toHaveBeenCalledWith({
      id: "open-organization-unit",
      label: "Open choragiew",
      targetRoute: "OrganizationUnitDetail",
      targetId: fallbackMyOrganizationUnits.organizationUnits[0]!.id
    });
  });
});

interface TestElement {
  type: string | TestComponent;
  props: {
    children?: TestNode;
    accessibilityLabel?: string;
    onPress?: () => void;
    style?: unknown;
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
