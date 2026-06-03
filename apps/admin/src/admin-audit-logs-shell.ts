import type { RuntimeMode } from "@jp2/shared-types";
import { designTokens } from "@jp2/shared-design-tokens";
import {
  adminContentFailureState,
  type AdminContentFetch,
  type AdminContentScreenState
} from "./admin-content-api.js";
import { fallbackAdminAuditLogs } from "./admin-content-fixtures.js";
import { fetchAdminAuditLogs, type AdminAuditLogQueryParams } from "./admin-audit-logs-api.js";
import {
  buildAdminAuditLogListScreen,
  type AdminAuditLogFilterField,
  type AdminAuditLogFilterName,
  type AdminAuditLogListScreen,
  type AdminAuditLogRow,
  type AdminAuditLogRoute
} from "./admin-audit-logs-screen.js";
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

export type AdminAuditLogShellRoute = "/admin/audit-logs";

export interface AdminAuditLogShellRouteMetadata {
  path: AdminAuditLogShellRoute;
  label: string;
  screenRoute: AdminAuditLogRoute;
}

export interface RenderAdminAuditLogRouteOptions {
  path: AdminAuditLogShellRoute;
  query?: Readonly<Record<string, string>>;
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
      query: context.query,
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
  const filters = auditLogQueryFromRoute(options.query);

  if (options.runtimeMode === "demo") {
    return buildAdminAuditLogListScreen({
      state: "ready",
      response: fallbackAdminAuditLogs,
      runtimeMode: options.runtimeMode,
      filters
    });
  }

  try {
    return buildAdminAuditLogListScreen({
      state: "ready",
      response: await fetchAdminAuditLogs({
        ...options,
        query: filters
      }),
      runtimeMode: options.runtimeMode,
      filters
    });
  } catch (error) {
    return buildAdminAuditLogListScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      filters
    });
  }
}

const auditLogQueryKeys = [
  "limit",
  "offset",
  "action",
  "entityType",
  "actorUserId",
  "entityId",
  "scopeOrganizationUnitId",
  "createdFrom",
  "createdTo"
] as const satisfies readonly (keyof AdminAuditLogQueryParams)[];

type AdminAuditLogRouteFilters = Partial<Record<AdminAuditLogFilterName, string>>;

function auditLogQueryFromRoute(
  query: Readonly<Record<string, string>> | undefined
): AdminAuditLogRouteFilters {
  const auditQuery: AdminAuditLogRouteFilters = {};

  for (const key of auditLogQueryKeys) {
    const value = query?.[key];

    if (value !== undefined) {
      auditQuery[key] = value;
    }
  }

  return auditQuery;
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
    renderAuditFilterForm(screen),
    renderAuditLogBody(screen),
    "</section>"
  ].join("");
}

function renderAuditLogBody(screen: AdminAuditLogListScreen): string {
  if (screen.state === "ready") {
    return [renderAuditRows(screen.rows), renderAuditPagination(screen)].join("");
  }

  return [
    renderAdminEmptyState(stateTitle(screen.state), stateBody(screen.state)),
    screen.state === "empty" ? renderAuditPagination(screen) : ""
  ].join("");
}

function renderAuditFilterForm(screen: AdminAuditLogListScreen): string {
  const clearAction = {
    id: "clear-filters",
    label: "Clear",
    targetRoute: screen.route
  };

  return [
    '<form class="audit-log-filter" method="get" action="/admin/audit-logs">',
    '<div class="audit-log-filter__fields">',
    screen.filters.map(renderAuditFilterField).join(""),
    "</div>",
    '<div class="audit-log-filter__actions">',
    '<button type="submit" class="admin-content__button" data-action="apply-filters">Apply</button>',
    screen.hasActiveFilters
      ? renderAdminActionLink(clearAction, { href: "/admin/audit-logs", secondary: true })
      : "",
    "</div>",
    "</form>"
  ].join("");
}

function renderAuditFilterField(field: AdminAuditLogFilterField): string {
  if (field.options) {
    return renderAuditFilterSelect(field);
  }

  return renderAdminFormField({
    label: field.label,
    name: field.name,
    value: field.value
  });
}

