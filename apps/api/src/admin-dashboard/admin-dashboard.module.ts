import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaService } from "../database/prisma.service.js";
import { AdminDashboardController } from "./admin-dashboard.controller.js";
import {
  AdminDashboardRepository,
  PrismaAdminDashboardRepository
} from "./admin-dashboard.repository.js";
import { AdminDashboardService } from "./admin-dashboard.service.js";

@Module({
  imports: [AuthModule],
  controllers: [AdminDashboardController],
  providers: [
    PrismaService,
    AdminDashboardService,
    {
      provide: AdminDashboardRepository,
      useClass: PrismaAdminDashboardRepository
    }
  ],
  exports: [AdminDashboardService]
})
export class AdminDashboardModule {}
