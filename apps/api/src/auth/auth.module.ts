import { Module } from "@nestjs/common";
import {
  AuthIdentityRepository,
  PrismaAuthIdentityRepository
} from "./auth-identity.repository.js";
import { createConfiguredExternalAuthProvider } from "./auth-provider.config.js";
import { AuthSessionController } from "./auth-session.controller.js";
import { AuthSessionService } from "./auth-session.service.js";
import { EXTERNAL_AUTH_PROVIDER } from "./auth.tokens.js";
import { CurrentUserController } from "./current-user.controller.js";
import { CurrentUserGuard } from "./current-user.guard.js";
import { CurrentUserService } from "./current-user.service.js";
import { PrismaService } from "../database/prisma.service.js";

@Module({
  controllers: [AuthSessionController, CurrentUserController],
  providers: [
    {
      provide: EXTERNAL_AUTH_PROVIDER,
      useFactory: createConfiguredExternalAuthProvider
    },
    {
      provide: AuthIdentityRepository,
      useClass: PrismaAuthIdentityRepository
    },
    PrismaService,
    AuthSessionService,
    CurrentUserGuard,
    CurrentUserService
  ],
  exports: [AuthSessionService, CurrentUserGuard, CurrentUserService]
})
export class AuthModule {}
