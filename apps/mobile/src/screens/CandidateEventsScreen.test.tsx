import { describe, expect, it, vi } from "vitest";
import { fallbackCandidateEvents } from "../candidate-dashboard.js";
import { buildCandidateEventsScreen } from "../candidate-screens.js";
import { CandidateEventsScreen } from "./CandidateEventsScreen.js";

describe("CandidateEventsScreen", () => {
  it("renders Figma event card state and forwards RSVP/detail actions", () => {
    const onAction = vi.fn();
    const screen = buildCandidateEventsScreen({
      state: "ready",
      response: {
        ...fallbackCandidateEvents,
        events: [
          {
            ...fallbackCandidateEvents.events[0]!,
            currentUserParticipation: null
          }
        ]
      },
      runtimeMode: "api"
    });
    const element = CandidateEventsScreen({ screen, onAction });

    expect(findText(element, "JP2 Knights")).toBe(true);
    expect(findText(element, "Upcoming Events")).toBe(true);
    expect(findText(element, "RSVP needed")).toBe(true);
    expect(findText(element, "RSVP Now")).toBe(true);
    expect(findText(element, "View Details")).toBe(true);

    findPressableByLabel(element, "RSVP Now")?.props.onPress?.();
    findPressableByLabel(element, "View Details")?.props.onPress?.();

    expect(onAction).toHaveBeenNthCalledWith(1, {
      id: "plan-to-attend",
      label: "RSVP Now",
      targetRoute: "CandidateEvents",
      targetId: fallbackCandidateEvents.events[0]!.id
    });
    expect(onAction).toHaveBeenNthCalledWith(2, {
      id: "view-event-detail",
      label: "View Details",
      targetRoute: "CandidateEventDetail",
      targetId: fallbackCandidateEvents.events[0]!.id
    });
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

function findPressableByLabel(node: TestNode, label: string): TestElement | undefined {
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
