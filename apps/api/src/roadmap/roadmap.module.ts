import { Module } from "@nestjs/common";
import { AuditLogService } from "../audit/audit-log.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { DatabaseModule } from "../database/database.module.js";
import { RoadmapController } from "./roadmap.controller.js";
import {
  AdminRoadmapAssignmentRepository,
  AdminRoadmapDefinitionRepository,
  AdminRoadmapSubmissionRepository,
  PrismaRoadmapRepository,
  RoadmapAccessRepository,
  RoadmapSubmissionRepository
} from "./roadmap.repository.js";
import { RoadmapService } from "./roadmap.service.js";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [RoadmapController],
  providers: [
    AuditLogService,
    RoadmapService,
    PrismaRoadmapRepository,
    {
      provide: RoadmapAccessRepository,
      useExisting: PrismaRoadmapRepository
    },
    {
      provide: RoadmapSubmissionRepository,
      useExisting: PrismaRoadmapRepository
    },
    {
      provide: AdminRoadmapSubmissionRepository,
      useExisting: PrismaRoadmapRepository
    },
    {
      provide: AdminRoadmapAssignmentRepository,
      useExisting: PrismaRoadmapRepository
    },
    {
      provide: AdminRoadmapDefinitionRepository,
      useExisting: PrismaRoadmapRepository
    }
  ],
  exports: [RoadmapService]
})
export class RoadmapModule {}
