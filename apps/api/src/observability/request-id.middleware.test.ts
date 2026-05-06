import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";
import { RequestContext } from "./request-context.js";
import { RequestIdMiddleware } from "./request-id.middleware.js";

describe("RequestIdMiddleware", () => {
  it("preserves incoming request ids and exposes them through request context", () => {
    const request = requestStub({ "x-request-id": " req_existing " });
    const response = responseStub();
    const next = vi.fn(() => {
      expect(RequestContext.getRequestId()).toBe("req_existing");
    });

    new RequestIdMiddleware().use(request, response, next);

    expect(request.headers["x-request-id"]).toBe("req_existing");
    expect(response.setHeader).toHaveBeenCalledWith("x-request-id", "req_existing");
    expect(next).toHaveBeenCalledOnce();
  });

  it("generates request ids when callers do not provide one", () => {
    const request = requestStub({});
    const response = responseStub();
    const next = vi.fn(() => {
      expect(RequestContext.getRequestId()).toMatch(
        /^req_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    new RequestIdMiddleware().use(request, response, next);

    expect(request.headers["x-request-id"]).toBeTypeOf("string");
    expect(response.setHeader).toHaveBeenCalledWith(
      "x-request-id",
      request.headers["x-request-id"]
    );
  });
});

function requestStub(headers: Record<string, string | undefined>): IncomingMessage {
  return { headers } as unknown as IncomingMessage;
}

function responseStub(): ServerResponse & { setHeader: ReturnType<typeof vi.fn> } {
  return { setHeader: vi.fn() } as unknown as ServerResponse & {
    setHeader: ReturnType<typeof vi.fn>;
  };
}
