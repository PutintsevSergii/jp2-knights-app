import { describe, expect, it, vi } from "vitest";
import { emptyJoinRequestFormDraft } from "../public-candidate-request.js";
import { buildJoinRequestFormScreen } from "../public-screens.js";
import { JoinRequestFormScreen } from "./JoinRequestFormScreen.js";

describe("JoinRequestFormScreen", () => {
  it("renders controlled public join request fields and submits", () => {
    const onChangeField = vi.fn();
    const onConsentAcceptedChange = vi.fn();
    const onSubmit = vi.fn();
    const element = JoinRequestFormScreen({
      screen: buildJoinRequestFormScreen({ state: "ready", runtimeMode: "demo" }),
      draft: {
        ...emptyJoinRequestFormDraft,
        firstName: "Anna"
      },
      consentAccepted: false,
      onChangeField,
      onConsentAcceptedChange,
      onSubmit
    });

    const firstNameInput = findElementByAccessibilityLabel(element, "First name");
    firstNameInput?.props.onChangeText?.("Maria");
    expect(onChangeField).toHaveBeenCalledWith("firstName", "Maria");

    const switchElement = findElementWithOnValueChange(element);
    switchElement?.props.onValueChange?.(true);
    expect(onConsentAcceptedChange).toHaveBeenCalledWith(true);

    const submitButton = findElementByAccessibilityLabel(element, "Submit interest");
    submitButton?.props.onPress?.();
    expect(onSubmit).toHaveBeenCalled();
    expect(findText(element, "Demo mode")).toBe(true);
  });

  it("shows server or validation feedback without hiding navigation", () => {
    const onNavigate = vi.fn();
    const element = JoinRequestFormScreen({
      screen: buildJoinRequestFormScreen({
        state: "ready",
        runtimeMode: "api",
        errorMessage: "Check the required fields and consent, then try again."
      }),
      draft: emptyJoinRequestFormDraft,
      consentAccepted: false,
      onNavigate
    });
    const homeButton = findElementByAccessibilityLabel(element, "Home");

    expect(findText(element, "Check the required fields and consent, then try again.")).toBe(true);
    homeButton?.props.onPress?.();
    expect(onNavigate).toHaveBeenCalledWith("PublicHome");
  });
});

interface TestElement {
  type: unknown;
  props: {
    accessibilityLabel?: string;
    children?: TestNode;
    onChangeText?: (value: string) => void;
    onPress?: () => void;
    onValueChange?: (value: boolean) => void;
  };
}

type TestNode = TestElement | string | number | boolean | null | undefined | readonly TestNode[];

function findElementWithOnValueChange(node: TestNode): TestElement | undefined {
  if (isTestNodeArray(node)) {
    for (const child of node) {
      const match = findElementWithOnValueChange(child);

      if (match) {
        return match;
      }
    }

    return undefined;
  }

  if (!isTestElement(node)) {
    return undefined;
  }

  if (typeof node.props.onValueChange === "function") {
    return node;
  }

  return findElementWithOnValueChange(node.props.children);
}

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
