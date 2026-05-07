import { describe, expect, it, vi } from "vitest";
import { resolveMobileLaunchState } from "../navigation.js";
import { buildIdleApprovalScreen } from "../public-screens.js";
import { IdleApprovalScreen } from "./IdleApprovalScreen.js";

describe("IdleApprovalScreen", () => {
  it("renders approval state without private role details", () => {
    const onNavigate = vi.fn();
    const element = IdleApprovalScreen({
      screen: buildIdleApprovalScreen({
        launchState: resolveMobileLaunchState(
          {
            id: "idle_1",
            roles: [],
            status: "active",
            approval: {
              state: "pending",
              expiresAt: "2026-06-04T08:00:00.000Z",
              scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
            }
          },
          { runtimeMode: "demo" }
        )
      }),
      onNavigate
    });

    expect(findText(element, "Account Approval Pending")).toBe(true);
    expect(findTextContaining(element, "Status: pending")).toBe(true);
    expect(findText(element, "Demo mode")).toBe(true);
    expect(JSON.stringify(element)).not.toMatch(/BROTHER|CANDIDATE|membership/i);

    findElementByAccessibilityLabel(element, "Home")?.props.onPress?.();
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

function findTextContaining(node: TestNode, text: string): boolean {
  if (isTestNodeArray(node)) {
    return node.some((child) => findTextContaining(child, text));
  }

  if (typeof node === "string") {
    return node.includes(text);
  }

  if (!isTestElement(node)) {
    return false;
  }

  return findTextContaining(node.props.children, text);
}

function isTestElement(node: TestNode): node is TestElement {
  return typeof node === "object" && node !== null && "type" in node && "props" in node;
}

function isTestNodeArray(node: TestNode): node is readonly TestNode[] {
  return Array.isArray(node);
}
