import { describe, expect, it } from "vitest";
import { CurrentUserService } from "./current-user.service.js";
import type { CurrentUserPrincipal } from "./current-user.types.js";

const candidateBrother: CurrentUserPrincipal = {
  id: "user_1",
  email: "brother@example.test",
  displayName: "Converted Brother",
  preferredLanguage: "en",
  status: "active",
  roles: ["CANDIDATE", "BROTHER"],
  candidateOrganizationUnitId: "organizationUnit-a",
  memberOrganizationUnitIds: ["organizationUnit-a"]
};

describe("CurrentUserService", () => {
  it("returns current identity with brother mobile precedence", () => {
    expect(new CurrentUserService().toResponse(candidateBrother)).toEqual({
      user: {
        id: "user_1",
        email: "brother@example.test",
        displayName: "Converted Brother",
        preferredLanguage: "en",
        status: "active",
        roles: ["CANDIDATE", "BROTHER"]
      },
      access: {
        mobileMode: "brother",
        adminLite: false,
        candidateOrganizationUnitId: "organizationUnit-a",
        memberOrganizationUnitIds: ["organizationUnit-a"],
        officerOrganizationUnitIds: [],
        approval: null
      }
    });
  });

  it("keeps officer-only users in Admin Lite and out of private mobile modes", () => {
    expect(
      new CurrentUserService().toResponse({
        id: "officer_1",
        email: "officer@example.test",
        displayName: "Demo Officer",
        status: "active",
        roles: ["OFFICER"],
        officerOrganizationUnitIds: ["organizationUnit-a"]
      }).access
    ).toEqual({
      mobileMode: "public",
      adminLite: true,
      candidateOrganizationUnitId: null,
      memberOrganizationUnitIds: [],
      officerOrganizationUnitIds: ["organizationUnit-a"],
      approval: null
    });
  });

  it("returns idle approval state without private app access", () => {
    expect(
      new CurrentUserService().toResponse({
        id: "idle_1",
        email: "idle@example.test",
        displayName: "Idle User",
        status: "invited",
        roles: [],
        approval: {
          state: "pending",
          expiresAt: "2026-06-04T08:00:00.000Z",
          scopeOrganizationUnitId: null
        }
      }).access
    ).toEqual({
      mobileMode: "public",
      adminLite: false,
      candidateOrganizationUnitId: null,
      memberOrganizationUnitIds: [],
      officerOrganizationUnitIds: [],
      approval: {
        state: "pending",
        expiresAt: "2026-06-04T08:00:00.000Z",
        scopeOrganizationUnitId: null
      }
    });
  });
});
