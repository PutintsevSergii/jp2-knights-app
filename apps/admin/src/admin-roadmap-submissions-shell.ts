import type { RuntimeMode } from "@jp2/shared-types";
import { designTokens } from "@jp2/shared-design-tokens";
import type {
  AdminRoadmapSubmissionDetailDto,
  AdminRoadmapSubmissionSummaryDto
} from "@jp2/shared-validation";
import {
  adminContentFailureState,
  type AdminContentFetch,
  type AdminContentScreenState
} from "./admin-content-api.js";
import { fallbackAdminRoadmapSubmissions } from "./admin-content-fixtures.js";
import {
  fetchAdminRoadmapSubmission,
  fetchAdminRoadmapSubmissions
} from "./admin-roadmap-submissions-api.js";
import {
  buildAdminRoadmapSubmissionDetailScreen,
  buildAdminRoadmapSubmissionListScreen,
  type AdminRoadmapSubmissionAction,
  type AdminRoadmapSubmissionDetailScreen,
  type AdminRoadmapSubmissionField,
  type AdminRoadmapSubmissionListScreen,
  type AdminRoadmapSubmissionRoute,
  type AdminRoadmapSubmissionRow
} from "./admin-roadmap-submissions-screen.js";
import {
  adminStatusCodeForState,
  escapeAttribute,
  escapeHtml,
  renderAdminActionLink,
  renderAdminDocument,
  renderAdminEmptyState,
  renderAdminFormField,
  renderAdminHeader
} from "./admin-render-primitives.js";
import type { AdminWebRouteDefinition } from "./admin-web-route-types.js";
import { routeOptions } from "./admin-web-route-types.js";

export type AdminRoadmapSubmissionShellRoute =
  | "/admin/roadmap-submissions"
  | `/admin/roadmap-submissions/${string}`;

export interface AdminRoadmapSubmissionShellRouteMetadata {
  path: "/admin/roadmap-submissions";
  label: string;
  screenRoute: AdminRoadmapSubmissionListScreen["route"];
}

export interface RenderAdminRoadmapSubmissionRouteOptions {
  path: AdminRoadmapSubmissionShellRoute;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  authToken?: string;
  authCookie?: string;
  baseUrl?: string;
  fetchImpl?: AdminContentFetch;
}

export interface RenderedAdminRoadmapSubmissionRoute {
  path: AdminRoadmapSubmissionShellRoute;
  route: AdminRoadmapSubmissionRoute;
  state: AdminContentScreenState;
  statusCode: number;
  document: string;
}

export const adminRoadmapSubmissionRouteDefinition: AdminWebRouteDefinition = {
  matches: isAdminRoadmapSubmissionRoute,
  render: async (context) => ({
    title: "Admin Roadmap Submissions",
    ...(await renderAdminRoadmapSubmissionRoute({
      ...routeOptions(context),
      path: context.path as AdminRoadmapSubmissionShellRoute
    }))
  })
};

function isAdminRoadmapSubmissionRoute(path: string): boolean {
  return (
    path === "/admin/roadmap-submissions" ||
    (path.startsWith("/admin/roadmap-submissions/") &&
      path.length > "/admin/roadmap-submissions/".length)
  );
}

export const adminRoadmapSubmissionShellRoutes: readonly AdminRoadmapSubmissionShellRouteMetadata[] =
  [
    {
      path: "/admin/roadmap-submissions",
      label: "Roadmap Reviews",
      screenRoute: "AdminRoadmapSubmissionList"
    }
  ];

export async function renderAdminRoadmapSubmissionRoute(
  options: RenderAdminRoadmapSubmissionRouteOptions
): Promise<RenderedAdminRoadmapSubmissionRoute> {
  const screen =
    options.path === "/admin/roadmap-submissions"
      ? await resolveRoadmapSubmissionListScreen(options)
      : await resolveRoadmapSubmissionDetailScreen(options);
  const html =
    screen.route === "AdminRoadmapSubmissionList"
      ? renderRoadmapSubmissionListScreen(screen)
      : renderRoadmapSubmissionDetailScreen(screen);

  return {
    path: options.path,
    route: screen.route,
    state: screen.state,
    statusCode: adminStatusCodeForState(screen.state),
    document: renderAdminDocument({ title: "Admin Roadmap Submissions", body: html })
  };
}