function renderAuditFilterSelect(field: AdminAuditLogFilterField): string {
  const options = field.options ?? [];

  return [
    '<label class="admin-content__field">',
    `<span class="admin-content__label">${escapeHtml(field.label)}</span>`,
    `<select class="admin-content__input" name="${escapeAttribute(field.name)}">`,
    options
      .map((option) =>
        [
          `<option value="${escapeAttribute(option.value)}"`,
          option.value === field.value ? " selected" : "",
          ">",
          escapeHtml(option.label),
          "</option>"
        ].join("")
      )
      .join(""),
    "</select>",
    "</label>"
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

function renderAuditPagination(screen: AdminAuditLogListScreen): string {
  const { limit, offset, total } = screen.pagination;
  const previousOffset = Math.max(0, offset - limit);
  const hasNextPage = offset + screen.rows.length < total;
  const links = [
    offset > 0
      ? renderAdminActionLink(
          {
            id: "previous-page",
            label: "Previous",
            targetRoute: screen.route
          },
          { href: auditLogHref(screen, previousOffset), secondary: true }
        )
      : "",
    hasNextPage
      ? renderAdminActionLink(
          {
            id: "next-page",
            label: "Next",
            targetRoute: screen.route
          },
          { href: auditLogHref(screen, offset + limit), secondary: true }
        )
      : ""
  ].filter(Boolean);

  if (links.length === 0) {
    return "";
  }

  return [
    '<nav class="audit-log-pagination" aria-label="Audit log pages">',
    `<span>${escapeHtml(auditPaginationLabel(offset, screen.rows.length, total))}</span>`,
    '<div class="audit-log-pagination__links">',
    links.join(""),
    "</div>",
    "</nav>"
  ].join("");
}

function auditPaginationLabel(offset: number, rowCount: number, total: number): string {
  return rowCount === 0
    ? `Showing 0 of ${total} results from offset ${offset}`
    : `Showing ${offset + 1}-${offset + rowCount} of ${total}`;
}

function auditLogHref(screen: AdminAuditLogListScreen, offset: number): string {
  const params = new URLSearchParams();

  for (const field of screen.filters) {
    if (field.value !== "") {
      params.set(field.name, field.value);
    }
  }

  params.set("offset", String(offset));

  return `/admin/audit-logs?${params.toString()}`;
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
    `.admin-content__button{background:${designTokens.color.action.primary};color:${designTokens.color.action.primaryText};border:1px solid ${designTokens.color.action.primary};border-radius:${designTokens.radius.md}px;padding:8px 12px;font-size:14px;line-height:16px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;min-height:34px;}`,
    `.admin-content__button--secondary{background:${designTokens.color.background.surface};color:${designTokens.color.text.primary};border-color:${designTokens.color.border.subtle};}`,
    `.admin-content__field{display:grid;gap:6px;}`,
    `.admin-content__label{color:${designTokens.color.text.muted};font-size:${designTokens.typography.size.secondary}px;font-weight:700;}`,
    `.admin-content__input{border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.md}px;padding:10px 12px;font:inherit;color:${designTokens.color.text.primary};background:${designTokens.color.background.app};min-width:0;}`,
    `.audit-log-filter{border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.md}px;background:${designTokens.color.background.surface};padding:${designTokens.space[4]}px;margin-bottom:${designTokens.space[4]}px;}`,
    `.audit-log-filter__fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:${designTokens.space[3]}px;}`,
    `.audit-log-filter__actions{display:flex;gap:${designTokens.space[2]}px;flex-wrap:wrap;margin-top:${designTokens.space[3]}px;}`,
    `.audit-log-pagination{display:flex;justify-content:space-between;align-items:center;gap:${designTokens.space[3]}px;margin-top:${designTokens.space[4]}px;color:${designTokens.color.text.muted};}`,
    `.audit-log-pagination__links{display:flex;gap:${designTokens.space[2]}px;flex-wrap:wrap;}`,
    `.audit-log-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:${designTokens.space[3]}px;}`,
    `.audit-log-card{border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.md}px;background:${designTokens.color.background.surface};padding:${designTokens.space[4]}px;}`,
    `.audit-log-card__header{display:flex;justify-content:space-between;gap:${designTokens.space[3]}px;margin-bottom:${designTokens.space[3]}px;}`,
    `.audit-log-card__header strong{font-size:${designTokens.typography.size.cardTitle}px;}`,
    `.audit-log-card__header time{color:${designTokens.color.text.muted};font-size:${designTokens.typography.size.secondary}px;white-space:nowrap;}`,
    `.audit-log-card p{display:grid;grid-template-columns:84px 1fr;gap:${designTokens.space[2]}px;margin:${designTokens.space[2]}px 0;word-break:break-word;}`,
    `.audit-log-card span{color:${designTokens.color.text.muted};font-weight:700;}`,
    "@media (max-width:760px){.admin-content{padding:32px 24px;}.admin-content__header{display:block;}.admin-content__actions{margin-top:16px;}.audit-log-filter__fields{grid-template-columns:1fr;}.audit-log-pagination{align-items:flex-start;flex-direction:column;}}",
    "</style>"
  ].join("");
}
