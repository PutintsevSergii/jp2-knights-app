import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaService } from "../database/prisma.service.js";
import { CandidateDashboardController } from "./candidate-dashboard.controller.js";
import { CandidateEventController } from "./candidate-event.controller.js";
import {
  CandidateDashboardRepository,
  PrismaCandidateDashboardRepository
} from "./candidate-dashboard.repository.js";
import { CandidateDashboardService } from "./candidate-dashboard.service.js";

@Module({
  imports: [AuthModule],
  controllers: [CandidateDashboardController, CandidateEventController],
  providers: [
    PrismaService,
    CandidateDashboardService,
    {
      provide: CandidateDashboardRepository,
      useClass: PrismaCandidateDashboardRepository
    }
  ],
  exports: [CandidateDashboardService]
})
export class CandidateDashboardModule {}
