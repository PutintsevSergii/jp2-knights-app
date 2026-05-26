import { describe, expect, it } from "vitest";
import {
  adminManageableContentWhere,
  adminScopedContentUpdateWhere,
  memberScopedVisibilityWhere,
  publishedAtNowOrUnset
} from "./content-visibility.where.js";

describe("content visibility where helpers", () => {
  it("builds member visibility filters without organization-unit scope", () => {
    expect(memberScopedVisibilityWhere("BROTHER", null)).toEqual([
      { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "BROTHER"] } }
    ]);
  });

  it("builds member visibility filters for one organization-unit id", () => {
    expect(memberScopedVisibilityWhere("CANDIDATE", "unit-1")).toEqual([
      { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "CANDIDATE"] } },
      { visibility: "ORGANIZATION_UNIT", targetOrganizationUnitId: "unit-1" }
    ]);
  });

  it("builds member visibility filters for multiple organization-unit ids", () => {
    expect(memberScopedVisibilityWhere("BROTHER", ["unit-1", "unit-2"])).toEqual([
      { visibility: { in: ["PUBLIC", "FAMILY_OPEN", "BROTHER"] } },
      {
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: { in: ["unit-1", "unit-2"] }
      }
    ]);
  });

  it("builds publish windows for content that is available now or has no publish gate", () => {
    const now = new Date("2026-05-26T00:00:00.000Z");

    expect(publishedAtNowOrUnset(now)).toEqual([
      { publishedAt: null },
      { publishedAt: { lte: now } }
    ]);
  });

  it("builds admin list filters by global or scoped content scope", () => {
    expect(adminManageableContentWhere({ kind: "global" })).toEqual({});
    expect(
      adminManageableContentWhere({
        kind: "scoped",
        organizationUnitIds: ["unit-1", "unit-2"]
      })
    ).toEqual({
      OR: [
        { visibility: { in: ["PUBLIC", "FAMILY_OPEN"] } },
        { targetOrganizationUnitId: { in: ["unit-1", "unit-2"] } }
      ]
    });
  });

  it("builds admin update filters by global or scoped content scope", () => {
    expect(adminScopedContentUpdateWhere("content-1", { kind: "global" })).toEqual({
      id: "content-1"
    });
    expect(
      adminScopedContentUpdateWhere("content-1", {
        kind: "scoped",
        organizationUnitIds: ["unit-1"]
      })
    ).toEqual({
      id: "content-1",
      targetOrganizationUnitId: { in: ["unit-1"] }
    });
  });
});
