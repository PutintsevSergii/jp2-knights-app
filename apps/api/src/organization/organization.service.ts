import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessBrotherMode, hasRole } from "@jp2/shared-auth";
import { requireAdminLite, requireSuperAdmin } from "../admin/admin-access.policy.js";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
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
      assertNotIdleApprovalPrincipal(principal);
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
    requireAdminLite(principal);

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
