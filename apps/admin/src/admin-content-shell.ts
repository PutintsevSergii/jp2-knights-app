import type { RuntimeMode } from "@jp2/shared-types";
import type {
  AdminAnnouncementListResponseDto,
  AdminEventListResponseDto,
  AdminPrayerListResponseDto,
  AdminSilentPrayerEventListResponseDto
} from "@jp2/shared-validation";
import type { AdminWebRouteDefinition } from "./admin-web-route-types.js";
import { routeOptions } from "./admin-web-route-types.js";
import {
  adminContentFailureState,
  type AdminContentFetch,
  type AdminContentScreenState,
  fetchAdminAnnouncements,
  fetchAdminEvents,
  fetchAdminPrayers,
  fetchAdminSilentPrayerEvents
} from "./admin-content-api.js";
import {
  fallbackAdminAnnouncements,
  fallbackAdminEvents,
  fallbackAdminPrayers,
  fallbackAdminSilentPrayerEvents
} from "./admin-content-fixtures.js";
import {
  type AdminContentListScreen,
  type AdminContentEditorKind,
  type AdminContentEditorScreen,
  buildAdminAnnouncementListScreen,
  buildAdminContentEditorScreen,
  buildAdminEventListScreen,
  buildAdminPrayerListScreen,
  buildAdminSilentPrayerListScreen
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
  | "/admin/prayers/new"
  | `/admin/prayers/${string}`
  | "/admin/events"
  | "/admin/events/new"
  | `/admin/events/${string}`
  | "/admin/silent-prayer-events"
  | "/admin/silent-prayer-events/new"
  | `/admin/silent-prayer-events/${string}`
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
  route: AdminContentListScreen["route"] | AdminContentEditorScreen["route"];
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
    path: "/admin/silent-prayer-events",
    label: "Silent Prayer",
    screenRoute: "AdminSilentPrayerList"
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

const silentPrayerListResolver: AdminContentListResolver<AdminSilentPrayerEventListResponseDto> = {
  demoResponse: fallbackAdminSilentPrayerEvents,
  fetchResponse: fetchAdminSilentPrayerEvents,
  buildScreen: buildAdminSilentPrayerListScreen
};

export async function renderAdminContentRoute(
  options: RenderAdminContentRouteOptions
): Promise<RenderedAdminContentRoute> {
  const screen =
    options.path === "/admin/prayers"
      ? await resolvePrayerScreen(options)
      : isAdminPrayerEditorRoute(options.path)
        ? await resolveContentEditorScreen(options, "prayer")
        : options.path === "/admin/events"
        ? await resolveEventScreen(options)
        : isAdminEventEditorRoute(options.path)
          ? await resolveContentEditorScreen(options, "event")
          : options.path === "/admin/silent-prayer-events"
            ? await resolveSilentPrayerScreen(options)
            : isAdminSilentPrayerEditorRoute(options.path)
              ? await resolveContentEditorScreen(options, "silentPrayer")
              : options.path === "/admin/announcements"
                ? await resolveAnnouncementScreen(options)
                : await resolveContentEditorScreen(options, "announcement");
  const rendered =
    isAdminContentEditorScreen(screen)
      ? renderAdminContentEditorScreen(screen)
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

async function resolveSilentPrayerScreen(
  options: RenderAdminContentRouteOptions
): Promise<AdminContentListScreen> {
  return resolveContentListScreen(options, silentPrayerListResolver);
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

async function resolveContentEditorScreen(
  options: RenderAdminContentRouteOptions,
  kind: AdminContentEditorKind
): Promise<AdminContentEditorScreen> {
  if (isNewContentEditorPath(options.path)) {
    return buildAdminContentEditorScreen({
      kind,
      state: options.canWrite ? "ready" : "forbidden",
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      mode: "create"
    });
  }

  const id = contentIdFromPath(options.path, kind);

  if (options.runtimeMode === "demo") {
    return buildAdminContentEditorScreen({
      kind,
      state: "ready",
      item: findDemoContentItem(kind, id),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      mode: "edit"
    });
  }

  try {
    return buildAdminContentEditorScreen({
      kind,
      state: "ready",
      item: await findApiContentItem(kind, id, options),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      mode: "edit"
    });
  } catch (error) {
    return buildAdminContentEditorScreen({
      kind,
      state: adminContentFailureState(error),
      runtimeMode: options.runtimeMode,
      canWrite: options.canWrite,
      mode: "edit"
    });
  }
}

function titleForRoute(
  route: AdminContentListScreen["route"] | AdminContentEditorScreen["route"]
): string {
  if (route === "AdminPrayerList" || route === "AdminPrayerEditor") {
    return "Admin Prayers";
  }

  if (route === "AdminEventList" || route === "AdminEventEditor") {
    return "Admin Events";
  }

  if (route === "AdminSilentPrayerList" || route === "AdminSilentPrayerEditor") {
    return "Admin Silent Prayer Events";
  }

  return "Admin Announcements";
}

function isAdminContentRoute(path: string): boolean {
  return (
    path === "/admin/prayers" ||
    isAdminPrayerEditorRoute(path) ||
    path === "/admin/events" ||
    isAdminEventEditorRoute(path) ||
    path === "/admin/silent-prayer-events" ||
    isAdminSilentPrayerEditorRoute(path) ||
    path === "/admin/announcements" ||
    isAdminAnnouncementEditorRoute(path)
  );
}

function titleForAdminContentRoute(path: string): string {
  if (path === "/admin/prayers" || isAdminPrayerEditorRoute(path)) {
    return "Admin Prayers";
  }

  if (path === "/admin/events" || isAdminEventEditorRoute(path)) {
    return "Admin Events";
  }

  if (path === "/admin/silent-prayer-events" || isAdminSilentPrayerEditorRoute(path)) {
    return "Admin Silent Prayer Events";
  }

  return "Admin Announcements";
}

function isAdminPrayerEditorRoute(path: string): boolean {
  return isAdminContentEditorRoute(path, "/admin/prayers/");
}

function isAdminEventEditorRoute(path: string): boolean {
  return isAdminContentEditorRoute(path, "/admin/events/");
}

function isAdminSilentPrayerEditorRoute(path: string): boolean {
  return isAdminContentEditorRoute(path, "/admin/silent-prayer-events/");
}

function isAdminAnnouncementEditorRoute(path: string): boolean {
  return isAdminContentEditorRoute(path, "/admin/announcements/");
}

function isAdminContentEditorRoute(path: string, prefix: string): boolean {
  return path === `${prefix}new` || (path.startsWith(prefix) && path.length > prefix.length);
}

function isNewContentEditorPath(path: AdminContentShellRoute): boolean {
  return path.endsWith("/new");
}

function contentIdFromPath(path: AdminContentShellRoute, kind: AdminContentEditorKind): string {
  return path.slice(editorPathPrefixFor(kind).length);
}

function editorPathPrefixFor(kind: AdminContentEditorKind): string {
  if (kind === "prayer") return "/admin/prayers/";
  if (kind === "event") return "/admin/events/";
  if (kind === "silentPrayer") return "/admin/silent-prayer-events/";
  return "/admin/announcements/";
}

function findDemoContentItem(kind: AdminContentEditorKind, id: string) {
  if (kind === "prayer") {
    return fallbackAdminPrayers.prayers.find((prayer) => prayer.id === id);
  }

  if (kind === "event") {
    return fallbackAdminEvents.events.find((event) => event.id === id);
  }

  if (kind === "silentPrayer") {
    return fallbackAdminSilentPrayerEvents.silentPrayerEvents.find((event) => event.id === id);
  }

  return fallbackAdminAnnouncements.announcements.find((announcement) => announcement.id === id);
}

async function findApiContentItem(
  kind: AdminContentEditorKind,
  id: string,
  options: RenderAdminContentRouteOptions
) {
  if (kind === "prayer") {
    const response = await fetchAdminPrayers(options);
    return response.prayers.find((prayer) => prayer.id === id);
  }

  if (kind === "event") {
    const response = await fetchAdminEvents(options);
    return response.events.find((event) => event.id === id);
  }

  if (kind === "silentPrayer") {
    const response = await fetchAdminSilentPrayerEvents(options);
    return response.silentPrayerEvents.find((event) => event.id === id);
  }

  const response = await fetchAdminAnnouncements(options);
  return response.announcements.find((announcement) => announcement.id === id);
}

function isAdminContentEditorScreen(
  screen: AdminContentListScreen | AdminContentEditorScreen
): screen is AdminContentEditorScreen {
  return screen.route.endsWith("Editor");
}

function renderAdminContentEditorScreen(screen: AdminContentEditorScreen) {
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

function renderEditorStyle(screen: AdminContentEditorScreen): string {
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

function renderEditorHeader(screen: AdminContentEditorScreen): string {
  return renderAdminHeader({
    title: screen.title,
    body: screen.body,
    actions: screen.actions,
    demoChromeVisible: screen.demoChromeVisible,
    renderAction: (action) => renderEditorAction(screen, action)
  });
}

function renderEditorForm(screen: AdminContentEditorScreen): string {
  if (screen.fields.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body, "admin-content__form");
  }

  return [
    `<form class="admin-content__form" data-content-id="${escapeAttribute(screen.contentId ?? "")}" data-mode="${screen.mode}">`,
    screen.fields.map(renderEditorField).join(""),
    "</form>"
  ].join("");
}

function renderEditorField(field: AdminContentEditorScreen["fields"][number]): string {
  const attrs = [
    `class="admin-content__input${field.multiline ? " admin-content__textarea" : ""}"`,
    `name="${escapeAttribute(field.name)}"`,
    field.required ? "required" : "",
    field.readOnly ? "readonly" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const control =
    field.multiline
      ? `<textarea ${attrs}>${escapeHtml(field.value)}</textarea>`
      : `<input ${attrs} value="${escapeAttribute(field.value)}">`;

  return [
    '<label class="admin-content__field">',
    `<span class="admin-content__label">${escapeHtml(field.label)}</span>`,
    control,
    "</label>"
  ].join("");
}

function renderEditorAction(
  screen: AdminContentEditorScreen,
  action: AdminContentEditorScreen["actions"][number]
): string {
  const modifier =
    action.id === "archive" || action.id === "cancel" ? " admin-content__button--danger" : "";
  const secondary = action.id === "refresh" ? " admin-content__button--secondary" : "";
  const href =
    action.id === "refresh"
      ? screen.listPath
      : action.id === "create"
        ? `${screen.listPath}/new`
        : action.targetId
          ? `${screen.listPath}/${action.targetId}`
          : screen.listPath;

  return renderAdminActionLink(action, {
    href,
    danger: Boolean(modifier),
    secondary: Boolean(secondary)
  });
}
