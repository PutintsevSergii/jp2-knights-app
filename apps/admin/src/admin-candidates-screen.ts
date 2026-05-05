import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminCandidateProfileDetailDto,
  AdminCandidateProfileListResponseDto,
  AdminCandidateProfileSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";

export type AdminCandidateRoute = "AdminCandidateList" | "AdminCandidateDetail";
export type AdminCandidateActionId = "refresh" | "view" | "save" | "pause" | "activate" | "archive";

export interface AdminCandidateAction {
  id: AdminCandidateActionId;
  label: string;
  targetRoute: AdminCandidateRoute;
  targetId?: string | undefined;
}

export interface AdminCandidateRow {
  id: string;
  title: string;
  primaryMeta: string;
  secondaryMeta: string;
  status: string;
  assignedOrganizationUnitName: string;
  responsibleOfficerName: string;
  actions: AdminCandidateAction[];
}

export interface AdminCandidateField {
  name:
    | keyof AdminCandidateProfileDetailDto
    | "status"
    | "assignedOrganizationUnitId"
    | "responsibleOfficerId";
  label: string;
  value: string;
  required: boolean;
  readOnly: boolean;
}

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

export interface AdminCandidateDetailScreen {
  route: "AdminCandidateDetail";
  state: AdminContentScreenState;
  title: string;
  body: string;
  candidateProfileId: string | null;
  fields: AdminCandidateField[];
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

export function buildAdminCandidateDetailScreen(options: {
  state: AdminContentScreenState;
  candidateProfile?: AdminCandidateProfileDetailDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}): AdminCandidateDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateDetail(options.state, options.runtimeMode);
  }

  if (!options.candidateProfile) {
    return stateOnlyCandidateDetail("empty", options.runtimeMode);
  }

  return {
    route: "AdminCandidateDetail",
    state: "ready",
    title: `Candidate: ${options.candidateProfile.displayName}`,
    body: options.canWrite
      ? "Update scoped assignment, responsible officer, or candidate profile status."
      : "Review the scoped candidate profile. Write access is required to update fields.",
    candidateProfileId: options.candidateProfile.id,
    fields: buildCandidateFields(options.candidateProfile, options.canWrite),
    actions: buildDetailActions(options.candidateProfile, options.canWrite),
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
    secondaryMeta: `Updated ${formatDateTime(profile.updatedAt)}`,
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

function buildDetailActions(
  profile: AdminCandidateProfileDetailDto,
  canWrite: boolean
): AdminCandidateAction[] {
  const actions: AdminCandidateAction[] = [
    { id: "refresh", label: "Back to List", targetRoute: "AdminCandidateList" }
  ];

  if (canWrite && profile.status !== "converted_to_brother") {
    actions.unshift({
      id: "save",
      label: "Save Candidate",
      targetRoute: "AdminCandidateDetail",
      targetId: profile.id
    });
  }

  return actions;
}

function buildCandidateFields(
  profile: AdminCandidateProfileDetailDto,
  canWrite: boolean
): AdminCandidateField[] {
  return [
    field("displayName", "Display Name", profile.displayName, true, true),
    field("email", "Email", profile.email, true, true),
    field("preferredLanguage", "Preferred Language", profile.preferredLanguage ?? "", false, true),
    field(
      "candidateRequestId",
      "Candidate Request ID",
      profile.candidateRequestId ?? "",
      false,
      true
    ),
    field("status", "Status", profile.status, true, !canWrite),
    field(
      "assignedOrganizationUnitId",
      "Assigned Organization Unit ID",
      profile.assignedOrganizationUnitId ?? "",
      false,
      !canWrite
    ),
    field(
      "responsibleOfficerId",
      "Responsible Officer ID",
      profile.responsibleOfficerId ?? "",
      false,
      !canWrite
    )
  ];
}

function field(
  name: AdminCandidateField["name"],
  label: string,
  value: string,
  required: boolean,
  readOnly: boolean
): AdminCandidateField {
  return { name, label, value, required, readOnly };
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

function stateOnlyCandidateDetail(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminCandidateDetailScreen {
  const copy = candidateDetailStateCopy[state];

  return {
    route: "AdminCandidateDetail",
    state,
    title: copy.title,
    body: copy.body,
    candidateProfileId: null,
    fields: [],
    actions:
      state === "forbidden"
        ? []
        : [{ id: "refresh", label: "Back to List", targetRoute: "AdminCandidateList" }],
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function formatDateTime(value: string): string {
  return new Date(value).toISOString();
}

const candidateStateCopy: Record<AdminContentScreenState, { title: string; body: string }> = {
  ready: { title: "Candidates", body: "Candidates are ready." },
  loading: { title: "Loading Candidates", body: "Candidates are loading." },
  empty: { title: "Candidates", body: "No candidates are available in the current admin scope." },
  error: { title: "Unable to Load Candidates", body: "Candidates could not be loaded." },
  offline: { title: "Offline", body: "Reconnect to refresh candidates." },
  forbidden: { title: "Access Denied", body: "Admin Lite access is required to manage candidates." }
};

const candidateDetailStateCopy: Record<AdminContentScreenState, { title: string; body: string }> = {
  ready: { title: "Candidate", body: "Candidate is ready." },
  loading: { title: "Loading Candidate", body: "Candidate is loading." },
  empty: {
    title: "Candidate Not Found",
    body: "The requested candidate is not available in the current admin scope."
  },
  error: { title: "Unable to Load Candidate", body: "Candidate could not be loaded." },
  offline: { title: "Offline", body: "Reconnect to refresh this candidate." },
  forbidden: { title: "Access Denied", body: "Admin Lite access is required to review candidates." }
};
