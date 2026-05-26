import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminRoadmapAssignmentDetailDto,
  AdminRoadmapAssignmentSummaryDto
} from "@jp2/shared-validation";
import {
  adminContentFailureState,
  type AdminContentFetch,
  type AdminContentScreenState
} from "./admin-content-api.js";
import { fallbackAdminRoadmapAssignments } from "./admin-content-fixtures.js";
import {
  fetchAdminRoadmapAssignment,
  fetchAdminRoadmapAssignments
} from "./admin-roadmap-assignments-api.js";
import {
  buildAdminRoadmapAssignmentDetailScreen,
  buildAdminRoadmapAssignmentEditorScreen,
  buildAdminRoadmapAssignmentListScreen,
  type AdminRoadmapAssignmentAction,
  type AdminRoadmapAssignmentDetailScreen,
  type AdminRoadmapAssignmentEditorScreen,
  type AdminRoadmapAssignmentListScreen,
  type AdminRoadmapAssignmentRoute,
  type AdminRoadmapAssignmentRow
} from "./admin-roadmap-assignments-screen.js";
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
import {
  renderRoadmapReadOnlySections,
  renderRoadmapReadOnlyStyle,
  roadmapReadOnlyStatusClass
} from "./admin-roadmap-readonly-shell-primitives.js";
import type { AdminWebRouteDefinition } from "./admin-web-route-types.js";
import { routeOptions } from "./admin-web-route-types.js";

export type AdminRoadmapAssignmentShellRoute =
  | "/admin/roadmap-assignments"
  | "/admin/roadmap-assignments/new"
  | `/admin/roadmap-assignments/${string}`;

export interface AdminRoadmapAssignmentShellRouteMetadata {
  path: "/admin/roadmap-assignments";
  label: string;
  screenRoute: AdminRoadmapAssignmentListScreen["route"];
}

export interface RenderAdminRoadmapAssignmentRouteOptions {
  path: AdminRoadmapAssignmentShellRoute;
  runtimeMode: RuntimeMode;
  authToken?: string;
  authCookie?: string;
  baseUrl?: string;
  fetchImpl?: AdminContentFetch;
}

export interface RenderedAdminRoadmapAssignmentRoute {
  path: AdminRoadmapAssignmentShellRoute;
  route: AdminRoadmapAssignmentRoute;
  state: AdminContentScreenState;
  statusCode: number;
  document: string;
}

export const adminRoadmapAssignmentRouteDefinition: AdminWebRouteDefinition = {
  matches: isAdminRoadmapAssignmentRoute,
  render: async (context) => ({
    title: "Admin Roadmap Assignments",
    ...(await renderAdminRoadmapAssignmentRoute({
      ...routeOptions(context),
      path: context.path as AdminRoadmapAssignmentShellRoute
    }))
  })
};

function isAdminRoadmapAssignmentRoute(path: string): boolean {
  return (
    path === "/admin/roadmap-assignments" ||
    (path.startsWith("/admin/roadmap-assignments/") &&
      path.length > "/admin/roadmap-assignments/".length)
  );
}

export const adminRoadmapAssignmentShellRoutes: readonly AdminRoadmapAssignmentShellRouteMetadata[] =
  [
    {
      path: "/admin/roadmap-assignments",
      label: "Roadmap Assignments",
      screenRoute: "AdminRoadmapAssignmentList"
    }
  ];

export async function renderAdminRoadmapAssignmentRoute(
  options: RenderAdminRoadmapAssignmentRouteOptions
): Promise<RenderedAdminRoadmapAssignmentRoute> {
  const screen =
    options.path === "/admin/roadmap-assignments"
      ? await resolveRoadmapAssignmentListScreen(options)
      : options.path === "/admin/roadmap-assignments/new"
        ? buildAdminRoadmapAssignmentEditorScreen({
            state: "ready",
            runtimeMode: options.runtimeMode
          })
        : await resolveRoadmapAssignmentDetailScreen(options);
  const html =
    screen.route === "AdminRoadmapAssignmentList"
      ? renderRoadmapAssignmentListScreen(screen)
      : screen.route === "AdminRoadmapAssignmentEditor"
        ? renderRoadmapAssignmentEditorScreen(screen)
        : renderRoadmapAssignmentDetailScreen(screen);

  return {
    path: options.path,
    route: screen.route,
    state: screen.state,
    statusCode: adminStatusCodeForState(screen.state),
    document: renderAdminDocument({ title: "Admin Roadmap Assignments", body: html })
  };
}

async function resolveRoadmapAssignmentListScreen(
  options: RenderAdminRoadmapAssignmentRouteOptions
): Promise<AdminRoadmapAssignmentListScreen> {
  if (options.runtimeMode === "demo") {
    return buildAdminRoadmapAssignmentListScreen({
      state: "ready",
      response: {
        roadmapAssignments: fallbackAdminRoadmapAssignments.map(toRoadmapAssignmentSummary)
      },
      runtimeMode: options.runtimeMode
    });
  }

  try {
    return buildAdminRoadmapAssignmentListScreen({
      state: "ready",
      response: await fetchAdminRoadmapAssignments(options),
      runtimeMode: options.runtimeMode
    });
  } catch (error) {
    return buildAdminRoadmapAssignmentListScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode
    });
  }
}

