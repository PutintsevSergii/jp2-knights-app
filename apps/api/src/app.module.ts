import { Module } from "@nestjs/common";
import { AdminCandidateRequestModule } from "./admin-candidate-requests/admin-candidate-request.module.js";
import { AdminCandidateModule } from "./admin-candidates/admin-candidate.module.js";
import { AdminContentModule } from "./admin-content/admin-content.module.js";
import { AdminDashboardModule } from "./admin-dashboard/admin-dashboard.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AuthModule } from "./auth/auth.module.js";
import { CandidateDashboardModule } from "./candidate/candidate-dashboard.module.js";
import { OrganizationModule } from "./organization/organization.module.js";
import { PublicModule } from "./public/public.module.js";

@Module({
  imports: [
    AdminCandidateRequestModule,
    AdminCandidateModule,
    AdminContentModule,
    AdminDashboardModule,
    AuthModule,
    CandidateDashboardModule,
    OrganizationModule,
    PublicModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
