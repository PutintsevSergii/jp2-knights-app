import { Module } from "@nestjs/common";
import { AuthSessionService } from "./auth-session.service.js";
import { CurrentUserController } from "./current-user.controller.js";
import { CurrentUserGuard } from "./current-user.guard.js";
import { CurrentUserService } from "./current-user.service.js";

@Module({
  controllers: [CurrentUserController],
  providers: [AuthSessionService, CurrentUserGuard, CurrentUserService],
  exports: [AuthSessionService, CurrentUserGuard, CurrentUserService]
})
export class AuthModule {}
