import { describe, expect, it } from "vitest";
import {
  approvalContentStatusCreateMetadata,
  approvalContentStatusUpdateMetadata,
  contentStatusCreateTimestamps,
  contentStatusUpdateTimestamps,
  eventStatusCreateMetadata,
  eventStatusCreateTimestamps,
  eventStatusUpdateMetadata,
  eventStatusUpdateTimestamps,
  toContentStatus,
  toEventStatus,
  toVisibility
} from "./content-contracts.js";

describe("content contract helpers", () => {
  const now = new Date("2026-05-26T00:00:00.000Z");

  it("accepts known shared enum values and rejects unknown repository values", () => {
    expect(toVisibility("PUBLIC", "test")).toBe("PUBLIC");
    expect(toContentStatus("PUBLISHED", "test")).toBe("PUBLISHED");
    expect(toEventStatus("published", "test")).toBe("published");
    expect(() => toVisibility("private", "test")).toThrow(
      "Repository returned an unknown test visibility."
    );
    expect(() => toContentStatus("live", "test")).toThrow(
      "Repository returned an unknown test status."
    );
    expect(() => toEventStatus("live", "test")).toThrow(
      "Repository returned an unknown test status."
    );
  });

  it("creates and updates content lifecycle timestamps by status", () => {
    expect(contentStatusCreateTimestamps("PUBLISHED", now)).toEqual({
      publishedAt: now,
      archivedAt: null
    });
    expect(contentStatusCreateTimestamps("ARCHIVED", now)).toEqual({
      publishedAt: null,
      archivedAt: now
    });
    expect(contentStatusCreateTimestamps("DRAFT", now)).toEqual({
      publishedAt: null,
      archivedAt: null
    });
    expect(contentStatusUpdateTimestamps("PUBLISHED", now)).toEqual({ publishedAt: now });
    expect(contentStatusUpdateTimestamps("ARCHIVED", now)).toEqual({ archivedAt: now });
    expect(contentStatusUpdateTimestamps(undefined, now)).toEqual({});
  });

  it("creates and updates approval metadata by content status", () => {
    expect(approvalContentStatusCreateMetadata("APPROVED", "actor-1", now)).toEqual({
      approvedBy: "actor-1",
      publishedBy: null,
      approvedAt: now,
      publishedAt: null,
      archivedAt: null
    });
    expect(approvalContentStatusCreateMetadata("PUBLISHED", "actor-1", now)).toEqual({
      approvedBy: "actor-1",
      publishedBy: "actor-1",
      approvedAt: now,
      publishedAt: now,
      archivedAt: null
    });
    expect(approvalContentStatusCreateMetadata("DRAFT", "actor-1", now)).toEqual({
      approvedBy: null,
      publishedBy: null,
      approvedAt: null,
      publishedAt: null,
      archivedAt: null
    });
    expect(approvalContentStatusUpdateMetadata("APPROVED", "actor-1", now)).toEqual({
      approvedBy: "actor-1",
      approvedAt: now
    });
    expect(approvalContentStatusUpdateMetadata("PUBLISHED", "actor-1", now)).toEqual({
      approvedBy: "actor-1",
      approvedAt: now,
      publishedBy: "actor-1",
      publishedAt: now
    });
    expect(approvalContentStatusUpdateMetadata(undefined, "actor-1", now)).toEqual({});
  });

  it("creates and updates event lifecycle timestamps by status", () => {
    expect(eventStatusCreateTimestamps("published", now)).toEqual({
      publishedAt: now,
      cancelledAt: null,
      archivedAt: null
    });
    expect(eventStatusCreateTimestamps("cancelled", now)).toEqual({
      publishedAt: null,
      cancelledAt: now,
      archivedAt: null
    });
    expect(eventStatusCreateTimestamps("archived", now)).toEqual({
      publishedAt: null,
      cancelledAt: null,
      archivedAt: now
    });
    expect(eventStatusCreateTimestamps("draft", now)).toEqual({
      publishedAt: null,
      cancelledAt: null,
      archivedAt: null
    });
    expect(eventStatusUpdateTimestamps("published", now)).toEqual({ publishedAt: now });
    expect(eventStatusUpdateTimestamps("cancelled", now)).toEqual({ cancelledAt: now });
    expect(eventStatusUpdateTimestamps("archived", now)).toEqual({ archivedAt: now });
    expect(eventStatusUpdateTimestamps(undefined, now)).toEqual({});
  });

  it("creates and updates event approval metadata by status", () => {
    expect(eventStatusCreateMetadata("published", "actor-1", now)).toEqual({
      approvedBy: "actor-1",
      publishedBy: "actor-1",
      approvedAt: now,
      publishedAt: now,
      cancelledAt: null,
      archivedAt: null
    });
    expect(eventStatusCreateMetadata("draft", "actor-1", now)).toEqual({
      approvedBy: null,
      publishedBy: null,
      approvedAt: null,
      publishedAt: null,
      cancelledAt: null,
      archivedAt: null
    });
    expect(eventStatusUpdateMetadata("published", "actor-1", now)).toEqual({
      approvedBy: "actor-1",
      approvedAt: now,
      publishedBy: "actor-1",
      publishedAt: now
    });
    expect(eventStatusUpdateMetadata(undefined, "actor-1", now)).toEqual({});
  });
});
