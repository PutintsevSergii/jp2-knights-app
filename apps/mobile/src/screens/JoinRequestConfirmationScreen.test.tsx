import { describe, expect, it, vi } from "vitest";
import { buildJoinRequestConfirmationScreen } from "../public-screens.js";
import { JoinRequestConfirmationScreen } from "./JoinRequestConfirmationScreen.js";

describe("JoinRequestConfirmationScreen", () => {
  it("renders safe confirmation copy and routes home", () => {
    const onNavigate = vi.fn();
    const element = JoinRequestConfirmationScreen({
      screen: buildJoinRequestConfirmationScreen({
        state: "ready",
        response: {
          request: {
            id: "11111111-1111-4111-8111-111111111111",
            status: "new"
          }
        },
        runtimeMode: "demo"
      }),
      onNavigate
    });
    const homeButton = findElementByAccessibilityLabel(element, "Home");

    expect(findText(element, "Demo mode")).toBe(true);
    expect(findText(element, "Request Received")).toBe(true);
    expect(findText(element, "11111111-1111-4111-8111-111111111111")).toBe(true);
    homeButton?.props.onPress?.();
    expect(onNavigate).toHaveBeenCalledWith("PublicHome");
  });
});

interface TestElement {
  type: unknown;
  props: {
    accessibilityLabel?: string;
    children?: TestNode;
    onPress?: () => void;
  };
}

type TestNode = TestElement | string | number | boolean | null | undefined | readonly TestNode[];

function findElementByAccessibilityLabel(
  node: TestNode,
  accessibilityLabel: string
): TestElement | undefined {
  if (isTestNodeArray(node)) {
    for (const child of node) {
      const match = findElementByAccessibilityLabel(child, accessibilityLabel);

      if (match) {
        return match;
      }
    }

    return undefined;
  }

  if (!isTestElement(node)) {
    return undefined;
  }

  if (node.props.accessibilityLabel === accessibilityLabel) {
    return node;
  }

  return findElementByAccessibilityLabel(node.props.children, accessibilityLabel);
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
