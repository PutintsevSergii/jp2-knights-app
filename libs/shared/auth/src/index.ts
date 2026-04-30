import type { Role, UserStatus, Visibility } from "@jp2/shared-types";

export interface Principal {
  id: string;
  roles: readonly Role[];
  status: UserStatus;
  candidateChoragiewId?: string | null;
  memberChoragiewIds?: readonly string[];
  officerChoragiewIds?: readonly string[];
}

export function hasRole(principal: Principal, role: Role): boolean {
  return principal.roles.includes(role);
}

export function hasAnyRole(principal: Principal, roles: readonly Role[]): boolean {
  return roles.some((role) => hasRole(principal, role));
}

export function isActive(principal: Principal): boolean {
  return principal.status === "active";
}

export function assertActive(principal: Principal): void {
  if (!isActive(principal)) {
    throw new Error("Inactive principals cannot access protected app modes.");
  }
}

export function canAccessCandidateMode(principal: Principal | null | undefined): boolean {
  return Boolean(principal && isActive(principal) && hasRole(principal, "CANDIDATE"));
}

export function canAccessBrotherMode(principal: Principal | null | undefined): boolean {
  return Boolean(principal && isActive(principal) && hasRole(principal, "BROTHER"));
}

export function canAccessAdminLite(principal: Principal | null | undefined): boolean {
  return Boolean(
    principal && isActive(principal) && hasAnyRole(principal, ["OFFICER", "SUPER_ADMIN"])
  );
}

export function canAdministerChoragiew(
  principal: Principal | null | undefined,
  choragiewId: string
): boolean {
  if (!principal || !isActive(principal)) {
    return false;
  }

  if (hasRole(principal, "SUPER_ADMIN")) {
    return true;
  }

  return (
    hasRole(principal, "OFFICER") && (principal.officerChoragiewIds ?? []).includes(choragiewId)
  );
}

export function canReadAdminScopedRecord(
  principal: Principal | null | undefined,
  scopeChoragiewId: string | null | undefined,
  options: { allowUnassignedForOfficer?: boolean } = {}
): boolean {
  if (!principal || !isActive(principal)) {
    return false;
  }

  if (hasRole(principal, "SUPER_ADMIN")) {
    return true;
  }

  if (!hasRole(principal, "OFFICER")) {
    return false;
  }

  if (!scopeChoragiewId) {
    return options.allowUnassignedForOfficer === true;
  }

  return (principal.officerChoragiewIds ?? []).includes(scopeChoragiewId);
}

export type AccessAudience = "public" | "candidate" | "brother" | "admin";

export interface VisibilityRecord {
  visibility: Visibility;
  targetChoragiewId?: string | null;
}

export interface VisibilityAccessOptions {
  audience: AccessAudience;
  candidateCanAccessChoragiew?: boolean;
  allowUnscopedOfficerContent?: boolean;
}

export function canViewByVisibility(
  principal: Principal | null | undefined,
  record: VisibilityRecord,
  options: VisibilityAccessOptions
): boolean {
  if (record.visibility === "PUBLIC" || record.visibility === "FAMILY_OPEN") {
    return true;
  }

  if (options.audience === "public" || !principal || !isActive(principal)) {
    return false;
  }

  switch (record.visibility) {
    case "CANDIDATE":
      return canViewCandidateContent(principal, record, options);
    case "BROTHER":
      return canViewBrotherContent(principal, record, options);
    case "CHORAGIEW":
      return canViewChoragiewContent(principal, record, options);
    case "OFFICER":
      return options.audience === "admin" && canViewOfficerContent(principal, record, options);
    case "ADMIN":
      return (
        options.audience === "admin" &&
        canReadAdminScopedRecordForVisibility(principal, record, options)
      );
  }
}

function canViewCandidateContent(
  principal: Principal,
  record: VisibilityRecord,
  options: VisibilityAccessOptions
): boolean {
  if (options.audience === "candidate" && hasRole(principal, "CANDIDATE")) {
    return true;
  }

  return (
    options.audience === "admin" &&
    canReadAdminScopedRecordForVisibility(principal, record, options)
  );
}

function canViewBrotherContent(
  principal: Principal,
  record: VisibilityRecord,
  options: VisibilityAccessOptions
): boolean {
  if (options.audience === "brother" && hasRole(principal, "BROTHER")) {
    return true;
  }

  return (
    options.audience === "admin" &&
    canReadAdminScopedRecordForVisibility(principal, record, options)
  );
}

function canViewChoragiewContent(
  principal: Principal,
  record: VisibilityRecord,
  options: VisibilityAccessOptions
): boolean {
  if (!record.targetChoragiewId) {
    return false;
  }

  if (options.audience === "brother" && hasRole(principal, "BROTHER")) {
    return (principal.memberChoragiewIds ?? []).includes(record.targetChoragiewId);
  }

  if (
    options.audience === "candidate" &&
    options.candidateCanAccessChoragiew === true &&
    hasRole(principal, "CANDIDATE")
  ) {
    return principal.candidateChoragiewId === record.targetChoragiewId;
  }

  return (
    options.audience === "admin" &&
    canReadAdminScopedRecordForVisibility(principal, record, options)
  );
}

function canViewOfficerContent(
  principal: Principal,
  record: VisibilityRecord,
  options: VisibilityAccessOptions
): boolean {
  if (!hasAnyRole(principal, ["OFFICER", "SUPER_ADMIN"])) {
    return false;
  }

  return canReadAdminScopedRecordForVisibility(principal, record, options);
}

function canReadAdminScopedRecordForVisibility(
  principal: Principal,
  record: VisibilityRecord,
  options: VisibilityAccessOptions
): boolean {
  const scopeOptions =
    options.allowUnscopedOfficerContent === undefined
      ? {}
      : { allowUnassignedForOfficer: options.allowUnscopedOfficerContent };

  return canReadAdminScopedRecord(principal, record.targetChoragiewId, scopeOptions);
}
