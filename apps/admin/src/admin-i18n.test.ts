import { describe, expect, it } from "vitest";
import { adminCopy, createAdminTranslator } from "./admin-i18n.js";

describe("admin i18n adapter", () => {
  it("uses the shared catalog for Admin Lite roadmap copy", () => {
    const t = createAdminTranslator();

    expect(t("admin.roadmapDefinitions.title")).toBe("Roadmap Definitions");
    expect(t("admin.roadmapSubmissions.empty.body")).toBe("No roadmap submissions need review.");
  });

  it("supports interpolation through the admin helper", () => {
    expect(adminCopy("roadmap.step.count", { count: 5 })).toBe("5 roadmap steps");
  });
});
