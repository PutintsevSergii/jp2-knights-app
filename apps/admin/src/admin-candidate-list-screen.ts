import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminCandidateProfileListResponseDto,
  AdminCandidateProfileSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import {
  formatAdminCandidateDateTime,
  type AdminCandidateAction,
  type AdminCandidateRow
} from "./admin-candidate-screen-contracts.js";

export interface AdminCandidateListScreen {
  route: "AdminCandidateList";
  state: AdminContentScreenState;
  title: string;
  body: string;
  rows: AdminCandidateRow[];
  actions: AdminCandidateAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export function buildAdminCandidateListScreen(options: {
  state: AdminContentScreenState;
  response?: AdminCandidateProfileListResponseDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}): AdminCandidateListScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateList(options.state, options.runtimeMode);
  }

  if (!options.response || options.response.candidateProfiles.length === 0) {
    return stateOnlyCandidateList("empty", options.runtimeMode);
  }

  return {
    route: "AdminCandidateList",
    state: "ready",
    title: "Candidates",
    body: "Manage authenticated candidate profiles, assignment, responsible officer, and status.",
    rows: options.response.candidateProfiles.map((profile) =>
      candidateProfileRow(profile, options.canWrite)
    ),
    actions: buildListActions(),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function candidateProfileRow(
  profile: AdminCandidateProfileSummaryDto,
  canWrite: boolean
): AdminCandidateRow {
  return {
    id: profile.id,
    title: profile.displayName,
    primaryMeta: `${profile.email} / ${profile.preferredLanguage ?? "language unset"}`,
    secondaryMeta: `Updated ${formatAdminCandidateDateTime(profile.updatedAt)}`,
    status: profile.status,
    assignedOrganizationUnitName:
      profile.assignedOrganizationUnitName ?? profile.assignedOrganizationUnitId ?? "Unassigned",
    responsibleOfficerName: profile.responsibleOfficerName ?? "Unassigned",
    actions: buildRowActions(profile, canWrite)
  };
}

function buildListActions(): AdminCandidateAction[] {
  return [{ id: "refresh", label: "Refresh", targetRoute: "AdminCandidateList" }];
}

function buildRowActions(
  profile: AdminCandidateProfileSummaryDto,
  canWrite: boolean
): AdminCandidateAction[] {
  const actions: AdminCandidateAction[] = [
    {
      id: "view",
      label: canWrite ? "Review" : "View",
      targetRoute: "AdminCandidateDetail",
      targetId: profile.id
    }
  ];

  if (!canWrite || profile.status === "archived" || profile.status === "converted_to_brother") {
    return actions;
  }

  actions.push(
    profile.status === "paused"
      ? {
          id: "activate",
          label: "Activate",
          targetRoute: "AdminCandidateDetail",
          targetId: profile.id
        }
      : {
          id: "pause",
          label: "Pause",
          targetRoute: "AdminCandidateDetail",
          targetId: profile.id
        },
    {
      id: "archive",
      label: "Archive",
      targetRoute: "AdminCandidateDetail",
      targetId: profile.id
    }
  );

  return actions;
}

function stateOnlyCandidateList(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminCandidateListScreen {
  const copy = candidateStateCopy[state];

  return {
    route: "AdminCandidateList",
    state,
    title: copy.title,
    body: copy.body,
    rows: [],
    actions: state === "forbidden" ? [] : buildListActions(),
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

const candidateStateCopy: Record<AdminContentScreenState, { title: string; body: string }> = {
  ready: { title: "Candidates", body: "Candidates are ready." },
  loading: { title: "Loading Candidates", body: "Candidates are loading." },
  empty: { title: "Candidates", body: "No candidates are available in the current admin scope." },
  error: { title: "Unable to Load Candidates", body: "Candidates could not be loaded." },
  offline: { title: "Offline", body: "Reconnect to refresh candidates." },
  forbidden: { title: "Access Denied", body: "Admin Lite access is required to manage candidates." }
};
