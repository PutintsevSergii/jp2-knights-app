import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { designTokens } from "@jp2/shared-design-tokens";
import type { RuntimeMode } from "@jp2/shared-types";
import { parseRuntimeMode } from "@jp2/shared-validation";
import type { AdminContentFetch } from "./admin-content-api.js";
import { renderAdminContentRoute } from "./admin-content-shell.js";
import { renderAdminDashboardRoute } from "./admin-dashboard-screen.js";
import { renderAdminOrganizationUnitRoute } from "./admin-organization-units-shell.js";
import { adminShellRoutes, type AdminShellRoute } from "./admin-shell.js";

export interface AdminWebRequest {
  path: string;
  headers?: Record<string, string | string[] | undefined>;
}

export interface AdminWebShellOptions {
  runtimeMode?: RuntimeMode;
  nodeEnv?: string;
  baseUrl?: string;
  canWrite?: boolean;
  fetchImpl?: AdminContentFetch;
}

export interface AdminWebResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const htmlHeaders = {
  "content-type": "text/html; charset=utf-8"
};

export async function renderAdminWebRequest(
  request: AdminWebRequest,
  options: AdminWebShellOptions = {}
): Promise<AdminWebResponse> {
  const path = normalizeAdminPath(request.path);
  const runtimeMode =
    options.runtimeMode ?? parseRuntimeMode(undefined, { nodeEnv: options.nodeEnv });

  if (!isAdminShellRoute(path)) {
    return {
      statusCode: 404,
      headers: htmlHeaders,
      body: renderMountedAdminDocument({
        title: "Not Found",
        path,
        runtimeMode,
        body: renderStatusMain("Not Found", "The requested Admin Lite route is not available.")
      })
    };
  }

  const authToken = bearerTokenFromHeaders(request.headers);

  if (path === "/admin/dashboard") {
    const rendered = await renderAdminDashboardRoute({
      runtimeMode,
      ...(authToken ? { authToken } : {}),
      ...(options.baseUrl ? { baseUrl: options.baseUrl } : {}),
      ...(options.fetchImpl ? { fetchImpl: options.fetchImpl } : {})
    });

    return {
      statusCode: rendered.statusCode,
      headers: htmlHeaders,
      body: mountRenderedRoute(rendered.document, {
        title: "Admin Dashboard",
        path,
        runtimeMode
      })
    };
  }

  if (path === "/admin/organization-units") {
    const rendered = await renderAdminOrganizationUnitRoute({
      path,
      runtimeMode,
      canWrite: options.canWrite ?? false,
      ...(authToken ? { authToken } : {}),
      ...(options.baseUrl ? { baseUrl: options.baseUrl } : {}),
      ...(options.fetchImpl ? { fetchImpl: options.fetchImpl } : {})
    });

    return {
      statusCode: rendered.statusCode,
      headers: htmlHeaders,
      body: mountRenderedRoute(rendered.document, {
        title: "Admin Organization Units",
        path,
        runtimeMode
      })
    };
  }

  if (isAdminOrganizationUnitDetailRoute(path)) {
    const rendered = await renderAdminOrganizationUnitRoute({
      path,
      runtimeMode,
      canWrite: options.canWrite ?? false,
      ...(authToken ? { authToken } : {}),
      ...(options.baseUrl ? { baseUrl: options.baseUrl } : {}),
      ...(options.fetchImpl ? { fetchImpl: options.fetchImpl } : {})
    });

    return {
      statusCode: rendered.statusCode,
      headers: htmlHeaders,
      body: mountRenderedRoute(rendered.document, {
        title: "Admin Organization Units",
        path,
        runtimeMode
      })
    };
  }

  if (path !== "/admin/prayers" && path !== "/admin/events") {
    return {
      statusCode: 404,
      headers: htmlHeaders,
      body: renderMountedAdminDocument({
        title: "Not Found",
        path,
        runtimeMode,
        body: renderStatusMain("Not Found", "The requested Admin Lite route is not available.")
      })
    };
  }

  const rendered = await renderAdminContentRoute({
    path,
    runtimeMode,
    canWrite: options.canWrite ?? false,
    ...(authToken ? { authToken } : {}),
    ...(options.baseUrl ? { baseUrl: options.baseUrl } : {}),
    ...(options.fetchImpl ? { fetchImpl: options.fetchImpl } : {})
  });

  return {
    statusCode: rendered.statusCode,
    headers: htmlHeaders,
    body: mountRenderedRoute(rendered.document, {
      title: path === "/admin/prayers" ? "Admin Prayers" : "Admin Events",
      path,
      runtimeMode
    })
  };
}

export function startAdminWebServer(options: AdminWebShellOptions & { port?: number } = {}) {
  const port = options.port ?? Number(process.env.ADMIN_PORT ?? 3001);
  const server = createServer((request, response) => {
    void handleNodeRequest(request, response, options);
  });

  server.listen(port);
  return server;
}

async function handleNodeRequest(
  request: IncomingMessage,
  response: ServerResponse,
  options: AdminWebShellOptions
): Promise<void> {
  const rendered = await renderAdminWebRequest(
    {
      path: request.url ?? "/admin/dashboard",
      headers: request.headers
    },
    webShellOptionsFromEnvironment(options)
  );

  response.writeHead(rendered.statusCode, rendered.headers);
  response.end(rendered.body);
}

