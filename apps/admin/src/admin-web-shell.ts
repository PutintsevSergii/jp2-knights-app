import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { RuntimeMode } from "@jp2/shared-types";
import { parseRuntimeMode } from "@jp2/shared-validation";
import type { AdminContentFetch } from "./admin-content-api.js";
import {
  htmlHeaders,
  mountRenderedRoute,
  renderMountedAdminDocument,
  renderStatusMain
} from "./admin-web-layout.js";
import { findAdminWebRoute, normalizeAdminPath } from "./admin-web-routes.js";

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

export async function renderAdminWebRequest(
  request: AdminWebRequest,
  options: AdminWebShellOptions = {}
): Promise<AdminWebResponse> {
  const path = normalizeAdminPath(request.path);
  const runtimeMode =
    options.runtimeMode ?? parseRuntimeMode(undefined, { nodeEnv: options.nodeEnv });
  const route = findAdminWebRoute(path);

  if (!route) {
    return notFoundResponse(path, runtimeMode);
  }

  const authToken = bearerTokenFromHeaders(request.headers);
  const authCookie = cookieFromHeaders(request.headers);
  const rendered = await route.render({
    path,
    runtimeMode,
    canWrite: options.canWrite ?? false,
    ...(authToken ? { authToken } : {}),
    ...(authCookie ? { authCookie } : {}),
    ...(options.baseUrl ? { baseUrl: options.baseUrl } : {}),
    ...(options.fetchImpl ? { fetchImpl: options.fetchImpl } : {})
  });

  return {
    statusCode: rendered.statusCode,
    headers: htmlHeaders,
    body: mountRenderedRoute(rendered.document, {
      title: rendered.title,
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

function notFoundResponse(path: string, runtimeMode: RuntimeMode): AdminWebResponse {
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

function cookieFromHeaders(
  headers: Record<string, string | string[] | undefined> | undefined
): string | undefined {
  const cookie = headers?.cookie;

  if (Array.isArray(cookie)) {
    return cookie.join("; ");
  }

  return cookie;
}
