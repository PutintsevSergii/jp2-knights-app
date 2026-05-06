import { designTokens } from "@jp2/shared-design-tokens";
import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminDashboardResponseDto, AdminDashboardTaskDto } from "@jp2/shared-validation";
import type { AdminContentScreenState, AdminContentFetch } from "./admin-content-api.js";
import { adminDashboardFailureState, fetchAdminDashboard } from "./admin-dashboard-api.js";
import { fallbackAdminDashboard } from "./admin-content-fixtures.js";

export interface AdminDashboardMetric {
  id: "identityAccessReviews" | "organizationUnits" | "prayers" | "events";
  label: string;
  value: number;
  targetRoute: AdminDashboardTaskDto["targetRoute"];
}

export interface AdminDashboardScreen {
  route: "AdminDashboard";
  state: AdminContentScreenState;
  title: string;
  body: string;
  metrics: AdminDashboardMetric[];
  tasks: AdminDashboardTaskDto[];
  navigation: Array<{
    label: string;
    path:
      | "/admin/dashboard"
      | "/admin/candidate-requests"
      | "/admin/identity-access-reviews"
      | AdminDashboardTaskDto["targetRoute"];
  }>;
  demoChromeVisible: boolean;
  theme: {
    background: string;
    surface: string;
    border: string;
    text: string;
    mutedText: string;
    primaryAction: string;
    primaryActionText: string;
    warning: string;
    spacing: number;
    radius: number;
  };
}

export interface BuildAdminDashboardScreenOptions {
  state: AdminContentScreenState;
  response?: AdminDashboardResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export interface RenderAdminDashboardRouteOptions {
  runtimeMode: RuntimeMode;
  authToken?: string;
  authCookie?: string;
  baseUrl?: string;
  fetchImpl?: AdminContentFetch;
}

export interface RenderedAdminDashboardRoute {
  path: "/admin/dashboard";
  route: "AdminDashboard";
  state: AdminContentScreenState;
  statusCode: number;
  document: string;
}

export async function renderAdminDashboardRoute(
  options: RenderAdminDashboardRouteOptions
): Promise<RenderedAdminDashboardRoute> {
  const screen = await resolveDashboardScreen(options);

  return {
    path: "/admin/dashboard",
    route: "AdminDashboard",
    state: screen.state,
    statusCode: statusCodeForState(screen.state),
    document: renderDashboardDocument(screen)
  };
}

export function buildAdminDashboardScreen(
  options: BuildAdminDashboardScreenOptions
): AdminDashboardScreen {
  if (options.state !== "ready") {
    return stateOnlyDashboard(options.state, options.runtimeMode);
  }

  const response = options.response;
  if (!response) {
    return stateOnlyDashboard("empty", options.runtimeMode);
  }

  return {
    route: "AdminDashboard",
    state: "ready",
    title: "Admin Dashboard",
    body:
      response.scope.adminKind === "SUPER_ADMIN"
        ? "Global V1 operations overview."
        : "Scoped V1 operations overview.",
    metrics: [
      {
        id: "identityAccessReviews",
        label: "Sign-In Reviews",
        value: response.counts.identityAccessReviews,
        targetRoute: "/admin/identity-access-reviews"
      },
      {
        id: "organizationUnits",
        label: "Organization Units",
        value: response.counts.organizationUnits,
        targetRoute: "/admin/organization-units"
      },
      {
        id: "prayers",
        label: "Prayers",
        value: response.counts.prayers,
        targetRoute: "/admin/prayers"
      },
      {
        id: "events",
        label: "Events",
        value: response.counts.events,
        targetRoute: "/admin/events"
      }
    ],
    tasks: response.tasks,
    navigation: adminDashboardNavigation,
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminDashboardTheme
  };
}

function renderDashboardDocument(screen: AdminDashboardScreen): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>Admin Dashboard</title>",
    "</head>",
    "<body>",
    `<main>${renderDashboardHtml(screen)}</main>`,
    "</body>",
    "</html>"
  ].join("");
}

function renderDashboardHtml(screen: AdminDashboardScreen): string {
  return [
    `<section class="admin-dashboard" data-route="${screen.route}" data-state="${screen.state}">`,
    renderDashboardStyle(screen),
    renderDashboardHeader(screen),
    renderDashboardMetrics(screen),
    renderDashboardTasks(screen),
    "</section>"
  ].join("");
}

function renderDashboardStyle(screen: AdminDashboardScreen): string {
  return [
    "<style>",
    ".admin-dashboard{",
    `background:${screen.theme.background};`,
    `color:${screen.theme.text};`,
    `font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;`,
    `padding:${screen.theme.spacing}px;`,
    "}",
    ".admin-dashboard__header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px;}",
    ".admin-dashboard__title{font-size:24px;font-weight:700;margin:0 0 4px;}",
    `.admin-dashboard__body{color:${screen.theme.mutedText};margin:0;}`,
    ".admin-dashboard__nav{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;}",
    ".admin-dashboard__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px;}",
    `.admin-dashboard__card{background:${screen.theme.surface};border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:14px;}`,
    ".admin-dashboard__value{font-size:28px;font-weight:700;margin:0;}",
    `.admin-dashboard__meta{color:${screen.theme.mutedText};font-size:13px;margin:0;}`,
    ".admin-dashboard__tasks{display:grid;gap:8px;}",
    `.admin-dashboard__link{background:${screen.theme.primaryAction};color:${screen.theme.primaryActionText};border-radius:${screen.theme.radius}px;padding:8px 10px;text-decoration:none;font-weight:600;}`,
    `.admin-dashboard__link--secondary{background:${screen.theme.surface};color:${screen.theme.text};border:1px solid ${screen.theme.border};}`,
    `.admin-dashboard__attention{border-color:${screen.theme.warning};}`,
    ".admin-dashboard__demo{font-size:12px;font-weight:700;text-transform:uppercase;}",
    "</style>"
  ].join("");
}

