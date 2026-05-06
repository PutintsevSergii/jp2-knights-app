import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { AdminCandidateRequestModule } from "./admin-candidate-requests/admin-candidate-request.module.js";
import { AdminCandidateModule } from "./admin-candidates/admin-candidate.module.js";
import { AdminContentModule } from "./admin-content/admin-content.module.js";
import { AdminDashboardModule } from "./admin-dashboard/admin-dashboard.module.js";
import { AdminIdentityAccessModule } from "./admin-identity-access/admin-identity-access.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AuthModule } from "./auth/auth.module.js";
import { BrotherCompanionModule } from "./brother-companion/brother-companion.module.js";
import { CandidateDashboardModule } from "./candidate/candidate-dashboard.module.js";
import { EventParticipationModule } from "./event-participation/event-participation.module.js";
import { OrganizationModule } from "./organization/organization.module.js";
import { RequestIdMiddleware } from "./observability/request-id.middleware.js";
import { PublicModule } from "./public/public.module.js";

@Module({
  imports: [
    AdminCandidateRequestModule,
    AdminCandidateModule,
    AdminContentModule,
    AdminDashboardModule,
    AdminIdentityAccessModule,
    AuthModule,
    BrotherCompanionModule,
    CandidateDashboardModule,
    EventParticipationModule,
    OrganizationModule,
    PublicModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
