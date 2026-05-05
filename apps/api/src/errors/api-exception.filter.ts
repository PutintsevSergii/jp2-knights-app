import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter
} from "@nestjs/common";

type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "BUSINESS_RULE_FAILED"
  | "INTERNAL_ERROR";

interface HttpRequestLike {
  headers?: Record<string, string | string[] | undefined>;
}

interface HttpResponseLike {
  status(statusCode: number): {
    json(body: unknown): unknown;
  };
}

interface ErrorResponseBody {
  message?: string | string[];
  issues?: unknown[];
  details?: unknown[];
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<HttpRequestLike>();
    const response = http.getResponse<HttpResponseLike>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? normalizeBody(exception.getResponse()) : {};

    response.status(status).json({
      error: {
        code: toErrorCode(status),
        message: toMessage(status, body),
        details: body.issues ?? body.details ?? [],
        requestId: toRequestId(request.headers?.["x-request-id"]),
        timestamp: new Date().toISOString()
      }
    });
  }
}

function normalizeBody(value: string | ErrorResponseBody): ErrorResponseBody {
  if (typeof value === "string") {
    return { message: value };
  }

  return value;
}

function toMessage(status: number, body: ErrorResponseBody): string {
  if (typeof body.message === "string") {
    return body.message;
  }

  if (Array.isArray(body.message) && body.message.length > 0) {
    return body.message.join("; ");
  }

  return status === 500 ? "An unexpected error occurred." : "Request failed.";
}

function toRequestId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "unknown";
  }

  return value ?? "unknown";
}

function toErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return "VALIDATION_ERROR";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 429:
      return "RATE_LIMITED";
    case 422:
      return "BUSINESS_RULE_FAILED";
    default:
      return "INTERNAL_ERROR";
  }
}
