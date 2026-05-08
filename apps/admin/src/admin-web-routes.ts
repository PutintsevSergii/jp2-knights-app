import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminCandidateRequestShellRoute } from "./admin-candidate-requests-shell.js";
import { renderAdminCandidateRequestRoute } from "./admin-candidate-requests-shell.js";
import type { AdminCandidateShellRoute } from "./admin-candidates-shell.js";
import { renderAdminCandidateRoute } from "./admin-candidates-shell.js";
import type { AdminContentFetch } from "./admin-content-api.js";
import type { AdminContentShellRoute } from "./admin-content-shell.js";
import { renderAdminContentRoute } from "./admin-content-shell.js";
import { renderAdminDashboardRoute } from "./admin-dashboard-screen.js";
import { renderAdminIdentityAccessShellRoute } from "./admin-identity-access-shell.js";
import type { AdminOrganizationUnitShellRoute } from "./admin-organization-units-shell.js";
import { renderAdminOrganizationUnitRoute } from "./admin-organization-units-shell.js";

export interface AdminWebRouteContext {
  path: string;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  authToken?: string;
  authCookie?: string;
  baseUrl?: string;
  fetchImpl?: AdminContentFetch;
}

export interface RenderedAdminWebRoute {
  title: string;
  statusCode: number;
  document: string;
}

interface AdminWebRouteDefinition {
  matches: (path: string) => boolean;
  render: (context: AdminWebRouteContext) => Promise<RenderedAdminWebRoute>;
}

export function normalizeAdminPath(path: string): string {
  const url = new URL(path, "http://admin.local");

  return url.pathname === "/admin" ? "/admin/dashboard" : url.pathname;
}

export function findAdminWebRoute(path: string): AdminWebRouteDefinition | undefined {
  return adminWebRouteDefinitions.find((route) => route.matches(path));
}

const adminWebRouteDefinitions: readonly AdminWebRouteDefinition[] = [
  {
    matches: (path) => path === "/admin/dashboard",
    render: async (context) => ({
      title: "Admin Dashboard",
      ...(await renderAdminDashboardRoute(routeOptions(context)))
    })
  },
  {
    matches: (path) => path === "/admin/identity-access-reviews",
    render: async (context) => ({
      title: "Admin Identity Access Reviews",
      ...(await renderAdminIdentityAccessShellRoute(routeOptions(context)))
    })
  },
  {
    matches: isAdminCandidateRequestRoute,
    render: async (context) => ({
      title: "Admin Candidate Requests",
      ...(await renderAdminCandidateRequestRoute({
        ...routeOptions(context),
        path: context.path as AdminCandidateRequestShellRoute
      }))
    })
  },
  {
    matches: isAdminCandidateRoute,
    render: async (context) => ({
      title: "Admin Candidates",
      ...(await renderAdminCandidateRoute({
        ...routeOptions(context),
        path: context.path as AdminCandidateShellRoute
      }))
    })
  },
  {
    matches: isAdminOrganizationUnitRoute,
    render: async (context) => ({
      title: "Admin Organization Units",
      ...(await renderAdminOrganizationUnitRoute({
        ...routeOptions(context),
        path: context.path as AdminOrganizationUnitShellRoute
      }))
    })
  },
  {
    matches: isAdminContentRoute,
    render: async (context) => ({
      title: titleForAdminContentRoute(context.path),
      ...(await renderAdminContentRoute({
        ...routeOptions(context),
        path: context.path as AdminContentShellRoute
      }))
    })
  }
];

function routeOptions(context: AdminWebRouteContext) {
  return {
    runtimeMode: context.runtimeMode,
    canWrite: context.canWrite,
    ...(context.authToken ? { authToken: context.authToken } : {}),
    ...(context.authCookie ? { authCookie: context.authCookie } : {}),
    ...(context.baseUrl ? { baseUrl: context.baseUrl } : {}),
    ...(context.fetchImpl ? { fetchImpl: context.fetchImpl } : {})
  };
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

function isAdminCandidateRequestRoute(path: string): boolean {
  return (
    path === "/admin/candidate-requests" ||
    (path.startsWith("/admin/candidate-requests/") &&
      path.length > "/admin/candidate-requests/".length)
  );
}

function isAdminCandidateRoute(path: string): boolean {
  return path === "/admin/candidates" || isAdminCandidateDetailRoute(path);
}

function isAdminCandidateDetailRoute(path: string): boolean {
  return path.startsWith("/admin/candidates/") && path.length > "/admin/candidates/".length;
}

function isAdminOrganizationUnitRoute(path: string): boolean {
  return (
    path === "/admin/organization-units" ||
    (path.startsWith("/admin/organization-units/") &&
      path.length > "/admin/organization-units/".length)
  );
}
