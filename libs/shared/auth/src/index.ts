import type { Role } from "@jp2/shared-types";

export interface Principal {
  id: string;
  roles: readonly Role[];
  status: "active" | "inactive" | "invited" | "archived";
}

export function hasRole(principal: Principal, role: Role): boolean {
  return principal.roles.includes(role);
}

export function assertActive(principal: Principal): void {
  if (principal.status !== "active") {
    throw new Error("Inactive principals cannot access protected app modes.");
  }
}
