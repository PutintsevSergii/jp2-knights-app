import { describe, expect, it } from "vitest";
import {
  assertActive,
  canAccessAdminLite,
  canAccessBrotherMode,
  canAccessCandidateMode,
  canAdministerOrganizationUnit,
  canReadAdminScopedRecord,
  canViewPublishedContent,
  canViewByVisibility,
  hasAnyRole,
  hasRole,
  resolveMobileMode,
  type Principal
} from "./index.js";

const organizationUnitA = "organization-unit-a";
const organizationUnitB = "organization-unit-b";

const candidate: Principal = {
  id: "candidate_1",
  roles: ["CANDIDATE"],
  status: "active",
  candidateOrganizationUnitId: organizationUnitA
};

const brother: Principal = {
  id: "brother_1",
  roles: ["BROTHER"],
  status: "active",
  memberOrganizationUnitIds: [organizationUnitA]
};

const officer: Principal = {
  id: "officer_1",
  roles: ["OFFICER"],
  status: "active",
  officerOrganizationUnitIds: [organizationUnitA]
};

const superAdmin: Principal = {
  id: "super_admin_1",
  roles: ["SUPER_ADMIN"],
  status: "active"
};

describe("shared auth helpers", () => {
  it("detects assigned roles", () => {
    expect(hasRole({ id: "user_1", roles: ["BROTHER"], status: "active" }, "BROTHER")).toBe(true);
  });

  it("detects any permitted role", () => {
    expect(hasAnyRole(officer, ["OFFICER", "SUPER_ADMIN"])).toBe(true);
    expect(hasAnyRole(candidate, ["OFFICER", "SUPER_ADMIN"])).toBe(false);
  });

  it("blocks inactive principals", () => {
    expect(() => assertActive({ id: "user_1", roles: ["BROTHER"], status: "inactive" })).toThrow(
      "Inactive principals"
    );
  });

  it("allows active principals", () => {
    expect(() =>
      assertActive({ id: "user_1", roles: ["BROTHER"], status: "active" })
    ).not.toThrow();
  });

  it("resolves app mode access from active status and role", () => {
    expect(canAccessCandidateMode(candidate)).toBe(true);
    expect(canAccessCandidateMode(undefined)).toBe(false);
    expect(canAccessBrotherMode(brother)).toBe(true);
    expect(canAccessBrotherMode(null)).toBe(false);
    expect(canAccessAdminLite(officer)).toBe(true);
    expect(canAccessAdminLite(superAdmin)).toBe(true);
    expect(canAccessAdminLite(brother)).toBe(false);
    expect(canAccessAdminLite({ ...officer, status: "archived" })).toBe(false);
    expect(canAccessBrotherMode({ ...brother, status: "inactive" })).toBe(false);
  });

  it("resolves mobile mode with brother precedence after candidate conversion", () => {
    expect(resolveMobileMode(null)).toBe("public");
    expect(resolveMobileMode(candidate)).toBe("candidate");
    expect(resolveMobileMode({ ...candidate, roles: ["CANDIDATE", "BROTHER"] })).toBe("brother");
  });

  it("keeps admin-only roles out of private mobile modes", () => {
    expect(resolveMobileMode(officer)).toBe("public");
    expect(resolveMobileMode(superAdmin)).toBe("public");
    expect(resolveMobileMode({ ...officer, roles: ["BROTHER", "OFFICER"] })).toBe("brother");
    expect(resolveMobileMode({ ...brother, status: "inactive" })).toBe("public");
  });

  it("scopes officer administration to assigned organization unit", () => {
    expect(canAdministerOrganizationUnit(officer, organizationUnitA)).toBe(true);
    expect(canAdministerOrganizationUnit(officer, organizationUnitB)).toBe(false);
    expect(canAdministerOrganizationUnit(superAdmin, organizationUnitB)).toBe(true);
    expect(canAdministerOrganizationUnit({ ...officer, status: "inactive" }, organizationUnitA)).toBe(false);
  });

  it("keeps unassigned admin records explicit for officers", () => {
    expect(canReadAdminScopedRecord(null, organizationUnitA)).toBe(false);
    expect(canReadAdminScopedRecord(candidate, organizationUnitA)).toBe(false);
    expect(canReadAdminScopedRecord(officer, null)).toBe(false);
    expect(canReadAdminScopedRecord(officer, null, { allowUnassignedForOfficer: true })).toBe(true);
    expect(canReadAdminScopedRecord(officer, organizationUnitA)).toBe(true);
    expect(canReadAdminScopedRecord(officer, organizationUnitB)).toBe(false);
    expect(canReadAdminScopedRecord(superAdmin, undefined)).toBe(true);
  });
});

