import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import { PrismaPublicCandidateRequestRepository } from "./public-candidate-request.repository.js";

describe("PrismaPublicCandidateRequestRepository", () => {
  it("checks duplicate active candidate requests by normalized email", async () => {
    const { candidateRequestCount, prisma } = prismaMock();
    candidateRequestCount.mockResolvedValueOnce(1);

    await expect(
      new PrismaPublicCandidateRequestRepository(prisma).hasActiveRequestForEmail(
        "Candidate@Example.Test"
      )
    ).resolves.toBe(true);
    expect(candidateRequestCount).toHaveBeenCalledWith({
      where: {
        email: "candidate@example.test",
        archivedAt: null,
        status: {
          in: ["new", "contacted", "invited"]
        }
      }
    });
  });

  it("persists candidate requests with consent timestamp and default new status", async () => {
    const { candidateRequestCreate, prisma } = prismaMock();
    candidateRequestCreate.mockResolvedValueOnce({
      id: "11111111-1111-4111-8111-111111111111",
      status: "new"
    });
    const consentAt = new Date("2026-05-05T12:00:00.000Z");

    await expect(
      new PrismaPublicCandidateRequestRepository(prisma).createCandidateRequest({
        firstName: "John",
        lastName: "Paul",
        email: "candidate@example.test",
        phone: null,
        country: "LV",
        city: "Riga",
        preferredLanguage: "en",
        message: null,
        consentAccepted: true,
        consentTextVersion: "candidate-request-v1",
        idempotencyKey: "join-request-1",
        consentAt
      })
    ).resolves.toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      status: "new"
    });
    expect(candidateRequestCreate).toHaveBeenCalledWith({
      data: {
        firstName: "John",
        lastName: "Paul",
        email: "candidate@example.test",
        phone: null,
        country: "LV",
        city: "Riga",
        preferredLanguage: "en",
        message: null,
        consentTextVersion: "candidate-request-v1",
        consentAt,
        idempotencyKey: "join-request-1",
        status: "new"
      },
      select: {
        id: true,
        status: true
      }
    });
  });

  it("finds active requests by idempotency key and normalized email", async () => {
    const { candidateRequestFindFirst, prisma } = prismaMock();
    candidateRequestFindFirst.mockResolvedValueOnce({
      id: "11111111-1111-4111-8111-111111111111",
      status: "contacted"
    });

    await expect(
      new PrismaPublicCandidateRequestRepository(prisma).findByIdempotencyKey(
        "join-request-1",
        "Candidate@Example.Test"
      )
    ).resolves.toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      status: "new"
    });
    expect(candidateRequestFindFirst).toHaveBeenCalledWith({
      where: {
        idempotencyKey: "join-request-1",
        email: "candidate@example.test",
        archivedAt: null,
        status: {
          in: ["new", "contacted", "invited"]
        }
      },
      select: {
        id: true,
        status: true
      }
    });
  });
});

function prismaMock(): {
  candidateRequestCount: ReturnType<typeof vi.fn>;
  candidateRequestCreate: ReturnType<typeof vi.fn>;
  candidateRequestFindFirst: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const candidateRequestCount = vi.fn(() => Promise.resolve(0));
  const candidateRequestCreate = vi.fn();
  const candidateRequestFindFirst = vi.fn(() => Promise.resolve(null));

  return {
    candidateRequestCount,
    candidateRequestCreate,
    candidateRequestFindFirst,
    prisma: {
      candidateRequest: {
        count: candidateRequestCount,
        findFirst: candidateRequestFindFirst,
        create: candidateRequestCreate
      }
    } as unknown as PrismaService
  };
}
