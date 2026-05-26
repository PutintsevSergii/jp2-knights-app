import { adminScopeFor } from "./admin-access.policy.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";

export type AdminContentScope =
  | { kind: "global" }
  | { kind: "scoped"; organizationUnitIds: readonly string[] };

export function adminContentScopeFor(principal: CurrentUserPrincipal): AdminContentScope {
  return adminManageableContentScope(adminScopeFor(principal));
}

export function adminManageableContentScope(
  scopeOrganizationUnitIds: readonly string[] | null
): AdminContentScope {
  return scopeOrganizationUnitIds === null
    ? { kind: "global" }
    : { kind: "scoped", organizationUnitIds: scopeOrganizationUnitIds };
}
