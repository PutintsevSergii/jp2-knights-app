import type { RuntimeMode } from "@jp2/shared-types";
import {
  adminContentFailureState,
  type AdminContentFetch,
  type AdminContentScreenState,
  fetchAdminAnnouncements,
  fetchAdminEvents,
  fetchAdminPrayers
} from "./admin-content-api.js";
import {
  fallbackAdminAnnouncements,
  fallbackAdminEvents,
  fallbackAdminPrayers
} from "./admin-content-fixtures.js";
import {
  type AdminAnnouncementEditorScreen,
  type AdminContentListScreen,
  buildAdminAnnouncementEditorScreen,
  buildAdminAnnouncementListScreen,
  buildAdminEventListScreen,
  buildAdminPrayerListScreen
} from "./admin-content-screens.js";
import {
  type RenderedAdminContentScreen,
  renderAdminContentListScreen
} from "./admin-content-render.js";

export type AdminContentShellRoute =
  | "/admin/prayers"
  | "/admin/events"
  | "/admin/announcements"
  | "/admin/announcements/new"
  | `/admin/announcements/${string}`;

export interface AdminContentShellRouteMetadata {
  path: AdminContentShellRoute;
  label: string;
  screenRoute: AdminContentListScreen["route"];
}

export interface RenderAdminContentRouteOptions {
  path: AdminContentShellRoute;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  authToken?: string;
  authCookie?: string;
  baseUrl?: string;
  fetchImpl?: AdminContentFetch;
}

type RenderedAdminContentShellScreen = RenderedAdminContentScreen | {
  route: AdminAnnouncementEditorScreen["route"];
  state: AdminContentScreenState;
  html: string;
};

export interface RenderedAdminContentRoute {
  path: AdminContentShellRoute;
  route: AdminContentListScreen["route"] | AdminAnnouncementEditorScreen["route"];
  state: AdminContentScreenState;
  html: string;
  statusCode: number;
  document: string;
}

export const adminContentShellRoutes: readonly AdminContentShellRouteMetadata[] = [
  {
    path: "/admin/prayers",
    label: "Prayers",
    screenRoute: "AdminPrayerList"
  },
  {
    path: "/admin/events",
    label: "Events",
    screenRoute: "AdminEventList"
  },
  {
    path: "/admin/announcements",
    label: "Announcements",
    screenRoute: "AdminAnnouncementList"
  }
];

export async function renderAdminContentRoute(
  options: RenderAdminContentRouteOptions
): Promise<RenderedAdminContentRoute> {
  const screen =
    options.path === "/admin/prayers"
      ? await resolvePrayerScreen(options)
      : options.path === "/admin/events"
        ? await resolveEventScreen(options)
        : options.path === "/admin/announcements"
          ? await resolveAnnouncementScreen(options)
          : await resolveAnnouncementEditorScreen(options);
  const rendered =
    screen.route === "AdminAnnouncementEditor"
      ? renderAdminAnnouncementEditorScreen(screen)
      : renderAdminContentListScreen(screen);

  return {
    ...rendered,
    path: options.path,
    statusCode: statusCodeForState(rendered.state),
    document: renderDocument(rendered)
  };
}

