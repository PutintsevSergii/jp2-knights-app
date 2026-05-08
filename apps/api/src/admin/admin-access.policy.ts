import { ForbiddenException } from "@nestjs/common";
import { canAccessAdminLite, hasRole } from "@jp2/shared-auth";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";

export function requireAdminLite(principal: CurrentUserPrincipal): void {
  if (!canAccessAdminLite(principal)) {
    assertNotIdleApprovalPrincipal(principal);
    throw new ForbiddenException("Admin Lite access is required.");
  }
}

export function requireSuperAdmin(principal: CurrentUserPrincipal): void {
  if (!hasRole(principal, "SUPER_ADMIN")) {
    assertNotIdleApprovalPrincipal(principal);
    throw new ForbiddenException("Super Admin access is required.");
  }
}

export function adminScopeFor(principal: CurrentUserPrincipal): readonly string[] | null {
  return hasRole(principal, "SUPER_ADMIN") ? null : (principal.officerOrganizationUnitIds ?? []);
}

export function canUseAdminOrganizationUnit(
  principal: CurrentUserPrincipal,
  organizationUnitId: string
): boolean {
  return (
    hasRole(principal, "SUPER_ADMIN") ||
    (principal.officerOrganizationUnitIds ?? []).includes(organizationUnitId)
  );
}

export function requireAdminOrganizationUnitScope(
  principal: CurrentUserPrincipal,
  organizationUnitId: string,
  message: string
): void {
  if (!canUseAdminOrganizationUnit(principal, organizationUnitId)) {
    throw new ForbiddenException(message);
  }
}

export function requireScopedAdminWrite(
  principal: CurrentUserPrincipal,
  targetOrganizationUnitId: string | null,
  message: string
): void {
  requireAdminLite(principal);

  if (hasRole(principal, "SUPER_ADMIN")) {
    return;
  }

  if (targetOrganizationUnitId && canUseAdminOrganizationUnit(principal, targetOrganizationUnitId)) {
    return;
  }

  throw new ForbiddenException(message);
}
