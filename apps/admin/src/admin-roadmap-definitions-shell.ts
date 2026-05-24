import { designTokens } from "@jp2/shared-design-tokens";
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
  type AdminRoadmapDefinitionRow,
  type AdminRoadmapDefinitionSection
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
      label: "Roadmap Definitions",
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
    document: renderAdminDocument({ title: "Admin Roadmap Definitions", body: html })
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

function renderRoadmapDefinitionDetailScreen(screen: AdminRoadmapDefinitionDetailScreen): string {
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
    renderSections(screen),
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
    `.admin-content__card,.admin-content__sections{border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.lg}px;padding:${designTokens.space[4]}px;background:${designTokens.color.background.surface};}`,
    ".admin-content__name{font-size:18px;line-height:24px;margin:0 0 6px;}",
    `.admin-content__meta,.admin-content__preview{color:${designTokens.color.text.muted};font-size:14px;line-height:20px;}`,
    ".admin-content__badge{display:inline-block;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:700;text-transform:uppercase;}",
    `.admin-content__badge--published{background:${designTokens.color.brand.gold};color:${designTokens.color.brand.goldDeep};}`,
    `.admin-content__badge--draft,.admin-content__badge--review,.admin-content__badge--approved{background:${designTokens.color.border.soft};color:${designTokens.color.text.muted};}`,
    `.admin-content__badge--archived{background:${designTokens.color.border.soft};color:${designTokens.color.status.danger};}`,
    `.admin-content__button{border:1px solid ${designTokens.color.action.primary};border-radius:${designTokens.radius.md}px;padding:8px 12px;text-decoration:none;color:${designTokens.color.action.primaryText};background:${designTokens.color.action.primary};font-weight:700;display:inline-flex;margin-right:8px;}`,
    `.admin-content__button--secondary{background:${designTokens.color.background.surface};color:${designTokens.color.text.primary};border-color:${designTokens.color.border.subtle};}`,
    ".admin-content__sections{display:grid;gap:16px;max-width:1120px;margin:0 auto;}",
    `.admin-content__section{border-bottom:1px solid ${designTokens.color.border.subtle};padding-bottom:14px;}`,
    ".admin-content__section:last-child{border-bottom:0;padding-bottom:0;}",
    ".admin-content__section-title{font-size:18px;line-height:24px;margin:0 0 6px;}",
    "@media (max-width:760px){.admin-content__header{display:block;}.admin-content__actions{margin-top:16px;}}",
    "</style>"
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
    `<span class="admin-content__badge ${statusClass(row.status)}">${escapeHtml(row.statusLabel)}</span>`,
    `<h2 class="admin-content__name">${escapeHtml(row.title)}</h2>`,
    `<div class="admin-content__meta">${escapeHtml(row.targetRole)} · ${escapeHtml(row.language)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.countsLabel)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.publishedAt)}</div>`,
    `<div class="admin-content__actions">${row.actions.map(renderAction).join("")}</div>`,
    "</article>"
  ].join("");
}

function renderSections(screen: AdminRoadmapDefinitionDetailScreen): string {
  if (screen.sections.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body);
  }

  return [
    `<div class="admin-content__sections" data-roadmap-definition-id="${escapeAttribute(screen.roadmapDefinitionId ?? "")}">`,
    screen.sections.map(renderSection).join(""),
    "</div>"
  ].join("");
}

function renderSection(section: AdminRoadmapDefinitionSection): string {
  return [
    `<section class="admin-content__section" data-roadmap-section-id="${escapeAttribute(section.id)}">`,
    `<h2 class="admin-content__section-title">${escapeHtml(section.title)}</h2>`,
    `<p class="admin-content__preview">${escapeHtml(section.body)}</p>`,
    "</section>"
  ].join("");
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

function statusClass(status: string): string {
  return `admin-content__badge--${status.toLowerCase().replaceAll("_", "-")}`;
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