describe("shared visibility helpers", () => {
  it("allows only public-safe visibility for public APIs", () => {
    expect(canViewByVisibility(null, { visibility: "PUBLIC" }, { audience: "public" })).toBe(true);
    expect(canViewByVisibility(null, { visibility: "FAMILY_OPEN" }, { audience: "public" })).toBe(
      true
    );
    expect(canViewByVisibility(null, { visibility: "CANDIDATE" }, { audience: "public" })).toBe(
      false
    );
    expect(canViewByVisibility(null, { visibility: "BROTHER" }, { audience: "public" })).toBe(
      false
    );
    expect(
      canViewByVisibility(
        null,
        { visibility: "ORGANIZATION_UNIT", targetOrganizationUnitId: organizationUnitA },
        { audience: "public" }
      )
    ).toBe(false);
  });

  it("prevents inactive users from reading private visibility", () => {
    expect(
      canViewByVisibility(
        { ...brother, status: "inactive" },
        { visibility: "BROTHER" },
        { audience: "brother" }
      )
    ).toBe(false);
  });

  it("keeps candidate and brother visibility separated", () => {
    expect(
      canViewByVisibility(candidate, { visibility: "CANDIDATE" }, { audience: "candidate" })
    ).toBe(true);
    expect(
      canViewByVisibility(candidate, { visibility: "BROTHER" }, { audience: "candidate" })
    ).toBe(false);
    expect(canViewByVisibility(brother, { visibility: "BROTHER" }, { audience: "brother" })).toBe(
      true
    );
    expect(canViewByVisibility(brother, { visibility: "CANDIDATE" }, { audience: "brother" })).toBe(
      false
    );
  });

  it("requires explicit candidate permission for organization unit visibility", () => {
    const scopedRecord = { visibility: "ORGANIZATION_UNIT" as const, targetOrganizationUnitId: organizationUnitA };

    expect(canViewByVisibility(candidate, scopedRecord, { audience: "candidate" })).toBe(false);
    expect(
      canViewByVisibility(candidate, scopedRecord, {
        audience: "candidate",
        candidateCanAccessOrganizationUnit: true
      })
    ).toBe(true);
    expect(
      canViewByVisibility(
        candidate,
        { ...scopedRecord, targetOrganizationUnitId: organizationUnitB },
        {
          audience: "candidate",
          candidateCanAccessOrganizationUnit: true
        }
      )
    ).toBe(false);
  });

  it("limits brother organization unit visibility to own organization unit", () => {
    expect(canViewByVisibility(brother, { visibility: "ORGANIZATION_UNIT" }, { audience: "brother" })).toBe(
      false
    );
    expect(
      canViewByVisibility(
        brother,
        { visibility: "ORGANIZATION_UNIT", targetOrganizationUnitId: organizationUnitA },
        { audience: "brother" }
      )
    ).toBe(true);
    expect(
      canViewByVisibility(
        brother,
        { visibility: "ORGANIZATION_UNIT", targetOrganizationUnitId: organizationUnitB },
        { audience: "brother" }
      )
    ).toBe(false);
  });

  it("requires scoped principals for organization unit visibility", () => {
    const scopedRecord = {
      visibility: "ORGANIZATION_UNIT" as const,
      targetOrganizationUnitId: organizationUnitA
    };
    const brotherWithoutMemberships: Principal = {
      id: "brother_without_memberships",
      roles: ["BROTHER"],
      status: "active"
    };

    expect(
      canViewByVisibility(brotherWithoutMemberships, scopedRecord, {
        audience: "brother"
      })
    ).toBe(false);
    expect(
      canViewByVisibility({ ...candidate, candidateOrganizationUnitId: null }, scopedRecord, {
        audience: "candidate",
        candidateCanAccessOrganizationUnit: true
      })
    ).toBe(false);
    expect(
      canViewByVisibility(officer, { visibility: "ORGANIZATION_UNIT" }, { audience: "admin" })
    ).toBe(false);
  });

  it("keeps officer admin visibility scoped by organization unit", () => {
    expect(
      canViewByVisibility(
        officer,
        { visibility: "BROTHER", targetOrganizationUnitId: organizationUnitA },
        { audience: "admin" }
      )
    ).toBe(true);
    expect(
      canViewByVisibility(
        officer,
        { visibility: "BROTHER", targetOrganizationUnitId: organizationUnitB },
        { audience: "admin" }
      )
    ).toBe(false);
    expect(
      canViewByVisibility(
        superAdmin,
        { visibility: "BROTHER", targetOrganizationUnitId: organizationUnitB },
        { audience: "admin" }
      )
    ).toBe(true);
  });

  it("keeps officer-only and admin-only records out of mobile modes", () => {
    expect(canViewByVisibility(officer, { visibility: "OFFICER" }, { audience: "brother" })).toBe(
      false
    );
    expect(canViewByVisibility(brother, { visibility: "OFFICER" }, { audience: "admin" })).toBe(
      false
    );
    expect(canViewByVisibility(officer, { visibility: "OFFICER" }, { audience: "admin" })).toBe(
      false
    );
    expect(canViewByVisibility(candidate, { visibility: "OFFICER" }, { audience: "admin" })).toBe(
      false
    );
    expect(
      canViewByVisibility(
        officer,
        { visibility: "OFFICER" },
        {
          audience: "admin",
          allowUnscopedOfficerContent: true
        }
      )
    ).toBe(true);
    expect(canViewByVisibility(officer, { visibility: "ADMIN" }, { audience: "candidate" })).toBe(
      false
    );
  });

  it("requires published, currently available, unarchived content before visibility access", () => {
    const publishedPublic = {
      status: "PUBLISHED" as const,
      visibility: "PUBLIC" as const,
      publishedAt: "2026-01-01T00:00:00.000Z"
    };

    expect(canViewPublishedContent(null, publishedPublic, { audience: "public" })).toBe(true);
    expect(
      canViewPublishedContent(
        null,
        { ...publishedPublic, status: "APPROVED" },
        { audience: "public" }
      )
    ).toBe(false);
    expect(
      canViewPublishedContent(
        null,
        { ...publishedPublic, publishedAt: "2999-01-01T00:00:00.000Z" },
        { audience: "public" }
      )
    ).toBe(false);
    expect(
      canViewPublishedContent(
        null,
        { ...publishedPublic, archivedAt: "2026-02-01T00:00:00.000Z" },
        { audience: "public" }
      )
    ).toBe(false);
  });

  it("applies role and organization unit visibility after published-content checks", () => {
    const scopedBrotherContent = {
      status: "PUBLISHED" as const,
      visibility: "ORGANIZATION_UNIT" as const,
      targetOrganizationUnitId: organizationUnitA,
      publishedAt: "2026-01-01T00:00:00.000Z"
    };

    expect(canViewPublishedContent(null, scopedBrotherContent, { audience: "public" })).toBe(
      false
    );
    expect(
      canViewPublishedContent(brother, scopedBrotherContent, { audience: "brother" })
    ).toBe(true);
    expect(
      canViewPublishedContent(
        { ...brother, memberOrganizationUnitIds: [organizationUnitB] },
        scopedBrotherContent,
        { audience: "brother" }
      )
    ).toBe(false);
  });

  it("covers admin visibility paths for candidate, brother, officer, and admin records", () => {
    expect(
      canViewByVisibility(
        officer,
        { visibility: "CANDIDATE", targetOrganizationUnitId: organizationUnitA },
        { audience: "admin" }
      )
    ).toBe(true);
    expect(
      canViewByVisibility(
        officer,
        { visibility: "CANDIDATE", targetOrganizationUnitId: organizationUnitB },
        { audience: "admin" }
      )
    ).toBe(false);
    expect(
      canViewByVisibility(
        officer,
        { visibility: "BROTHER", targetOrganizationUnitId: organizationUnitA },
        { audience: "admin" }
      )
    ).toBe(true);
    expect(
      canViewByVisibility(
        superAdmin,
        { visibility: "OFFICER", targetOrganizationUnitId: organizationUnitB },
        { audience: "admin" }
      )
    ).toBe(true);
    expect(
      canViewByVisibility(
        superAdmin,
        { visibility: "ADMIN", targetOrganizationUnitId: organizationUnitB },
        { audience: "admin" }
      )
    ).toBe(true);
    expect(
      canViewByVisibility(
        brother,
        { visibility: "ADMIN", targetOrganizationUnitId: organizationUnitA },
        { audience: "admin" }
      )
    ).toBe(false);
  });

  it("supports date objects and explicit clocks for published content availability", () => {
    const record = {
      status: "PUBLISHED" as const,
      visibility: "PUBLIC" as const,
      publishedAt: new Date("2026-01-02T00:00:00.000Z")
    };

    expect(
      canViewPublishedContent(null, record, {
        audience: "public",
        now: new Date("2026-01-01T00:00:00.000Z")
      })
    ).toBe(false);
    expect(
      canViewPublishedContent(null, record, {
        audience: "public",
        now: new Date("2026-01-03T00:00:00.000Z")
      })
    ).toBe(true);
    expect(
      canViewPublishedContent(
        null,
        { status: "PUBLISHED", visibility: "FAMILY_OPEN" },
        { audience: "public" }
      )
    ).toBe(true);
  });
});
