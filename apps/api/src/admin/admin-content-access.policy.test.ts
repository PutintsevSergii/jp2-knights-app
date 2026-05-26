import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import {
  adminContentScopeFor,
  adminManageableContentScope
} from "./admin-content-access.policy.js";

describe("admin content access policy", () => {
  it("maps super admin principals to global content scope", () => {
    expect(adminContentScopeFor(principal(["SUPER_ADMIN"]))).toEqual({ kind: "global" });
    expect(adminManageableContentScope(null)).toEqual({ kind: "global" });
  });

  it("maps officer principals to scoped content scope", () => {
    const organizationUnitIds = ["11111111-1111-4111-8111-111111111111"];

    expect(adminContentScopeFor(principal(["OFFICER"], organizationUnitIds))).toEqual({
      kind: "scoped",
      organizationUnitIds
    });
    expect(adminManageableContentScope(organizationUnitIds)).toEqual({
      kind: "scoped",
      organizationUnitIds
    });
  });

  it("keeps officers without assignments scoped to an empty set", () => {
    expect(adminContentScopeFor(principal(["OFFICER"]))).toEqual({
      kind: "scoped",
      organizationUnitIds: []
    });
  });
});

function principal(
  roles: CurrentUserPrincipal["roles"],
  officerOrganizationUnitIds?: readonly string[]
): CurrentUserPrincipal {
  const currentUserPrincipal: CurrentUserPrincipal = {
    id: "user-1",
    email: "admin@example.test",
    displayName: "Admin",
    roles,
    status: "active"
  };

  if (officerOrganizationUnitIds) {
    currentUserPrincipal.officerOrganizationUnitIds = officerOrganizationUnitIds;
  }

  return currentUserPrincipal;
}