async function resolveRoadmapAssignmentDetailScreen(
  options: RenderAdminRoadmapAssignmentRouteOptions
): Promise<AdminRoadmapAssignmentDetailScreen> {
  const id = roadmapAssignmentIdFromPath(options.path);

  if (options.runtimeMode === "demo") {
    return buildAdminRoadmapAssignmentDetailScreen({
      state: "ready",
      roadmapAssignment: fallbackAdminRoadmapAssignments.find((assignment) => assignment.id === id),
      runtimeMode: options.runtimeMode
    });
  }

  try {
    return buildAdminRoadmapAssignmentDetailScreen({
      state: "ready",
      roadmapAssignment: (await fetchAdminRoadmapAssignment(id, options)).roadmapAssignment,
      runtimeMode: options.runtimeMode
    });
  } catch (error) {
    return buildAdminRoadmapAssignmentDetailScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode
    });
  }
}

function renderRoadmapAssignmentListScreen(screen: AdminRoadmapAssignmentListScreen): string {
  return [
    `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}">`,
    renderRoadmapReadOnlyStyle(),
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

function renderRoadmapAssignmentDetailScreen(screen: AdminRoadmapAssignmentDetailScreen): string {
  return [
    `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}">`,
    renderRoadmapReadOnlyStyle(),
    renderAdminHeader({
      title: screen.title,
      body: screen.body,
      actions: screen.actions,
      demoChromeVisible: screen.demoChromeVisible,
      renderAction
    }),
    renderSections(screen),
    "</section>"
  ].join("");
}

function renderRoadmapAssignmentEditorScreen(screen: AdminRoadmapAssignmentEditorScreen): string {
  return [
    `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}" data-mode="${screen.mode}">`,
    renderRoadmapReadOnlyStyle(),
    renderRoadmapAssignmentEditorStyle(screen),
    renderAdminHeader({
      title: screen.title,
      body: screen.body,
      actions: screen.actions,
      demoChromeVisible: screen.demoChromeVisible,
      renderAction
    }),
    renderEditorForm(screen),
    "</section>"
  ].join("");
}

function renderRows(screen: AdminRoadmapAssignmentListScreen): string {
  if (screen.rows.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body);
  }

  return ['<div class="admin-content__cards">', screen.rows.map(renderRow).join(""), "</div>"].join("");
}

function renderRow(row: AdminRoadmapAssignmentRow): string {
  return [
    `<article class="admin-content__card" data-roadmap-assignment-id="${escapeAttribute(row.id)}">`,
    `<span class="admin-content__badge ${roadmapReadOnlyStatusClass(row.status)}">${escapeHtml(row.statusLabel)}</span>`,
    `<h2 class="admin-content__name">${escapeHtml(row.title)}</h2>`,
    `<div class="admin-content__meta">${escapeHtml(row.assignee)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.roadmapMeta)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.organizationUnitName)} · ${escapeHtml(row.assignedAt)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.countsLabel)}</div>`,
    `<div class="admin-content__actions">${row.actions.map(renderAction).join("")}</div>`,
    "</article>"
  ].join("");
}

function renderSections(screen: AdminRoadmapAssignmentDetailScreen): string {
  return renderRoadmapReadOnlySections({
    sections: screen.sections,
    emptyTitle: screen.title,
    emptyBody: screen.body,
    containerAttributeName: "data-roadmap-assignment-id",
    containerId: screen.roadmapAssignmentId ?? ""
  });
}

function renderEditorForm(screen: AdminRoadmapAssignmentEditorScreen): string {
  if (screen.fields.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body, "admin-content__form");
  }

  return [
    '<form class="admin-content__form" data-endpoint="/admin/roadmap-assignments" data-method="POST">',
    screen.fields.map(renderAdminFormField).join(""),
    "</form>"
  ].join("");
}

function renderRoadmapAssignmentEditorStyle(screen: AdminRoadmapAssignmentEditorScreen): string {
  return [
    "<style>",
    `.admin-content__form{display:grid;gap:14px;max-width:760px;margin:0 auto;border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:16px;background:${screen.theme.surface};}`,
    ".admin-content__field{display:grid;gap:6px;}",
    ".admin-content__label{font-weight:700;}",
    `.admin-content__input{border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:10px 12px;font:inherit;color:${screen.theme.text};background:${screen.theme.background};}`,
    "</style>"
  ].join("");
}

function renderAction(action: AdminRoadmapAssignmentAction): string {
  const href =
    action.id === "create"
      ? "/admin/roadmap-assignments/new"
      : action.targetId && action.id !== "refresh"
      ? `/admin/roadmap-assignments/${action.targetId}`
      : "/admin/roadmap-assignments";

  return renderAdminActionLink(action, {
    href,
    secondary: action.id === "view" || action.id === "refresh"
  });
}

function roadmapAssignmentIdFromPath(path: AdminRoadmapAssignmentShellRoute): string {
  return path.slice("/admin/roadmap-assignments/".length);
}

function toRoadmapAssignmentSummary(
  assignment: AdminRoadmapAssignmentDetailDto
): AdminRoadmapAssignmentSummaryDto {
  return {
    id: assignment.id,
    assigneeUserId: assignment.assigneeUserId,
    assigneeName: assignment.assigneeName,
    assigneeEmail: assignment.assigneeEmail,
    roadmapDefinitionId: assignment.roadmapDefinitionId,
    roadmapTitle: assignment.roadmapTitle,
    roadmapTargetRole: assignment.roadmapTargetRole,
    roadmapStatus: assignment.roadmapStatus,
    organizationUnitId: assignment.organizationUnitId,
    organizationUnitName: assignment.organizationUnitName,
    status: assignment.status,
    assignedByUserId: assignment.assignedByUserId,
    assignedByName: assignment.assignedByName,
    assignedAt: assignment.assignedAt,
    completedAt: assignment.completedAt,
    submissionCount: assignment.submissionCount,
    pendingSubmissionCount: assignment.pendingSubmissionCount,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
    archivedAt: assignment.archivedAt
  };
}
