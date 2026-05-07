import type { RuntimeMode } from "@jp2/shared-types";
import type { BrotherTodayResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherEventBody,
  brotherScreenTheme,
  brotherStateCopy,
  buildOrganizationUnitSection,
  type BrotherScreenAction,
  type BrotherScreenSection,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";

export interface BrotherTodayScreen {
  route: "BrotherToday";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export function buildBrotherTodayScreen(options: {
  state: MobileScreenState;
  response?: BrotherTodayResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): BrotherTodayScreen {
  if (options.state !== "ready") {
    return stateOnlyBrotherToday(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyBrotherToday("empty", options.runtimeMode === "demo");
  }

  return {
    route: "BrotherToday",
    state: "ready",
    title: "Brother Today",
    body: brotherTodayBody(options.response),
    sections: buildTodaySections(options.response),
    actions: options.response.cards.map((card) => ({
      id: card.id,
      label: card.label,
      targetRoute: card.targetRoute
    })),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: brotherScreenTheme
  };
}

function buildTodaySections(response: BrotherTodayResponseDto): BrotherScreenSection[] {
  const sections = response.cards.map((card) => ({
    id: `card-${card.id}`,
    title: card.label,
    body: card.body
  }));

  if (response.upcomingEvents.length > 0) {
    sections.push(
      ...response.upcomingEvents.map((event) => ({
        id: `event-${event.id}`,
        title: event.title,
        body: brotherEventBody(event)
      }))
    );
  } else {
    sections.push({
      id: "events-empty",
      title: "Events",
      body: "No brother-visible events are listed yet."
    });
  }

  sections.push(
    ...response.organizationUnits.map((organizationUnit) =>
      buildOrganizationUnitSection(organizationUnit)
    )
  );

  return sections;
}

function stateOnlyBrotherToday(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherTodayScreen {
  const copy = brotherStateCopy("today", state);

  return {
    route: "BrotherToday",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function brotherTodayBody(response: BrotherTodayResponseDto): string {
  const degree = response.profileSummary.currentDegree ?? "degree pending";
  const organizationUnit = response.profileSummary.organizationUnitName ?? "choragiew pending";

  return `${response.profileSummary.displayName} - ${degree} - ${organizationUnit}`;
}
