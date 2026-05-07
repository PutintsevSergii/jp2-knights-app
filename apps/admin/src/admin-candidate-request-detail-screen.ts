import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminCandidateRequestDetailDto } from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import {
  adminCandidateRequestBackAction,
  formatAdminCandidateRequestDateTime,
  type AdminCandidateRequestAction,
  type AdminCandidateRequestField
} from "./admin-candidate-request-screen-contracts.js";

export interface AdminCandidateRequestDetailScreen {
  route: "AdminCandidateRequestDetail";
  state: AdminContentScreenState;
  title: string;
  body: string;
  candidateRequestId: string | null;
  fields: AdminCandidateRequestField[];
  actions: AdminCandidateRequestAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface BuildAdminCandidateRequestDetailScreenOptions {
  state: AdminContentScreenState;
  candidateRequest?: AdminCandidateRequestDetailDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}

export function buildAdminCandidateRequestDetailScreen(
  options: BuildAdminCandidateRequestDetailScreenOptions
): AdminCandidateRequestDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateRequestDetail(options.state, options.runtimeMode);
  }

  if (!options.candidateRequest) {
    return stateOnlyCandidateRequestDetail("empty", options.runtimeMode);
  }

  return {
    route: "AdminCandidateRequestDetail",
    state: "ready",
    title: `Candidate Request: ${options.candidateRequest.firstName} ${options.candidateRequest.lastName}`,
    body: options.canWrite
      ? "Update follow-up status, scoped assignment, and officer notes without converting the request yet."
      : "Review the scoped candidate request. Write access is required to update follow-up fields.",
    candidateRequestId: options.candidateRequest.id,
    fields: buildCandidateRequestFields(options.candidateRequest, options.canWrite),
    actions: buildDetailActions(options.candidateRequest, options.canWrite),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function buildDetailActions(
  request: AdminCandidateRequestDetailDto,
  canWrite: boolean
): AdminCandidateRequestAction[] {
  const actions: AdminCandidateRequestAction[] = [adminCandidateRequestBackAction()];

  if (
    canWrite &&
    request.status !== "converted_to_candidate" &&
    request.status !== "rejected"
  ) {
    actions.unshift({
      id: "save",
      label: "Save Follow-up",
      targetRoute: "AdminCandidateRequestDetail",
      targetId: request.id
    });
  }

  return actions;
}

function stateOnlyCandidateRequestDetail(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminCandidateRequestDetailScreen {
  const copy = candidateRequestDetailStateCopy[state];

  return {
    route: "AdminCandidateRequestDetail",
    state,
    title: copy.title,
    body: copy.body,
    candidateRequestId: null,
    fields: [],
    actions: state === "forbidden" ? [] : [adminCandidateRequestBackAction()],
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function buildCandidateRequestFields(
  request: AdminCandidateRequestDetailDto,
  canWrite: boolean
): AdminCandidateRequestField[] {
  return [
    field("firstName", "First Name", request.firstName, true, true),
    field("lastName", "Last Name", request.lastName, true, true),
    field("email", "Email", request.email, true, true),
    field("phone", "Phone", request.phone ?? "", false, true),
    field("country", "Country", request.country, true, true),
    field("city", "City", request.city, true, true),
    field("preferredLanguage", "Preferred Language", request.preferredLanguage ?? "", false, true),
    field("message", "Message", request.message ?? "", false, true, true),
    field("consentTextVersion", "Consent Text Version", request.consentTextVersion, true, true),
    field(
      "consentAt",
      "Consent At",
      formatAdminCandidateRequestDateTime(request.consentAt),
      true,
      true
    ),
    field("status", "Status", request.status, true, !canWrite),
    field(
      "assignedOrganizationUnitId",
      "Assigned Organization Unit ID",
      request.assignedOrganizationUnitId ?? "",
      false,
      !canWrite
    ),
    field("officerNote", "Officer Note", request.officerNote ?? "", false, !canWrite, true)
  ];
}

function field(
  name: AdminCandidateRequestField["name"],
  label: string,
  value: string,
  required: boolean,
  readOnly: boolean,
  multiline = false
): AdminCandidateRequestField {
  return {
    name,
    label,
    value,
    required,
    readOnly,
    multiline
  };
}

const candidateRequestDetailStateCopy: Record<
  AdminContentScreenState,
  { title: string; body: string }
> = {
  ready: {
    title: "Candidate Request",
    body: "Candidate request is ready."
  },
  loading: {
    title: "Loading Candidate Request",
    body: "Candidate request is loading."
  },
  empty: {
    title: "Candidate Request Not Found",
    body: "The requested candidate request is not available in the current admin scope."
  },
  error: {
    title: "Unable to Load Candidate Request",
    body: "Candidate request could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh this candidate request."
  },
  forbidden: {
    title: "Access Denied",
    body: "Admin Lite access is required to review candidate requests."
  }
};
