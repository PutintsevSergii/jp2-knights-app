import { describe, expect, it, vi } from "vitest";
import { fallbackCandidateEventDetail } from "../candidate-dashboard.js";
import { buildCandidateEventDetailScreen } from "../candidate-screens.js";
import { CandidateEventDetailScreen } from "./CandidateEventDetailScreen.js";

describe("CandidateEventDetailScreen", () => {
  it("renders Figma-style event detail and forwards own RSVP actions only", () => {
    const onAction = vi.fn();
    const screen = buildCandidateEventDetailScreen({
      state: "ready",
      response: fallbackCandidateEventDetail,
      runtimeMode: "api"
    });
    const element = CandidateEventDetailScreen({ screen, onAction });

    expect(findText(element, "JP2 Knights")).toBe(true);
    expect(findText(element, "Candidate Gathering")).toBe(true);
    expect(findText(element, "Formation")).toBe(true);
    expect(findText(element, "Planning to attend")).toBe(true);
    expect(findText(element, "Date")).toBe(true);
    expect(findText(element, "Time")).toBe(true);
    expect(findText(element, "Location")).toBe(true);
    expect(findText(element, "Formation gathering for active candidates.")).toBe(true);
    expect(JSON.stringify(element)).not.toMatch(/participants|brother|membership|degree/i);

    findPressableByLabel(element, "Cancel intent")?.props.onPress?.();
    findPressableByLabel(element, "Candidate Events")?.props.onPress?.();

    expect(onAction).toHaveBeenNthCalledWith(1, {
      id: "cancel-participation",
      label: "Cancel intent",
      targetRoute: "CandidateEventDetail",
      targetId: fallbackCandidateEventDetail.event.id
    });
    expect(onAction).toHaveBeenNthCalledWith(2, {
      id: "events",
      label: "Candidate Events",
      targetRoute: "CandidateEvents"
    });
  });

  it("renders non-ready state copy without event detail cards", () => {
    const screen = buildCandidateEventDetailScreen({
      state: "forbidden",
      runtimeMode: "api"
    });
    const element = CandidateEventDetailScreen({ screen });

    expect(findText(element, "Access Denied")).toBe(true);
    expect(findText(element, "An active candidate profile is required.")).toBe(true);
    expect(findText(element, "Date")).toBe(false);
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
