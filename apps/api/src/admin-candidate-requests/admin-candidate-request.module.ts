import { Module } from "@nestjs/common";
import { AuditLogService } from "../audit/audit-log.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaService } from "../database/prisma.service.js";
import { AdminCandidateRequestController } from "./admin-candidate-request.controller.js";
import {
  AdminCandidateRequestRepository,
  PrismaAdminCandidateRequestRepository
} from "./admin-candidate-request.repository.js";
import { AdminCandidateRequestService } from "./admin-candidate-request.service.js";

@Module({
  imports: [AuthModule],
  controllers: [AdminCandidateRequestController],
  providers: [
    PrismaService,
    AuditLogService,
    AdminCandidateRequestService,
    {
      provide: AdminCandidateRequestRepository,
      useClass: PrismaAdminCandidateRequestRepository
    }
  ],
  exports: [AdminCandidateRequestService]
})
export class AdminCandidateRequestModule {}