function renderDashboardHeader(screen: AdminDashboardScreen): string {
  const demoBadge = screen.demoChromeVisible
    ? '<span class="admin-dashboard__demo" aria-label="Demo mode">Demo</span>'
    : "";

  return [
    '<header class="admin-dashboard__header">',
    "<div>",
    `<h1 class="admin-dashboard__title">${escapeHtml(screen.title)}</h1>`,
    `<p class="admin-dashboard__body">${escapeHtml(screen.body)}</p>`,
    demoBadge,
    `<nav class="admin-dashboard__nav" aria-label="Admin navigation">${screen.navigation
      .map(
        (item) =>
          `<a class="admin-dashboard__link admin-dashboard__link--secondary" href="${escapeAttribute(
            item.path
          )}">${escapeHtml(item.label)}</a>`
      )
      .join("")}</nav>`,
    "</div>",
    "</header>"
  ].join("");
}

function renderDashboardMetrics(screen: AdminDashboardScreen): string {
  if (screen.metrics.length === 0) {
    return [
      '<div class="admin-dashboard__card" role="status">',
      `<strong>${escapeHtml(screen.title)}</strong>`,
      `<p class="admin-dashboard__meta">${escapeHtml(screen.body)}</p>`,
      "</div>"
    ].join("");
  }

  return [
    '<div class="admin-dashboard__grid">',
    screen.metrics
      .map((metric) =>
        [
          '<article class="admin-dashboard__card">',
          `<p class="admin-dashboard__value">${metric.value}</p>`,
          `<p class="admin-dashboard__meta">${escapeHtml(metric.label)}</p>`,
          `<a class="admin-dashboard__link" href="${escapeAttribute(metric.targetRoute)}">Open</a>`,
          "</article>"
        ].join("")
      )
      .join(""),
    "</div>"
  ].join("");
}

function renderDashboardTasks(screen: AdminDashboardScreen): string {
  if (screen.tasks.length === 0) {
    return "";
  }

  return [
    '<section class="admin-dashboard__tasks" aria-label="Admin tasks">',
    screen.tasks
      .map((task) => {
        const attention = task.priority === "attention" ? " admin-dashboard__attention" : "";
        return [
          `<a class="admin-dashboard__card${attention}" href="${escapeAttribute(
            task.targetRoute
          )}" data-task-id="${escapeAttribute(task.id)}">`,
          `<strong>${escapeHtml(task.label)}</strong>`,
          `<p class="admin-dashboard__meta">${task.count}</p>`,
          "</a>"
        ].join("");
      })
      .join(""),
    "</section>"
  ].join("");
}

async function resolveDashboardScreen(
  options: RenderAdminDashboardRouteOptions
): Promise<AdminDashboardScreen> {
  if (options.runtimeMode === "demo") {
    return buildAdminDashboardScreen({
      state: "ready",
      response: fallbackAdminDashboard,
      runtimeMode: options.runtimeMode
    });
  }

  try {
    return buildAdminDashboardScreen({
      state: "ready",
      response: await fetchAdminDashboard(options),
      runtimeMode: options.runtimeMode
    });
  } catch (error) {
    return buildAdminDashboardScreen({
      state: adminDashboardFailureState(error),
      runtimeMode: options.runtimeMode
    });
  }
}

function stateOnlyDashboard(
  state: AdminContentScreenState,
  runtimeMode: RuntimeMode
): AdminDashboardScreen {
  const copy = dashboardStateCopy[state];

  return {
    route: "AdminDashboard",
    state,
    title: copy.title,
    body: copy.body,
    metrics: [],
    tasks: [],
    navigation: state === "forbidden" ? [] : adminDashboardNavigation,
    demoChromeVisible: runtimeMode === "demo",
    theme: adminDashboardTheme
  };
}

function statusCodeForState(state: AdminContentScreenState): number {
  if (state === "forbidden") return 403;
  if (state === "offline") return 503;
  if (state === "error") return 500;
  return 200;
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

const adminDashboardNavigation: AdminDashboardScreen["navigation"] = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Sign-In Reviews", path: "/admin/identity-access-reviews" },
  { label: "Candidate Requests", path: "/admin/candidate-requests" },
  { label: "Organization Units", path: "/admin/organization-units" },
  { label: "Prayers", path: "/admin/prayers" },
  { label: "Events", path: "/admin/events" }
];

const dashboardStateCopy: Record<AdminContentScreenState, { title: string; body: string }> = {
  ready: {
    title: "Admin Dashboard",
    body: "Admin dashboard is ready."
  },
  loading: {
    title: "Loading Dashboard",
    body: "Admin dashboard is loading."
  },
  empty: {
    title: "Admin Dashboard",
    body: "No dashboard data is available."
  },
  error: {
    title: "Unable to Load Dashboard",
    body: "Admin dashboard could not be loaded."
  },
  offline: {
    title: "Offline",
    body: "Reconnect to refresh the admin dashboard."
  },
  forbidden: {
    title: "Access Denied",
    body: "Admin Lite access is required."
  }
};

const adminDashboardTheme: AdminDashboardScreen["theme"] = {
  background: designTokens.color.background.app,
  surface: designTokens.color.background.surface,
  border: designTokens.color.border.subtle,
  text: designTokens.color.text.primary,
  mutedText: designTokens.color.text.muted,
  primaryAction: designTokens.color.action.primary,
  primaryActionText: designTokens.color.action.primaryText,
  warning: designTokens.color.status.warning,
  spacing: designTokens.space[4],
  radius: designTokens.radius.md
};
