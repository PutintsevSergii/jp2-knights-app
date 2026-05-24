import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminRoadmapAssignmentListResponseDto,
  AdminRoadmapAssignmentSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import {
  formatAdminRoadmapAssignmentDateTime,
  roadmapAssignmentStatusLabel,
  type AdminRoadmapAssignmentAction,
  type AdminRoadmapAssignmentRow
} from "./admin-roadmap-assignment-screen-contracts.js";

export interface AdminRoadmapAssignmentListScreen {
  route: "AdminRoadmapAssignmentList";
  state: AdminContentScreenState;
  title: string;
  body: string;
  rows: AdminRoadmapAssignmentRow[];
  actions: AdminRoadmapAssignmentAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface BuildAdminRoadmapAssignmentListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminRoadmapAssignmentListResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export function buildAdminRoadmapAssignmentListScreen(
  options: BuildAdminRoadmapAssignmentListScreenOptions
): AdminRoadmapAssignmentListScreen {
  if (options.state !== "ready") {
    return stateOnlyRoadmapAssignmentList(options.state, options.runtimeMode);
  }

  if (!options.response || options.response.roadmapAssignments.length === 0) {
    return stateOnlyRoadmapAssignmentList("empty", options.runtimeMode);
  }

  return {
    route: "AdminRoadmapAssignmentList",
    state: "ready",
    title: "Roadmap Assignments",
    body: "Inspect who has an assigned candidate or brother roadmap. Assignment changes remain deferred.",
    rows: options.response.roadmapAssignments.map(roadmapAssignmentRow),
    actions: buildListActions(),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function roadmapAssignmentRow(
  assignment: AdminRoadmapAssignmentSummaryDto
): AdminRoadmapAssignmentRow {
  return {
    id: assignment.id,
    title: assignment.roadmapTitle,
    assignee: `${assignment.assigneeName} <${assignment.assigneeEmail}>`,
    roadmapMeta: `${assignment.roadmapTargetRole} · ${assignment.roadmapStatus}`,
    organizationUnitName: assignment.organizationUnitName ?? "Global assignment",
    status: assignment.status,
    statusLabel: roadmapAssignmentStatusLabel(assignment.status),
    countsLabel: `${assignment.submissionCount} submissions · ${assignment.pendingSubmissionCount} pending`,
    assignedAt: formatAdminRoadmapAssignmentDateTime(assignment.assignedAt),
    actions: [
      {
        id: "view",
        label: "View",
        targetRoute: "AdminRoadmapAssignmentDetail",
        targetId: assignment.id
      }
    ]
  };
}

function buildListActions(): AdminRoadmapAssignmentAction[] {
  return [
    {
      id: "refresh",
      label: "Refresh",
      targetRoute: "AdminRoadmapAssignmentList"
    }
  ];
}

function stateOnlyRoadmapAssignmentList(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminRoadmapAssignmentListScreen {
  const copy = roadmapAssignmentListStateCopy[state];

  return {
    route: "AdminRoadmapAssignmentList",
    state,
    title: copy.title,
    body: copy.body,
    rows: [],
    actions: state === "forbidden" ? [] : buildListActions(),
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

const roadmapAssignmentListStateCopy: Record<
  AdminContentScreenState,
  { title: string; body: string }
> = {
  ready: {
    title: "Roadmap Assignments",
    body: "Roadmap assignments are ready."
  },
  loading: {
    title: "Loading Roadmap Assignments",
    body: "Roadmap assignments are loading."
  },
  empty: {
    title: "Roadmap Assignments",
    body: "No roadmap assignments are configured."
  },
  error: {
    title: "Unable to Load Roadmap Assignments",
    body: "Roadmap assignments could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh roadmap assignments."
  },
  forbidden: {
    title: "Access Denied",
    body: "Super Admin access is required to inspect roadmap assignments."
  }
};
