import type { RuntimeMode } from "@jp2/shared-types";
import type { CandidateDashboardResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  candidateScreenTheme,
  candidateStateCopy,
  organizationUnitBody,
  type CandidateScreenAction,
  type CandidateScreenSection,
  type CandidateScreenTheme
} from "./candidate-screen-contracts.js";

export interface CandidateContactScreen {
  route: "CandidateContact";
  state: MobileScreenState;
  title: string;
  body: string;
  officer?: CandidateContactOfficer | undefined;
  contactActions: CandidateContactAction[];
  sections: CandidateScreenSection[];
  actions: CandidateScreenAction[];
  demoChromeVisible: boolean;
  theme: CandidateScreenTheme;
}

export interface CandidateContactOfficer {
  displayName: string;
  email: string;
  phoneLabel: string;
  assignmentLabel: string;
}

export interface CandidateContactAction {
  id: "email" | "phone";
  label: string;
  url: string;
}

export function buildCandidateContactScreen(options: {
  state: MobileScreenState;
  response?: CandidateDashboardResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): CandidateContactScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateContact(options.state, options.runtimeMode === "demo");
  }

  if (!options.response?.profile.responsibleOfficer) {
    return stateOnlyCandidateContact("empty", options.runtimeMode === "demo");
  }

  const officer = options.response.profile.responsibleOfficer;
  const assignmentLabel = options.response.profile.assignedOrganizationUnit
    ? `${options.response.profile.assignedOrganizationUnit.name} - ${organizationUnitBody(
        options.response.profile.assignedOrganizationUnit
      )}`
    : "Local assignment pending";

  return {
    route: "CandidateContact",
    state: "ready",
    title: "Contact Officer",
    body: `${officer.displayName} - ${officer.email}`,
    officer: {
      displayName: officer.displayName,
      email: officer.email,
      phoneLabel: officer.phone ?? "Phone not recorded",
      assignmentLabel
    },
    contactActions: buildContactActions(officer),
    sections: [
      {
        id: "responsible-officer",
        title: officer.displayName,
        body: officer.email
      },
      {
        id: "assignment",
        title: "Assignment",
        body: assignmentLabel
      }
    ],
    actions: [
      {
        id: "dashboard",
        label: "Dashboard",
        targetRoute: "CandidateDashboard"
      }
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: candidateScreenTheme
  };
}

function buildContactActions(
  officer: NonNullable<CandidateDashboardResponseDto["profile"]["responsibleOfficer"]>
): CandidateContactAction[] {
  const actions: CandidateContactAction[] = [
    {
      id: "email",
      label: "Email officer",
      url: `mailto:${encodeURIComponent(officer.email)}`
    }
  ];

  if (officer.phone) {
    actions.push({
      id: "phone",
      label: "Call officer",
      url: `tel:${encodeURIComponent(officer.phone)}`
    });
  }

  return actions;
}

function stateOnlyCandidateContact(
  state: MobileScreenState,
  demoChromeVisible: boolean
): CandidateContactScreen {
  const copy = candidateStateCopy("contact", state);

  return {
    route: "CandidateContact",
    state,
    title: copy.title,
    body: copy.body,
    contactActions: [],
    sections: [],
    actions: [
      {
        id: "dashboard",
        label: "Dashboard",
        targetRoute: "CandidateDashboard"
      }
    ],
    demoChromeVisible,
    theme: candidateScreenTheme
  };
}