function renderDocument(rendered: RenderedAdminContentShellScreen): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${titleForRoute(rendered.route)}</title>`,
    "</head>",
    "<body>",
    `<main>${rendered.html}</main>`,
    "</body>",
    "</html>"
  ].join("");
}

async function resolvePrayerScreen(
  options: RenderAdminContentRouteOptions
): Promise<AdminContentListScreen> {
  if (options.runtimeMode === "demo") {
    return buildAdminPrayerListScreen({
      state: "ready",
      response: fallbackAdminPrayers,
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }

  try {
    return buildAdminPrayerListScreen({
      state: "ready",
      response: await fetchAdminPrayers(options),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  } catch (error) {
    return buildAdminPrayerListScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }
}

async function resolveEventScreen(
  options: RenderAdminContentRouteOptions
): Promise<AdminContentListScreen> {
  if (options.runtimeMode === "demo") {
    return buildAdminEventListScreen({
      state: "ready",
      response: fallbackAdminEvents,
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }

  try {
    return buildAdminEventListScreen({
      state: "ready",
      response: await fetchAdminEvents(options),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  } catch (error) {
    return buildAdminEventListScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }
}

async function resolveAnnouncementScreen(
  options: RenderAdminContentRouteOptions
): Promise<AdminContentListScreen> {
  if (options.runtimeMode === "demo") {
    return buildAdminAnnouncementListScreen({
      state: "ready",
      response: fallbackAdminAnnouncements,
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }

  try {
    return buildAdminAnnouncementListScreen({
      state: "ready",
      response: await fetchAdminAnnouncements(options),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  } catch (error) {
    return buildAdminAnnouncementListScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }
}

async function resolveAnnouncementEditorScreen(
  options: RenderAdminContentRouteOptions
): Promise<AdminAnnouncementEditorScreen> {
  if (options.path === "/admin/announcements/new") {
    return buildAdminAnnouncementEditorScreen({
      state: options.canWrite ? "ready" : "forbidden",
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      mode: "create"
    });
  }

  const id = announcementIdFromPath(options.path);

  if (options.runtimeMode === "demo") {
    return buildAdminAnnouncementEditorScreen({
      state: "ready",
      announcement: fallbackAdminAnnouncements.announcements.find(
        (announcement) => announcement.id === id
      ),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      mode: "edit"
    });
  }

  try {
    const response = await fetchAdminAnnouncements(options);

    return buildAdminAnnouncementEditorScreen({
      state: "ready",
      announcement: response.announcements.find((announcement) => announcement.id === id),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      mode: "edit"
    });
  } catch (error) {
    return buildAdminAnnouncementEditorScreen({
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      mode: "edit"
    });
  }
}

function statusCodeForState(state: AdminContentScreenState): number {
  if (state === "forbidden") {
    return 403;
  }

  if (state === "empty") {
    return 404;
  }

  if (state === "offline") {
    return 503;
  }

  if (state === "error") {
    return 500;
  }

  return 200;
}

function titleForRoute(route: AdminContentListScreen["route"] | AdminAnnouncementEditorScreen["route"]): string {
  if (route === "AdminPrayerList") {
    return "Admin Prayers";
  }

  if (route === "AdminEventList") {
    return "Admin Events";
  }

  return "Admin Announcements";
}

function announcementIdFromPath(path: AdminContentShellRoute): string {
  return path.slice("/admin/announcements/".length);
}

function renderAdminAnnouncementEditorScreen(screen: AdminAnnouncementEditorScreen) {
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

function renderEditorStyle(screen: AdminAnnouncementEditorScreen): string {
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
    `.admin-content__button{background:${screen.theme.primaryAction};color:${screen.theme.primaryActionText};border:0;border-radius:${screen.theme.radius}px;padding:8px 10px;font-weight:600;text-decoration:none;display:inline-block;}`,
    `.admin-content__button--secondary{background:${screen.theme.surface};color:${screen.theme.text};border:1px solid ${screen.theme.border};}`,
    `.admin-content__button--danger{background:${screen.theme.danger};color:${screen.theme.primaryActionText};}`,
    `.admin-content__form{background:${screen.theme.surface};border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:16px;display:grid;gap:12px;max-width:760px;}`,
    ".admin-content__field{display:grid;gap:4px;}",
    ".admin-content__label{font-weight:600;}",
    `.admin-content__input{border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:8px;font:inherit;color:${screen.theme.text};background:${screen.theme.background};}`,
    `.admin-content__textarea{min-height:120px;resize:vertical;}`,
    `.admin-content__meta{color:${screen.theme.mutedText};font-size:13px;}`,
    ".admin-content__demo{font-size:12px;font-weight:700;text-transform:uppercase;}",
    "</style>"
  ].join("");
}

function renderEditorHeader(screen: AdminAnnouncementEditorScreen): string {
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

function renderEditorForm(screen: AdminAnnouncementEditorScreen): string {
  if (screen.fields.length === 0) {
    return [
      '<div class="admin-content__form" role="status">',
      `<strong>${escapeHtml(screen.title)}</strong>`,
      `<p class="admin-content__meta">${escapeHtml(screen.body)}</p>`,
      "</div>"
    ].join("");
  }

  return [
    `<form class="admin-content__form" data-announcement-id="${escapeAttribute(screen.announcementId ?? "")}" data-mode="${screen.mode}">`,
    screen.fields.map(renderEditorField).join(""),
    "</form>"
  ].join("");
}

function renderEditorField(field: AdminAnnouncementEditorScreen["fields"][number]): string {
  const attrs = [
    `class="admin-content__input${field.name === "body" ? " admin-content__textarea" : ""}"`,
    `name="${escapeAttribute(field.name)}"`,
    field.required ? "required" : "",
    field.readOnly ? "readonly" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const control =
    field.name === "body"
      ? `<textarea ${attrs}>${escapeHtml(field.value)}</textarea>`
      : `<input ${attrs} value="${escapeAttribute(field.value)}">`;

  return [
    '<label class="admin-content__field">',
    `<span class="admin-content__label">${escapeHtml(field.label)}</span>`,
    control,
    "</label>"
  ].join("");
}

function renderEditorAction(action: AdminAnnouncementEditorScreen["actions"][number]): string {
  const modifier = action.id === "archive" ? " admin-content__button--danger" : "";
  const secondary = action.id === "refresh" ? " admin-content__button--secondary" : "";
  const href =
    action.id === "refresh"
      ? "/admin/announcements"
      : action.id === "create"
        ? "/admin/announcements/new"
        : action.targetId
          ? `/admin/announcements/${action.targetId}`
          : "/admin/announcements";

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
