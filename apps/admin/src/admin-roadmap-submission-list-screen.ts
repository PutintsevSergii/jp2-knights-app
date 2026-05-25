import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminRoadmapSubmissionListResponseDto,
  AdminRoadmapSubmissionSummaryDto
} from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import { adminCopy } from "./admin-i18n.js";
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
    title: adminCopy("admin.roadmapSubmissions.title"),
    body: adminCopy("admin.roadmapSubmissions.list.body"),
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
    organizationUnitName:
      submission.organizationUnitName ??
      submission.organizationUnitId ??
      adminCopy("admin.roadmapSubmissions.global"),
    status: submission.status,
    statusLabel: roadmapSubmissionStatusLabel(submission.status),
    bodyPreview: submission.bodyPreview ?? adminCopy("admin.roadmapSubmissions.noPreview"),
    attachmentLabel: adminCopy("admin.roadmapSubmissions.attachmentCount", {
      count: submission.attachmentCount,
      pluralSuffix: submission.attachmentCount === 1 ? "" : "s"
    }),
    createdAt: formatAdminRoadmapSubmissionDateTime(submission.createdAt),
    actions: buildRowActions(submission, canWrite)
  };
}

function buildListActions(): AdminRoadmapSubmissionAction[] {
  return [
    {
      id: "refresh",
      label: adminCopy("common.refresh"),
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
      label:
        canWrite && submission.status === "pending_review"
          ? adminCopy("admin.roadmapSubmissions.review")
          : adminCopy("admin.roadmapSubmissions.view"),
      targetRoute: "AdminRoadmapSubmissionDetail",
      targetId: submission.id
    }
  ];

  if (canWrite && submission.status === "pending_review") {
    actions.push(
      {
        id: "approve",
        label: adminCopy("admin.roadmapSubmissions.approve"),
        targetRoute: "AdminRoadmapSubmissionDetail",
        targetId: submission.id
      },
      {
        id: "reject",
        label: adminCopy("admin.roadmapSubmissions.reject"),
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
    title: adminCopy("admin.roadmapSubmissions.title"),
    body: adminCopy("admin.roadmapSubmissions.ready.body")
  },
  loading: {
    title: adminCopy("admin.roadmapSubmissions.loading.title"),
    body: adminCopy("admin.roadmapSubmissions.loading.body")
  },
  empty: {
    title: adminCopy("admin.roadmapSubmissions.title"),
    body: adminCopy("admin.roadmapSubmissions.empty.body")
  },
  error: {
    title: adminCopy("admin.roadmapSubmissions.error.title"),
    body: adminCopy("admin.roadmapSubmissions.error.body")
  },
  offline: {
    title: adminCopy("common.offline.title"),
    body: adminCopy("admin.roadmapSubmissions.offline.body")
  },
  forbidden: {
    title: adminCopy("common.accessDenied.title"),
    body: adminCopy("admin.roadmapSubmissions.forbidden.body")
  }
};
