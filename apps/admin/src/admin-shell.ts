import {
  adminContentShellRoutes,
  type AdminContentShellRouteMetadata
} from "./admin-content-shell.js";
import {
  adminCandidateRequestShellRoutes,
  type AdminCandidateRequestShellRouteMetadata
} from "./admin-candidate-requests-shell.js";
import {
  adminCandidateShellRoutes,
  type AdminCandidateShellRouteMetadata
} from "./admin-candidates-shell.js";
import {
  adminIdentityAccessShellRoutes,
  type AdminIdentityAccessShellRouteMetadata
} from "./admin-identity-access-shell.js";
import {
  adminOrganizationUnitShellRoutes,
  type AdminOrganizationUnitShellRouteMetadata
} from "./admin-organization-units-shell.js";

export type AdminShellRoute =
  | "/admin/dashboard"
  | AdminIdentityAccessShellRouteMetadata["path"]
  | AdminCandidateRequestShellRouteMetadata["path"]
  | AdminCandidateShellRouteMetadata["path"]
  | AdminOrganizationUnitShellRouteMetadata["path"]
  | AdminContentShellRouteMetadata["path"];

export interface AdminShellRouteMetadata {
  path: AdminShellRoute;
  label: string;
  screenRoute:
    | "AdminDashboard"
    | AdminIdentityAccessShellRouteMetadata["screenRoute"]
    | AdminCandidateRequestShellRouteMetadata["screenRoute"]
    | AdminCandidateShellRouteMetadata["screenRoute"]
    | AdminOrganizationUnitShellRouteMetadata["screenRoute"]
    | AdminContentShellRouteMetadata["screenRoute"];
}

export const adminShellRoutes: readonly AdminShellRouteMetadata[] = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    screenRoute: "AdminDashboard"
  },
  ...adminIdentityAccessShellRoutes,
  ...adminCandidateRequestShellRoutes,
  ...adminCandidateShellRoutes,
  ...adminOrganizationUnitShellRoutes,
  ...adminContentShellRoutes
];
