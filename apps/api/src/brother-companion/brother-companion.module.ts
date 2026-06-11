import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { DatabaseModule } from "../database/database.module.js";
import {
  createConfiguredLiturgicalCalendarProvider,
  LiturgicalCalendarProvider,
} from "../public/liturgical-calendar.provider.js";
import { BrotherCompanionController } from "./brother-companion.controller.js";
import {
  BrotherCompanionRepository,
  PrismaBrotherCompanionRepository
} from "./brother-companion.repository.js";
import { BrotherCompanionService } from "./brother-companion.service.js";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [BrotherCompanionController],
  providers: [
    BrotherCompanionService,
    {
      provide: BrotherCompanionRepository,
      useClass: PrismaBrotherCompanionRepository
    },
    {
      provide: LiturgicalCalendarProvider,
      useFactory: createConfiguredLiturgicalCalendarProvider
    }
  ],
  exports: [BrotherCompanionService]
})
export class BrotherCompanionModule {}
