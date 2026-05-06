import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Injectable, type NestMiddleware } from "@nestjs/common";
import { RequestContext } from "./request-context.js";

const REQUEST_ID_HEADER = "x-request-id";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: IncomingMessage, response: ServerResponse, next: () => void): void {
    const requestId = normalizeRequestId(request.headers[REQUEST_ID_HEADER]) ?? generateRequestId();

    request.headers[REQUEST_ID_HEADER] = requestId;
    response.setHeader(REQUEST_ID_HEADER, requestId);

    RequestContext.run({ requestId }, next);
  }
}

function normalizeRequestId(value: string | string[] | undefined): string | null {
  const requestId = Array.isArray(value) ? value[0] : value;
  const trimmed = requestId?.trim();

  return trimmed ? trimmed.slice(0, 120) : null;
}

function generateRequestId(): string {
  return `req_${randomUUID()}`;
}
