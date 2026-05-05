import { Injectable } from "@nestjs/common";
import type { CandidateRequestStatus } from "@jp2/shared-types";
import { PrismaService } from "../database/prisma.service.js";
import type {
  CreatePublicCandidateRequest,
  PublicCandidateRequestSummary
} from "./public.types.js";

const ACTIVE_CANDIDATE_REQUEST_STATUSES: CandidateRequestStatus[] = ["new", "contacted", "invited"];

export interface PublicCandidateRequestCreateInput extends CreatePublicCandidateRequest {
  consentAt: Date;
}

export abstract class PublicCandidateRequestRepository {
  abstract hasActiveRequestForEmail(email: string): Promise<boolean>;
  abstract findByIdempotencyKey(
    idempotencyKey: string,
    email: string
  ): Promise<PublicCandidateRequestSummary | null>;
  abstract createCandidateRequest(
    input: PublicCandidateRequestCreateInput
  ): Promise<PublicCandidateRequestSummary>;
  abstract now(): Date;
}

@Injectable()
export class PrismaPublicCandidateRequestRepository extends PublicCandidateRequestRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async hasActiveRequestForEmail(email: string): Promise<boolean> {
    const count = await this.prisma.candidateRequest.count({
      where: {
        email: normalizeEmail(email),
        archivedAt: null,
        status: {
          in: ACTIVE_CANDIDATE_REQUEST_STATUSES
        }
      }
    });

    return count > 0;
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
    email: string
  ): Promise<PublicCandidateRequestSummary | null> {
    const request = await this.prisma.candidateRequest.findFirst({
      where: {
        idempotencyKey,
        email: normalizeEmail(email),
        archivedAt: null,
        status: {
          in: ACTIVE_CANDIDATE_REQUEST_STATUSES
        }
      },
      select: {
        id: true,
        status: true
      }
    });

    return request ? toPublicCandidateRequestSummary(request.id) : null;
  }

  async createCandidateRequest(
    input: PublicCandidateRequestCreateInput
  ): Promise<PublicCandidateRequestSummary> {
    const request = await this.prisma.candidateRequest.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: normalizeEmail(input.email),
        phone: input.phone ?? null,
        country: input.country,
        city: input.city,
        preferredLanguage: input.preferredLanguage ?? null,
        message: input.message ?? null,
        consentTextVersion: input.consentTextVersion,
        consentAt: input.consentAt,
        idempotencyKey: input.idempotencyKey ?? null,
        status: "new"
      },
      select: {
        id: true,
        status: true
      }
    });

    return toPublicCandidateRequestSummary(request.id);
  }

  now(): Date {
    return new Date();
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicCandidateRequestSummary(id: string): PublicCandidateRequestSummary {
  return {
    id,
    status: "new"
  };
}
