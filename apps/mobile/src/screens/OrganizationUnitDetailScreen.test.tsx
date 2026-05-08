import { describe, expect, it, vi } from "vitest";
import { fallbackMyOrganizationUnits } from "../brother-companion.js";
import { buildOrganizationUnitDetailScreen } from "../brother-screens.js";
import { OrganizationUnitDetailScreen } from "./OrganizationUnitDetailScreen.js";

describe("OrganizationUnitDetailScreen", () => {
  it("renders read-only organization-unit detail and forwards navigation actions", () => {
    const onAction = vi.fn();
    const screen = buildOrganizationUnitDetailScreen({
      state: "ready",
      response: fallbackMyOrganizationUnits,
      selectedOrganizationUnitId: fallbackMyOrganizationUnits.organizationUnits[0]!.id,
      runtimeMode: "demo"
    });
    const element = OrganizationUnitDetailScreen({ screen, onAction });

    expect(findText(element, "JP2 Knights")).toBe(true);
    expect(findText(element, "Pilot Choragiew")).toBe(true);
    expect(findText(element, "Riga, Latvia")).toBe(true);
    expect(findText(element, "Pilot community")).toBe(true);
    expect(JSON.stringify(element)).not.toMatch(/roster|member list|brother list|participant/i);

    findPressableByLabel(element, "Back to choragiew")?.props.onPress?.();
    findPressableByLabel(element, "Dashboard")?.props.onPress?.();
    findPressableByLabel(element, "Account")?.props.onPress?.();

    expect(onAction).toHaveBeenNthCalledWith(1, {
      id: "organization-units",
      label: "Back to choragiew",
      targetRoute: "MyOrganizationUnits"
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
  });

  it("renders non-ready state copy without detail fields", () => {
    const screen = buildOrganizationUnitDetailScreen({
      state: "offline",
      runtimeMode: "api"
    });
    const element = OrganizationUnitDetailScreen({ screen });

    expect(findText(element, "Offline")).toBe(true);
    expect(findText(element, "Reconnect to refresh organization-unit details.")).toBe(true);
    expect(findText(element, "Pilot Choragiew")).toBe(false);
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
