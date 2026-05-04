import {
  adminContentShellRoutes,
  type AdminContentShellRouteMetadata
} from "./admin-content-shell.js";

export type AdminShellRoute = "/admin/dashboard" | AdminContentShellRouteMetadata["path"];

export interface AdminShellRouteMetadata {
  path: AdminShellRoute;
  label: string;
  screenRoute: "AdminDashboard" | AdminContentShellRouteMetadata["screenRoute"];
}

export const adminShellRoutes: readonly AdminShellRouteMetadata[] = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    screenRoute: "AdminDashboard"
  },
  ...adminContentShellRoutes
];
