import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminCandidateRequestListResponseDto,
  AdminCandidateRequestSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import {
  formatAdminCandidateRequestDateTime,
  type AdminCandidateRequestAction,
  type AdminCandidateRequestMetric,
  type AdminCandidateRequestRow
} from "./admin-candidate-request-screen-contracts.js";

export interface AdminCandidateRequestListScreen {
  route: "AdminCandidateRequestList";
  state: AdminContentScreenState;
  title: string;
  body: string;
  metrics: AdminCandidateRequestMetric[];
  rows: AdminCandidateRequestRow[];
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

export function buildAdminCandidateRequestListScreen(
  options: BuildAdminCandidateRequestListScreenOptions
): AdminCandidateRequestListScreen {
  if (options.state !== "ready") {
    return stateOnlyCandidateRequestList(options.state, options.runtimeMode);
  }

  if (!options.response || options.response.candidateRequests.length === 0) {
    return stateOnlyCandidateRequestList("empty", options.runtimeMode);
  }

  const rows = options.response.candidateRequests.map((request) =>
    candidateRequestRow(request, options.canWrite)
  );

  return {
    route: "AdminCandidateRequestList",
    state: "ready",
    title: "Candidate Requests",
    body: "Review join-interest requests, officer follow-up status, and scoped assignments.",
    metrics: buildStatusMetrics(options.response.candidateRequests),
    rows,
    actions: buildListActions(),
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
    initials: candidateInitials(request.firstName, request.lastName),
    primaryMeta: request.email,
    secondaryMeta: `Updated ${formatAdminCandidateRequestDateTime(request.updatedAt)}`,
    locationMeta: `${request.city}, ${request.country}`,
    messagePreview: request.messagePreview ?? "No message provided.",
    status: request.status,
    statusLabel: statusLabel(request.status),
    assignedOrganizationUnitName:
      request.assignedOrganizationUnitName ??
      request.assignedOrganizationUnitId ??
      "Unassigned",
    createdAt: formatAdminCandidateRequestDateTime(request.createdAt),
    actions: buildRowActions(request, canWrite)
  };
}

function buildStatusMetrics(
  requests: readonly AdminCandidateRequestSummaryDto[]
): AdminCandidateRequestMetric[] {
  return [
    {
      id: "new",
      label: "New",
      count: countStatus(requests, "new"),
      description: "Requires initial contact",
      tone: "attention"
    },
    {
      id: "contacted",
      label: "Contacted",
      count: countStatus(requests, "contacted"),
      description: "Awaiting response",
      tone: "warning"
    },
    {
      id: "invited",
      label: "Invited",
      count: countStatus(requests, "invited"),
      description: "To next formation meeting",
      tone: "success"
    },
    {
      id: "rejected",
      label: "Rejected",
      count: countStatus(requests, "rejected"),
      description: "Declined applications",
      tone: "danger"
    }
  ];
}

function countStatus(
  requests: readonly AdminCandidateRequestSummaryDto[],
  status: AdminCandidateRequestSummaryDto["status"]
): number {
  return requests.filter((request) => request.status === status).length;
}

function candidateInitials(firstName: string, lastName: string): string {
  return `${firstName.at(0) ?? ""}${lastName.at(0) ?? ""}`.toUpperCase();
}

function statusLabel(status: AdminCandidateRequestSummaryDto["status"]): string {
  return status.replaceAll("_", " ").toUpperCase();
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
    metrics: buildStatusMetrics([]),
    rows: [],
    actions: state === "forbidden" ? [] : buildListActions(),
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
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
