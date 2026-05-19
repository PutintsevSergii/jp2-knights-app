import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { DatabaseModule } from "../database/database.module.js";
import { RoadmapController } from "./roadmap.controller.js";
import { PrismaRoadmapRepository, RoadmapRepository } from "./roadmap.repository.js";
import { RoadmapService } from "./roadmap.service.js";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [RoadmapController],
  providers: [
    RoadmapService,
    {
      provide: RoadmapRepository,
      useClass: PrismaRoadmapRepository
    }
  ],
  exports: [RoadmapService]
})
export class RoadmapModule {}
