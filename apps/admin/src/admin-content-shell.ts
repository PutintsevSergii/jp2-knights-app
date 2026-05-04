import type { RuntimeMode } from "@jp2/shared-types";
import {
  adminContentFailureState,
  type AdminContentFetch,
  type AdminContentScreenState,
  fetchAdminEvents,
  fetchAdminPrayers
} from "./admin-content-api.js";
import { fallbackAdminEvents, fallbackAdminPrayers } from "./admin-content-fixtures.js";
import {
  type AdminContentListScreen,
  buildAdminEventListScreen,
  buildAdminPrayerListScreen
} from "./admin-content-screens.js";
import {
  type RenderedAdminContentScreen,
  renderAdminContentListScreen
} from "./admin-content-render.js";

export type AdminContentShellRoute = "/admin/prayers" | "/admin/events";

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
  baseUrl?: string;
  fetchImpl?: AdminContentFetch;
}

export interface RenderedAdminContentRoute extends RenderedAdminContentScreen {
  path: AdminContentShellRoute;
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
  }
];

export async function renderAdminContentRoute(
  options: RenderAdminContentRouteOptions
): Promise<RenderedAdminContentRoute> {
  const screen =
    options.path === "/admin/prayers"
      ? await resolvePrayerScreen(options)
      : await resolveEventScreen(options);
  const rendered = renderAdminContentListScreen(screen);

  return {
    ...rendered,
    path: options.path,
    statusCode: statusCodeForState(rendered.state),
    document: renderDocument(rendered)
  };
}

function renderDocument(rendered: RenderedAdminContentScreen): string {
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

function statusCodeForState(state: AdminContentScreenState): number {
  if (state === "forbidden") {
    return 403;
  }

  if (state === "offline") {
    return 503;
  }

  if (state === "error") {
    return 500;
  }

  return 200;
}

function titleForRoute(route: RenderedAdminContentScreen["route"]): string {
  return route === "AdminPrayerList" ? "Admin Prayers" : "Admin Events";
}
