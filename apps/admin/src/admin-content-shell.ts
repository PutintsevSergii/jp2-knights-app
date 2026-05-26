import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminAnnouncementListResponseDto,
  AdminEventListResponseDto,
  AdminPrayerListResponseDto
} from "@jp2/shared-validation";
import type { AdminWebRouteDefinition } from "./admin-web-route-types.js";
import { routeOptions } from "./admin-web-route-types.js";
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
import { renderAdminContentListScreen } from "./admin-content-render.js";
import {
  adminStatusCodeForState,
  escapeAttribute,
  escapeHtml,
  renderAdminActionLink,
  renderAdminDocument,
  renderAdminEmptyState,
  renderAdminHeader
} from "./admin-render-primitives.js";

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

export const adminContentRouteDefinition: AdminWebRouteDefinition = {
  matches: isAdminContentRoute,
  render: async (context) => ({
    title: titleForAdminContentRoute(context.path),
    ...(await renderAdminContentRoute({
      ...routeOptions(context),
      path: context.path as AdminContentShellRoute
    }))
  })
};

interface AdminContentListResolver<TResponse> {
  demoResponse: TResponse;
  fetchResponse: (options: RenderAdminContentRouteOptions) => Promise<TResponse>;
  buildScreen: (options: {
    state: AdminContentScreenState;
    response?: TResponse | undefined;
    runtimeMode: RuntimeMode;
    canWrite: boolean;
  }) => AdminContentListScreen;
}

const prayerListResolver: AdminContentListResolver<AdminPrayerListResponseDto> = {
  demoResponse: fallbackAdminPrayers,
  fetchResponse: fetchAdminPrayers,
  buildScreen: buildAdminPrayerListScreen
};

const eventListResolver: AdminContentListResolver<AdminEventListResponseDto> = {
  demoResponse: fallbackAdminEvents,
  fetchResponse: fetchAdminEvents,
  buildScreen: buildAdminEventListScreen
};

const announcementListResolver: AdminContentListResolver<AdminAnnouncementListResponseDto> = {
  demoResponse: fallbackAdminAnnouncements,
  fetchResponse: fetchAdminAnnouncements,
  buildScreen: buildAdminAnnouncementListScreen
};

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
    statusCode: adminStatusCodeForState(rendered.state),
    document: renderAdminDocument({
      title: titleForRoute(rendered.route),
      body: rendered.html
    })
  };
}

async function resolvePrayerScreen(
  options: RenderAdminContentRouteOptions
): Promise<AdminContentListScreen> {
  return resolveContentListScreen(options, prayerListResolver);
}

async function resolveEventScreen(
  options: RenderAdminContentRouteOptions
): Promise<AdminContentListScreen> {
  return resolveContentListScreen(options, eventListResolver);
}

async function resolveAnnouncementScreen(
  options: RenderAdminContentRouteOptions
): Promise<AdminContentListScreen> {
  return resolveContentListScreen(options, announcementListResolver);
}

async function resolveContentListScreen<TResponse>(
  options: RenderAdminContentRouteOptions,
  resolver: AdminContentListResolver<TResponse>
): Promise<AdminContentListScreen> {
  if (options.runtimeMode === "demo") {
    return resolver.buildScreen({
      state: "ready",
      response: resolver.demoResponse,
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  }

  try {
    return resolver.buildScreen({
      state: "ready",
      response: await resolver.fetchResponse(options),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite
    });
  } catch (error) {
    return resolver.buildScreen({
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

function titleForRoute(
  route: AdminContentListScreen["route"] | AdminAnnouncementEditorScreen["route"]
): string {
  if (route === "AdminPrayerList") {
    return "Admin Prayers";
  }

  if (route === "AdminEventList") {
    return "Admin Events";
  }

  return "Admin Announcements";
}

function isAdminContentRoute(path: string): boolean {
  return (
    path === "/admin/prayers" ||
    path === "/admin/events" ||
    path === "/admin/announcements" ||
    isAdminAnnouncementEditorRoute(path)
  );
}

function titleForAdminContentRoute(path: string): string {
  if (path === "/admin/prayers") {
    return "Admin Prayers";
  }

  if (path === "/admin/events") {
    return "Admin Events";
  }

  return "Admin Announcements";
}

function isAdminAnnouncementEditorRoute(path: string): boolean {
  return (
    path === "/admin/announcements/new" ||
    (path.startsWith("/admin/announcements/") && path.length > "/admin/announcements/".length)
  );
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
  return renderAdminHeader({
    title: screen.title,
    body: screen.body,
    actions: screen.actions,
    demoChromeVisible: screen.demoChromeVisible,
    renderAction: renderEditorAction
  });
}

function renderEditorForm(screen: AdminAnnouncementEditorScreen): string {
  if (screen.fields.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body, "admin-content__form");
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

  return renderAdminActionLink(action, {
    href,
    danger: Boolean(modifier),
    secondary: Boolean(secondary)
  });
}
