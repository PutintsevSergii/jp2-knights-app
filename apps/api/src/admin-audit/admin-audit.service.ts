import { Injectable } from "@nestjs/common";
import { requireSuperAdmin } from "../admin/admin-access.policy.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminAuditRepository } from "./admin-audit.repository.js";
import type { AdminAuditLogListResponse } from "./admin-audit.types.js";

@Injectable()
export class AdminAuditService {
  constructor(private readonly adminAuditRepository: AdminAuditRepository) {}

  async listAuditLogs(principal: CurrentUserPrincipal): Promise<AdminAuditLogListResponse> {
    requireSuperAdmin(principal);

    return {
      auditLogs: await this.adminAuditRepository.listLatest()
    };
  }
}
