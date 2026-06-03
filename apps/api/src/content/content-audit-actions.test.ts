import { describe, expect, it } from "vitest";
import {
  contentMutationAuditAction,
  eventMutationAuditAction
} from "./content-audit-actions.js";

describe("contentMutationAuditAction", () => {
  it("classifies content approval, publish, archive, and generic update actions", () => {
    expect(contentMutationAuditAction("prayer", { status: "APPROVED" }, null)).toBe(
      "admin.prayer.approve"
    );
    expect(
      contentMutationAuditAction(
        "announcement",
        { status: "PUBLISHED" },
        { status: "APPROVED", approvedAt: "2026-06-03T12:00:00.000Z" }
      )
    ).toBe("admin.announcement.publish");
    expect(
      contentMutationAuditAction("silent_prayer_event", { status: "ARCHIVED" }, { status: "DRAFT" })
    ).toBe("admin.silent_prayer_event.archive");
    expect(contentMutationAuditAction("prayer", {}, { status: "DRAFT" })).toBe(
      "admin.prayer.update"
    );
  });
});

describe("eventMutationAuditAction", () => {
  it("classifies event approval, publish, cancel, archive, and generic update actions", () => {
    expect(
      eventMutationAuditAction(
        { approvedAt: "2026-06-03T12:00:00.000Z" },
        { status: "draft", approvedAt: null }
      )
    ).toBe("admin.event.approve");
    expect(
      eventMutationAuditAction(
        { status: "published" },
        { status: "draft", approvedAt: "2026-06-03T12:00:00.000Z" }
      )
    ).toBe("admin.event.publish");
    expect(eventMutationAuditAction({ status: "cancelled" }, { status: "published" })).toBe(
      "admin.event.cancel"
    );
    expect(eventMutationAuditAction({ status: "archived" }, { status: "cancelled" })).toBe(
      "admin.event.archive"
    );
    expect(eventMutationAuditAction({}, { status: "draft" })).toBe(
      "admin.event.update"
    );
  });
});
