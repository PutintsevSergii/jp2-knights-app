import { describe, expect, it } from "vitest";
import { roadmapSubmissionBodyPreview } from "./roadmap.presenter.js";

describe("roadmap presenter helpers", () => {
  it("returns null for blank submission bodies", () => {
    expect(roadmapSubmissionBodyPreview(" \n\t ")).toBeNull();
  });

  it("normalizes short body previews", () => {
    expect(roadmapSubmissionBodyPreview("First line\n\nsecond line")).toBe(
      "First line second line"
    );
  });

  it("truncates long body previews", () => {
    const preview = roadmapSubmissionBodyPreview("a".repeat(220));

    expect(preview).toHaveLength(180);
    expect(preview?.endsWith("...")).toBe(true);
  });
});
