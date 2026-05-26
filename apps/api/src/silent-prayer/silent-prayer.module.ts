import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { DatabaseModule } from "../database/database.module.js";
import { SilentPrayerPresenceService } from "./silent-prayer-presence.service.js";
import { createConfiguredSilentPrayerPresenceStore } from "./silent-prayer-presence.store.js";
import { SilentPrayerPresenceStore } from "./silent-prayer-presence.types.js";
import { SilentPrayerGateway } from "./silent-prayer.gateway.js";
import {
  BrotherSilentPrayerController,
  PublicSilentPrayerController
} from "./silent-prayer.controller.js";
import {
  PrismaSilentPrayerRepository,
  SilentPrayerRepository
} from "./silent-prayer.repository.js";
import { SilentPrayerService } from "./silent-prayer.service.js";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [PublicSilentPrayerController, BrotherSilentPrayerController],
  providers: [
    SilentPrayerService,
    SilentPrayerGateway,
    SilentPrayerPresenceService,
    {
      provide: SilentPrayerPresenceStore,
      useFactory: createConfiguredSilentPrayerPresenceStore
    },
    {
      provide: SilentPrayerRepository,
      useClass: PrismaSilentPrayerRepository
    }
  ],
  exports: [SilentPrayerService]
})
export class SilentPrayerModule {}
