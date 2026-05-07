import { describe, expect, it, vi } from "vitest";
import { fallbackBrotherToday } from "../brother-companion.js";
import { buildBrotherTodayScreen } from "../brother-screens.js";
import { PrivateContentScreen } from "./PrivateContentScreen.js";

describe("PrivateContentScreen", () => {
  it("renders a private screen model and forwards the full action metadata", () => {
    const onAction = vi.fn();
    const screen = buildBrotherTodayScreen({
      state: "ready",
      response: fallbackBrotherToday,
      runtimeMode: "demo"
    });
    const element = PrivateContentScreen({ screen, onAction });
    const pressable = findElementByType(element, "Pressable");

    expect(findText(element, "Demo mode")).toBe(true);
    pressable?.props.onPress?.();
    expect(onAction).toHaveBeenCalledWith(screen.actions[0]);
  });
});

interface TestElement {
  type: unknown;
  props: {
    children?: TestNode;
    onPress?: () => void;
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
