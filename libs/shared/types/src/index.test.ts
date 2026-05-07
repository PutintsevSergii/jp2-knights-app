import { describe, expect, it } from "vitest";
import {
  CONTENT_STATUSES,
  DEVICE_TOKEN_PLATFORMS,
  MEMBERSHIP_STATUSES,
  NOTIFICATION_CATEGORIES,
  ORGANIZATION_UNIT_STATUSES,
  ORGANIZATION_UNIT_TYPES,
  PARTICIPATION_STATUSES,
  RUNTIME_MODES,
  VISIBILITIES
} from "./index.js";

describe("shared types", () => {
  it("keeps public visibility as an explicit contract value", () => {
    expect(VISIBILITIES).toContain("PUBLIC");
  });

  it("documents demo runtime mode for fixture-backed app launches", () => {
    expect(RUNTIME_MODES).toContain("demo");
  });

  it("keeps content workflow statuses uppercase for public contracts", () => {
    expect(CONTENT_STATUSES).toEqual(["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"]);
  });

  it("keeps operational statuses in snake_case", () => {
    expect(PARTICIPATION_STATUSES).toContain("planning_to_attend");
  });

  it("keeps notification categories and token platforms explicit", () => {
    expect(NOTIFICATION_CATEGORIES).toEqual([
      "events",
      "announcements",
      "roadmap_updates",
      "prayer_reminders"
    ]);
    expect(DEVICE_TOKEN_PLATFORMS).toEqual(["ios", "android", "web"]);
  });

  it("keeps organization lifecycle statuses shared for API and admin code", () => {
    expect(ORGANIZATION_UNIT_TYPES).toContain("CHORAGIEW");
    expect(ORGANIZATION_UNIT_STATUSES).toEqual(["active", "archived"]);
    expect(MEMBERSHIP_STATUSES).toEqual(["active", "inactive", "archived"]);
  });
});
