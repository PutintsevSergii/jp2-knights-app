import type { ContentStatus, Role, UserStatus, Visibility } from "@jp2/shared-types";

export interface Principal {
  id: string;
  roles: readonly Role[];
  status: UserStatus;
  candidateOrganizationUnitId?: string | null;
  memberOrganizationUnitIds?: readonly string[];
  officerOrganizationUnitIds?: readonly string[];
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

export type MobileMode = "public" | "candidate" | "brother";

export function resolveMobileMode(principal: Principal | null | undefined): MobileMode {
  if (!principal || !isActive(principal)) {
    return "public";
  }

  if (hasRole(principal, "BROTHER")) {
    return "brother";
  }

  if (hasRole(principal, "CANDIDATE")) {
    return "candidate";
  }

  return "public";
}

export function canAdministerOrganizationUnit(
  principal: Principal | null | undefined,
  organizationUnitId: string
): boolean {
  if (!principal || !isActive(principal)) {
    return false;
  }

  if (hasRole(principal, "SUPER_ADMIN")) {
    return true;
  }

  return (
    hasRole(principal, "OFFICER") &&
    (principal.officerOrganizationUnitIds ?? []).includes(organizationUnitId)
  );
}

export function canReadAdminScopedRecord(
  principal: Principal | null | undefined,
  scopeOrganizationUnitId: string | null | undefined,
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

  if (!scopeOrganizationUnitId) {
    return options.allowUnassignedForOfficer === true;
  }

  return (principal.officerOrganizationUnitIds ?? []).includes(scopeOrganizationUnitId);
}

export type AccessAudience = "public" | "candidate" | "brother" | "admin";

export interface VisibilityRecord {
  visibility: Visibility;
  targetOrganizationUnitId?: string | null;
}

export interface PublishableVisibilityRecord extends VisibilityRecord {
  status: ContentStatus;
  publishedAt?: Date | string | null;
  archivedAt?: Date | string | null;
}

export interface VisibilityAccessOptions {
  audience: AccessAudience;
  candidateCanAccessOrganizationUnit?: boolean;
  allowUnscopedOfficerContent?: boolean;
  now?: Date;
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
    case "ORGANIZATION_UNIT":
      return canViewOrganizationUnitContent(principal, record, options);
    case "OFFICER":
      return options.audience === "admin" && canViewOfficerContent(principal, record, options);
    case "ADMIN":
      return (
        options.audience === "admin" &&
        canReadAdminScopedRecordForVisibility(principal, record, options)
      );
  }
}

export function canViewPublishedContent(
  principal: Principal | null | undefined,
  record: PublishableVisibilityRecord,
  options: VisibilityAccessOptions
): boolean {
  if (record.status !== "PUBLISHED" || record.archivedAt) {
    return false;
  }

  if (record.publishedAt && toTime(record.publishedAt) > (options.now ?? new Date()).getTime()) {
    return false;
  }

  return canViewByVisibility(principal, record, options);
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

function canViewOrganizationUnitContent(
  principal: Principal,
  record: VisibilityRecord,
  options: VisibilityAccessOptions
): boolean {
  if (!record.targetOrganizationUnitId) {
    return false;
  }

  if (options.audience === "brother" && hasRole(principal, "BROTHER")) {
    return (principal.memberOrganizationUnitIds ?? []).includes(record.targetOrganizationUnitId);
  }

  if (
    options.audience === "candidate" &&
    options.candidateCanAccessOrganizationUnit === true &&
    hasRole(principal, "CANDIDATE")
  ) {
    return principal.candidateOrganizationUnitId === record.targetOrganizationUnitId;
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

  return canReadAdminScopedRecord(principal, record.targetOrganizationUnitId, scopeOptions);
}

function toTime(value: Date | string): number {
  return value instanceof Date ? value.getTime() : Date.parse(value);
}
