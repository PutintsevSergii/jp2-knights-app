import type { RuntimeMode } from "@jp2/shared-types";
import type { CandidateDashboardResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  candidateEventBody,
  candidateScreenTheme,
  candidateStateCopy,
  organizationUnitBody,
  type CandidateScreenAction,
  type CandidateScreenSection,
  type CandidateScreenTheme
} from "./candidate-screen-contracts.js";

export interface CandidateDashboardScreen {
  route: "CandidateDashboard";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: CandidateScreenSection[];
  actions: CandidateScreenAction[];
  demoChromeVisible: boolean;
  theme: CandidateScreenTheme;
}

export interface BuildCandidateDashboardScreenOptions {
  state: MobileScreenState;
  response?: CandidateDashboardResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export function buildCandidateDashboardScreen(
  options: BuildCandidateDashboardScreenOptions
): CandidateDashboardScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateDashboard(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyCandidateDashboard("empty", options.runtimeMode === "demo");
  }

  return {
    route: "CandidateDashboard",
    state: "ready",
    title: "Candidate Dashboard",
    body: candidateDashboardBody(options.response),
    sections: buildCandidateDashboardSections(options.response),
    actions: buildCandidateDashboardActions(options.response),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: candidateScreenTheme
  };
}

function buildCandidateDashboardSections(
  response: CandidateDashboardResponseDto
): CandidateScreenSection[] {
  const sections: CandidateScreenSection[] = [
    {
      id: "next-step",
      title: response.nextStep.label,
      body: response.nextStep.body
    }
  ];

  if (response.profile.assignedOrganizationUnit) {
    sections.push({
      id: "assignment",
      title: response.profile.assignedOrganizationUnit.name,
      body: organizationUnitBody(response.profile.assignedOrganizationUnit)
    });
  } else {
    sections.push({
      id: "assignment-empty",
      title: "Assignment",
      body: "Your local assignment is being prepared."
    });
  }

  if (response.profile.responsibleOfficer) {
    sections.push({
      id: "responsible-officer",
      title: response.profile.responsibleOfficer.displayName,
      body: response.profile.responsibleOfficer.email
    });
  }

  if (response.upcomingEvents.length > 0) {
    sections.push(
      ...response.upcomingEvents.map((event) => ({
        id: `event-${event.id}`,
        title: event.title,
        body: candidateEventBody(event)
      }))
    );
  } else {
    sections.push({
      id: "events-empty",
      title: "Events",
      body: "No candidate-visible events are listed yet."
    });
  }

  if (response.announcements.length > 0) {
    sections.push(
      ...response.announcements.map((announcement) => ({
        id: `announcement-${announcement.id}`,
        title: announcement.title,
        body: announcement.body
      }))
    );
  } else {
    sections.push({
      id: "announcements-empty",
      title: "Announcements",
      body: "No candidate announcements are listed yet."
    });
  }

  return sections;
}

function buildCandidateDashboardActions(
  response: CandidateDashboardResponseDto
): CandidateScreenAction[] {
  const actions: CandidateScreenAction[] = [
    {
      id: "next-step",
      label: response.nextStep.label,
      targetRoute: response.nextStep.targetRoute
    }
  ];

  if (response.profile.responsibleOfficer) {
    actions.push({
      id: "contact",
      label: "Contact",
      targetRoute: "CandidateContact"
    });
  }

  if (response.upcomingEvents.length > 0) {
    actions.push({
      id: "events",
      label: "Events",
      targetRoute: "CandidateEvents"
    });
  }

  if (response.announcements.length > 0) {
    actions.push({
      id: "announcements",
      label: "Announcements",
      targetRoute: "CandidateAnnouncements"
    });
  }

  return actions;
}

function stateOnlyCandidateDashboard(
  state: MobileScreenState,
  demoChromeVisible: boolean
): CandidateDashboardScreen {
  const copy = candidateStateCopy("dashboard", state);

  return {
    route: "CandidateDashboard",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: candidateScreenTheme
  };
}

function candidateDashboardBody(response: CandidateDashboardResponseDto): string {
  const assignment = response.profile.assignedOrganizationUnit?.name ?? "local assignment pending";

  return `${response.profile.displayName} - ${assignment}`;
}
