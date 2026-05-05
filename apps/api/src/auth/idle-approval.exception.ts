import { ForbiddenException } from "@nestjs/common";
import type { CurrentUserApproval, CurrentUserPrincipal } from "./current-user.types.js";

export const IDLE_APPROVAL_REQUIRED_CODE = "IDLE_APPROVAL_REQUIRED";

export function hasIdleApprovalState(
  principal: CurrentUserPrincipal | null | undefined
): principal is CurrentUserPrincipal & { approval: CurrentUserApproval } {
  return Boolean(principal?.approval);
}

export function idleApprovalRequiredException(principal: CurrentUserPrincipal): ForbiddenException {
  const approval = principal.approval;

  return new ForbiddenException({
    code: IDLE_APPROVAL_REQUIRED_CODE,
    message: "Your account is waiting for approval before private app access is available.",
    details: approval
      ? [
          {
            state: approval.state,
            expiresAt: approval.expiresAt,
            scopeOrganizationUnitId: approval.scopeOrganizationUnitId
          }
        ]
      : []
  });
}

export function assertNotIdleApprovalPrincipal(principal: CurrentUserPrincipal): void {
  if (hasIdleApprovalState(principal)) {
    throw idleApprovalRequiredException(principal);
  }
}
