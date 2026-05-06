import { parseRuntimeMode } from "@jp2/shared-validation";
import { renderAdminWebRequest } from "./admin-web-shell.js";

export async function renderAdminNextRoute(request: Request, path: string): Promise<Response> {
  const rendered = await renderAdminWebRequest(
    {
      path,
      headers: headersFromRequest(request)
    },
    {
      runtimeMode: parseRuntimeMode(process.env.APP_RUNTIME_MODE, {
        nodeEnv: process.env.NODE_ENV
      }),
      ...(process.env.API_BASE_URL ? { baseUrl: process.env.API_BASE_URL } : {}),
      canWrite: process.env.ADMIN_CAN_WRITE === "true"
    }
  );

  return new Response(rendered.body, {
    status: rendered.statusCode,
    headers: rendered.headers
  });
}

function headersFromRequest(request: Request): Record<string, string> {
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  const headers: Record<string, string> = {};

  if (authorization) {
    headers.authorization = authorization;
  }

  if (cookie) {
    headers.cookie = cookie;
  }

  return headers;
}
