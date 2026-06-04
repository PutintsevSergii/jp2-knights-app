import { describe, expect, it } from "vitest";
import { adminPrivacyWorkflowOperationPath } from "@jp2/shared-types";
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
            messagePreview: candidateRequest.messagePreview,
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
      "reject"
    ]);
    expect(screen.metrics.map((metric) => [metric.id, metric.count])).toEqual([
      ["new", 1],
      ["contacted", 0],
      ["invited", 0],
      ["rejected", 0]
    ]);
    expect(screen.rows[0]).toMatchObject({
      initials: "JN",
      locationMeta: "Riga, LV",
      messagePreview: "I would like to learn more about the Order.",
      statusLabel: "New"
    });

    const contactedScreen = buildAdminCandidateRequestListScreen({
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
            messagePreview: candidateRequest.messagePreview,
            status: "contacted",
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

    expect(contactedScreen.rows[0]?.actions.map((action) => action.id)).toEqual([
      "view",
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

  it("adds Super Admin privacy actions only when explicitly allowed", () => {
    const officerScreen = buildAdminCandidateRequestDetailScreen({
      state: "ready",
      candidateRequest,
      runtimeMode: "api",
      canWrite: true
    });

    expect(officerScreen.actions.map((action) => action.id)).not.toContain("erase");
    expect(officerScreen.actions.map((action) => action.id)).not.toContain("export");

    const superAdminScreen = buildAdminCandidateRequestDetailScreen({
      state: "ready",
      candidateRequest,
      runtimeMode: "api",
      canWrite: true,
      canManagePrivacy: true
    });

    expect(superAdminScreen.actions.map((action) => action.id)).toEqual([
      "save",
      "export",
      "erase",
      "refresh"
    ]);
    expect(superAdminScreen.actions.find((action) => action.id === "export")).toMatchObject({
      requestMethod: "GET",
      requestPath: adminPrivacyWorkflowOperationPath(
        "candidateRequest",
        candidateRequest.id,
        "export"
      )
    });
    expect(superAdminScreen.actions.find((action) => action.id === "erase")).toMatchObject({
      requestMethod: "POST",
      requestPath: adminPrivacyWorkflowOperationPath(
        "candidateRequest",
        candidateRequest.id,
        "erase"
      )
    });
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
