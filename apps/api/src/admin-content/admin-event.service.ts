import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessAdminLite, hasRole } from "@jp2/shared-auth";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminEventRepository } from "./admin-event.repository.js";
import type {
  AdminEventDetailResponse,
  AdminEventListResponse,
  CreateAdminEventRequest,
  UpdateAdminEventRequest
} from "./admin-event.types.js";

@Injectable()
export class AdminEventService {
  constructor(private readonly adminEventRepository: AdminEventRepository) {}

  async listAdminEvents(principal: CurrentUserPrincipal): Promise<AdminEventListResponse> {
    if (!canAccessAdminLite(principal)) {
      throw new ForbiddenException("Admin Lite access is required.");
    }

    return {
      events: await this.adminEventRepository.listManageableEvents(scopeFor(principal))
    };
  }

  async createAdminEvent(
    principal: CurrentUserPrincipal,
    data: CreateAdminEventRequest
  ): Promise<AdminEventDetailResponse> {
    assertCanWriteEvent(principal, data.targetOrganizationUnitId ?? null);

    return {
      event: await this.adminEventRepository.createEvent(data)
    };
  }

  async updateAdminEvent(
    principal: CurrentUserPrincipal,
    id: string,
    data: UpdateAdminEventRequest
  ): Promise<AdminEventDetailResponse> {
    if (data.targetOrganizationUnitId !== undefined) {
      assertCanWriteEvent(principal, data.targetOrganizationUnitId);
    } else if (!canAccessAdminLite(principal)) {
      throw new ForbiddenException("Admin Lite access is required.");
    }

    const event = await this.adminEventRepository.updateEvent(id, data, scopeFor(principal));

    if (!event) {
      throw new NotFoundException("Event was not found in the current admin scope.");
    }

    return { event };
  }
}

function scopeFor(principal: CurrentUserPrincipal): readonly string[] | null {
  return hasRole(principal, "SUPER_ADMIN") ? null : (principal.officerOrganizationUnitIds ?? []);
}

function assertCanWriteEvent(
  principal: CurrentUserPrincipal,
  targetOrganizationUnitId: string | null
): void {
  if (!canAccessAdminLite(principal)) {
    throw new ForbiddenException("Admin Lite access is required.");
  }

  if (hasRole(principal, "SUPER_ADMIN")) {
    return;
  }

  if (
    targetOrganizationUnitId &&
    (principal.officerOrganizationUnitIds ?? []).includes(targetOrganizationUnitId)
  ) {
    return;
  }

  throw new ForbiddenException("Officer event writes must stay within assigned organization units.");
}
