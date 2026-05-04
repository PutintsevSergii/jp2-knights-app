import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaService } from "../database/prisma.service.js";
import { AdminEventController } from "./admin-event.controller.js";
import { AdminEventRepository, PrismaAdminEventRepository } from "./admin-event.repository.js";
import { AdminEventService } from "./admin-event.service.js";
import { AdminPrayerController } from "./admin-prayer.controller.js";
import { AdminPrayerRepository, PrismaAdminPrayerRepository } from "./admin-prayer.repository.js";
import { AdminPrayerService } from "./admin-prayer.service.js";

@Module({
  imports: [AuthModule],
  controllers: [AdminEventController, AdminPrayerController],
  providers: [
    PrismaService,
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
  exports: [AdminEventService, AdminPrayerService]
})
export class AdminContentModule {}
