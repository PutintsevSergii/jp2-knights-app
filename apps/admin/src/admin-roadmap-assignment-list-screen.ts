import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminRoadmapAssignmentListResponseDto,
  AdminRoadmapAssignmentSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import { adminCopy } from "./admin-i18n.js";
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
    title: adminCopy("admin.roadmapAssignments.title"),
    body: adminCopy("admin.roadmapAssignments.list.body"),
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
    organizationUnitName:
      assignment.organizationUnitName ?? adminCopy("admin.roadmapAssignments.global"),
    status: assignment.status,
    statusLabel: roadmapAssignmentStatusLabel(assignment.status),
    countsLabel: adminCopy("admin.roadmapAssignments.counts", {
      submissionCount: assignment.submissionCount,
      pendingCount: assignment.pendingSubmissionCount
    }),
    assignedAt: formatAdminRoadmapAssignmentDateTime(assignment.assignedAt),
    actions: [
      {
        id: "view",
        label: adminCopy("admin.roadmapAssignments.view"),
        targetRoute: "AdminRoadmapAssignmentDetail",
        targetId: assignment.id
      }
    ]
  };
}

function buildListActions(): AdminRoadmapAssignmentAction[] {
  return [
    {
      id: "create",
      label: adminCopy("admin.roadmapAssignments.create"),
      targetRoute: "AdminRoadmapAssignmentList"
    },
    {
      id: "refresh",
      label: adminCopy("common.refresh"),
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
    title: adminCopy("admin.roadmapAssignments.title"),
    body: adminCopy("admin.roadmapAssignments.ready.body")
  },
  loading: {
    title: adminCopy("admin.roadmapAssignments.loading.title"),
    body: adminCopy("admin.roadmapAssignments.loading.body")
  },
  empty: {
    title: adminCopy("admin.roadmapAssignments.title"),
    body: adminCopy("admin.roadmapAssignments.empty.body")
  },
  error: {
    title: adminCopy("admin.roadmapAssignments.error.title"),
    body: adminCopy("admin.roadmapAssignments.error.body")
  },
  offline: {
    title: adminCopy("common.offline.title"),
    body: adminCopy("admin.roadmapAssignments.offline.body")
  },
  forbidden: {
    title: adminCopy("common.accessDenied.title"),
    body: adminCopy("admin.roadmapAssignments.forbidden.body")
  }
};
