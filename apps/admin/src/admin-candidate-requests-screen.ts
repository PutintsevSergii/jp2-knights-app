import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminCandidateRequestDetailDto,
  AdminCandidateRequestListResponseDto,
  AdminCandidateRequestSummaryDto
} from "@jp2/shared-validation";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import type { AdminContentScreenState } from "./admin-content-api.js";

export type AdminCandidateRequestRoute =
  | "AdminCandidateRequestList"
  | "AdminCandidateRequestDetail";

export type AdminCandidateRequestActionId =
  | "refresh"
  | "view"
  | "contact"
  | "invite"
  | "reject"
  | "save";

export interface AdminCandidateRequestAction {
  id: AdminCandidateRequestActionId;
  label: string;
  targetRoute: AdminCandidateRequestRoute;
  targetId?: string | undefined;
}

export interface AdminCandidateRequestRow {
  id: string;
  title: string;
  primaryMeta: string;
  secondaryMeta: string;
  status: string;
  assignedOrganizationUnitName: string;
  createdAt: string;
  actions: AdminCandidateRequestAction[];
}

export interface AdminCandidateRequestListScreen {
  route: "AdminCandidateRequestList";
  state: AdminContentScreenState;
  title: string;
  body: string;
  rows: AdminCandidateRequestRow[];
  actions: AdminCandidateRequestAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface AdminCandidateRequestField {
  name:
    | keyof AdminCandidateRequestDetailDto
    | "status"
    | "assignedOrganizationUnitId"
    | "officerNote";
  label: string;
  value: string;
  required: boolean;
  readOnly: boolean;
  multiline: boolean;
}

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

export interface BuildAdminCandidateRequestListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminCandidateRequestListResponseDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}

export interface BuildAdminCandidateRequestDetailScreenOptions {
  state: AdminContentScreenState;
  candidateRequest?: AdminCandidateRequestDetailDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}

export function buildAdminCandidateRequestListScreen(
  options: BuildAdminCandidateRequestListScreenOptions
): AdminCandidateRequestListScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateRequestList(options.state, options.runtimeMode);
  }

  if (!options.response || options.response.candidateRequests.length === 0) {
    return stateOnlyCandidateRequestList("empty", options.runtimeMode);
  }

  return {
    route: "AdminCandidateRequestList",
    state: "ready",
    title: "Candidate Requests",
    body: "Review join-interest requests, officer follow-up status, and scoped assignments.",
    rows: options.response.candidateRequests.map((request) =>
      candidateRequestRow(request, options.canWrite)
    ),
    actions: buildListActions(),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
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

function candidateRequestRow(
  request: AdminCandidateRequestSummaryDto,
  canWrite: boolean
): AdminCandidateRequestRow {
  return {
    id: request.id,
    title: `${request.firstName} ${request.lastName}`,
    primaryMeta: `${request.email} / ${request.city}, ${request.country}`,
    secondaryMeta: `Updated ${formatDateTime(request.updatedAt)}`,
    status: request.status,
    assignedOrganizationUnitName:
      request.assignedOrganizationUnitName ??
      request.assignedOrganizationUnitId ??
      "Unassigned",
    createdAt: formatDateTime(request.createdAt),
    actions: buildRowActions(request, canWrite)
  };
}

function buildListActions(): AdminCandidateRequestAction[] {
  return [
    {
      id: "refresh",
      label: "Refresh",
      targetRoute: "AdminCandidateRequestList"
    }
  ];
}

function buildRowActions(
  request: AdminCandidateRequestSummaryDto,
  canWrite: boolean
): AdminCandidateRequestAction[] {
  const actions: AdminCandidateRequestAction[] = [
    {
      id: "view",
      label: canWrite ? "Review" : "View",
      targetRoute: "AdminCandidateRequestDetail",
      targetId: request.id
    }
  ];

  if (!canWrite || request.status === "converted_to_candidate" || request.status === "rejected") {
    return actions;
  }

  if (request.status === "new") {
    actions.push({
      id: "contact",
      label: "Mark Contacted",
      targetRoute: "AdminCandidateRequestDetail",
      targetId: request.id
    });
  }

  if (request.status === "contacted") {
    actions.push({
      id: "invite",
      label: "Mark Invited",
      targetRoute: "AdminCandidateRequestDetail",
      targetId: request.id
    });
  }

  actions.push({
    id: "reject",
    label: "Reject",
    targetRoute: "AdminCandidateRequestDetail",
    targetId: request.id
  });

  return actions;
}

function buildDetailActions(
  request: AdminCandidateRequestDetailDto,
  canWrite: boolean
): AdminCandidateRequestAction[] {
  const actions: AdminCandidateRequestAction[] = [
    {
      id: "refresh",
      label: "Back to List",
      targetRoute: "AdminCandidateRequestList"
    }
  ];

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

function stateOnlyCandidateRequestList(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminCandidateRequestListScreen {
  const copy = candidateRequestStateCopy[state];

  return {
    route: "AdminCandidateRequestList",
    state,
    title: copy.title,
    body: copy.body,
    rows: [],
    actions: state === "forbidden" ? [] : buildListActions(),
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
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
    actions:
      state === "forbidden"
        ? []
        : [
            {
              id: "refresh",
              label: "Back to List",
              targetRoute: "AdminCandidateRequestList"
            }
          ],
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
    field("consentAt", "Consent At", formatDateTime(request.consentAt), true, true),
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

function formatDateTime(value: string): string {
  return new Date(value).toISOString();
}

const candidateRequestStateCopy: Record<AdminContentScreenState, { title: string; body: string }> =
  {
    ready: {
      title: "Candidate Requests",
      body: "Candidate requests are ready."
    },
    loading: {
      title: "Loading Candidate Requests",
      body: "Candidate requests are loading."
    },
    empty: {
      title: "Candidate Requests",
      body: "No candidate requests are available in the current admin scope."
    },
    error: {
      title: "Unable to Load Candidate Requests",
      body: "Candidate requests could not be loaded."
    },
    offline: {
      title: "Offline",
      body: "Reconnect to refresh candidate requests."
    },
    forbidden: {
      title: "Access Denied",
      body: "Admin Lite access is required to manage candidate requests."
    }
  };

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
