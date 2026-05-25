import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminRoadmapDefinitionDetailDto,
  AdminRoadmapDefinitionSummaryDto
} from "@jp2/shared-validation";
import {
  adminContentFailureState,
  type AdminContentFetch,
  type AdminContentScreenState
} from "./admin-content-api.js";
import { fallbackAdminRoadmapDefinitions } from "./admin-content-fixtures.js";
import { adminCopy } from "./admin-i18n.js";
import {
  fetchAdminRoadmapDefinition,
  fetchAdminRoadmapDefinitions
} from "./admin-roadmap-definitions-api.js";
import {
  buildAdminRoadmapDefinitionDetailScreen,
  buildAdminRoadmapDefinitionListScreen,
  type AdminRoadmapDefinitionAction,
  type AdminRoadmapDefinitionDetailScreen,
  type AdminRoadmapDefinitionListScreen,
  type AdminRoadmapDefinitionRoute,
  type AdminRoadmapDefinitionRow
} from "./admin-roadmap-definitions-screen.js";
import {
  adminStatusCodeForState,
  escapeAttribute,
  escapeHtml,
  renderAdminActionLink,
  renderAdminDocument,
  renderAdminEmptyState,
  renderAdminHeader
} from "./admin-render-primitives.js";
import {
  renderRoadmapReadOnlySections,
  renderRoadmapReadOnlyStyle,
  roadmapReadOnlyStatusClass
} from "./admin-roadmap-readonly-shell-primitives.js";

export type AdminRoadmapDefinitionShellRoute =
  | "/admin/roadmap-definitions"
  | `/admin/roadmap-definitions/${string}`;

export interface AdminRoadmapDefinitionShellRouteMetadata {
  path: "/admin/roadmap-definitions";
  label: string;
  screenRoute: AdminRoadmapDefinitionListScreen["route"];
}

export interface RenderAdminRoadmapDefinitionRouteOptions {
  path: AdminRoadmapDefinitionShellRoute;
  runtimeMode: RuntimeMode;
  authToken?: string;
  authCookie?: string;
  baseUrl?: string;
  fetchImpl?: AdminContentFetch;
}

export interface RenderedAdminRoadmapDefinitionRoute {
  path: AdminRoadmapDefinitionShellRoute;
  route: AdminRoadmapDefinitionRoute;
  state: AdminContentScreenState;
  statusCode: number;
  document: string;
}

export const adminRoadmapDefinitionShellRoutes: readonly AdminRoadmapDefinitionShellRouteMetadata[] =
  [
    {
      path: "/admin/roadmap-definitions",
      label: adminCopy("admin.roadmapDefinitions.title"),
      screenRoute: "AdminRoadmapDefinitionList"
    }
  ];

export async function renderAdminRoadmapDefinitionRoute(
  options: RenderAdminRoadmapDefinitionRouteOptions
): Promise<RenderedAdminRoadmapDefinitionRoute> {
  const screen =
    options.path === "/admin/roadmap-definitions"
      ? await resolveRoadmapDefinitionListScreen(options)
      : await resolveRoadmapDefinitionDetailScreen(options);
  const html =
    screen.route === "AdminRoadmapDefinitionList"
      ? renderRoadmapDefinitionListScreen(screen)
      : renderRoadmapDefinitionDetailScreen(screen);

  return {
    path: options.path,
    route: screen.route,
    state: screen.state,
    statusCode: adminStatusCodeForState(screen.state),
    document: renderAdminDocument({
      title: adminCopy("admin.roadmapDefinitions.documentTitle"),
      body: html
    })
  };
}

