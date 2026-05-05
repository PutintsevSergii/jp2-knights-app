import {
  adminContentShellRoutes,
  type AdminContentShellRouteMetadata
} from "./admin-content-shell.js";
import {
  adminCandidateRequestShellRoutes,
  type AdminCandidateRequestShellRouteMetadata
} from "./admin-candidate-requests-shell.js";
import {
  adminOrganizationUnitShellRoutes,
  type AdminOrganizationUnitShellRouteMetadata
} from "./admin-organization-units-shell.js";

export type AdminShellRoute =
  | "/admin/dashboard"
  | AdminCandidateRequestShellRouteMetadata["path"]
  | AdminOrganizationUnitShellRouteMetadata["path"]
  | AdminContentShellRouteMetadata["path"];

export interface AdminShellRouteMetadata {
  path: AdminShellRoute;
  label: string;
  screenRoute:
    | "AdminDashboard"
    | AdminCandidateRequestShellRouteMetadata["screenRoute"]
    | AdminOrganizationUnitShellRouteMetadata["screenRoute"]
    | AdminContentShellRouteMetadata["screenRoute"];
}

export const adminShellRoutes: readonly AdminShellRouteMetadata[] = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    screenRoute: "AdminDashboard"
  },
  ...adminCandidateRequestShellRoutes,
  ...adminOrganizationUnitShellRoutes,
  ...adminContentShellRoutes
];