async function resolveRoadmapSubmissionListScreen(
  options: RenderAdminRoadmapSubmissionRouteOptions
): Promise<AdminRoadmapSubmissionListScreen> {
  if (options.runtimeMode === "demo") {
    return buildAdminRoadmapSubmissionListScreen({
      state: "ready",
      response: {
        roadmapSubmissions: fallbackAdminRoadmapSubmissions.map(toRoadmapSubmissionSummary)
      },
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }

  try {
    return buildAdminRoadmapSubmissionListScreen({
      state: "ready",
      response: await fetchAdminRoadmapSubmissions(options),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  } catch (error) {
    return buildAdminRoadmapSubmissionListScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }
}

async function resolveRoadmapSubmissionDetailScreen(
  options: RenderAdminRoadmapSubmissionRouteOptions
): Promise<AdminRoadmapSubmissionDetailScreen> {
  const id = roadmapSubmissionIdFromPath(options.path);

  if (options.runtimeMode === "demo") {
    return buildAdminRoadmapSubmissionDetailScreen({
      state: "ready",
      roadmapSubmission: fallbackAdminRoadmapSubmissions.find((submission) => submission.id === id),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }

  try {
    return buildAdminRoadmapSubmissionDetailScreen({
      state: "ready",
      roadmapSubmission: (await fetchAdminRoadmapSubmission(id, options)).roadmapSubmission,
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  } catch (error) {
    return buildAdminRoadmapSubmissionDetailScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }
}

function renderRoadmapSubmissionListScreen(screen: AdminRoadmapSubmissionListScreen): string {
  return [
    `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}">`,
    renderStyle(),
    renderAdminHeader({
      title: screen.title,
      body: screen.body,
      actions: screen.actions,
      demoChromeVisible: screen.demoChromeVisible,
      renderAction
    }),
    renderRows(screen),
    "</section>"
  ].join("");
}

function renderRoadmapSubmissionDetailScreen(screen: AdminRoadmapSubmissionDetailScreen): string {
  return [
    `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}">`,
    renderStyle(),
    renderAdminHeader({
      title: screen.title,
      body: screen.body,
      actions: screen.actions,
      demoChromeVisible: screen.demoChromeVisible,
      renderAction
    }),
    renderFields(screen),
    "</section>"
  ].join("");
}

function renderStyle(): string {
  return [
    "<style>",
    `.admin-content{padding:${designTokens.space[8]}px ${designTokens.space[6]}px;font-family:${designTokens.typography.fontFamily.web};background:${designTokens.color.background.app};color:${designTokens.color.text.primary};}`,
    ".admin-content__header{display:flex;justify-content:space-between;gap:24px;max-width:1120px;margin:0 auto 28px;}",
    `.admin-content__title{font-size:44px;line-height:50px;margin:0 0 8px;color:${designTokens.color.brand.goldDarker};}`,
    `.admin-content__body{margin:0;color:${designTokens.color.text.muted};max-width:640px;}`,
    ".admin-content__actions{display:flex;gap:8px;flex-wrap:wrap;}",
    ".admin-content__cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;max-width:1120px;margin:0 auto;}",
    `.admin-content__card,.admin-content__form{border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.lg}px;padding:${designTokens.space[4]}px;background:${designTokens.color.background.surface};}`,
    ".admin-content__name{font-size:18px;line-height:24px;margin:0 0 6px;}",
    `.admin-content__meta,.admin-content__preview{color:${designTokens.color.text.muted};font-size:14px;line-height:20px;}`,
    ".admin-content__badge{display:inline-block;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:700;text-transform:uppercase;}",
    `.admin-content__badge--pending-review{background:${designTokens.color.brand.gold};color:${designTokens.color.brand.goldDeep};}`,
    `.admin-content__badge--approved{background:${designTokens.color.border.soft};color:${designTokens.color.status.success};}`,
    `.admin-content__badge--rejected{background:${designTokens.color.border.soft};color:${designTokens.color.status.danger};}`,
    `.admin-content__button{border:1px solid ${designTokens.color.action.primary};border-radius:${designTokens.radius.md}px;padding:8px 12px;text-decoration:none;color:${designTokens.color.action.primaryText};background:${designTokens.color.action.primary};font-weight:700;display:inline-flex;margin-right:8px;}`,
    `.admin-content__button--secondary{background:${designTokens.color.background.surface};color:${designTokens.color.text.primary};border-color:${designTokens.color.border.subtle};}`,
    `.admin-content__button--danger{background:${designTokens.color.status.danger};border-color:${designTokens.color.status.danger};color:${designTokens.color.text.inverse};}`,
    ".admin-content__form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;max-width:1120px;margin:0 auto;}",
    ".admin-content__field{display:grid;gap:6px;}",
    ".admin-content__field--wide{grid-column:1 / -1;}",
    `.admin-content__label{font-size:12px;line-height:16px;font-weight:700;text-transform:uppercase;color:${designTokens.color.text.subdued};}`,
    `.admin-content__input{border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.md}px;padding:10px 12px;font:inherit;color:${designTokens.color.text.primary};background:${designTokens.color.background.app};}`,
    ".admin-content__textarea{min-height:120px;}",
    ".admin-content__demo{display:block;margin-top:10px;font-size:12px;font-weight:700;text-transform:uppercase;}",
    "@media (max-width:760px){.admin-content__header{display:block;}.admin-content__actions{margin-top:16px;}.admin-content__form{grid-template-columns:1fr;}.admin-content__field--wide{grid-column:auto;}}",
    "</style>"
  ].join("");
}

function renderRows(screen: AdminRoadmapSubmissionListScreen): string {
  if (screen.rows.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body);
  }

  return ['<div class="admin-content__cards">', screen.rows.map(renderRow).join(""), "</div>"].join("");
}

function renderRow(row: AdminRoadmapSubmissionRow): string {
  return [
    `<article class="admin-content__card" data-roadmap-submission-id="${escapeAttribute(row.id)}">`,
    `<span class="admin-content__badge ${statusClass(row.status)}">${escapeHtml(row.statusLabel)}</span>`,
    `<h2 class="admin-content__name">${escapeHtml(row.title)}</h2>`,
    `<div class="admin-content__meta">${escapeHtml(row.submitter)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.roadmapMeta)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.organizationUnitName)} · ${escapeHtml(row.createdAt)}</div>`,
    `<p class="admin-content__preview">${escapeHtml(row.bodyPreview)}</p>`,
    `<div class="admin-content__meta">${escapeHtml(row.attachmentLabel)}</div>`,
    `<div class="admin-content__actions">${row.actions.map(renderAction).join("")}</div>`,
    "</article>"
  ].join("");
}

function renderFields(screen: AdminRoadmapSubmissionDetailScreen): string {
  if (screen.fields.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body);
  }

  return [
    `<form class="admin-content__form" data-roadmap-submission-id="${escapeAttribute(screen.roadmapSubmissionId ?? "")}">`,
    screen.fields.map(renderField).join(""),
    "</form>"
  ].join("");
}

function renderField(field: AdminRoadmapSubmissionField): string {
  return renderAdminFormField({
    name: field.name,
    label: field.label,
    value: field.value,
    required: false,
    readOnly: field.readOnly,
    multiline: field.multiline
  });
}

function renderAction(action: AdminRoadmapSubmissionAction): string {
  const href =
    action.targetId && action.id !== "refresh"
      ? `/admin/roadmap-submissions/${action.targetId}`
      : "/admin/roadmap-submissions";

  return renderAdminActionLink(action, {
    href,
    danger: action.id === "reject",
    secondary: action.id === "view" || action.id === "refresh"
  });
}

function statusClass(status: string): string {
  return `admin-content__badge--${status.replaceAll("_", "-")}`;
}

function roadmapSubmissionIdFromPath(path: AdminRoadmapSubmissionShellRoute): string {
  return path.slice("/admin/roadmap-submissions/".length);
}

function toRoadmapSubmissionSummary(
  submission: AdminRoadmapSubmissionDetailDto
): AdminRoadmapSubmissionSummaryDto {
  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    stepId: submission.stepId,
    submitterUserId: submission.submitterUserId,
    submitterName: submission.submitterName,
    submitterEmail: submission.submitterEmail,
    roadmapTitle: submission.roadmapTitle,
    roadmapTargetRole: submission.roadmapTargetRole,
    stageTitle: submission.stageTitle,
    stepTitle: submission.stepTitle,
    organizationUnitId: submission.organizationUnitId,
    organizationUnitName: submission.organizationUnitName,
    status: submission.status,
    bodyPreview: submission.bodyPreview,
    attachmentCount: submission.attachmentCount,
    reviewComment: submission.reviewComment,
    reviewedAt: submission.reviewedAt,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt
  };
}
