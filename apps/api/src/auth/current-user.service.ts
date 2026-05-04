import { Injectable } from "@nestjs/common";
import { canAccessAdminLite, resolveMobileMode } from "@jp2/shared-auth";
import type { CurrentUserPrincipal, CurrentUserResponse } from "./current-user.types.js";

@Injectable()
export class CurrentUserService {
  toResponse(principal: CurrentUserPrincipal): CurrentUserResponse {
    return {
      user: {
        id: principal.id,
        email: principal.email,
        displayName: principal.displayName,
        preferredLanguage: principal.preferredLanguage ?? null,
        status: principal.status,
        roles: principal.roles
      },
      access: {
        mobileMode: resolveMobileMode(principal),
        adminLite: canAccessAdminLite(principal),
        candidateOrganizationUnitId: principal.candidateOrganizationUnitId ?? null,
        memberOrganizationUnitIds: principal.memberOrganizationUnitIds ?? [],
        officerOrganizationUnitIds: principal.officerOrganizationUnitIds ?? []
      }
    };
  }
}
