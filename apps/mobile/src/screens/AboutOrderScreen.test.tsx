import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fallbackAboutOrderContentPage } from "../public-content.js";
import { buildAboutOrderScreen } from "../public-screens.js";
import { AboutOrderScreen } from "./AboutOrderScreen.js";

describe("AboutOrderScreen", () => {
  it("creates a React Native about screen element from the screen model", () => {
    const element = AboutOrderScreen({
      screen: buildAboutOrderScreen({
        state: "ready",
        page: fallbackAboutOrderContentPage,
        runtimeMode: "api"
      })
    }) as ReactElement<{ style?: unknown }>;

    expect(element).toBeTruthy();
    expect(element.props.style).toBeDefined();
    expect(findText(element, "About the Order")).toBe(true);
  });

  it("invokes public route navigation actions", () => {
    const onNavigate = vi.fn();
    const element = AboutOrderScreen({
      screen: buildAboutOrderScreen({
        state: "ready",
        page: fallbackAboutOrderContentPage,
        runtimeMode: "demo"
      }),
      onNavigate
    });
    const pressable = findElementByType(element, "Pressable");

    expect(findText(element, "Demo mode")).toBe(true);
    expect(pressable).toBeDefined();
    pressable?.props.onPress?.();
    expect(onNavigate).toHaveBeenCalledWith("JoinRequestForm");
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
