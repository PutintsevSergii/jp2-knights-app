import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { DatabaseModule } from "../database/database.module.js";
import { CandidateAnnouncementController } from "./candidate-announcement.controller.js";
import { CandidateDashboardController } from "./candidate-dashboard.controller.js";
import { CandidateEventController } from "./candidate-event.controller.js";
import {
  CandidateDashboardRepository,
  PrismaCandidateDashboardRepository
} from "./candidate-dashboard.repository.js";
import { CandidateDashboardService } from "./candidate-dashboard.service.js";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [
    CandidateAnnouncementController,
    CandidateDashboardController,
    CandidateEventController
  ],
  providers: [
    CandidateDashboardService,
    {
      provide: CandidateDashboardRepository,
      useClass: PrismaCandidateDashboardRepository
    }
  ],
  exports: [CandidateDashboardService]
})
export class CandidateDashboardModule {}
