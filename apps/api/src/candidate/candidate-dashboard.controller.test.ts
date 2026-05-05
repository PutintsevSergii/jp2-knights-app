import { describe, expect, it, vi } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { CandidateDashboardController } from "./candidate-dashboard.controller.js";
import type { CandidateDashboardService } from "./candidate-dashboard.service.js";
import type { CandidateDashboardResponse } from "./candidate-dashboard.types.js";

const principal: CurrentUserPrincipal = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "candidate@example.test",
  displayName: "Demo Candidate",
  status: "active",
  roles: ["CANDIDATE"]
};

const dashboard: CandidateDashboardResponse = {
  profile: {
    id: "22222222-2222-4222-8222-222222222222",
    userId: principal.id,
    displayName: principal.displayName,
    email: principal.email,
    preferredLanguage: null,
    status: "active",
    assignedOrganizationUnit: null,
    responsibleOfficer: null
  },
  nextStep: {
    id: "await-assignment",
    label: "Await local assignment",
    body: "A local officer still needs to assign your candidate profile to a choragiew.",
    targetRoute: "CandidateContact",
    priority: "attention"
  },
  upcomingEvents: [],
  announcements: []
};

describe("CandidateDashboardController", () => {
  it("delegates to the service using the guard-attached principal", async () => {
    const getDashboard = vi.fn(() => Promise.resolve(dashboard));
    const service = {
      getDashboard
    } as unknown as CandidateDashboardService;

    await expect(
      new CandidateDashboardController(service).getDashboard({ principal })
    ).resolves.toBe(dashboard);
    expect(getDashboard).toHaveBeenCalledWith(principal);
  });

  it("fails closed if the guard did not attach a principal", () => {
    const service = {
      getDashboard: vi.fn()
    } as unknown as CandidateDashboardService;

    expect(() => new CandidateDashboardController(service).getDashboard({})).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
  });
});
