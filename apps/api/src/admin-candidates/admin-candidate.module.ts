import { Module } from "@nestjs/common";
import { AuditLogService } from "../audit/audit-log.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaService } from "../database/prisma.service.js";
import { AdminCandidateController } from "./admin-candidate.controller.js";
import {
  AdminCandidateRepository,
  PrismaAdminCandidateRepository
} from "./admin-candidate.repository.js";
import { AdminCandidateService } from "./admin-candidate.service.js";

@Module({
  imports: [AuthModule],
  controllers: [AdminCandidateController],
  providers: [
    PrismaService,
    AuditLogService,
    AdminCandidateService,
    {
      provide: AdminCandidateRepository,
      useClass: PrismaAdminCandidateRepository
    }
  ],
  exports: [AdminCandidateService]
})
export class AdminCandidateModule {}
