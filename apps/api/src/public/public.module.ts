import { Module } from "@nestjs/common";
import { PublicController } from "./public.controller.js";
import { PublicHomeService } from "./public-home.service.js";

@Module({
  controllers: [PublicController],
  providers: [PublicHomeService]
})
export class PublicModule {}
