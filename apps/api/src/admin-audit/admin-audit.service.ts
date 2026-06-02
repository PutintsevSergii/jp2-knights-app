import { Injectable } from "@nestjs/common";
import { requireSuperAdmin } from "../admin/admin-access.policy.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminAuditRepository } from "./admin-audit.repository.js";
import type { AdminAuditLogListQuery, AdminAuditLogListResponse } from "./admin-audit.types.js";

@Injectable()
export class AdminAuditService {
  constructor(private readonly adminAuditRepository: AdminAuditRepository) {}

  async listAuditLogs(
    principal: CurrentUserPrincipal,
    query: AdminAuditLogListQuery
  ): Promise<AdminAuditLogListResponse> {
    requireSuperAdmin(principal);
    const { auditLogs, total } = await this.adminAuditRepository.list(query);

    return {
      auditLogs,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total
      }
    };
  }
}
