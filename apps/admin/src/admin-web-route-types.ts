import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminContentFetch } from "./admin-content-api.js";

export interface AdminWebRouteContext {
  path: string;
  query: Readonly<Record<string, string>>;
  runtimeMode: RuntimeMode;
  canWrite: boolean;
  canManagePrivacy: boolean;
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

export interface AdminWebRouteDefinition {
  matches: (path: string) => boolean;
  render: (context: AdminWebRouteContext) => Promise<RenderedAdminWebRoute>;
}

export function routeOptions(context: AdminWebRouteContext) {
  return {
    runtimeMode: context.runtimeMode,
    canWrite: context.canWrite,
    canManagePrivacy: context.canManagePrivacy,
    ...(context.authToken ? { authToken: context.authToken } : {}),
    ...(context.authCookie ? { authCookie: context.authCookie } : {}),
    ...(context.baseUrl ? { baseUrl: context.baseUrl } : {}),
    ...(context.fetchImpl ? { fetchImpl: context.fetchImpl } : {})
  };
}
