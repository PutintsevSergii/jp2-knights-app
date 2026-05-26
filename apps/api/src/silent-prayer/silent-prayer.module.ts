import { Module } from "@nestjs/common";
import { AuditLogService } from "../audit/audit-log.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { DatabaseModule } from "../database/database.module.js";
import { AdminSilentPrayerController } from "./admin-silent-prayer.controller.js";
import {
  AdminSilentPrayerRepository,
  PrismaAdminSilentPrayerRepository
} from "./admin-silent-prayer.repository.js";
import { AdminSilentPrayerService } from "./admin-silent-prayer.service.js";
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
  controllers: [
    PublicSilentPrayerController,
    BrotherSilentPrayerController,
    AdminSilentPrayerController
  ],
  providers: [
    SilentPrayerService,
    AdminSilentPrayerService,
    SilentPrayerGateway,
    SilentPrayerPresenceService,
    AuditLogService,
    {
      provide: SilentPrayerPresenceStore,
      useFactory: createConfiguredSilentPrayerPresenceStore
    },
    {
      provide: SilentPrayerRepository,
      useClass: PrismaSilentPrayerRepository
    },
    {
      provide: AdminSilentPrayerRepository,
      useClass: PrismaAdminSilentPrayerRepository
    }
  ],
  exports: [SilentPrayerService, AdminSilentPrayerService]
})
export class SilentPrayerModule {}
