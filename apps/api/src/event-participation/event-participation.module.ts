import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { DatabaseModule } from "../database/database.module.js";
import { EventParticipationController } from "./event-participation.controller.js";
import {
  EventParticipationRepository,
  PrismaEventParticipationRepository
} from "./event-participation.repository.js";
import { EventParticipationService } from "./event-participation.service.js";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [EventParticipationController],
  providers: [
    EventParticipationService,
    {
      provide: EventParticipationRepository,
      useClass: PrismaEventParticipationRepository
    }
  ],
  exports: [EventParticipationService]
})
export class EventParticipationModule {}
