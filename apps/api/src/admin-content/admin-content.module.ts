import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaService } from "../database/prisma.service.js";
import { AdminPrayerController } from "./admin-prayer.controller.js";
import { AdminPrayerRepository, PrismaAdminPrayerRepository } from "./admin-prayer.repository.js";
import { AdminPrayerService } from "./admin-prayer.service.js";

@Module({
  imports: [AuthModule],
  controllers: [AdminPrayerController],
  providers: [
    PrismaService,
    AdminPrayerService,
    {
      provide: AdminPrayerRepository,
      useClass: PrismaAdminPrayerRepository
    }
  ],
  exports: [AdminPrayerService]
})
export class AdminContentModule {}
