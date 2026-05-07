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
  type AdminCandidateRequestRow
} from "./admin-candidate-request-screen-contracts.js";

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

function candidateRequestRow(
  request: AdminCandidateRequestSummaryDto,
  canWrite: boolean
): AdminCandidateRequestRow {
  return {
    id: request.id,
    title: `${request.firstName} ${request.lastName}`,
    primaryMeta: `${request.email} / ${request.city}, ${request.country}`,
    secondaryMeta: `Updated ${formatAdminCandidateRequestDateTime(request.updatedAt)}`,
    status: request.status,
    assignedOrganizationUnitName:
      request.assignedOrganizationUnitName ??
      request.assignedOrganizationUnitId ??
      "Unassigned",
    createdAt: formatAdminCandidateRequestDateTime(request.createdAt),
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
