import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import {
  InMemoryPublicCandidateRequestRateLimiter,
  PublicCandidateRequestRateLimiter
} from "./public-candidate-request-rate-limiter.js";
import {
  PrismaPublicCandidateRequestRepository,
  PublicCandidateRequestRepository
} from "./public-candidate-request.repository.js";
import { PublicCandidateRequestService } from "./public-candidate-request.service.js";
import {
  PublicContentRepository,
  PrismaPublicContentRepository
} from "./public-content.repository.js";
import { PublicContentService } from "./public-content.service.js";
import { PublicController } from "./public.controller.js";
import { PublicHomeService } from "./public-home.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [PublicController],
  providers: [
    PublicHomeService,
    PublicContentService,
    PublicCandidateRequestService,
    {
      provide: PublicCandidateRequestRateLimiter,
      useClass: InMemoryPublicCandidateRequestRateLimiter
    },
    {
      provide: PublicContentRepository,
      useClass: PrismaPublicContentRepository
    },
    {
      provide: PublicCandidateRequestRepository,
      useClass: PrismaPublicCandidateRequestRepository
    }
  ]
})
export class PublicModule {}
