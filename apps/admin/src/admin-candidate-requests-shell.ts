import type { RuntimeMode } from "@jp2/shared-types";
import { designTokens } from "@jp2/shared-design-tokens";
import type { AdminCandidateRequestDetailDto } from "@jp2/shared-validation";
import {
  adminContentFailureState,
  type AdminContentFetch,
  type AdminContentScreenState
} from "./admin-content-api.js";
import { fallbackAdminCandidateRequestDetails } from "./admin-content-fixtures.js";
import {
  fetchAdminCandidateRequest,
  fetchAdminCandidateRequests
} from "./admin-candidate-requests-api.js";
import {
  buildAdminCandidateRequestDetailScreen,
  buildAdminCandidateRequestListScreen,
  type AdminCandidateRequestAction,
  type AdminCandidateRequestDetailScreen,
  type AdminCandidateRequestListScreen,
  type AdminCandidateRequestRoute,
  type AdminCandidateRequestRow
} from "./admin-candidate-requests-screen.js";
import {
  adminStatusCodeForState,
  cssBoxShadow,
  escapeAttribute,
  escapeHtml,
  renderAdminActionLink,
  renderAdminDocument,
  renderAdminEmptyState,
  renderAdminFormField,
  renderAdminHeader,
  renderAdminActionButton
} from "./admin-render-primitives.js";
import type { AdminWebRouteDefinition } from "./admin-web-route-types.js";
import { routeOptions } from "./admin-web-route-types.js";

export type AdminCandidateRequestShellRoute =
  | "/admin/candidate-requests"
  | `/admin/candidate-requests/${string}`;

export interface AdminCandidateRequestShellRouteMetadata {
  path: "/admin/candidate-requests";
  label: string;
  screenRoute: AdminCandidateRequestListScreen["route"];
}

export interface RenderAdminCandidateRequestRouteOptions {
  path: AdminCandidateRequestShellRoute;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  canManagePrivacy?: boolean | undefined;
  authToken?: string;
  authCookie?: string;
  baseUrl?: string;
  fetchImpl?: AdminContentFetch;
}

export interface RenderedAdminCandidateRequestRoute {
  path: AdminCandidateRequestShellRoute;
  route: AdminCandidateRequestRoute;
  state: AdminContentScreenState;
  statusCode: number;
  document: string;
}

export const adminCandidateRequestRouteDefinition: AdminWebRouteDefinition = {
  matches: isAdminCandidateRequestRoute,
  render: async (context) => ({
    title: "Admin Candidate Requests",
    ...(await renderAdminCandidateRequestRoute({
      ...routeOptions(context),
      path: context.path as AdminCandidateRequestShellRoute
    }))
  })
};

function isAdminCandidateRequestRoute(path: string): boolean {
  return (
    path === "/admin/candidate-requests" ||
    (path.startsWith("/admin/candidate-requests/") &&
      path.length > "/admin/candidate-requests/".length)
  );
}

export const adminCandidateRequestShellRoutes: readonly AdminCandidateRequestShellRouteMetadata[] =
  [
    {
      path: "/admin/candidate-requests",
      label: "Candidate Requests",
      screenRoute: "AdminCandidateRequestList"
    }
  ];

export async function renderAdminCandidateRequestRoute(
  options: RenderAdminCandidateRequestRouteOptions
): Promise<RenderedAdminCandidateRequestRoute> {
  const screen =
    options.path === "/admin/candidate-requests"
      ? await resolveCandidateRequestListScreen(options)
      : await resolveCandidateRequestDetailScreen(options);
  const html =
    screen.route === "AdminCandidateRequestList"
      ? renderCandidateRequestListScreen(screen)
      : renderCandidateRequestDetailScreen(screen);

  return {
    path: options.path,
    route: screen.route,
    state: screen.state,
    statusCode: adminStatusCodeForState(screen.state),
    document: renderAdminDocument({ title: "Admin Candidate Requests", body: html })
  };
}

