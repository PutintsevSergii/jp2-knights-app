import { ForbiddenException, Injectable } from "@nestjs/common";
import { canAccessAdminLite, hasRole } from "@jp2/shared-auth";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminPrayerRepository } from "./admin-prayer.repository.js";
import type {
  AdminPrayerDetailResponse,
  AdminPrayerListResponse,
  CreateAdminPrayerRequest,
  UpdateAdminPrayerRequest
} from "./admin-prayer.types.js";

@Injectable()
export class AdminPrayerService {
  constructor(private readonly adminPrayerRepository: AdminPrayerRepository) {}

  async listAdminPrayers(principal: CurrentUserPrincipal): Promise<AdminPrayerListResponse> {
    if (!canAccessAdminLite(principal)) {
      throw new ForbiddenException("Admin Lite access is required.");
    }

    return {
      prayers: await this.adminPrayerRepository.listManageablePrayers(
        hasRole(principal, "SUPER_ADMIN") ? null : (principal.officerOrganizationUnitIds ?? [])
      )
    };
  }

  async createAdminPrayer(
    principal: CurrentUserPrincipal,
    data: CreateAdminPrayerRequest
  ): Promise<AdminPrayerDetailResponse> {
    requireSuperAdmin(principal);

    return {
      prayer: await this.adminPrayerRepository.createPrayer(data)
    };
  }

  async updateAdminPrayer(
    principal: CurrentUserPrincipal,
    id: string,
    data: UpdateAdminPrayerRequest
  ): Promise<AdminPrayerDetailResponse> {
    requireSuperAdmin(principal);

    return {
      prayer: await this.adminPrayerRepository.updatePrayer(id, data)
    };
  }
}

function requireSuperAdmin(principal: CurrentUserPrincipal): void {
  if (!hasRole(principal, "SUPER_ADMIN")) {
    throw new ForbiddenException("Super Admin access is required.");
  }
}
