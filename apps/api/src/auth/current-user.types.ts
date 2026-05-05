import type { MobileMode, Principal } from "@jp2/shared-auth";
import type { Role, UserStatus } from "@jp2/shared-types";

export interface CurrentUserPrincipal extends Principal {
  email: string;
  displayName: string;
  preferredLanguage?: string | null;
  approval?: CurrentUserApproval | null;
}

export interface CurrentUserApproval {
  state: "pending" | "rejected" | "expired";
  expiresAt: string | null;
  scopeOrganizationUnitId: string | null;
}

export interface RequestWithPrincipal {
  principal?: CurrentUserPrincipal;
  headers?: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string | undefined>;
  body?: unknown;
}

export interface CurrentUserResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    preferredLanguage: string | null;
    status: UserStatus;
    roles: readonly Role[];
  };
  access: {
    mobileMode: MobileMode;
    adminLite: boolean;
    candidateOrganizationUnitId: string | null;
    memberOrganizationUnitIds: readonly string[];
    officerOrganizationUnitIds: readonly string[];
    approval: CurrentUserApproval | null;
  };
}

export interface AuthSessionRequest {
  idToken: string;
  csrfToken?: string;
}

export interface AuthSessionResponse {
  currentUser: CurrentUserResponse;
  session: {
    transport: "bearer" | "cookie";
    expiresAt: string | null;
  };
}

export interface AuthMutationResponse {
  success: true;
}
