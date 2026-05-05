import { ConflictException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PublicCandidateRequestRateLimiter } from "./public-candidate-request-rate-limiter.js";
import { PublicCandidateRequestRepository } from "./public-candidate-request.repository.js";
import type {
  CreatePublicCandidateRequest,
  PublicCandidateRequestResponse
} from "./public.types.js";

@Injectable()
export class PublicCandidateRequestService {
  constructor(
    private readonly candidateRequestRepository: PublicCandidateRequestRepository,
    private readonly rateLimiter: PublicCandidateRequestRateLimiter
  ) {}

  async createCandidateRequest(
    input: CreatePublicCandidateRequest
  ): Promise<PublicCandidateRequestResponse> {
    if (input.idempotencyKey) {
      const existing = await this.candidateRequestRepository.findByIdempotencyKey(
        input.idempotencyKey,
        input.email
      );

      if (existing) {
        return { request: existing };
      }
    }

    if (
      !this.rateLimiter.consume(rateLimitKey(input.email), this.candidateRequestRepository.now())
    ) {
      throw new HttpException("Too many candidate request attempts.", HttpStatus.TOO_MANY_REQUESTS);
    }

    const hasActiveRequest = await this.candidateRequestRepository.hasActiveRequestForEmail(
      input.email
    );

    if (hasActiveRequest) {
      throw new ConflictException("An active candidate request already exists for this email.");
    }

    const request = await this.candidateRequestRepository.createCandidateRequest({
      ...input,
      phone: input.phone ?? null,
      preferredLanguage: input.preferredLanguage ?? null,
      message: input.message ?? null,
      consentAt: this.candidateRequestRepository.now()
    });

    return { request };
  }
}

function rateLimitKey(email: string): string {
  return `public-candidate-request:${email.trim().toLowerCase()}`;
}