async function resolveCandidateRequestListScreen(
  options: RenderAdminCandidateRequestRouteOptions
): Promise<AdminCandidateRequestListScreen> {
  if (options.runtimeMode === "demo") {
    return buildAdminCandidateRequestListScreen({
      state: "ready",
      response: {
        candidateRequests: fallbackAdminCandidateRequestDetails.map(toCandidateRequestSummary)
      },
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }

  try {
    return buildAdminCandidateRequestListScreen({
      state: "ready",
      response: await fetchAdminCandidateRequests(options),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  } catch (error) {
    return buildAdminCandidateRequestListScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }
}

function toCandidateRequestSummary(request: AdminCandidateRequestDetailDto) {
  return {
    id: request.id,
    firstName: request.firstName,
    lastName: request.lastName,
    email: request.email,
    country: request.country,
    city: request.city,
    messagePreview: request.messagePreview,
    status: request.status,
    assignedOrganizationUnitId: request.assignedOrganizationUnitId,
    assignedOrganizationUnitName: request.assignedOrganizationUnitName,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    archivedAt: request.archivedAt
  };
}

async function resolveCandidateRequestDetailScreen(
  options: RenderAdminCandidateRequestRouteOptions
): Promise<AdminCandidateRequestDetailScreen> {
  const id = candidateRequestIdFromPath(options.path);

  if (options.runtimeMode === "demo") {
    return buildAdminCandidateRequestDetailScreen({
      state: "ready",
      candidateRequest: fallbackAdminCandidateRequestDetails.find((request) => request.id === id),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      canManagePrivacy: options.canManagePrivacy
    });
  }

  try {
    return buildAdminCandidateRequestDetailScreen({
      state: "ready",
      candidateRequest: (await fetchAdminCandidateRequest(id, options)).candidateRequest,
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      canManagePrivacy: options.canManagePrivacy
    });
  } catch (error) {
    return buildAdminCandidateRequestDetailScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      canManagePrivacy: options.canManagePrivacy
    });
  }
}

function renderCandidateRequestListScreen(screen: AdminCandidateRequestListScreen): string {
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
    renderMetrics(screen),
    renderRows(screen),
    "</section>"
  ].join("");
}

function renderCandidateRequestDetailScreen(screen: AdminCandidateRequestDetailScreen): string {
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
    renderDetailForm(screen),
    "</section>"
  ].join("");
}

