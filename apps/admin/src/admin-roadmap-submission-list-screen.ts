import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminRoadmapSubmissionListResponseDto,
  AdminRoadmapSubmissionSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import {
  formatAdminRoadmapSubmissionDateTime,
  roadmapSubmissionStatusLabel,
  type AdminRoadmapSubmissionAction,
  type AdminRoadmapSubmissionRow
} from "./admin-roadmap-submission-screen-contracts.js";

export interface AdminRoadmapSubmissionListScreen {
  route: "AdminRoadmapSubmissionList";
  state: AdminContentScreenState;
  title: string;
  body: string;
  rows: AdminRoadmapSubmissionRow[];
  actions: AdminRoadmapSubmissionAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface BuildAdminRoadmapSubmissionListScreenOptions {
  state: AdminContentScreenState;
  response?: AdminRoadmapSubmissionListResponseDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}

export function buildAdminRoadmapSubmissionListScreen(
  options: BuildAdminRoadmapSubmissionListScreenOptions
): AdminRoadmapSubmissionListScreen {
  if (options.state !== "ready") {
    return stateOnlyRoadmapSubmissionList(options.state, options.runtimeMode);
  }

  if (!options.response || options.response.roadmapSubmissions.length === 0) {
    return stateOnlyRoadmapSubmissionList("empty", options.runtimeMode);
  }

  return {
    route: "AdminRoadmapSubmissionList",
    state: "ready",
    title: "Roadmap Submissions",
    body: "Review scoped formation submissions. Decisions are audited and do not automatically change degrees.",
    rows: options.response.roadmapSubmissions.map((submission) =>
      roadmapSubmissionRow(submission, options.canWrite)
    ),
    actions: buildListActions(),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function roadmapSubmissionRow(
  submission: AdminRoadmapSubmissionSummaryDto,
  canWrite: boolean
): AdminRoadmapSubmissionRow {
  return {
    id: submission.id,
    title: submission.stepTitle,
    submitter: `${submission.submitterName} · ${submission.submitterEmail}`,
    roadmapMeta: `${submission.roadmapTitle} · ${submission.stageTitle}`,
    organizationUnitName: submission.organizationUnitName ?? submission.organizationUnitId ?? "Global",
    status: submission.status,
    statusLabel: roadmapSubmissionStatusLabel(submission.status),
    bodyPreview: submission.bodyPreview ?? "No preview available.",
    attachmentLabel: `${submission.attachmentCount} attachment${submission.attachmentCount === 1 ? "" : "s"}`,
    createdAt: formatAdminRoadmapSubmissionDateTime(submission.createdAt),
    actions: buildRowActions(submission, canWrite)
  };
}

function buildListActions(): AdminRoadmapSubmissionAction[] {
  return [
    {
      id: "refresh",
      label: "Refresh",
      targetRoute: "AdminRoadmapSubmissionList"
    }
  ];
}

function buildRowActions(
  submission: AdminRoadmapSubmissionSummaryDto,
  canWrite: boolean
): AdminRoadmapSubmissionAction[] {
  const actions: AdminRoadmapSubmissionAction[] = [
    {
      id: "view",
      label: canWrite && submission.status === "pending_review" ? "Review" : "View",
      targetRoute: "AdminRoadmapSubmissionDetail",
      targetId: submission.id
    }
  ];

  if (canWrite && submission.status === "pending_review") {
    actions.push(
      {
        id: "approve",
        label: "Approve",
        targetRoute: "AdminRoadmapSubmissionDetail",
        targetId: submission.id
      },
      {
        id: "reject",
        label: "Reject",
        targetRoute: "AdminRoadmapSubmissionDetail",
        targetId: submission.id
      }
    );
  }

  return actions;
}

function stateOnlyRoadmapSubmissionList(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminRoadmapSubmissionListScreen {
  const copy = roadmapSubmissionListStateCopy[state];

  return {
    route: "AdminRoadmapSubmissionList",
    state,
    title: copy.title,
    body: copy.body,
    rows: [],
    actions: state === "forbidden" ? [] : buildListActions(),
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

const roadmapSubmissionListStateCopy: Record<
  AdminContentScreenState,
  { title: string; body: string }
> = {
  ready: {
    title: "Roadmap Submissions",
    body: "Roadmap submissions are ready."
  },
  loading: {
    title: "Loading Roadmap Submissions",
    body: "Roadmap submissions are loading."
  },
  empty: {
    title: "Roadmap Submissions",
    body: "No roadmap submissions need review."
  },
  error: {
    title: "Unable to Load Roadmap Submissions",
    body: "Roadmap submissions could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh roadmap submissions."
  },
  forbidden: {
    title: "Access Denied",
    body: "Admin Lite access is required to review roadmap submissions."
  }
};
