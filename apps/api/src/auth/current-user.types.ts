import type { MobileMode, Principal } from "@jp2/shared-auth";
import type { Role, UserStatus } from "@jp2/shared-types";

export interface CurrentUserPrincipal extends Principal {
  email: string;
  displayName: string;
  preferredLanguage?: string | null;
}

export interface RequestWithPrincipal {
  principal?: CurrentUserPrincipal;
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
  };
}
