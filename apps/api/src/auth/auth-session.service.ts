import { Injectable } from "@nestjs/common";
import type { CurrentUserPrincipal, RequestWithPrincipal } from "./current-user.types.js";

@Injectable()
export class AuthSessionService {
  resolveCurrentUser(request: RequestWithPrincipal): Promise<CurrentUserPrincipal | null> {
    return Promise.resolve(request.principal ?? null);
  }
}
