import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { AuthSessionService } from "./auth-session.service.js";
import type { RequestWithPrincipal } from "./current-user.types.js";

@Injectable()
export class CurrentUserGuard implements CanActivate {
  constructor(private readonly authSessionService: AuthSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    const principal = await this.authSessionService.resolveCurrentUser(request);

    if (!principal) {
      throw new ForbiddenException("Authentication is required.");
    }

    if (principal.status === "inactive" || principal.status === "archived") {
      throw new ForbiddenException("Inactive principals cannot access protected app modes.");
    }

    request.principal = principal;
    return true;
  }
}
