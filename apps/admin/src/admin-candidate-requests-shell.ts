import type { RuntimeMode } from "@jp2/shared-types";
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
  authToken?: string;
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
    statusCode: statusCodeForState(screen.state),
    document: renderDocument(html)
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
      canWrite: options.canWrite
    });
  }

  try {
    return buildAdminCandidateRequestDetailScreen({
      state: "ready",
      candidateRequest: (await fetchAdminCandidateRequest(id, options)).candidateRequest,
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  } catch (error) {
    return buildAdminCandidateRequestDetailScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }
}

function renderDocument(html: string): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>Admin Candidate Requests</title>",
    "</head>",
    "<body>",
    `<main>${html}</main>`,
    "</body>",
    "</html>"
  ].join("");
}

function renderCandidateRequestListScreen(screen: AdminCandidateRequestListScreen): string {
  return [
    `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}">`,
    renderStyle(screen),
    renderHeader(screen.title, screen.body, screen.actions, screen.demoChromeVisible),
    renderRows(screen),
    "</section>"
  ].join("");
}

function renderCandidateRequestDetailScreen(screen: AdminCandidateRequestDetailScreen): string {
  return [
    `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}">`,
    renderStyle(screen),
    renderHeader(screen.title, screen.body, screen.actions, screen.demoChromeVisible),
    renderDetailForm(screen),
    "</section>"
  ].join("");
}

function renderStyle(
  screen: AdminCandidateRequestListScreen | AdminCandidateRequestDetailScreen
): string {
  return [
    "<style>",
    ".admin-content{",
    `background:${screen.theme.background};`,
    `color:${screen.theme.text};`,
    `font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;`,
    `padding:${screen.theme.spacing}px;`,
    "}",
    ".admin-content__header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px;}",
    ".admin-content__title{font-size:24px;font-weight:700;margin:0 0 4px;}",
    `.admin-content__body{color:${screen.theme.mutedText};margin:0;}`,
    ".admin-content__actions{display:flex;gap:8px;flex-wrap:wrap;}",
    `.admin-content__table{width:100%;border-collapse:collapse;background:${screen.theme.surface};border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;overflow:hidden;}`,
    `.admin-content__table th,.admin-content__table td{border-bottom:1px solid ${screen.theme.border};padding:12px;text-align:left;vertical-align:top;}`,
    `.admin-content__meta{color:${screen.theme.mutedText};font-size:13px;}`,
    `.admin-content__badge{display:inline-block;border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:2px 6px;font-size:12px;}`,
    `.admin-content__button{background:${screen.theme.primaryAction};color:${screen.theme.primaryActionText};border:0;border-radius:${screen.theme.radius}px;padding:8px 10px;font-weight:600;text-decoration:none;}`,
    `.admin-content__button--secondary{background:${screen.theme.surface};color:${screen.theme.text};border:1px solid ${screen.theme.border};}`,
    `.admin-content__button--danger{background:${screen.theme.danger};color:${screen.theme.primaryActionText};}`,
    `.admin-content__empty,.admin-content__form{background:${screen.theme.surface};border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:16px;}`,
    ".admin-content__form{display:grid;gap:12px;max-width:840px;}",
    ".admin-content__field{display:grid;gap:4px;}",
    ".admin-content__label{font-weight:600;}",
    `.admin-content__input{border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:8px;font:inherit;color:${screen.theme.text};background:${screen.theme.background};}`,
    ".admin-content__textarea{min-height:96px;resize:vertical;}",
    ".admin-content__demo{font-size:12px;font-weight:700;text-transform:uppercase;}",
    "</style>"
  ].join("");
}

function renderHeader(
  title: string,
  body: string,
  actions: readonly AdminCandidateRequestAction[],
  demoChromeVisible: boolean
): string {
  const demoBadge = demoChromeVisible
    ? '<span class="admin-content__demo" aria-label="Demo mode">Demo</span>'
    : "";

  return [
    '<header class="admin-content__header">',
    "<div>",
    `<h1 class="admin-content__title">${escapeHtml(title)}</h1>`,
    `<p class="admin-content__body">${escapeHtml(body)}</p>`,
    demoBadge,
    "</div>",
    `<div class="admin-content__actions">${actions.map(renderAction).join("")}</div>`,
    "</header>"
  ].join("");
}

