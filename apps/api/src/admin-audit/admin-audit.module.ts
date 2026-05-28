import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { DatabaseModule } from "../database/database.module.js";
import { AdminAuditController } from "./admin-audit.controller.js";
import { AdminAuditRepository, PrismaAdminAuditRepository } from "./admin-audit.repository.js";
import { AdminAuditService } from "./admin-audit.service.js";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [AdminAuditController],
  providers: [
    AdminAuditService,
    {
      provide: AdminAuditRepository,
      useClass: PrismaAdminAuditRepository
    }
  ]
})
export class AdminAuditModule {}
