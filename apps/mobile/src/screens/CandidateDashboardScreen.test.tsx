import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fallbackCandidateDashboard } from "../candidate-dashboard.js";
import { buildCandidateDashboardScreen } from "../candidate-screens.js";
import { CandidateDashboardScreen } from "./CandidateDashboardScreen.js";

describe("CandidateDashboardScreen", () => {
  it("creates a React Native candidate dashboard element from the screen model", () => {
    const element = CandidateDashboardScreen({
      screen: buildCandidateDashboardScreen({
        state: "ready",
        response: fallbackCandidateDashboard,
        runtimeMode: "api"
      })
    }) as ReactElement<{ style?: unknown }>;

    expect(element).toBeTruthy();
    expect(element.props.style).toBeDefined();
  });

  it("shows demo chrome and invokes candidate route navigation actions", () => {
    const onNavigate = vi.fn();
    const element = CandidateDashboardScreen({
      screen: buildCandidateDashboardScreen({
        state: "ready",
        response: fallbackCandidateDashboard,
        runtimeMode: "demo"
      }),
      onNavigate
    });
    const pressable = findElementByType(element, "Pressable");

    expect(findText(element, "Demo mode")).toBe(true);
    expect(pressable).toBeDefined();
    pressable?.props.onPress?.();
    expect(onNavigate).toHaveBeenCalledWith("CandidateRoadmap");
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
