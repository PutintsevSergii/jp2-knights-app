import { Module } from "@nestjs/common";
import { AuditLogService } from "../audit/audit-log.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaService } from "../database/prisma.service.js";
import { AdminIdentityAccessController } from "./admin-identity-access.controller.js";
import {
  AdminIdentityAccessRepository,
  PrismaAdminIdentityAccessRepository
} from "./admin-identity-access.repository.js";
import { AdminIdentityAccessService } from "./admin-identity-access.service.js";

@Module({
  imports: [AuthModule],
  controllers: [AdminIdentityAccessController],
  providers: [
    PrismaService,
    AuditLogService,
    AdminIdentityAccessService,
    {
      provide: AdminIdentityAccessRepository,
      useClass: PrismaAdminIdentityAccessRepository
    }
  ],
  exports: [AdminIdentityAccessService]
})
export class AdminIdentityAccessModule {}
