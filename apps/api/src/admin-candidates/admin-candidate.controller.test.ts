import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminCandidateController } from "./admin-candidate.controller.js";
import type { AdminCandidateService } from "./admin-candidate.service.js";
import type { AdminCandidateProfileDetail } from "./admin-candidate.types.js";

const principal: CurrentUserPrincipal = {
  id: "admin_1",
  email: "admin@example.test",
  displayName: "Demo Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

const candidateProfile: AdminCandidateProfileDetail = {
  id: "77777777-7777-4777-8777-777777777777",
  userId: "88888888-8888-4888-8888-888888888888",
  candidateRequestId: "55555555-5555-4555-8555-555555555555",
  displayName: "Anna Nowak",
  email: "anna@example.test",
  preferredLanguage: "en",
  assignedOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  assignedOrganizationUnitName: "Riga Choragiew",
  responsibleOfficerId: principal.id,
  responsibleOfficerName: principal.displayName,
  status: "active",
  createdAt: "2026-05-05T10:05:00.000Z",
  updatedAt: "2026-05-05T10:05:00.000Z",
  archivedAt: null
};

describe("AdminCandidateController", () => {
  it("delegates candidate profile list/detail/update using the guard-attached principal", async () => {
    const controller = new AdminCandidateController({
      listCandidateProfiles: (receivedPrincipal: CurrentUserPrincipal) => {
        expect(receivedPrincipal).toBe(principal);
        return Promise.resolve({ candidateProfiles: [candidateProfile] });
      },
      getCandidateProfile: (receivedPrincipal: CurrentUserPrincipal, id: string) => {
        expect(receivedPrincipal).toBe(principal);
        expect(id).toBe(candidateProfile.id);
        return Promise.resolve({ candidateProfile });
      },
      updateCandidateProfile: (
        receivedPrincipal: CurrentUserPrincipal,
        id: string,
        body: { status?: "active" | "paused" | "archived" }
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(id).toBe(candidateProfile.id);
        expect(body).toEqual({ status: "paused" });
        return Promise.resolve({
          candidateProfile: { ...candidateProfile, status: "paused" }
        });
      }
    } as unknown as AdminCandidateService);

    await expect(controller.listCandidateProfiles({ principal })).resolves.toEqual({
      candidateProfiles: [candidateProfile]
    });
    await expect(
      controller.getCandidateProfile({ principal }, candidateProfile.id)
    ).resolves.toEqual({ candidateProfile });
    await expect(
      controller.updateCandidateProfile({ principal }, candidateProfile.id, { status: "paused" })
    ).resolves.toMatchObject({
      candidateProfile: { status: "paused" }
    });
  });

  it("fails closed when invoked without the guard-attached principal", () => {
    const controller = new AdminCandidateController({} as AdminCandidateService);

    expect(() => controller.listCandidateProfiles({})).toThrow("CurrentUserGuard");
    expect(() => controller.getCandidateProfile({}, candidateProfile.id)).toThrow(
      "CurrentUserGuard"
    );
    expect(() =>
      controller.updateCandidateProfile({}, candidateProfile.id, { status: "paused" })
    ).toThrow("CurrentUserGuard");
  });
});
