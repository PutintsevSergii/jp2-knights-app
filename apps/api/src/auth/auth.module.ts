import { Module } from "@nestjs/common";
import {
  AuthIdentityRepository,
  PrismaAuthIdentityRepository
} from "./auth-identity.repository.js";
import { createConfiguredExternalAuthProvider } from "./auth-provider.config.js";
import { AuthSessionController } from "./auth-session.controller.js";
import { AuthSessionService } from "./auth-session.service.js";
import { AuthNotificationController } from "./auth-notification.controller.js";
import {
  AuthNotificationRepository,
  PrismaAuthNotificationRepository
} from "./auth-notification.repository.js";
import { AuthNotificationService } from "./auth-notification.service.js";
import { EXTERNAL_AUTH_PROVIDER } from "./auth.tokens.js";
import { CurrentUserController } from "./current-user.controller.js";
import { CurrentUserGuard } from "./current-user.guard.js";
import { CurrentUserService } from "./current-user.service.js";
import { DatabaseModule } from "../database/database.module.js";

@Module({
  imports: [DatabaseModule],
  controllers: [AuthNotificationController, AuthSessionController, CurrentUserController],
  providers: [
    {
      provide: EXTERNAL_AUTH_PROVIDER,
      useFactory: createConfiguredExternalAuthProvider
    },
    {
      provide: AuthIdentityRepository,
      useClass: PrismaAuthIdentityRepository
    },
    {
      provide: AuthNotificationRepository,
      useClass: PrismaAuthNotificationRepository
    },
    AuthNotificationService,
    AuthSessionService,
    CurrentUserGuard,
    CurrentUserService
  ],
  exports: [AuthSessionService, CurrentUserGuard, CurrentUserService]
})
export class AuthModule {}
