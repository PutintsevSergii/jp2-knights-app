import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminRoadmapAssignmentDetailDto } from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import { formatAdminStatusLabel } from "./admin-status-labels.js";
import {
  adminRoadmapAssignmentBackAction,
  formatAdminRoadmapAssignmentDateTime,
  roadmapAssignmentStatusLabel,
  type AdminRoadmapAssignmentAction,
  type AdminRoadmapAssignmentSection
} from "./admin-roadmap-assignment-screen-contracts.js";

export interface AdminRoadmapAssignmentDetailScreen {
  route: "AdminRoadmapAssignmentDetail";
  state: AdminContentScreenState;
  title: string;
  body: string;
  roadmapAssignmentId: string | null;
  sections: AdminRoadmapAssignmentSection[];
  actions: AdminRoadmapAssignmentAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface BuildAdminRoadmapAssignmentDetailScreenOptions {
  state: AdminContentScreenState;
  roadmapAssignment?: AdminRoadmapAssignmentDetailDto | undefined;
  runtimeMode: RuntimeMode;
}

export function buildAdminRoadmapAssignmentDetailScreen(
  options: BuildAdminRoadmapAssignmentDetailScreenOptions
): AdminRoadmapAssignmentDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyRoadmapAssignmentDetail(options.state, options.runtimeMode);
  }

  if (!options.roadmapAssignment) {
    return stateOnlyRoadmapAssignmentDetail("empty", options.runtimeMode);
  }

  return {
    route: "AdminRoadmapAssignmentDetail",
    state: "ready",
    title: `Roadmap Assignment: ${options.roadmapAssignment.assigneeName}`,
    body: `${options.roadmapAssignment.roadmapTitle} · ${roadmapAssignmentStatusLabel(options.roadmapAssignment.status)}`,
    roadmapAssignmentId: options.roadmapAssignment.id,
    sections: buildSections(options.roadmapAssignment),
    actions: [adminRoadmapAssignmentBackAction()],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function buildSections(
  assignment: AdminRoadmapAssignmentDetailDto
): AdminRoadmapAssignmentSection[] {
  return [
    {
      id: "assignment",
      title: "Assignment",
      body: [
        `${assignment.assigneeName} <${assignment.assigneeEmail}>`,
        assignment.organizationUnitName ?? "Global assignment",
        `Assigned ${formatAdminRoadmapAssignmentDateTime(assignment.assignedAt)}`,
        `Completed ${formatAdminRoadmapAssignmentDateTime(assignment.completedAt)}`
      ].join(" · ")
    },
    {
      id: "submissions",
      title: "Submission Status",
      body:
        assignment.submissions.length === 0
          ? "No submissions recorded."
          : assignment.submissions
              .map(
                (submission) =>
                  `${submission.stageTitle}: ${submission.stepTitle} · ${formatAdminStatusLabel(submission.status)} · ${submission.attachmentCount} attachments`
              )
              .join(" | ")
    }
  ];
}

function stateOnlyRoadmapAssignmentDetail(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminRoadmapAssignmentDetailScreen {
  const copy = roadmapAssignmentDetailStateCopy[state];

  return {
    route: "AdminRoadmapAssignmentDetail",
    state,
    title: copy.title,
    body: copy.body,
    roadmapAssignmentId: null,
    sections: [],
    actions: state === "forbidden" ? [] : [adminRoadmapAssignmentBackAction()],
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

const roadmapAssignmentDetailStateCopy: Record<
  AdminContentScreenState,
  { title: string; body: string }
> = {
  ready: {
    title: "Roadmap Assignment",
    body: "Roadmap assignment is ready."
  },
  loading: {
    title: "Loading Roadmap Assignment",
    body: "Roadmap assignment is loading."
  },
  empty: {
    title: "Roadmap Assignment Not Found",
    body: "The requested roadmap assignment is not available."
  },
  error: {
    title: "Unable to Load Roadmap Assignment",
    body: "Roadmap assignment could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh this roadmap assignment."
  },
  forbidden: {
    title: "Access Denied",
    body: "Super Admin access is required to inspect roadmap assignments."
  }
};
