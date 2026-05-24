import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminRoadmapSubmissionDetailDto } from "@jp2/shared-validation";
import type { AdminContentScreenState } from "./admin-content-api.js";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screens.js";
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
    title: `Roadmap Submission: ${options.roadmapSubmission.stepTitle}`,
    body: canReview
      ? "Approve or reject this scoped submission. Rejections require a review comment."
      : "Review the submitted roadmap step and recorded decision.",
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

function buildRoadmapSubmissionFields(
  submission: AdminRoadmapSubmissionDetailDto,
  canReview: boolean
): AdminRoadmapSubmissionField[] {
  return [
    field("submitterName", "Submitter", submission.submitterName, true),
    field("submitterEmail", "Email", submission.submitterEmail, true),
    field("roadmapTitle", "Roadmap", submission.roadmapTitle, true),
    field("stageTitle", "Stage", submission.stageTitle, true),
    field("stepTitle", "Step", submission.stepTitle, true),
    field("organizationUnitName", "Organization Unit", submission.organizationUnitName ?? "", true),
    field("status", "Current Status", roadmapSubmissionStatusLabel(submission.status), true),
    field("createdAt", "Submitted At", formatAdminRoadmapSubmissionDateTime(submission.createdAt), true),
    field("body", "Submission", submission.body, true, true),
    field(
      "attachmentMetadata",
      "Attachments",
      submission.attachmentMetadata.map((metadata) => metadata.originalFilename).join(", "),
      true
    ),
    field("reviewStatus", "Review Status", "approved / rejected", !canReview),
    field("reviewCommentInput", "Review Comment", submission.reviewComment ?? "", !canReview, true)
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
    title: "Roadmap Submission",
    body: "Roadmap submission is ready."
  },
  loading: {
    title: "Loading Roadmap Submission",
    body: "Roadmap submission is loading."
  },
  empty: {
    title: "Roadmap Submission Not Found",
    body: "The requested roadmap submission is not available in the current admin scope."
  },
  error: {
    title: "Unable to Load Roadmap Submission",
    body: "Roadmap submission could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh this roadmap submission."
  },
  forbidden: {
    title: "Access Denied",
    body: "Admin Lite access is required to review roadmap submissions."
  }
};
