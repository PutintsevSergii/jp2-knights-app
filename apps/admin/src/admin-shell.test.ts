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
