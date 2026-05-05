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
  adminOrganizationUnitShellRoutes,
  type AdminOrganizationUnitShellRouteMetadata
} from "./admin-organization-units-shell.js";

export type AdminShellRoute =
  | "/admin/dashboard"
  | AdminCandidateRequestShellRouteMetadata["path"]
  | AdminCandidateShellRouteMetadata["path"]
  | AdminOrganizationUnitShellRouteMetadata["path"]
  | AdminContentShellRouteMetadata["path"];

export interface AdminShellRouteMetadata {
  path: AdminShellRoute;
  label: string;
  screenRoute:
    | "AdminDashboard"
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
  ...adminCandidateRequestShellRoutes,
  ...adminCandidateShellRoutes,
  ...adminOrganizationUnitShellRoutes,
  ...adminContentShellRoutes
];
