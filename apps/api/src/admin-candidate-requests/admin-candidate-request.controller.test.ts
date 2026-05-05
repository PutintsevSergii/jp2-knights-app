import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { AdminCandidateRequestController } from "./admin-candidate-request.controller.js";
import type { AdminCandidateRequestService } from "./admin-candidate-request.service.js";
import type {
  AdminCandidateProfileDetail,
  AdminCandidateRequestDetail,
  ConvertCandidateRequest,
  UpdateAdminCandidateRequest
} from "./admin-candidate-request.types.js";

const candidateRequest: AdminCandidateRequestDetail = {
  id: "55555555-5555-4555-8555-555555555555",
  firstName: "Anna",
  lastName: "Nowak",
  email: "anna@example.test",
  phone: null,
  country: "Latvia",
  city: "Riga",
  preferredLanguage: "en",
  message: "I would like to learn more.",
  consentTextVersion: "candidate-request-v1",
  consentAt: "2026-05-05T10:00:00.000Z",
  status: "new",
  assignedOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
  assignedOrganizationUnitName: "Riga Choragiew",
  officerNote: null,
  createdAt: "2026-05-05T10:00:00.000Z",
  updatedAt: "2026-05-05T10:00:00.000Z",
  archivedAt: null
};

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
  candidateRequestId: candidateRequest.id,
  displayName: "Anna Nowak",
  email: candidateRequest.email,
  preferredLanguage: candidateRequest.preferredLanguage,
  assignedOrganizationUnitId: candidateRequest.assignedOrganizationUnitId,
  assignedOrganizationUnitName: candidateRequest.assignedOrganizationUnitName,
  responsibleOfficerId: principal.id,
  responsibleOfficerName: principal.displayName,
  status: "active",
  createdAt: "2026-05-05T10:05:00.000Z",
  updatedAt: "2026-05-05T10:05:00.000Z",
  archivedAt: null
};

describe("AdminCandidateRequestController", () => {
  it("delegates candidate request list/detail/update using the guard-attached principal", async () => {
    const controller = new AdminCandidateRequestController({
      listCandidateRequests: (receivedPrincipal: CurrentUserPrincipal) => {
        expect(receivedPrincipal).toBe(principal);
        return Promise.resolve({ candidateRequests: [candidateRequest] });
      },
      getCandidateRequest: (receivedPrincipal: CurrentUserPrincipal, id: string) => {
        expect(receivedPrincipal).toBe(principal);
        expect(id).toBe(candidateRequest.id);
        return Promise.resolve({ candidateRequest });
      },
      updateCandidateRequest: (
        receivedPrincipal: CurrentUserPrincipal,
        id: string,
        body: UpdateAdminCandidateRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(id).toBe(candidateRequest.id);
        expect(body).toEqual({
          status: "contacted",
          officerNote: "Followed up by email."
        });
        return Promise.resolve({
          candidateRequest: {
            ...candidateRequest,
            status: "contacted",
            officerNote: "Followed up by email."
          }
        });
      },
      convertCandidateRequest: (
        receivedPrincipal: CurrentUserPrincipal,
        id: string,
        body: ConvertCandidateRequest
      ) => {
        expect(receivedPrincipal).toBe(principal);
        expect(id).toBe(candidateRequest.id);
        expect(body).toEqual({
          responsibleOfficerId: principal.id
        });
        return Promise.resolve({
          candidateProfile
        });
      }
    } as unknown as AdminCandidateRequestService);

    await expect(controller.listCandidateRequests({ principal })).resolves.toEqual({
      candidateRequests: [candidateRequest]
    });
    await expect(
      controller.getCandidateRequest({ principal }, candidateRequest.id)
    ).resolves.toEqual({
      candidateRequest
    });
    await expect(
      controller.updateCandidateRequest({ principal }, candidateRequest.id, {
        status: "contacted",
        officerNote: "Followed up by email."
      })
    ).resolves.toEqual({
      candidateRequest: {
        ...candidateRequest,
        status: "contacted",
        officerNote: "Followed up by email."
      }
    });
    await expect(
      controller.convertCandidateRequest({ principal }, candidateRequest.id, {
        responsibleOfficerId: principal.id
      })
    ).resolves.toEqual({
      candidateProfile
    });
  });

  it("fails closed when invoked without the guard-attached principal", () => {
    const controller = new AdminCandidateRequestController({} as AdminCandidateRequestService);

    expect(() => controller.listCandidateRequests({})).toThrow("CurrentUserGuard");
    expect(() => controller.getCandidateRequest({}, candidateRequest.id)).toThrow(
      "CurrentUserGuard"
    );
    expect(() =>
      controller.updateCandidateRequest({}, candidateRequest.id, { status: "contacted" })
    ).toThrow("CurrentUserGuard");
    expect(() => controller.convertCandidateRequest({}, candidateRequest.id, {})).toThrow(
      "CurrentUserGuard"
    );
  });
});
