import { describe, expect, it } from "vitest";
import { fallbackAdminCandidateRequestDetails } from "./admin-content-fixtures.js";
import {
  buildAdminCandidateRequestDetailScreen,
  buildAdminCandidateRequestListScreen
} from "./admin-candidate-requests-screen.js";

const candidateRequest = fallbackAdminCandidateRequestDetails[0]!;

describe("admin candidate request screens", () => {
  it("builds list rows with scoped follow-up actions", () => {
    const screen = buildAdminCandidateRequestListScreen({
      state: "ready",
      response: {
        candidateRequests: [
          {
            id: candidateRequest.id,
            firstName: candidateRequest.firstName,
            lastName: candidateRequest.lastName,
            email: candidateRequest.email,
            country: candidateRequest.country,
            city: candidateRequest.city,
            status: candidateRequest.status,
            assignedOrganizationUnitId: candidateRequest.assignedOrganizationUnitId,
            assignedOrganizationUnitName: candidateRequest.assignedOrganizationUnitName,
            createdAt: candidateRequest.createdAt,
            updatedAt: candidateRequest.updatedAt,
            archivedAt: candidateRequest.archivedAt
          }
        ]
      },
      runtimeMode: "api",
      canWrite: true
    });

    expect(screen).toMatchObject({
      route: "AdminCandidateRequestList",
      state: "ready",
      title: "Candidate Requests",
      demoChromeVisible: false
    });
    expect(screen.rows[0]?.actions.map((action) => action.id)).toEqual([
      "view",
      "contact",
      "invite",
      "reject"
    ]);
  });

  it("builds detail fields with only follow-up fields writable", () => {
    const screen = buildAdminCandidateRequestDetailScreen({
      state: "ready",
      candidateRequest,
      runtimeMode: "demo",
      canWrite: true
    });

    expect(screen.demoChromeVisible).toBe(true);
    expect(screen.fields.find((field) => field.name === "email")?.readOnly).toBe(true);
    expect(screen.fields.find((field) => field.name === "message")?.readOnly).toBe(true);
    expect(screen.fields.find((field) => field.name === "status")?.readOnly).toBe(false);
    expect(screen.fields.find((field) => field.name === "officerNote")?.readOnly).toBe(false);
    expect(screen.actions.map((action) => action.id)).toEqual(["save", "refresh"]);
  });

  it("maps forbidden and empty states without leaking actions", () => {
    expect(
      buildAdminCandidateRequestListScreen({
        state: "forbidden",
        runtimeMode: "api",
        canWrite: true
      })
    ).toMatchObject({
      state: "forbidden",
      rows: [],
      actions: []
    });

    expect(
      buildAdminCandidateRequestDetailScreen({
        state: "ready",
        runtimeMode: "api",
        canWrite: false
      })
    ).toMatchObject({
      state: "empty",
      fields: []
    });
  });
});
