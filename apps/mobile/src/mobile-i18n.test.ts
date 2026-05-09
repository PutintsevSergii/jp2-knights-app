import { describe, expect, it } from "vitest";
import { createMobileTranslator, mobileCopy } from "./mobile-i18n.js";

describe("mobile i18n adapter", () => {
  it("uses the shared catalog for mobile roadmap copy", () => {
    const t = createMobileTranslator();

    expect(t("mobile.candidate.roadmap.title")).toBe("Candidate Roadmap");
    expect(t("roadmap.step.count", { count: 2 })).toBe("2 roadmap steps");
  });

  it("keeps a small direct helper for existing screen model builders", () => {
    expect(mobileCopy("common.demoMode")).toBe("Demo mode");
  });
});