function renderStyle(): string {
  const subtleShadow = cssBoxShadow(designTokens.elevation.subtle);
  const raisedShadow = cssBoxShadow(designTokens.elevation.raised);

  return [
    "<style>",
    ".admin-content{",
    `background:${designTokens.color.background.app};`,
    `color:${designTokens.color.text.primary};`,
    `font-family:${designTokens.typography.fontFamily.web};`,
    `padding:${designTokens.space[8]}px;`,
    "min-height:100%;",
    "}",
    ".admin-content__header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin:0 auto 28px;max-width:1120px;}",
    `.admin-content__title{font-size:48px;line-height:53px;font-weight:700;margin:0 0 8px;color:${designTokens.color.brand.goldDarker};max-width:560px;}`,
    `.admin-content__body{color:${designTokens.color.text.muted};font-size:${designTokens.typography.size.body}px;line-height:${designTokens.typography.lineHeight.body}px;margin:0;max-width:560px;}`,
    ".admin-content__actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}",
    ".admin-content__metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;max-width:1120px;margin:0 auto 28px;}",
    `.admin-content__metric{background:${designTokens.color.background.surface};border:1px solid ${designTokens.color.border.chrome};border-radius:${designTokens.radius.lg}px;padding:${designTokens.space[4]}px;box-shadow:${subtleShadow};}`,
    `.admin-content__metric--attention{background:${designTokens.color.brand.gold};border-color:${designTokens.color.brand.goldDark};}`,
    `.admin-content__metric-label{display:block;font-size:12px;line-height:16px;font-weight:700;color:${designTokens.color.brand.goldDarker};margin-bottom:8px;}`,
    `.admin-content__metric-count{display:block;font-size:32px;line-height:38px;font-weight:700;color:${designTokens.color.text.primary};margin-bottom:8px;}`,
    `.admin-content__metric-body{display:block;font-size:12px;line-height:16px;color:${designTokens.color.text.muted};}`,
    ".admin-content__cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;max-width:1120px;margin:0 auto;}",
    `.admin-content__card{background:${designTokens.color.background.surface};border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.lg}px;padding:${designTokens.space[4]}px;box-shadow:${raisedShadow};}`,
    ".admin-content__card-head{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:start;margin-bottom:10px;}",
    `.admin-content__avatar{width:48px;height:48px;border-radius:${designTokens.radius.pill}px;background:${designTokens.color.brand.gold};display:grid;place-items:center;font-weight:700;color:${designTokens.color.text.primary};}`,
    `.admin-content__name{font-size:18px;line-height:25px;font-weight:700;margin:0;color:${designTokens.color.text.primary};}`,
    `.admin-content__meta{color:${designTokens.color.text.muted};font-size:13px;line-height:18px;}`,
    `.admin-content__preview{color:${designTokens.color.text.muted};font-size:14px;line-height:20px;margin:10px 0 14px;}`,
    `.admin-content__badge{display:inline-block;border-radius:${designTokens.radius.pill}px;padding:3px 8px;font-size:11px;line-height:14px;font-weight:700;text-transform:uppercase;white-space:nowrap;}`,
    `.admin-content__badge--new{background:${designTokens.color.brand.gold};color:${designTokens.color.brand.goldDeep};}`,
    `.admin-content__badge--contacted{background:${designTokens.color.border.soft};color:${designTokens.color.text.muted};}`,
    `.admin-content__badge--invited,.admin-content__badge--converted-to-candidate{background:${designTokens.color.border.soft};color:${designTokens.color.status.success};}`,
    `.admin-content__badge--rejected{background:${designTokens.color.border.soft};color:${designTokens.color.status.danger};}`,
    `.admin-content__button{background:${designTokens.color.action.primary};color:${designTokens.color.action.primaryText};border:1px solid ${designTokens.color.action.primary};border-radius:${designTokens.radius.md}px;padding:8px 12px;font-size:14px;line-height:16px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;min-height:34px;}`,
    `.admin-content__button--secondary{background:${designTokens.color.background.surface};color:${designTokens.color.text.primary};border-color:${designTokens.color.border.subtle};}`,
    `.admin-content__button--danger{background:${designTokens.color.status.danger};border-color:${designTokens.color.status.danger};color:${designTokens.color.text.inverse};}`,
    `.admin-content__empty,.admin-content__form{max-width:1120px;margin:0 auto;background:${designTokens.color.background.surface};border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.lg}px;padding:${designTokens.space[6]}px;box-shadow:${raisedShadow};}`,
    ".admin-content__form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}",
    ".admin-content__field{display:grid;gap:6px;}",
    ".admin-content__field--wide{grid-column:1 / -1;}",
    `.admin-content__label{font-size:12px;line-height:16px;font-weight:700;text-transform:uppercase;color:${designTokens.color.text.subdued};}`,
    `.admin-content__input{border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.md}px;padding:10px 12px;font:inherit;color:${designTokens.color.text.primary};background:${designTokens.color.background.app};}`,
    ".admin-content__textarea{min-height:112px;resize:vertical;}",
    `.admin-content__demo{display:inline-block;margin-top:10px;font-size:12px;font-weight:700;text-transform:uppercase;color:${designTokens.color.brand.goldDark};}`,
    "@media (max-width:760px){.admin-content{padding:32px 24px;}.admin-content__header{display:block;}.admin-content__actions{margin-top:16px;}.admin-content__title{font-size:40px;line-height:46px;}.admin-content__metrics{grid-template-columns:repeat(2,minmax(0,1fr));}.admin-content__form{grid-template-columns:1fr;}.admin-content__field--wide{grid-column:auto;}}",
    "@media (max-width:430px){.admin-content{padding:32px 24px;}.admin-content__metrics{gap:14px;}.admin-content__metric{padding:14px;}.admin-content__cards{grid-template-columns:1fr;}.admin-content__card-head{grid-template-columns:auto 1fr;}.admin-content__badge{grid-column:2;justify-self:start;}.admin-content__button{flex:1 1 0;}}",
    "</style>"
  ].join("");
}

