import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessAdminLite, canAccessBrotherMode, hasRole } from "@jp2/shared-auth";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
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
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly auditLog: AuditLogService
  ) {}

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

    const organizationUnit = await this.organizationRepository.createOrganizationUnit(data);
    await this.auditLog.record({
      action: "admin.organizationUnit.create",
      actorUserId: principal.id,
      entityType: "organization_unit",
      entityId: organizationUnit.id,
      scopeOrganizationUnitId: organizationUnit.id,
      beforeSummary: null,
      afterSummary: summarizeOrganizationUnitForAudit(organizationUnit)
    });

    return {
      organizationUnit
    };
  }

  async updateAdminOrganizationUnit(
    principal: CurrentUserPrincipal,
    id: string,
    data: UpdateOrganizationUnitRequest
  ): Promise<OrganizationUnitDetailResponse> {
    requireSuperAdmin(principal);

    const beforeOrganizationUnit = await this.organizationRepository.findOrganizationUnitForAudit(id);
    const organizationUnit = await this.organizationRepository.updateOrganizationUnit(id, data);
    await this.auditLog.record({
      action: "admin.organizationUnit.update",
      actorUserId: principal.id,
      entityType: "organization_unit",
      entityId: organizationUnit.id,
      scopeOrganizationUnitId: organizationUnit.id,
      beforeSummary: beforeOrganizationUnit
        ? summarizeOrganizationUnitForAudit(beforeOrganizationUnit)
        : null,
      afterSummary: summarizeOrganizationUnitForAudit(organizationUnit)
    });

    return {
      organizationUnit
    };
  }
}

function requireSuperAdmin(principal: CurrentUserPrincipal): void {
  if (!hasRole(principal, "SUPER_ADMIN")) {
    throw new ForbiddenException("Super Admin access is required.");
  }
}

function summarizeOrganizationUnitForAudit(
  organizationUnit: OrganizationUnitDetailResponse["organizationUnit"]
): AuditSummary {
  return {
    type: organizationUnit.type,
    parentUnitId: organizationUnit.parentUnitId,
    name: organizationUnit.name,
    city: organizationUnit.city,
    country: organizationUnit.country,
    parish: organizationUnit.parish,
    status: organizationUnit.status
  };
}
