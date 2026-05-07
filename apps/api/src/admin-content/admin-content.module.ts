import { Module } from "@nestjs/common";
import { AuditLogService } from "../audit/audit-log.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaService } from "../database/prisma.service.js";
import {
  AnnouncementPushRecipientRepository,
  PrismaAnnouncementPushRecipientRepository
} from "../notifications/announcement-push-recipient.repository.js";
import {
  NoopPushNotificationAdapter,
  PushNotificationAdapter
} from "../notifications/push-notification.adapter.js";
import { AdminAnnouncementController } from "./admin-announcement.controller.js";
import {
  AdminAnnouncementRepository,
  PrismaAdminAnnouncementRepository
} from "./admin-announcement.repository.js";
import { AdminAnnouncementService } from "./admin-announcement.service.js";
import { AdminEventController } from "./admin-event.controller.js";
import { AdminEventRepository, PrismaAdminEventRepository } from "./admin-event.repository.js";
import { AdminEventService } from "./admin-event.service.js";
import { AdminPrayerController } from "./admin-prayer.controller.js";
import { AdminPrayerRepository, PrismaAdminPrayerRepository } from "./admin-prayer.repository.js";
import { AdminPrayerService } from "./admin-prayer.service.js";

@Module({
  imports: [AuthModule],
  controllers: [AdminAnnouncementController, AdminEventController, AdminPrayerController],
  providers: [
    PrismaService,
    AuditLogService,
    AdminAnnouncementService,
    {
      provide: AdminAnnouncementRepository,
      useClass: PrismaAdminAnnouncementRepository
    },
    {
      provide: AnnouncementPushRecipientRepository,
      useClass: PrismaAnnouncementPushRecipientRepository
    },
    {
      provide: PushNotificationAdapter,
      useClass: NoopPushNotificationAdapter
    },
    AdminEventService,
    {
      provide: AdminEventRepository,
      useClass: PrismaAdminEventRepository
    },
    AdminPrayerService,
    {
      provide: AdminPrayerRepository,
      useClass: PrismaAdminPrayerRepository
    }
  ],
  exports: [AdminAnnouncementService, AdminEventService, AdminPrayerService]
})
export class AdminContentModule {}
