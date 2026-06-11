import { describe, expect, it, vi } from "vitest";
import { fallbackCandidateAnnouncements } from "../candidate-dashboard.js";
import { buildCandidateAnnouncementDetailScreen } from "../candidate-screens.js";
import { CandidateAnnouncementDetailScreen } from "./CandidateAnnouncementDetailScreen.js";

describe("CandidateAnnouncementDetailScreen", () => {
  it("renders a one-way candidate announcement detail and forwards navigation actions", () => {
    const onAction = vi.fn();
    const screen = buildCandidateAnnouncementDetailScreen({
      state: "ready",
      response: fallbackCandidateAnnouncements,
      selectedAnnouncementId: fallbackCandidateAnnouncements.announcements[0]!.id,
      runtimeMode: "api"
    });
    const element = CandidateAnnouncementDetailScreen({ screen, onAction });

    expect(findText(element, "JP2 Knights")).toBe(true);
    expect(findText(element, "Candidate Formation Update")).toBe(true);
    expect(findText(element, "Pinned announcement")).toBe(true);
    expect(findText(element, "May 7, 2026, 12:00")).toBe(true);
    expect(findText(element, "One-way announcement")).toBe(true);
    expect(JSON.stringify(element)).not.toMatch(
      /brother|membership|degree|chat|comment|read receipt|delivery|participants/i
    );

    findPressableByLabel(element, "Candidate Announcements")?.props.onPress?.();
    findPressableByLabel(element, "Home")?.props.onPress?.();

    expect(onAction).toHaveBeenNthCalledWith(1, {
      id: "announcements",
      label: "Candidate Announcements",
      targetRoute: "CandidateAnnouncements"
    });
    expect(onAction).toHaveBeenNthCalledWith(2, {
      id: "dashboard",
      label: "Home",
      targetRoute: "CandidateDashboard"
    });
  });

  it("renders empty state when the announcement is not available", () => {
    const screen = buildCandidateAnnouncementDetailScreen({
      state: "ready",
      response: fallbackCandidateAnnouncements,
      selectedAnnouncementId: "00000000-0000-4000-8000-000000000000",
      runtimeMode: "api"
    });
    const element = CandidateAnnouncementDetailScreen({ screen });

    expect(findText(element, "Candidate Announcement")).toBe(true);
    expect(findText(element, "This candidate-visible announcement is not available.")).toBe(true);
    expect(findText(element, "One-way announcement")).toBe(false);
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
