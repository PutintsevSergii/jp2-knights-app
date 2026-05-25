import { describe, expect, it } from "vitest";
import { adminCopy, createAdminTranslator } from "./admin-i18n.js";

describe("admin i18n adapter", () => {
  it("uses the shared catalog for Admin Lite roadmap copy", () => {
    const t = createAdminTranslator();

    expect(t("admin.roadmapDefinitions.title")).toBe("Roadmap Definitions");
    expect(t("admin.roadmapDefinitions.documentTitle")).toBe("Admin Roadmap Definitions");
    expect(t("admin.roadmapDefinitions.detail.title", { title: "Brother Formation" })).toBe(
      "Roadmap Definition: Brother Formation"
    );
    expect(t("admin.roadmapSubmissions.empty.body")).toBe("No roadmap submissions need review.");
    expect(t("admin.roadmapSubmissions.review")).toBe("Review");
    expect(t("admin.roadmapSubmissions.detail.title", { stepTitle: "Meet your officer" })).toBe(
      "Roadmap Submission: Meet your officer"
    );
    expect(t("admin.roadmapAssignments.create")).toBe("Create Assignment");
    expect(t("admin.roadmapAssignments.detail.title", { assigneeName: "Demo Brother" })).toBe(
      "Roadmap Assignment: Demo Brother"
    );
  });

  it("supports interpolation through the admin helper", () => {
    expect(adminCopy("roadmap.step.count", { count: 5 })).toBe("5 roadmap steps");
    expect(
      adminCopy("admin.roadmapDefinitions.counts", {
        stageCount: 1,
        stagePluralSuffix: "",
        stepCount: 2,
        stepPluralSuffix: "s",
        assignmentCount: 3,
        assignmentPluralSuffix: "s"
      })
    ).toBe("1 stage · 2 steps · 3 assignments");
    expect(
      adminCopy("admin.roadmapSubmissions.attachmentCount", {
        count: 2,
        pluralSuffix: "s"
      })
    ).toBe("2 attachments");
    expect(
      adminCopy("admin.roadmapAssignments.counts", {
        submissionCount: 2,
        pendingCount: 1
      })
    ).toBe("2 submissions · 1 pending");
  });
});
