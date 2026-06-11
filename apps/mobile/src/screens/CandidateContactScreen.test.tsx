import { describe, expect, it, vi } from "vitest";
import { fallbackCandidateDashboard } from "../candidate-dashboard.js";
import { buildCandidateContactScreen } from "../candidate-screens.js";
import { CandidateContactScreen } from "./CandidateContactScreen.js";

describe("CandidateContactScreen", () => {
  it("renders responsible officer contact and opens external email links", () => {
    const onAction = vi.fn();
    const onOpenUrl = vi.fn();
    const screen = buildCandidateContactScreen({
      state: "ready",
      response: fallbackCandidateDashboard,
      runtimeMode: "api"
    });
    const element = CandidateContactScreen({ screen, onAction, onOpenUrl });

    expect(findText(element, "JP2 Knights")).toBe(true);
    expect(findText(element, "Responsible Officer")).toBe(true);
    expect(findText(element, "officer@example.test")).toBe(true);
    expect(findText(element, "Phone not recorded")).toBe(true);
    expect(findText(element, "Pilot Choragiew - Riga, Latvia")).toBe(true);
    expect(findText(element, "Email officer")).toBe(true);
    expect(findText(element, "Call officer")).toBe(false);
    expect(JSON.stringify(element)).not.toMatch(/chat|comment|in-app|thread|message/i);

    findPressableByLabel(element, "Email officer")?.props.onPress?.();
    findPressableByLabel(element, "Back to dashboard")?.props.onPress?.();
    findPressableByLabel(element, "Home")?.props.onPress?.();

    expect(onOpenUrl).toHaveBeenCalledWith("mailto:officer%40example.test");
    expect(onAction).toHaveBeenNthCalledWith(1, {
      id: "dashboard",
      label: "Dashboard",
      targetRoute: "CandidateDashboard"
    });
    expect(onAction).toHaveBeenNthCalledWith(2, {
      id: "dashboard",
      label: "Home",
      targetRoute: "CandidateDashboard"
    });
  });

  it("renders phone deep link only when the dashboard DTO includes a phone", () => {
    const onOpenUrl = vi.fn();
    const screen = buildCandidateContactScreen({
      state: "ready",
      response: {
        ...fallbackCandidateDashboard,
        profile: {
          ...fallbackCandidateDashboard.profile,
          responsibleOfficer: {
            ...fallbackCandidateDashboard.profile.responsibleOfficer!,
            phone: "+37120000000"
          }
        }
      },
      runtimeMode: "api"
    });
    const element = CandidateContactScreen({ screen, onOpenUrl });

    findPressableByLabel(element, "Call officer")?.props.onPress?.();

    expect(findText(element, "+37120000000")).toBe(true);
    expect(onOpenUrl).toHaveBeenCalledWith("tel:%2B37120000000");
  });

  it("renders non-ready state copy without officer contact actions", () => {
    const screen = buildCandidateContactScreen({
      state: "offline",
      runtimeMode: "api"
    });
    const element = CandidateContactScreen({ screen });

    expect(findText(element, "Offline")).toBe(true);
    expect(findText(element, "Reconnect to refresh responsible officer contact.")).toBe(true);
    expect(findText(element, "Email officer")).toBe(false);
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
