import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminRoadmapSubmissionDetailDto } from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
import { adminCopy } from "./admin-i18n.js";
import {
  adminRoadmapSubmissionBackAction,
  formatAdminRoadmapSubmissionDateTime,
  roadmapSubmissionStatusLabel,
  type AdminRoadmapSubmissionAction,
  type AdminRoadmapSubmissionField
} from "./admin-roadmap-submission-screen-contracts.js";

export interface AdminRoadmapSubmissionDetailScreen {
  route: "AdminRoadmapSubmissionDetail";
  state: AdminContentScreenState;
  title: string;
  body: string;
  roadmapSubmissionId: string | null;
  fields: AdminRoadmapSubmissionField[];
  actions: AdminRoadmapSubmissionAction[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export interface BuildAdminRoadmapSubmissionDetailScreenOptions {
  state: AdminContentScreenState;
  roadmapSubmission?: AdminRoadmapSubmissionDetailDto | undefined;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
}

export function buildAdminRoadmapSubmissionDetailScreen(
  options: BuildAdminRoadmapSubmissionDetailScreenOptions
): AdminRoadmapSubmissionDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyRoadmapSubmissionDetail(options.state, options.runtimeMode);
  }

  if (!options.roadmapSubmission) {
    return stateOnlyRoadmapSubmissionDetail("empty", options.runtimeMode);
  }

  const canReview = options.canWrite && options.roadmapSubmission.status === "pending_review";

  return {
    route: "AdminRoadmapSubmissionDetail",
    state: "ready",
    title: adminCopy("admin.roadmapSubmissions.detail.title", {
      stepTitle: options.roadmapSubmission.stepTitle
    }),
    body: canReview
      ? adminCopy("admin.roadmapSubmissions.detail.review.body")
      : adminCopy("admin.roadmapSubmissions.detail.readOnly.body"),
    roadmapSubmissionId: options.roadmapSubmission.id,
    fields: buildRoadmapSubmissionFields(options.roadmapSubmission, canReview),
    actions: buildDetailActions(options.roadmapSubmission, canReview),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

function buildDetailActions(
  submission: AdminRoadmapSubmissionDetailDto,
  canReview: boolean
): AdminRoadmapSubmissionAction[] {
  const actions: AdminRoadmapSubmissionAction[] = [adminRoadmapSubmissionBackAction()];

  if (canReview) {
    actions.unshift(
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

function buildRoadmapSubmissionFields(
  submission: AdminRoadmapSubmissionDetailDto,
  canReview: boolean
): AdminRoadmapSubmissionField[] {
  return [
    field(
      "submitterName",
      adminCopy("admin.roadmapSubmissions.detail.submitter"),
      submission.submitterName,
      true
    ),
    field(
      "submitterEmail",
      adminCopy("admin.roadmapSubmissions.detail.email"),
      submission.submitterEmail,
      true
    ),
    field(
      "roadmapTitle",
      adminCopy("admin.roadmapSubmissions.detail.roadmap"),
      submission.roadmapTitle,
      true
    ),
    field(
      "stageTitle",
      adminCopy("admin.roadmapSubmissions.detail.stage"),
      submission.stageTitle,
      true
    ),
    field("stepTitle", adminCopy("admin.roadmapSubmissions.detail.step"), submission.stepTitle, true),
    field(
      "organizationUnitName",
      adminCopy("admin.roadmapSubmissions.detail.organizationUnit"),
      submission.organizationUnitName ?? "",
      true
    ),
    field(
      "status",
      adminCopy("admin.roadmapSubmissions.detail.currentStatus"),
      roadmapSubmissionStatusLabel(submission.status),
      true
    ),
    field(
      "createdAt",
      adminCopy("admin.roadmapSubmissions.detail.submittedAt"),
      formatAdminRoadmapSubmissionDateTime(submission.createdAt),
      true
    ),
    field(
      "body",
      adminCopy("admin.roadmapSubmissions.detail.submission"),
      submission.body,
      true,
      true
    ),
    field(
      "attachmentMetadata",
      adminCopy("admin.roadmapSubmissions.detail.attachments"),
      submission.attachmentMetadata.map((metadata) => metadata.originalFilename).join(", "),
      true
    ),
    field(
      "reviewStatus",
      adminCopy("admin.roadmapSubmissions.detail.reviewStatus"),
      adminCopy("admin.roadmapSubmissions.detail.reviewStatusOptions"),
      !canReview
    ),
    field(
      "reviewCommentInput",
      adminCopy("admin.roadmapSubmissions.detail.reviewComment"),
      submission.reviewComment ?? "",
      !canReview,
      true
    )
  ];
}

function field(
  name: AdminRoadmapSubmissionField["name"],
  label: string,
  value: string,
  readOnly: boolean,
  multiline = false
): AdminRoadmapSubmissionField {
  return {
    name,
    label,
    value,
    readOnly,
    multiline
  };
}

function stateOnlyRoadmapSubmissionDetail(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminRoadmapSubmissionDetailScreen {
  const copy = roadmapSubmissionDetailStateCopy[state];

  return {
    route: "AdminRoadmapSubmissionDetail",
    state,
    title: copy.title,
    body: copy.body,
    roadmapSubmissionId: null,
    fields: [],
    actions: state === "forbidden" ? [] : [adminRoadmapSubmissionBackAction()],
    demoChromeVisible: runtimeMode === "demo",
    theme: adminContentTheme
  };
}

const roadmapSubmissionDetailStateCopy: Record<
  AdminContentScreenState,
  { title: string; body: string }
> = {
  ready: {
    title: adminCopy("admin.roadmapSubmissions.detail.fallbackTitle"),
    body: adminCopy("admin.roadmapSubmissions.detail.ready.body")
  },
  loading: {
    title: adminCopy("admin.roadmapSubmissions.detail.loading.title"),
    body: adminCopy("admin.roadmapSubmissions.detail.loading.body")
  },
  empty: {
    title: adminCopy("admin.roadmapSubmissions.detail.empty.title"),
    body: adminCopy("admin.roadmapSubmissions.detail.empty.body")
  },
  error: {
    title: adminCopy("admin.roadmapSubmissions.detail.error.title"),
    body: adminCopy("admin.roadmapSubmissions.detail.error.body")
  },
  offline: {
    title: adminCopy("common.offline.title"),
    body: adminCopy("admin.roadmapSubmissions.detail.offline.body")
  },
  forbidden: {
    title: adminCopy("common.accessDenied.title"),
    body: adminCopy("admin.roadmapSubmissions.forbidden.body")
  }
};
