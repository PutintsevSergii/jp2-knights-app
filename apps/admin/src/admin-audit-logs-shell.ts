import type { RuntimeMode } from "@jp2/shared-types";
import { designTokens } from "@jp2/shared-design-tokens";
import {
  adminContentFailureState,
  type AdminContentFetch,
  type AdminContentScreenState
} from "./admin-content-api.js";
import { fallbackAdminAuditLogs } from "./admin-content-fixtures.js";
import { fetchAdminAuditLogs } from "./admin-audit-logs-api.js";
import {
  buildAdminAuditLogListScreen,
  type AdminAuditLogListScreen,
  type AdminAuditLogRow,
  type AdminAuditLogRoute
} from "./admin-audit-logs-screen.js";
import {
  adminStatusCodeForState,
  escapeAttribute,
  escapeHtml,
  renderAdminDocument,
  renderAdminEmptyState,
  renderAdminHeader
} from "./admin-render-primitives.js";
import type { AdminWebRouteDefinition } from "./admin-web-route-types.js";
import { routeOptions } from "./admin-web-route-types.js";

export type AdminAuditLogShellRoute = "/admin/audit-logs";

export interface AdminAuditLogShellRouteMetadata {
  path: AdminAuditLogShellRoute;
  label: string;
  screenRoute: AdminAuditLogRoute;
}

export interface RenderAdminAuditLogRouteOptions {
  path: AdminAuditLogShellRoute;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  authToken?: string;
  authCookie?: string;
  baseUrl?: string;
  fetchImpl?: AdminContentFetch;
}

export interface RenderedAdminAuditLogRoute {
  path: AdminAuditLogShellRoute;
  route: AdminAuditLogRoute;
  state: AdminContentScreenState;
  statusCode: number;
  document: string;
}

export const adminAuditLogRouteDefinition: AdminWebRouteDefinition = {
  matches: (path) => path === "/admin/audit-logs",
  render: async (context) => ({
    title: "Admin Audit Logs",
    ...(await renderAdminAuditLogRoute({
      ...routeOptions(context),
      path: "/admin/audit-logs"
    }))
  })
};

export const adminAuditLogShellRoutes: readonly AdminAuditLogShellRouteMetadata[] = [
  {
    path: "/admin/audit-logs",
    label: "Audit Logs",
    screenRoute: "AdminAuditLogList"
  }
];

export async function renderAdminAuditLogRoute(
  options: RenderAdminAuditLogRouteOptions
): Promise<RenderedAdminAuditLogRoute> {
  const screen = await resolveAuditLogListScreen(options);
  const html = renderAuditLogListScreen(screen);

  return {
    path: options.path,
    route: screen.route,
    state: screen.state,
    statusCode: adminStatusCodeForState(screen.state),
    document: renderAdminDocument({ title: "Admin Audit Logs", body: html })
  };
}

async function resolveAuditLogListScreen(
  options: RenderAdminAuditLogRouteOptions
): Promise<AdminAuditLogListScreen> {
  if (options.runtimeMode === "demo") {
    return buildAdminAuditLogListScreen({
      state: "ready",
      response: fallbackAdminAuditLogs,
      runtimeMode: options.runtimeMode
    });
  }

  try {
    return buildAdminAuditLogListScreen({
      state: "ready",
      response: await fetchAdminAuditLogs(options),
      runtimeMode: options.runtimeMode
    });
  } catch (error) {
    return buildAdminAuditLogListScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode
    });
  }
}

function renderAuditLogListScreen(screen: AdminAuditLogListScreen): string {
  return [
    `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}">`,
    renderStyle(),
    renderAdminHeader({
      title: screen.title,
      body: screen.body,
      actions: [],
      demoChromeVisible: screen.demoChromeVisible,
      renderAction: () => ""
    }),
    screen.state === "ready"
      ? renderAuditRows(screen.rows)
      : renderAdminEmptyState(stateTitle(screen.state), stateBody(screen.state)),
    "</section>"
  ].join("");
}

function renderAuditRows(rows: readonly AdminAuditLogRow[]): string {
  return [
    '<div class="audit-log-list">',
    rows
      .map(
        (row) => [
          `<article class="audit-log-card" data-audit-log-id="${escapeAttribute(row.id)}">`,
          '<div class="audit-log-card__header">',
          `<strong>${escapeHtml(row.action)}</strong>`,
          `<time>${escapeHtml(row.createdAt)}</time>`,
          "</div>",
          `<p><span>Actor</span>${escapeHtml(row.actorLabel)}</p>`,
          `<p><span>Entity</span>${escapeHtml(row.entityLabel)}</p>`,
          `<p><span>Scope</span>${escapeHtml(row.scopeLabel)}</p>`,
          `<p><span>Before</span>${escapeHtml(row.beforeSummary)}</p>`,
          `<p><span>After</span>${escapeHtml(row.afterSummary)}</p>`,
          `<p><span>Request</span>${escapeHtml(row.requestId)}</p>`,
          "</article>"
        ].join("")
      )
      .join(""),
    "</div>"
  ].join("");
}

function stateTitle(state: AdminContentScreenState): string {
  if (state === "empty") return "No audit logs";
  if (state === "forbidden") return "Super Admin access required";
  if (state === "offline") return "Audit logs unavailable";
  return "Could not load audit logs";
}

function stateBody(state: AdminContentScreenState): string {
  if (state === "empty") return "Critical admin actions will appear here after they are recorded.";
  if (state === "forbidden") return "Audit logs are restricted to Super Admin review.";
  if (state === "offline") return "The Admin Lite shell could not reach the API.";
  return "Try again after checking the API logs and request id.";
}

function renderStyle(): string {
  return [
    "<style>",
    `.admin-content{padding:${designTokens.space[6]}px;}`,
    `.admin-content__header{display:flex;justify-content:space-between;gap:${designTokens.space[4]}px;align-items:flex-start;margin-bottom:${designTokens.space[4]}px;}`,
    `.admin-content__title{margin:0 0 ${designTokens.space[2]}px;font-size:${designTokens.typography.size.sectionTitle}px;}`,
    `.admin-content__body{margin:0;color:${designTokens.color.text.muted};}`,
    `.admin-content__demo{display:inline-block;margin-top:${designTokens.space[2]}px;color:${designTokens.color.status.warning};font-weight:700;text-transform:uppercase;font-size:12px;}`,
    `.admin-content__empty{border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.md}px;padding:${designTokens.space[4]}px;background:${designTokens.color.background.surface};}`,
    `.admin-content__empty p{margin:${designTokens.space[2]}px 0 0;color:${designTokens.color.text.muted};}`,
    `.audit-log-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:${designTokens.space[3]}px;}`,
    `.audit-log-card{border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.md}px;background:${designTokens.color.background.surface};padding:${designTokens.space[4]}px;}`,
    `.audit-log-card__header{display:flex;justify-content:space-between;gap:${designTokens.space[3]}px;margin-bottom:${designTokens.space[3]}px;}`,
    `.audit-log-card__header strong{font-size:${designTokens.typography.size.cardTitle}px;}`,
    `.audit-log-card__header time{color:${designTokens.color.text.muted};font-size:${designTokens.typography.size.secondary}px;white-space:nowrap;}`,
    `.audit-log-card p{display:grid;grid-template-columns:84px 1fr;gap:${designTokens.space[2]}px;margin:${designTokens.space[2]}px 0;word-break:break-word;}`,
    `.audit-log-card span{color:${designTokens.color.text.muted};font-weight:700;}`,
    "</style>"
  ].join("");
}
