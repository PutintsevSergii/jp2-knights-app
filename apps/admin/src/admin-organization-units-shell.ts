import type { RuntimeMode } from "@jp2/shared-types";
import {
  adminContentFailureState,
  type AdminContentFetch,
  type AdminContentScreenState
} from "./admin-content-api.js";
import { fallbackAdminOrganizationUnits } from "./admin-content-fixtures.js";
import { renderAdminContentListScreen } from "./admin-content-render.js";
import { fetchAdminOrganizationUnits } from "./admin-organization-units-api.js";
import {
  buildAdminOrganizationUnitEditorScreen,
  buildAdminOrganizationUnitListScreen,
  type AdminOrganizationUnitEditorScreen,
  type AdminOrganizationUnitRoute,
  type AdminOrganizationUnitListScreen
} from "./admin-organization-units-screen.js";

export type AdminOrganizationUnitShellRoute =
  | "/admin/organization-units"
  | "/admin/organization-units/new"
  | `/admin/organization-units/${string}`;

export interface AdminOrganizationUnitShellRouteMetadata {
  path: AdminOrganizationUnitShellRoute;
  label: string;
  screenRoute: AdminOrganizationUnitListScreen["route"];
}

export interface RenderAdminOrganizationUnitRouteOptions {
  path: AdminOrganizationUnitShellRoute;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  authToken?: string;
  baseUrl?: string;
  fetchImpl?: AdminContentFetch;
}

export interface RenderedAdminOrganizationUnitRoute {
  path: AdminOrganizationUnitShellRoute;
  route: AdminOrganizationUnitRoute;
  state: AdminContentScreenState;
  statusCode: number;
  document: string;
}

export const adminOrganizationUnitShellRoutes: readonly AdminOrganizationUnitShellRouteMetadata[] =
  [
    {
      path: "/admin/organization-units",
      label: "Organization Units",
      screenRoute: "AdminOrganizationUnitList"
    }
  ];

export async function renderAdminOrganizationUnitRoute(
  options: RenderAdminOrganizationUnitRouteOptions
): Promise<RenderedAdminOrganizationUnitRoute> {
  const screen =
    options.path === "/admin/organization-units"
      ? await resolveOrganizationUnitListScreen(options)
      : await resolveOrganizationUnitEditorScreen(options);
  const rendered =
    screen.route === "AdminOrganizationUnitList"
      ? renderAdminContentListScreen(screen)
      : renderAdminOrganizationUnitEditorScreen(screen);

  return {
    path: options.path,
    route: screen.route,
    state: rendered.state,
    statusCode: statusCodeForState(rendered.state),
    document: renderDocument(rendered.html)
  };
}

