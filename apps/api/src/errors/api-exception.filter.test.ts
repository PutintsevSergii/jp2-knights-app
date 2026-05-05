import type { ArgumentsHost } from "@nestjs/common";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { ApiExceptionFilter } from "./api-exception.filter.js";

describe("ApiExceptionFilter", () => {
  it("maps validation exceptions to the common error contract", () => {
    const { host, json, status } = httpHost({
      headers: {
        "x-request-id": "req_123"
      }
    });

    new ApiExceptionFilter().catch(
      new BadRequestException({
        message: "Validation failed.",
        issues: [{ path: "name", message: "Required" }]
      }),
      host
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed.",
        details: [{ path: "name", message: "Required" }],
        requestId: "req_123",
        timestamp: expect.any(String) as string
      }
    });
  });

  it("maps authorization exceptions and missing request ids", () => {
    const { host, json, status } = httpHost({ headers: {} });

    new ApiExceptionFilter().catch(new ForbiddenException("Access denied."), host);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: "FORBIDDEN",
        message: "Access denied.",
        details: [],
        requestId: "unknown",
        timestamp: expect.any(String) as string
      }
    });
  });

  it("hides unexpected exception details behind a generic internal error", () => {
    const { host, json, status } = httpHost({ headers: {} });

    new ApiExceptionFilter().catch(new Error("Sensitive implementation detail"), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
        details: [],
        requestId: "unknown",
        timestamp: expect.any(String) as string
      }
    });
  });

  it("normalizes array messages, details, and array request ids", () => {
    const { host, json, status } = httpHost({
      headers: {
        "x-request-id": ["req_first", "req_second"]
      }
    });

    new ApiExceptionFilter().catch(
      new BadRequestException({
        message: ["Name is required.", "City is required."],
        details: [{ path: "name" }]
      }),
      host
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: "VALIDATION_ERROR",
        message: "Name is required.; City is required.",
        details: [{ path: "name" }],
        requestId: "req_first",
        timestamp: expect.any(String) as string
      }
    });
  });

  it("maps expected HTTP statuses to stable API error codes", () => {
    const cases = [
      [new UnauthorizedException("Login required."), 401, "UNAUTHORIZED", "Login required."],
      [new NotFoundException("Record was not found."), 404, "NOT_FOUND", "Record was not found."],
      [
        new ConflictException("Duplicate active record."),
        409,
        "CONFLICT",
        "Duplicate active record."
      ],
      [new HttpException("Too many requests.", 429), 429, "RATE_LIMITED", "Too many requests."],
      [
        new UnprocessableEntityException("Business rule failed."),
        422,
        "BUSINESS_RULE_FAILED",
        "Business rule failed."
      ],
      [new HttpException({}, 418), 418, "INTERNAL_ERROR", "Request failed."]
    ] as const;

    for (const [exception, expectedStatus, expectedCode, expectedMessage] of cases) {
      const { host, json, status } = httpHost({ headers: {} });

      new ApiExceptionFilter().catch(exception, host);

      expect(status).toHaveBeenCalledWith(expectedStatus);
      expect(json).toHaveBeenCalledWith({
        error: {
          code: expectedCode,
          message: expectedMessage,
          details: [],
          requestId: "unknown",
          timestamp: expect.any(String) as string
        }
      });
    }
  });
});

function httpHost(request: { headers: Record<string, string | string[] | undefined> }): {
  host: ArgumentsHost;
  json: ReturnType<typeof vi.fn>;
  status: ReturnType<typeof vi.fn>;
} {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));

  return {
    host: {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({ status })
      })
    } as ArgumentsHost,
    json,
    status
  };
}
