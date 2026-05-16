import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminCandidateProfileDetailDto } from "@jp2/shared-validation";
import {
  adminContentFailureState,
  type AdminContentFetch,
  type AdminContentScreenState
} from "./admin-content-api.js";
import { fallbackAdminCandidateProfiles } from "./admin-content-fixtures.js";
import { fetchAdminCandidateProfile, fetchAdminCandidateProfiles } from "./admin-candidates-api.js";
import {
  buildAdminCandidateDetailScreen,
  buildAdminCandidateListScreen,
  type AdminCandidateAction,
  type AdminCandidateDetailScreen,
  type AdminCandidateListScreen,
  type AdminCandidateRoute,
  type AdminCandidateRow
} from "./admin-candidates-screen.js";
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

export type AdminCandidateShellRoute = "/admin/candidates" | `/admin/candidates/${string}`;

export interface AdminCandidateShellRouteMetadata {
  path: "/admin/candidates";
  label: string;
  screenRoute: AdminCandidateListScreen["route"];
}

export interface RenderAdminCandidateRouteOptions {
  path: AdminCandidateShellRoute;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  authToken?: string;
  authCookie?: string;
  baseUrl?: string;
  fetchImpl?: AdminContentFetch;
}

export interface RenderedAdminCandidateRoute {
  path: AdminCandidateShellRoute;
  route: AdminCandidateRoute;
  state: AdminContentScreenState;
  statusCode: number;
  document: string;
}

export const adminCandidateShellRoutes: readonly AdminCandidateShellRouteMetadata[] = [
  {
    path: "/admin/candidates",
    label: "Candidates",
    screenRoute: "AdminCandidateList"
  }
];

export async function renderAdminCandidateRoute(
  options: RenderAdminCandidateRouteOptions
): Promise<RenderedAdminCandidateRoute> {
  const screen =
    options.path === "/admin/candidates"
      ? await resolveCandidateListScreen(options)
      : await resolveCandidateDetailScreen(options);
  const html =
    screen.route === "AdminCandidateList"
      ? renderCandidateListScreen(screen)
      : renderCandidateDetailScreen(screen);

  return {
    path: options.path,
    route: screen.route,
    state: screen.state,
    statusCode: adminStatusCodeForState(screen.state),
    document: renderAdminDocument({ title: "Admin Candidates", body: html })
  };
}

async function resolveCandidateListScreen(
  options: RenderAdminCandidateRouteOptions
): Promise<AdminCandidateListScreen> {
  if (options.runtimeMode === "demo") {
    return buildAdminCandidateListScreen({
      state: "ready",
      response: { candidateProfiles: fallbackAdminCandidateProfiles.map(toCandidateSummary) },
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }

  try {
    return buildAdminCandidateListScreen({
      state: "ready",
      response: await fetchAdminCandidateProfiles(options),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  } catch (error) {
    return buildAdminCandidateListScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }
}

async function resolveCandidateDetailScreen(
  options: RenderAdminCandidateRouteOptions
): Promise<AdminCandidateDetailScreen> {
  const id = candidateIdFromPath(options.path);

  if (options.runtimeMode === "demo") {
    return buildAdminCandidateDetailScreen({
      state: "ready",
      candidateProfile: fallbackAdminCandidateProfiles.find((profile) => profile.id === id),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }

  try {
    return buildAdminCandidateDetailScreen({
      state: "ready",
      candidateProfile: (await fetchAdminCandidateProfile(id, options)).candidateProfile,
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  } catch (error) {
    return buildAdminCandidateDetailScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }
}

function toCandidateSummary(profile: AdminCandidateProfileDetailDto) {
  return {
    id: profile.id,
    userId: profile.userId,
    candidateRequestId: profile.candidateRequestId,
    displayName: profile.displayName,
    email: profile.email,
    preferredLanguage: profile.preferredLanguage,
    assignedOrganizationUnitId: profile.assignedOrganizationUnitId,
    assignedOrganizationUnitName: profile.assignedOrganizationUnitName,
    responsibleOfficerId: profile.responsibleOfficerId,
    responsibleOfficerName: profile.responsibleOfficerName,
    status: profile.status,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    archivedAt: profile.archivedAt
  };
}

function renderCandidateListScreen(screen: AdminCandidateListScreen): string {
  return [
    `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}">`,
    renderStyle(screen),
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

function renderCandidateDetailScreen(screen: AdminCandidateDetailScreen): string {
  return [
    `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}">`,
    renderStyle(screen),
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

function renderStyle(screen: AdminCandidateListScreen | AdminCandidateDetailScreen): string {
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
    ".admin-content__demo{font-size:12px;font-weight:700;text-transform:uppercase;}",
    "</style>"
  ].join("");
}

function renderRows(screen: AdminCandidateListScreen): string {
  if (screen.rows.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body);
  }

  return [
    '<table class="admin-content__table">',
    "<thead><tr>",
    '<th scope="col">Candidate</th>',
    '<th scope="col">Status</th>',
    '<th scope="col">Assignment</th>',
    '<th scope="col">Officer</th>',
    '<th scope="col">Actions</th>',
    "</tr></thead>",
    "<tbody>",
    screen.rows.map(renderRow).join(""),
    "</tbody></table>"
  ].join("");
}

function renderRow(row: AdminCandidateRow): string {
  return [
    `<tr data-candidate-profile-id="${escapeAttribute(row.id)}">`,
    "<td>",
    `<strong>${escapeHtml(row.title)}</strong>`,
    `<div class="admin-content__meta">${escapeHtml(row.primaryMeta)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.secondaryMeta)}</div>`,
    "</td>",
    `<td><span class="admin-content__badge">${escapeHtml(row.status)}</span></td>`,
    `<td>${escapeHtml(row.assignedOrganizationUnitName)}</td>`,
    `<td>${escapeHtml(row.responsibleOfficerName)}</td>`,
    `<td><div class="admin-content__actions">${row.actions.map(renderAction).join("")}</div></td>`,
    "</tr>"
  ].join("");
}

function renderDetailForm(screen: AdminCandidateDetailScreen): string {
  if (screen.fields.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body);
  }

  return [
    `<form class="admin-content__form" data-candidate-profile-id="${escapeAttribute(screen.candidateProfileId ?? "")}">`,
    screen.fields.map(renderField).join(""),
    "</form>"
  ].join("");
}

function renderField(field: AdminCandidateDetailScreen["fields"][number]): string {
  return renderAdminFormField(field);
}

function renderAction(action: AdminCandidateAction): string {
  const modifier = action.id === "archive" ? " admin-content__button--danger" : "";
  const secondary =
    action.id === "refresh" || action.id === "view" ? " admin-content__button--secondary" : "";
  const href =
    action.id === "refresh"
      ? "/admin/candidates"
      : action.targetId
        ? `/admin/candidates/${action.targetId}`
        : "/admin/candidates";

  return renderAdminActionLink(action, {
    href,
    danger: Boolean(modifier),
    secondary: Boolean(secondary)
  });
}

function candidateIdFromPath(path: AdminCandidateShellRoute): string {
  return path.slice("/admin/candidates/".length);
}
