import { describe, expect, it, vi } from "vitest";
import { buildSignInScreen } from "../public-screens.js";
import { SignInScreen } from "./SignInScreen.js";

describe("SignInScreen", () => {
  it("renders the Google provider action without credential fields", () => {
    const onSubmit = vi.fn();
    const element = SignInScreen({
      screen: buildSignInScreen({ state: "ready", runtimeMode: "demo" }),
      onSubmit
    });

    findElementByAccessibilityLabel(element, "Continue with Google")?.props.onPress?.();
    expect(onSubmit).toHaveBeenCalled();
    expect(findText(element, "Demo mode")).toBe(true);
    expect(findElementByAccessibilityLabel(element, "Email")).toBeUndefined();
    expect(findElementByAccessibilityLabel(element, "Show password")).toBeUndefined();
  });

  it("keeps public navigation available when sign-in feedback is shown", () => {
    const onNavigate = vi.fn();
    const element = SignInScreen({
      screen: buildSignInScreen({
        state: "ready",
        runtimeMode: "api",
        errorMessage: "Google/Firebase sign-in provider is not configured in this Expo build."
      }),
      onNavigate
    });

    expect(
      findText(element, "Google/Firebase sign-in provider is not configured in this Expo build.")
    ).toBe(true);
    findElementByAccessibilityLabel(element, "Home")?.props.onPress?.();
    expect(onNavigate).toHaveBeenCalledWith("PublicHome");
  });

  it("exposes Figma auth-shell actions without granting private access", () => {
    const onNavigate = vi.fn();
    const element = SignInScreen({
      screen: buildSignInScreen({ state: "ready", runtimeMode: "api" }),
      onNavigate
    });

    findElementByAccessibilityLabel(element, "Create Account")?.props.onPress?.();
    expect(onNavigate).toHaveBeenCalledWith("JoinRequestForm");
    expect(JSON.stringify(element)).not.toMatch(/roles|membership|officer scope/i);
  });
});

interface TestElement {
  type: unknown;
  props: {
    accessibilityLabel?: string;
    children?: TestNode;
    onChangeText?: (value: string) => void;
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
