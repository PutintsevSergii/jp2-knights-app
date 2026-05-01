import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessAdminLite, canAccessBrotherMode, hasRole } from "@jp2/shared-auth";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { OrganizationRepository } from "./organization.repository.js";
import type {
  AdminOrganizationUnitListResponse,
  CreateOrganizationUnitRequest,
  MyOrganizationUnitsResponse,
  OrganizationUnitDetailResponse,
  UpdateOrganizationUnitRequest
} from "./organization.types.js";

@Injectable()
export class OrganizationService {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async getMyOrganizationUnits(
    principal: CurrentUserPrincipal
  ): Promise<MyOrganizationUnitsResponse> {
    if (!canAccessBrotherMode(principal)) {
      throw new ForbiddenException("Brother role is required.");
    }

    const organizationUnits =
      await this.organizationRepository.findActiveMembershipOrganizationUnits(principal.id);

    if (organizationUnits.length === 0) {
      throw new NotFoundException("Active membership organization unit was not found.");
    }

    return { organizationUnits };
  }

  async listAdminOrganizationUnits(
    principal: CurrentUserPrincipal
  ): Promise<AdminOrganizationUnitListResponse> {
    if (!canAccessAdminLite(principal)) {
      throw new ForbiddenException("Admin Lite access is required.");
    }

    const organizationUnits = hasRole(principal, "SUPER_ADMIN")
      ? await this.organizationRepository.listActiveOrganizationUnits()
      : await this.organizationRepository.listActiveOrganizationUnitsByIds(
          principal.officerOrganizationUnitIds ?? []
        );

    return { organizationUnits };
  }

  async createAdminOrganizationUnit(
    principal: CurrentUserPrincipal,
    data: CreateOrganizationUnitRequest
  ): Promise<OrganizationUnitDetailResponse> {
    requireSuperAdmin(principal);

    return {
      organizationUnit: await this.organizationRepository.createOrganizationUnit(data)
    };
  }

  async updateAdminOrganizationUnit(
    principal: CurrentUserPrincipal,
    id: string,
    data: UpdateOrganizationUnitRequest
  ): Promise<OrganizationUnitDetailResponse> {
    requireSuperAdmin(principal);

    return {
      organizationUnit: await this.organizationRepository.updateOrganizationUnit(id, data)
    };
  }
}

function requireSuperAdmin(principal: CurrentUserPrincipal): void {
  if (!hasRole(principal, "SUPER_ADMIN")) {
    throw new ForbiddenException("Super Admin access is required.");
  }
}
