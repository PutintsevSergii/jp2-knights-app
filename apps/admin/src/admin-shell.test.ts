import { describe, expect, it } from "vitest";
import { adminShellRoutes } from "./admin-shell.js";

describe("admin shell routes", () => {
  it("exposes dashboard navigation before implemented content routes", () => {
    expect(adminShellRoutes).toEqual([
      {
        path: "/admin/dashboard",
        label: "Dashboard",
        screenRoute: "AdminDashboard"
      },
      {
        path: "/admin/identity-access-reviews",
        label: "Sign-In Reviews",
        screenRoute: "AdminIdentityAccessReviews"
      },
      {
        path: "/admin/candidate-requests",
        label: "Candidate Requests",
        screenRoute: "AdminCandidateRequestList"
      },
      {
        path: "/admin/candidates",
        label: "Candidates",
        screenRoute: "AdminCandidateList"
      },
      {
        path: "/admin/organization-units",
        label: "Organization Units",
        screenRoute: "AdminOrganizationUnitList"
      },
      {
        path: "/admin/prayers",
        label: "Prayers",
        screenRoute: "AdminPrayerList"
      },
      {
        path: "/admin/events",
        label: "Events",
        screenRoute: "AdminEventList"
      }
    ]);
  });
});
