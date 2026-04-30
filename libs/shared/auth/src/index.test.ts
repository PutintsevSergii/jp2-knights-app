import { describe, expect, it } from "vitest";
import {
  assertActive,
  canAccessAdminLite,
  canAccessBrotherMode,
  canAccessCandidateMode,
  canAdministerChoragiew,
  canReadAdminScopedRecord,
  canViewByVisibility,
  hasAnyRole,
  hasRole,
  type Principal
} from "./index.js";

const choragiewA = "choragiew-a";
const choragiewB = "choragiew-b";

const candidate: Principal = {
  id: "candidate_1",
  roles: ["CANDIDATE"],
  status: "active",
  candidateChoragiewId: choragiewA
};

const brother: Principal = {
  id: "brother_1",
  roles: ["BROTHER"],
  status: "active",
  memberChoragiewIds: [choragiewA]
};

const officer: Principal = {
  id: "officer_1",
  roles: ["OFFICER"],
  status: "active",
  officerChoragiewIds: [choragiewA]
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
    expect(canAccessBrotherMode(brother)).toBe(true);
    expect(canAccessAdminLite(officer)).toBe(true);
    expect(canAccessAdminLite(superAdmin)).toBe(true);
    expect(canAccessAdminLite(brother)).toBe(false);
    expect(canAccessBrotherMode({ ...brother, status: "inactive" })).toBe(false);
  });

  it("scopes officer administration to assigned choragiew", () => {
    expect(canAdministerChoragiew(officer, choragiewA)).toBe(true);
    expect(canAdministerChoragiew(officer, choragiewB)).toBe(false);
    expect(canAdministerChoragiew(superAdmin, choragiewB)).toBe(true);
    expect(canAdministerChoragiew({ ...officer, status: "inactive" }, choragiewA)).toBe(false);
  });

  it("keeps unassigned admin records explicit for officers", () => {
    expect(canReadAdminScopedRecord(null, choragiewA)).toBe(false);
    expect(canReadAdminScopedRecord(candidate, choragiewA)).toBe(false);
    expect(canReadAdminScopedRecord(officer, null)).toBe(false);
    expect(canReadAdminScopedRecord(officer, null, { allowUnassignedForOfficer: true })).toBe(true);
    expect(canReadAdminScopedRecord(officer, choragiewA)).toBe(true);
    expect(canReadAdminScopedRecord(officer, choragiewB)).toBe(false);
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
        { visibility: "CHORAGIEW", targetChoragiewId: choragiewA },
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

  it("requires explicit candidate permission for choragiew visibility", () => {
    const scopedRecord = { visibility: "CHORAGIEW" as const, targetChoragiewId: choragiewA };

    expect(canViewByVisibility(candidate, scopedRecord, { audience: "candidate" })).toBe(false);
    expect(
      canViewByVisibility(candidate, scopedRecord, {
        audience: "candidate",
        candidateCanAccessChoragiew: true
      })
    ).toBe(true);
    expect(
      canViewByVisibility(
        candidate,
        { ...scopedRecord, targetChoragiewId: choragiewB },
        {
          audience: "candidate",
          candidateCanAccessChoragiew: true
        }
      )
    ).toBe(false);
  });

  it("limits brother choragiew visibility to own choragiew", () => {
    expect(canViewByVisibility(brother, { visibility: "CHORAGIEW" }, { audience: "brother" })).toBe(
      false
    );
    expect(
      canViewByVisibility(
        brother,
        { visibility: "CHORAGIEW", targetChoragiewId: choragiewA },
        { audience: "brother" }
      )
    ).toBe(true);
    expect(
      canViewByVisibility(
        brother,
        { visibility: "CHORAGIEW", targetChoragiewId: choragiewB },
        { audience: "brother" }
      )
    ).toBe(false);
  });

  it("keeps officer admin visibility scoped by choragiew", () => {
    expect(
      canViewByVisibility(
        officer,
        { visibility: "BROTHER", targetChoragiewId: choragiewA },
        { audience: "admin" }
      )
    ).toBe(true);
    expect(
      canViewByVisibility(
        officer,
        { visibility: "BROTHER", targetChoragiewId: choragiewB },
        { audience: "admin" }
      )
    ).toBe(false);
    expect(
      canViewByVisibility(
        superAdmin,
        { visibility: "BROTHER", targetChoragiewId: choragiewB },
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
});