async function resolveOrganizationUnitListScreen(
  options: RenderAdminOrganizationUnitRouteOptions
): Promise<AdminOrganizationUnitListScreen> {
  if (options.runtimeMode === "demo") {
    return buildAdminOrganizationUnitListScreen({
      state: "ready",
      response: fallbackAdminOrganizationUnits,
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }

  try {
    return buildAdminOrganizationUnitListScreen({
      state: "ready",
      response: await fetchAdminOrganizationUnits(options),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  } catch (error) {
    return buildAdminOrganizationUnitListScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }
}

async function resolveOrganizationUnitEditorScreen(
  options: RenderAdminOrganizationUnitRouteOptions
): Promise<AdminOrganizationUnitEditorScreen> {
  if (options.path === "/admin/organization-units/new") {
    return buildAdminOrganizationUnitEditorScreen({
      state: options.canWrite ? "ready" : "forbidden",
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      mode: "create"
    });
  }

  const id = organizationUnitIdFromPath(options.path);

  if (options.runtimeMode === "demo") {
    return buildAdminOrganizationUnitEditorScreen({
      state: "ready",
      organizationUnit: fallbackAdminOrganizationUnits.organizationUnits.find((unit) => unit.id === id),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      mode: "edit"
    });
  }

  try {
    const response = await fetchAdminOrganizationUnits(options);

    return buildAdminOrganizationUnitEditorScreen({
      state: "ready",
      organizationUnit: response.organizationUnits.find((unit) => unit.id === id),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      mode: "edit"
    });
  } catch (error) {
    return buildAdminOrganizationUnitEditorScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      mode: "edit"
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
    "<title>Admin Organization Units</title>",
    "</head>",
    "<body>",
    `<main>${html}</main>`,
    "</body>",
    "</html>"
  ].join("");
}

function statusCodeForState(state: AdminContentScreenState): number {
  if (state === "forbidden") return 403;
  if (state === "empty") return 404;
  if (state === "offline") return 503;
  if (state === "error") return 500;
  return 200;
}

function organizationUnitIdFromPath(path: AdminOrganizationUnitShellRoute): string {
  return path.slice("/admin/organization-units/".length);
}

function renderAdminOrganizationUnitEditorScreen(screen: AdminOrganizationUnitEditorScreen) {
  return {
    route: screen.route,
    state: screen.state,
    html: [
      `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}" data-mode="${screen.mode}">`,
      renderEditorStyle(screen),
      renderEditorHeader(screen),
      renderEditorForm(screen),
      "</section>"
    ].join("")
  };
}

function renderEditorStyle(screen: AdminOrganizationUnitEditorScreen): string {
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
    `.admin-content__button{background:${screen.theme.primaryAction};color:${screen.theme.primaryActionText};border:0;border-radius:${screen.theme.radius}px;padding:8px 10px;font-weight:600;}`,
    `.admin-content__button--secondary{background:${screen.theme.surface};color:${screen.theme.text};border:1px solid ${screen.theme.border};}`,
    `.admin-content__button--danger{background:${screen.theme.danger};color:${screen.theme.primaryActionText};}`,
    `.admin-content__form{background:${screen.theme.surface};border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:16px;display:grid;gap:12px;max-width:760px;}`,
    ".admin-content__field{display:grid;gap:4px;}",
    ".admin-content__label{font-weight:600;}",
    `.admin-content__input{border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:8px;font:inherit;color:${screen.theme.text};background:${screen.theme.background};}`,
    `.admin-content__meta{color:${screen.theme.mutedText};font-size:13px;}`,
    ".admin-content__demo{font-size:12px;font-weight:700;text-transform:uppercase;}",
    "</style>"
  ].join("");
}

function renderEditorHeader(screen: AdminOrganizationUnitEditorScreen): string {
  const demoBadge = screen.demoChromeVisible
    ? '<span class="admin-content__demo" aria-label="Demo mode">Demo</span>'
    : "";

  return [
    '<header class="admin-content__header">',
    "<div>",
    `<h1 class="admin-content__title">${escapeHtml(screen.title)}</h1>`,
    `<p class="admin-content__body">${escapeHtml(screen.body)}</p>`,
    demoBadge,
    "</div>",
    `<div class="admin-content__actions">${screen.actions.map(renderEditorAction).join("")}</div>`,
    "</header>"
  ].join("");
}

function renderEditorForm(screen: AdminOrganizationUnitEditorScreen): string {
  if (screen.fields.length === 0) {
    return [
      '<div class="admin-content__form" role="status">',
      `<strong>${escapeHtml(screen.title)}</strong>`,
      `<p class="admin-content__meta">${escapeHtml(screen.body)}</p>`,
      "</div>"
    ].join("");
  }

  return [
    `<form class="admin-content__form" data-organization-unit-id="${escapeAttribute(screen.organizationUnitId ?? "")}" data-mode="${screen.mode}">`,
    screen.fields
      .map(
        (field) => [
          '<label class="admin-content__field">',
          `<span class="admin-content__label">${escapeHtml(field.label)}</span>`,
          `<input class="admin-content__input" name="${escapeAttribute(field.name)}" value="${escapeAttribute(field.value)}"${field.required ? " required" : ""}${field.readOnly ? " readonly" : ""}>`,
          "</label>"
        ].join("")
      )
      .join(""),
    "</form>"
  ].join("");
}

function renderEditorAction(action: AdminOrganizationUnitEditorScreen["actions"][number]): string {
  const modifier = action.id === "archive" ? " admin-content__button--danger" : "";
  const secondary = action.id === "refresh" ? " admin-content__button--secondary" : "";
  const href =
    action.id === "refresh"
      ? "/admin/organization-units"
      : action.id === "create"
        ? "/admin/organization-units/new"
        : action.targetId
          ? `/admin/organization-units/${action.targetId}`
          : "/admin/organization-units";

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