function renderMetrics(screen: AdminCandidateRequestListScreen): string {
  if (screen.state !== "ready") {
    return "";
  }

  return [
    '<div class="admin-content__metrics" aria-label="Candidate request status counts">',
    screen.metrics
      .map((metric) =>
        [
          `<div class="admin-content__metric admin-content__metric--${metric.tone}">`,
          `<span class="admin-content__metric-label">${escapeHtml(metric.label)}</span>`,
          `<span class="admin-content__metric-count">${metric.count}</span>`,
          `<span class="admin-content__metric-body">${escapeHtml(metric.description)}</span>`,
          "</div>"
        ].join("")
      )
      .join(""),
    "</div>"
  ].join("");
}

function renderRows(screen: AdminCandidateRequestListScreen): string {
  if (screen.rows.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body);
  }

  return ['<div class="admin-content__cards">', screen.rows.map(renderRow).join(""), "</div>"].join(
    ""
  );
}

function renderRow(row: AdminCandidateRequestRow): string {
  return [
    `<article class="admin-content__card" data-candidate-request-id="${escapeAttribute(row.id)}">`,
    '<div class="admin-content__card-head">',
    `<span class="admin-content__avatar" aria-hidden="true">${escapeHtml(row.initials)}</span>`,
    "<div>",
    `<h2 class="admin-content__name">${escapeHtml(row.title)}</h2>`,
    `<div class="admin-content__meta">${escapeHtml(row.createdAt)} · ${escapeHtml(row.locationMeta)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.assignedOrganizationUnitName)}</div>`,
    "</div>",
    `<span class="admin-content__badge ${statusClass(row.status)}">${escapeHtml(row.statusLabel)}</span>`,
    "</div>",
    `<p class="admin-content__preview">${escapeHtml(row.messagePreview)}</p>`,
    `<div class="admin-content__actions">${row.actions.map(renderAction).join("")}</div>`,
    "</article>"
  ].join("");
}

function renderDetailForm(screen: AdminCandidateRequestDetailScreen): string {
  if (screen.fields.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body);
  }

  return [
    `<form class="admin-content__form" data-candidate-request-id="${escapeAttribute(screen.candidateRequestId ?? "")}">`,
    screen.fields.map(renderAdminFormField).join(""),
    "</form>"
  ].join("");
}

function renderAction(action: AdminCandidateRequestAction): string {
  if (action.id === "erase") {
    return renderAdminActionButton(action, { danger: true });
  }

  const modifier = action.id === "reject" ? " admin-content__button--danger" : "";
  const secondary =
    action.id === "refresh" || action.id === "view" ? " admin-content__button--secondary" : "";
  const href =
    action.requestPath
      ? `/api/${action.requestPath}`
      : action.id === "refresh"
      ? "/admin/candidate-requests"
      : action.targetId
        ? `/admin/candidate-requests/${action.targetId}`
        : "/admin/candidate-requests";

  return renderAdminActionLink(action, {
    href,
    danger: Boolean(modifier),
    secondary: Boolean(secondary)
  });
}

function statusClass(status: string): string {
  return `admin-content__badge--${status.replaceAll("_", "-")}`;
}

function candidateRequestIdFromPath(path: AdminCandidateRequestShellRoute): string {
  return path.slice("/admin/candidate-requests/".length);
}
