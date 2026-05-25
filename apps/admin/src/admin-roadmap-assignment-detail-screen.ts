import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminRoadmapAssignmentDetailDto } from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import { adminCopy } from "./admin-i18n.js";
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
    title: adminCopy("admin.roadmapAssignments.detail.title", {
      assigneeName: options.roadmapAssignment.assigneeName
    }),
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
      title: adminCopy("admin.roadmapAssignments.detail.section.assignment"),
      body: [
        `${assignment.assigneeName} <${assignment.assigneeEmail}>`,
        assignment.organizationUnitName ?? adminCopy("admin.roadmapAssignments.global"),
        adminCopy("admin.roadmapAssignments.detail.assignedAt", {
          assignedAt: formatAdminRoadmapAssignmentDateTime(assignment.assignedAt)
        }),
        adminCopy("admin.roadmapAssignments.detail.completedAt", {
          completedAt: formatAdminRoadmapAssignmentDateTime(assignment.completedAt)
        })
      ].join(" · ")
    },
    {
      id: "submissions",
      title: adminCopy("admin.roadmapAssignments.detail.section.submissions"),
      body:
        assignment.submissions.length === 0
          ? adminCopy("admin.roadmapAssignments.detail.noSubmissions")
          : assignment.submissions
              .map(
                (submission) =>
                  adminCopy("admin.roadmapAssignments.detail.submissionLine", {
                    stageTitle: submission.stageTitle,
                    stepTitle: submission.stepTitle,
                    statusLabel: formatAdminStatusLabel(submission.status),
                    attachmentCount: submission.attachmentCount
                  })
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
    title: adminCopy("admin.roadmapAssignments.detail.fallbackTitle"),
    body: adminCopy("admin.roadmapAssignments.detail.ready.body")
  },
  loading: {
    title: adminCopy("admin.roadmapAssignments.detail.loading.title"),
    body: adminCopy("admin.roadmapAssignments.detail.loading.body")
  },
  empty: {
    title: adminCopy("admin.roadmapAssignments.detail.empty.title"),
    body: adminCopy("admin.roadmapAssignments.detail.empty.body")
  },
  error: {
    title: adminCopy("admin.roadmapAssignments.detail.error.title"),
    body: adminCopy("admin.roadmapAssignments.detail.error.body")
  },
  offline: {
    title: adminCopy("common.offline.title"),
    body: adminCopy("admin.roadmapAssignments.detail.offline.body")
  },
  forbidden: {
    title: adminCopy("common.accessDenied.title"),
    body: adminCopy("admin.roadmapAssignments.forbidden.body")
  }
};
