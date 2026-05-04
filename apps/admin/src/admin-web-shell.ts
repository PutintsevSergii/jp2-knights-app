import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { RuntimeMode } from "@jp2/shared-types";
import { parseRuntimeMode } from "@jp2/shared-validation";
import type { AdminContentFetch } from "./admin-content-api.js";
import { renderAdminContentRoute } from "./admin-content-shell.js";
import { renderAdminDashboardRoute } from "./admin-dashboard-screen.js";
import type { AdminShellRoute } from "./admin-shell.js";

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

  if (!isAdminShellRoute(path)) {
    return {
      statusCode: 404,
      headers: htmlHeaders,
      body: renderStatusDocument("Not Found", "The requested Admin Lite route is not available.")
    };
  }

  const runtimeMode =
    options.runtimeMode ?? parseRuntimeMode(undefined, { nodeEnv: options.nodeEnv });
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
      body: rendered.document
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
    body: rendered.document
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
  return path === "/admin/dashboard" || path === "/admin/prayers" || path === "/admin/events";
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

function renderStatusDocument(title: string, body: string): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${title}</title>`,
    "</head>",
    "<body>",
    `<main><h1>${title}</h1><p>${body}</p></main>`,
    "</body>",
    "</html>"
  ].join("");
}
