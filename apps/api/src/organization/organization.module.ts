import { Module } from "@nestjs/common";
import { AuditLogService } from "../audit/audit-log.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaService } from "../database/prisma.service.js";
import { OrganizationRepository, PrismaOrganizationRepository } from "./organization.repository.js";
import { OrganizationController } from "./organization.controller.js";
import { OrganizationService } from "./organization.service.js";

@Module({
  imports: [AuthModule],
  controllers: [OrganizationController],
  providers: [
    AuditLogService,
    PrismaService,
    OrganizationService,
    {
      provide: OrganizationRepository,
      useClass: PrismaOrganizationRepository
    }
  ],
  exports: [OrganizationService]
})
export class OrganizationModule {}