function renderRows(screen: AdminCandidateRequestListScreen): string {
  if (screen.rows.length === 0) {
    return [
      '<div class="admin-content__empty" role="status">',
      `<strong>${escapeHtml(screen.title)}</strong>`,
      `<p>${escapeHtml(screen.body)}</p>`,
      "</div>"
    ].join("");
  }

  return [
    '<table class="admin-content__table">',
    "<thead><tr>",
    '<th scope="col">Candidate</th>',
    '<th scope="col">Status</th>',
    '<th scope="col">Assignment</th>',
    '<th scope="col">Created</th>',
    '<th scope="col">Actions</th>',
    "</tr></thead>",
    "<tbody>",
    screen.rows.map(renderRow).join(""),
    "</tbody></table>"
  ].join("");
}

function renderRow(row: AdminCandidateRequestRow): string {
  return [
    `<tr data-candidate-request-id="${escapeAttribute(row.id)}">`,
    "<td>",
    `<strong>${escapeHtml(row.title)}</strong>`,
    `<div class="admin-content__meta">${escapeHtml(row.primaryMeta)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.secondaryMeta)}</div>`,
    "</td>",
    `<td><span class="admin-content__badge">${escapeHtml(row.status)}</span></td>`,
    `<td>${escapeHtml(row.assignedOrganizationUnitName)}</td>`,
    `<td>${escapeHtml(row.createdAt)}</td>`,
    `<td><div class="admin-content__actions">${row.actions.map(renderAction).join("")}</div></td>`,
    "</tr>"
  ].join("");
}

function renderDetailForm(screen: AdminCandidateRequestDetailScreen): string {
  if (screen.fields.length === 0) {
    return [
      '<div class="admin-content__empty" role="status">',
      `<strong>${escapeHtml(screen.title)}</strong>`,
      `<p>${escapeHtml(screen.body)}</p>`,
      "</div>"
    ].join("");
  }

  return [
    `<form class="admin-content__form" data-candidate-request-id="${escapeAttribute(screen.candidateRequestId ?? "")}">`,
    screen.fields
      .map((field) => {
        const common = [
          `class="admin-content__input${field.multiline ? " admin-content__textarea" : ""}"`,
          `name="${escapeAttribute(field.name)}"`,
          field.required ? "required" : "",
          field.readOnly ? "readonly" : ""
        ]
          .filter(Boolean)
          .join(" ");

        return [
          '<label class="admin-content__field">',
          `<span class="admin-content__label">${escapeHtml(field.label)}</span>`,
          field.multiline
            ? `<textarea ${common}>${escapeHtml(field.value)}</textarea>`
            : `<input ${common} value="${escapeAttribute(field.value)}">`,
          "</label>"
        ].join("");
      })
      .join(""),
    "</form>"
  ].join("");
}

function renderAction(action: AdminCandidateRequestAction): string {
  const modifier = action.id === "reject" ? " admin-content__button--danger" : "";
  const secondary =
    action.id === "refresh" || action.id === "view" ? " admin-content__button--secondary" : "";
  const href =
    action.id === "refresh"
      ? "/admin/candidate-requests"
      : action.targetId
        ? `/admin/candidate-requests/${action.targetId}`
        : "/admin/candidate-requests";

  return [
    `<a class="admin-content__button${modifier}${secondary}" href="${escapeAttribute(href)}"`,
    ` data-action="${action.id}"`,
    ` data-target-route="${action.targetRoute}"`,
    action.targetId ? ` data-target-id="${escapeAttribute(action.targetId)}"` : "",
    ">",
    escapeHtml(action.label),
    "</a>"
  ].join("");
}

function statusCodeForState(state: AdminContentScreenState): number {
  if (state === "forbidden") return 403;
  if (state === "empty") return 404;
  if (state === "offline") return 503;
  if (state === "error") return 500;
  return 200;
}

function candidateRequestIdFromPath(path: AdminCandidateRequestShellRoute): string {
  return path.slice("/admin/candidate-requests/".length);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
