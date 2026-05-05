import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaService } from "../database/prisma.service.js";
import { BrotherCompanionController } from "./brother-companion.controller.js";
import {
  BrotherCompanionRepository,
  PrismaBrotherCompanionRepository
} from "./brother-companion.repository.js";
import { BrotherCompanionService } from "./brother-companion.service.js";

@Module({
  imports: [AuthModule],
  controllers: [BrotherCompanionController],
  providers: [
    PrismaService,
    BrotherCompanionService,
    {
      provide: BrotherCompanionRepository,
      useClass: PrismaBrotherCompanionRepository
    }
  ],
  exports: [BrotherCompanionService]
})
export class BrotherCompanionModule {}