function webShellOptionsFromEnvironment(options: AdminWebShellOptions): AdminWebShellOptions {
  const baseUrl = options.baseUrl ?? process.env.API_BASE_URL;

  return {
    ...options,
    runtimeMode:
      options.runtimeMode ??
      parseRuntimeMode(process.env.APP_RUNTIME_MODE, { nodeEnv: process.env.NODE_ENV }),
    ...(process.env.NODE_ENV ? { nodeEnv: process.env.NODE_ENV } : {}),
    ...(baseUrl ? { baseUrl } : {}),
    canWrite: options.canWrite ?? process.env.ADMIN_CAN_WRITE === "true"
  };
}

function normalizeAdminPath(path: string): string {
  const url = new URL(path, "http://admin.local");
  const normalized = url.pathname === "/admin" ? "/admin/dashboard" : url.pathname;

  return normalized;
}

function isAdminShellRoute(path: string): path is AdminShellRoute {
  return (
    path === "/admin/dashboard" ||
    path === "/admin/organization-units" ||
    isAdminOrganizationUnitDetailRoute(path) ||
    path === "/admin/prayers" ||
    path === "/admin/events"
  );
}

function isAdminOrganizationUnitDetailRoute(
  path: string
): path is `/admin/organization-units/${string}` {
  return (
    path.startsWith("/admin/organization-units/") &&
    path.length > "/admin/organization-units/".length
  );
}

function bearerTokenFromHeaders(
  headers: Record<string, string | string[] | undefined> | undefined
): string | undefined {
  const authorization = headers?.authorization;
  const header = Array.isArray(authorization) ? authorization[0] : authorization;

  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length);
}

function mountRenderedRoute(
  document: string,
  options: {
    title: string;
    path: string;
    runtimeMode: RuntimeMode;
  }
): string {
  return renderMountedAdminDocument({
    ...options,
    body: extractMainHtml(document)
  });
}

function renderMountedAdminDocument(options: {
  title: string;
  path: string;
  runtimeMode: RuntimeMode;
  body: string;
}): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(options.title)}</title>`,
    renderMountedStyle(),
    "</head>",
    "<body>",
    `<div class="admin-app" data-runtime-mode="${options.runtimeMode}">`,
    renderMountedHeader(options.path, options.runtimeMode),
    `<main class="admin-app__main">${options.body}</main>`,
    "</div>",
    "</body>",
    "</html>"
  ].join("");
}

function renderMountedHeader(path: string, runtimeMode: RuntimeMode): string {
  return [
    '<header class="admin-app__header">',
    '<a class="admin-app__brand" href="/admin">JP2 Admin Lite</a>',
    `<nav class="admin-app__nav" aria-label="Admin Lite">${adminShellRoutes
      .map((route) => renderMountedNavLink(route.path, route.label, path))
      .join("")}</nav>`,
    `<span class="admin-app__mode" aria-label="Runtime mode">${runtimeMode}</span>`,
    "</header>"
  ].join("");
}

function renderMountedNavLink(routePath: string, label: string, currentPath: string): string {
  const active = isActiveRoute(routePath, currentPath);

  return [
    `<a class="admin-app__nav-link${active ? " admin-app__nav-link--active" : ""}" href="${escapeAttribute(routePath)}"`,
    active ? ' aria-current="page"' : "",
    ">",
    escapeHtml(label),
    "</a>"
  ].join("");
}

function isActiveRoute(routePath: string, currentPath: string): boolean {
  if (routePath === "/admin/organization-units") {
    return currentPath === routePath || currentPath.startsWith("/admin/organization-units/");
  }

  return currentPath === routePath;
}

function renderMountedStyle(): string {
  return [
    "<style>",
    "body{margin:0;}",
    `.admin-app{min-height:100vh;background:${designTokens.color.background.app};color:${designTokens.color.text.primary};font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}`,
    `.admin-app__header{position:sticky;top:0;z-index:1;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:${designTokens.space[3]}px ${designTokens.space[4]}px;background:${designTokens.color.background.surface};border-bottom:1px solid ${designTokens.color.border.subtle};}`,
    `.admin-app__brand{font-weight:700;color:${designTokens.color.text.primary};text-decoration:none;}`,
    ".admin-app__nav{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}",
    `.admin-app__nav-link{color:${designTokens.color.text.primary};border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.md}px;padding:7px 10px;text-decoration:none;font-weight:600;}`,
    `.admin-app__nav-link--active{background:${designTokens.color.action.primary};border-color:${designTokens.color.action.primary};color:${designTokens.color.action.primaryText};}`,
    `.admin-app__mode{margin-left:auto;color:${designTokens.color.text.muted};font-size:12px;font-weight:700;text-transform:uppercase;}`,
    ".admin-app__main{min-width:0;}",
    "</style>"
  ].join("");
}

function extractMainHtml(document: string): string {
  const match = /<main[^>]*>([\s\S]*)<\/main>/i.exec(document);

  return match?.[1] ?? document;
}

function renderStatusMain(title: string, body: string): string {
  return `<section class="admin-content"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(body)}</p></section>`;
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
