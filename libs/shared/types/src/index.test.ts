import { describe, expect, it } from "vitest";
import { CONTENT_STATUSES, PARTICIPATION_STATUSES, RUNTIME_MODES, VISIBILITIES } from "./index.js";

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
});
