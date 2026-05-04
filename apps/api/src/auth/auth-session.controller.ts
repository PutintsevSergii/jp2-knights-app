import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { authSessionRequestSchema } from "@jp2/shared-validation";
import { apiErrorOpenApiSchema } from "../errors/api-error.openapi.js";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import {
  authMutationResponseOpenApiSchema,
  authSessionRequestOpenApiSchema,
  authSessionResponseOpenApiSchema
} from "./auth.openapi.js";
import { AuthSessionService } from "./auth-session.service.js";
import { CurrentUserGuard } from "./current-user.guard.js";
import { CurrentUserService } from "./current-user.service.js";
import type {
  AuthMutationResponse,
  AuthSessionRequest,
  AuthSessionResponse,
  RequestWithPrincipal
} from "./current-user.types.js";

@ApiTags("auth")
@Controller("auth")
export class AuthSessionController {
  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly currentUserService: CurrentUserService
  ) {}

  @Post("session")
  @ApiOkResponse({
    description: "Verified provider login resolved to the local JP2 current user.",
    schema: authSessionResponseOpenApiSchema
  })
  @ApiBody({ schema: authSessionRequestOpenApiSchema })
  @ApiResponse({
    status: 401,
    description: "The provider token is missing, invalid, expired, revoked, or disabled.",
    content: { "application/json": { schema: apiErrorOpenApiSchema } }
  })
  async createSession(
    @Body(new ZodValidationPipe(authSessionRequestSchema)) body: AuthSessionRequest,
    @Req() request: RequestWithPrincipal,
    @Res({ passthrough: true }) response?: CookieResponse
  ): Promise<AuthSessionResponse> {
    const session = await this.authSessionService.createSession(body, request);
    request.principal = session.principal;

    if (session.sessionCookie) {
      response?.cookie?.("jp2_session", session.sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: session.expiresAt ?? undefined
      });
    }

    return {
      currentUser: this.currentUserService.toResponse(request.principal),
      session: {
        transport: session.sessionCookie ? "cookie" : "bearer",
        expiresAt: session.expiresAt ? session.expiresAt.toISOString() : null
      }
    };
  }

  @Post("logout")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "Local session state was cleared.",
    schema: authMutationResponseOpenApiSchema
  })
  logout(@Res({ passthrough: true }) response?: CookieResponse): AuthMutationResponse {
    response?.clearCookie?.("jp2_session", {
      httpOnly: true,
      sameSite: "lax",
      path: "/"
    });

    return { success: true };
  }

  @Post("refresh")
  @UseGuards(CurrentUserGuard)
  @ApiOkResponse({
    description: "The current provider-backed session is still valid.",
    schema: authSessionResponseOpenApiSchema
  })
  refresh(@Req() request: RequestWithPrincipal): AuthSessionResponse {
    if (!request.principal) {
      throw new Error("CurrentUserGuard did not attach a principal.");
    }

    return {
      currentUser: this.currentUserService.toResponse(request.principal),
      session: {
        transport: "bearer",
        expiresAt: null
      }
    };
  }
}

interface CookieResponse {
  clearCookie?: (name: string, options: Record<string, unknown>) => void;
  cookie?: (name: string, value: string, options: Record<string, unknown>) => void;
}
