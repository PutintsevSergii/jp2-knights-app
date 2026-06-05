import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import {
  assertEventPublishHasPriorApproval,
  assertPublishHasPriorApproval,
  assertPublishedContentRetainsApproval,
  assertPublishedEventRetainsApproval
} from "./content-approval.policy.js";

describe("content approval policy", () => {
  it("requires explicit content approval before publishing", () => {
    expect(() =>
      assertPublishHasPriorApproval(
        "PUBLISHED",
        { status: "APPROVED", approvedAt: null },
        "Prayer"
      )
    ).not.toThrow();
    expect(() =>
      assertPublishHasPriorApproval(
        "PUBLISHED",
        { status: "DRAFT", approvedAt: "2026-06-03T12:00:00.000Z" },
        "Prayer"
      )
    ).not.toThrow();
    expect(() =>
      assertPublishHasPriorApproval(
        "PUBLISHED",
        { status: "PUBLISHED", approvedAt: null },
        "Prayer"
      )
    ).toThrow(BadRequestException);
  });

  it("requires event approval metadata before publishing", () => {
    expect(() =>
      assertEventPublishHasPriorApproval(
        "published",
        { status: "draft", approvedAt: "2026-06-03T12:00:00.000Z" },
        "Event"
      )
    ).not.toThrow();
    expect(() =>
      assertEventPublishHasPriorApproval(
        "published",
        { status: "published", approvedAt: null },
        "Event"
      )
    ).toThrow(BadRequestException);
  });

  it("requires published content to retain explicit approval metadata", () => {
    expect(() =>
      assertPublishedContentRetainsApproval(
        undefined,
        undefined,
        {
          status: "PUBLISHED",
          approvedAt: "2026-06-03T12:00:00.000Z"
        },
        "Prayer"
      )
    ).not.toThrow();
    expect(() =>
      assertPublishedContentRetainsApproval(
        undefined,
        undefined,
        { status: "PUBLISHED", approvedAt: null },
        "Prayer"
      )
    ).toThrow(BadRequestException);
    expect(() =>
      assertPublishedContentRetainsApproval(
        "ARCHIVED",
        undefined,
        { status: "PUBLISHED", approvedAt: null },
        "Prayer"
      )
    ).not.toThrow();
  });

  it("requires published events to retain explicit approval metadata", () => {
    expect(() =>
      assertPublishedEventRetainsApproval(
        undefined,
        undefined,
        {
          status: "published",
          approvedAt: "2026-06-03T12:00:00.000Z"
        },
        "Event"
      )
    ).not.toThrow();
    expect(() =>
      assertPublishedEventRetainsApproval(
        undefined,
        undefined,
        { status: "published", approvedAt: null },
        "Event"
      )
    ).toThrow(BadRequestException);
    expect(() =>
      assertPublishedEventRetainsApproval(
        "cancelled",
        undefined,
        { status: "published", approvedAt: null },
        "Event"
      )
    ).not.toThrow();
  });
});
