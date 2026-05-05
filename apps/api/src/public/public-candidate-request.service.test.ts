import { ConflictException, HttpException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { PublicCandidateRequestRateLimiter } from "./public-candidate-request-rate-limiter.js";
import type { PublicCandidateRequestRepository } from "./public-candidate-request.repository.js";
import { PublicCandidateRequestService } from "./public-candidate-request.service.js";

const requestPayload = {
  firstName: "John",
  lastName: "Paul",
  email: "candidate@example.test",
  phone: "+37120000000",
  country: "LV",
  city: "Riga",
  preferredLanguage: "en",
  message: "I would like to learn more.",
  consentAccepted: true,
  consentTextVersion: "candidate-request-v1",
  idempotencyKey: "join-request-1"
} as const;

describe("PublicCandidateRequestService", () => {
  it("creates a new candidate request with consent metadata and no PII in the response", async () => {
    const repository = repositoryWith();

    await expect(
      new PublicCandidateRequestService(repository, allowAllRateLimiter()).createCandidateRequest(
        requestPayload
      )
    ).resolves.toEqual({
      request: {
        id: "11111111-1111-4111-8111-111111111111",
        status: "new"
      }
    });
    expect(repository.created).toEqual([
      {
        ...requestPayload,
        consentAt: new Date("2026-05-05T12:00:00.000Z")
      }
    ]);
  });

  it("rejects duplicate active candidate request emails", async () => {
    const repository = repositoryWith({ hasActiveRequestForEmail: true });

    await expect(
      new PublicCandidateRequestService(repository, allowAllRateLimiter()).createCandidateRequest(
        requestPayload
      )
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.created).toEqual([]);
  });

  it("returns the existing request for a matching idempotency key", async () => {
    const repository = repositoryWith({
      existingForIdempotencyKey: {
        id: "22222222-2222-4222-8222-222222222222",
        status: "new"
      }
    });

    await expect(
      new PublicCandidateRequestService(repository, denyAllRateLimiter()).createCandidateRequest(
        requestPayload
      )
    ).resolves.toEqual({
      request: {
        id: "22222222-2222-4222-8222-222222222222",
        status: "new"
      }
    });
    expect(repository.created).toEqual([]);
  });

  it("rate limits repeated candidate request attempts before persistence", async () => {
    const repository = repositoryWith();

    await expect(
      new PublicCandidateRequestService(repository, denyAllRateLimiter()).createCandidateRequest({
        ...requestPayload,
        idempotencyKey: undefined
      })
    ).rejects.toSatisfy(
      (error: unknown) => error instanceof HttpException && error.getStatus() === 429
    );
    expect(repository.created).toEqual([]);
  });
});

function repositoryWith(
  options: {
    hasActiveRequestForEmail?: boolean;
    existingForIdempotencyKey?: { id: string; status: "new" } | null;
  } = {}
): PublicCandidateRequestRepository & {
  created: unknown[];
} {
  const created: unknown[] = [];

  return {
    created,
    hasActiveRequestForEmail: () => Promise.resolve(options.hasActiveRequestForEmail ?? false),
    findByIdempotencyKey: () => Promise.resolve(options.existingForIdempotencyKey ?? null),
    createCandidateRequest: (input) => {
      created.push(input);

      return Promise.resolve({
        id: "11111111-1111-4111-8111-111111111111",
        status: "new"
      });
    },
    now: () => new Date("2026-05-05T12:00:00.000Z")
  };
}

function allowAllRateLimiter(): PublicCandidateRequestRateLimiter {
  return {
    consume: () => true
  };
}

function denyAllRateLimiter(): PublicCandidateRequestRateLimiter {
  return {
    consume: () => false
  };
}
