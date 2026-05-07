import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminCandidateProfileDetailDto } from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import {
  adminCandidateBackAction,
  type AdminCandidateAction,
  type AdminCandidateField
} from "./admin-candidate-screen-contracts.js";

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

function buildDetailActions(
  profile: AdminCandidateProfileDetailDto,
  canWrite: boolean
): AdminCandidateAction[] {
  const actions: AdminCandidateAction[] = [adminCandidateBackAction()];

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
    actions: state === "forbidden" ? [] : [adminCandidateBackAction()],
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

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
