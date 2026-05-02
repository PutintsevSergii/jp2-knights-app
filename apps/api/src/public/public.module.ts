import { Module } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import { PublicContentRepository, PrismaPublicContentRepository } from "./public-content.repository.js";
import { PublicContentService } from "./public-content.service.js";
import { PublicController } from "./public.controller.js";
import { PublicHomeService } from "./public-home.service.js";

@Module({
  controllers: [PublicController],
  providers: [
    PrismaService,
    PublicHomeService,
    PublicContentService,
    {
      provide: PublicContentRepository,
      useClass: PrismaPublicContentRepository
    }
  ]
})
export class PublicModule {}