async function resolveRoadmapDefinitionListScreen(
  options: RenderAdminRoadmapDefinitionRouteOptions
): Promise<AdminRoadmapDefinitionListScreen> {
  if (options.runtimeMode === "demo") {
    return buildAdminRoadmapDefinitionListScreen({
      state: "ready",
      response: {
        roadmapDefinitions: fallbackAdminRoadmapDefinitions.map(toRoadmapDefinitionSummary)
      },
      runtimeMode: options.runtimeMode
    });
  }

  try {
    return buildAdminRoadmapDefinitionListScreen({
      state: "ready",
      response: await fetchAdminRoadmapDefinitions(options),
      runtimeMode: options.runtimeMode
    });
  } catch (error) {
    return buildAdminRoadmapDefinitionListScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode
    });
  }
}

async function resolveRoadmapDefinitionDetailScreen(
  options: RenderAdminRoadmapDefinitionRouteOptions
): Promise<AdminRoadmapDefinitionDetailScreen> {
  const id = roadmapDefinitionIdFromPath(options.path);

  if (options.runtimeMode === "demo") {
    return buildAdminRoadmapDefinitionDetailScreen({
      state: "ready",
      roadmapDefinition: fallbackAdminRoadmapDefinitions.find((definition) => definition.id === id),
      runtimeMode: options.runtimeMode
    });
  }

  try {
    return buildAdminRoadmapDefinitionDetailScreen({
      state: "ready",
      roadmapDefinition: (await fetchAdminRoadmapDefinition(id, options)).roadmapDefinition,
      runtimeMode: options.runtimeMode
    });
  } catch (error) {
    return buildAdminRoadmapDefinitionDetailScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode
    });
  }
}

function renderRoadmapDefinitionListScreen(screen: AdminRoadmapDefinitionListScreen): string {
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

function renderRoadmapDefinitionDetailScreen(screen: AdminRoadmapDefinitionDetailScreen): string {
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

function renderRows(screen: AdminRoadmapDefinitionListScreen): string {
  if (screen.rows.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body);
  }

  return ['<div class="admin-content__cards">', screen.rows.map(renderRow).join(""), "</div>"].join("");
}

function renderRow(row: AdminRoadmapDefinitionRow): string {
  return [
    `<article class="admin-content__card" data-roadmap-definition-id="${escapeAttribute(row.id)}">`,
    `<span class="admin-content__badge ${roadmapReadOnlyStatusClass(row.status)}">${escapeHtml(row.statusLabel)}</span>`,
    `<h2 class="admin-content__name">${escapeHtml(row.title)}</h2>`,
    `<div class="admin-content__meta">${escapeHtml(row.targetRole)} · ${escapeHtml(row.language)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.countsLabel)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.publishedAt)}</div>`,
    `<div class="admin-content__actions">${row.actions.map(renderAction).join("")}</div>`,
    "</article>"
  ].join("");
}

function renderSections(screen: AdminRoadmapDefinitionDetailScreen): string {
  return renderRoadmapReadOnlySections({
    sections: screen.sections,
    emptyTitle: screen.title,
    emptyBody: screen.body,
    containerAttributeName: "data-roadmap-definition-id",
    containerId: screen.roadmapDefinitionId ?? ""
  });
}

function renderAction(action: AdminRoadmapDefinitionAction): string {
  const href =
    action.targetId && action.id !== "refresh"
      ? `/admin/roadmap-definitions/${action.targetId}`
      : "/admin/roadmap-definitions";

  return renderAdminActionLink(action, {
    href,
    secondary: action.id === "view" || action.id === "refresh"
  });
}

function roadmapDefinitionIdFromPath(path: AdminRoadmapDefinitionShellRoute): string {
  return path.slice("/admin/roadmap-definitions/".length);
}

function toRoadmapDefinitionSummary(
  definition: AdminRoadmapDefinitionDetailDto
): AdminRoadmapDefinitionSummaryDto {
  return {
    id: definition.id,
    title: definition.title,
    targetRole: definition.targetRole,
    language: definition.language,
    status: definition.status,
    publishedAt: definition.publishedAt,
    stageCount: definition.stageCount,
    stepCount: definition.stepCount,
    assignmentCount: definition.assignmentCount,
    createdAt: definition.createdAt,
    updatedAt: definition.updatedAt,
    archivedAt: definition.archivedAt
  };
}
