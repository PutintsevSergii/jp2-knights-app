import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AuthModule } from "./auth/auth.module.js";
import { OrganizationModule } from "./organization/organization.module.js";
import { PublicModule } from "./public/public.module.js";

@Module({
  imports: [AuthModule, OrganizationModule, PublicModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
