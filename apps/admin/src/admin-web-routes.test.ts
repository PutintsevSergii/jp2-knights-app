import { describe, expect, it } from "vitest";
import { findAdminWebRoute, normalizeAdminPath } from "./admin-web-routes.js";

describe("admin web route registry", () => {
  it("normalizes the admin root to the dashboard", () => {
    expect(normalizeAdminPath("/admin")).toBe("/admin/dashboard");
    expect(normalizeAdminPath("/admin?tab=ignored")).toBe("/admin/dashboard");
  });

  it("delegates matching to feature-owned route definitions", () => {
    expect(findAdminWebRoute("/admin/dashboard")).toBeDefined();
    expect(findAdminWebRoute("/admin/candidate-requests/request-1")).toBeDefined();
    expect(findAdminWebRoute("/admin/roadmap-assignments/assignment-1")).toBeDefined();
    expect(findAdminWebRoute("/admin/announcements/new")).toBeDefined();
    expect(findAdminWebRoute("/admin/missing")).toBeUndefined();
  });
});
