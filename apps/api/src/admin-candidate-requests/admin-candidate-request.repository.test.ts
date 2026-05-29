import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service.js";
import { PrismaAdminCandidateRequestRepository } from "./admin-candidate-request.repository.js";

const candidateRequestRecord = {
  id: "55555555-5555-4555-8555-555555555555",
  firstName: "Anna",
  lastName: "Nowak",
  email: "anna@example.test",
  phone: "555-0100",
  country: "Latvia",
  city: "Riga",
  preferredLanguage: "en",
  message: "I would like to learn more.",
  consentTextVersion: "candidate-request-v1",
  consentAt: new Date("2026-05-05T10:00:00.000Z"),
  status: "new",
  assignedOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  assignedOrganizationUnit: { name: "Riga Choragiew" },
  officerNote: "Sensitive officer note",
  createdAt: new Date("2026-05-05T10:00:00.000Z"),
  updatedAt: new Date("2026-05-05T10:00:00.000Z"),
  archivedAt: null
} as const;

describe("PrismaAdminCandidateRequestRepository", () => {
  it("anonymizes and archives candidate request personal identifiers for erasure", async () => {
    const { candidateRequestFindUnique, candidateRequestUpdate, prisma } = prismaMock();
    const erasedAt = new Date("2026-05-29T08:00:00.000Z");
    candidateRequestFindUnique.mockResolvedValueOnce({ id: candidateRequestRecord.id });
    candidateRequestUpdate.mockResolvedValueOnce({
      ...candidateRequestRecord,
      firstName: "Erased",
      lastName: "Subject",
      email: "erased+55555555-5555-4555-8555-555555555555@privacy.local",
      phone: null,
      country: "Erased",
      city: "Erased",
      preferredLanguage: null,
      message: null,
      officerNote: null,
      archivedAt: erasedAt
    });

    await expect(
      new PrismaAdminCandidateRequestRepository(prisma).eraseCandidateRequest(
        candidateRequestRecord.id,
        erasedAt
      )
    ).resolves.toMatchObject({
      id: candidateRequestRecord.id,
      firstName: "Erased",
      lastName: "Subject",
      email: "erased+55555555-5555-4555-8555-555555555555@privacy.local",
      phone: null,
      country: "Erased",
      city: "Erased",
      messagePreview: null,
      preferredLanguage: null,
      message: null,
      officerNote: null,
      archivedAt: "2026-05-29T08:00:00.000Z"
    });
    expect(candidateRequestUpdate).toHaveBeenCalledWith({
      where: { id: candidateRequestRecord.id },
      data: {
        firstName: "Erased",
        lastName: "Subject",
        email: "erased+55555555-5555-4555-8555-555555555555@privacy.local",
        phone: null,
        country: "Erased",
        city: "Erased",
        preferredLanguage: null,
        message: null,
        idempotencyKey: null,
        officerNote: null,
        archivedAt: erasedAt
      },
      include: {
        assignedOrganizationUnit: {
          select: {
            name: true
          }
        }
      }
    });
  });

  it("does not update a missing candidate request during erasure", async () => {
    const { candidateRequestFindUnique, candidateRequestUpdate, prisma } = prismaMock();
    candidateRequestFindUnique.mockResolvedValueOnce(null);

    await expect(
      new PrismaAdminCandidateRequestRepository(prisma).eraseCandidateRequest(
        candidateRequestRecord.id,
        new Date("2026-05-29T08:00:00.000Z")
      )
    ).resolves.toBeNull();
    expect(candidateRequestUpdate).not.toHaveBeenCalled();
  });
});

function prismaMock(): {
  candidateRequestFindUnique: ReturnType<typeof vi.fn>;
  candidateRequestUpdate: ReturnType<typeof vi.fn>;
  prisma: PrismaService;
} {
  const candidateRequestFindUnique = vi.fn();
  const candidateRequestUpdate = vi.fn();

  return {
    candidateRequestFindUnique,
    candidateRequestUpdate,
    prisma: {
      candidateRequest: {
        findUnique: candidateRequestFindUnique,
        update: candidateRequestUpdate
      }
    } as unknown as PrismaService
  };
}
