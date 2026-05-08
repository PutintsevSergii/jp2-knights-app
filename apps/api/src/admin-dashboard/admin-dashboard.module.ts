import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { DatabaseModule } from "../database/database.module.js";
import { AdminDashboardController } from "./admin-dashboard.controller.js";
import {
  AdminDashboardRepository,
  PrismaAdminDashboardRepository
} from "./admin-dashboard.repository.js";
import { AdminDashboardService } from "./admin-dashboard.service.js";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [AdminDashboardController],
  providers: [
    AdminDashboardService,
    {
      provide: AdminDashboardRepository,
      useClass: PrismaAdminDashboardRepository
    }
  ],
  exports: [AdminDashboardService]
})
export class AdminDashboardModule {}
