import {
  adminAuditLogShellRoutes,
  type AdminAuditLogShellRouteMetadata
} from "./admin-audit-logs-shell.js";
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
import {
  adminPrivacyWorkflowShellRoutes,
  type AdminPrivacyWorkflowShellRouteMetadata
} from "./admin-privacy-workflows-screen.js";
import {
  adminRoadmapAssignmentShellRoutes,
  type AdminRoadmapAssignmentShellRouteMetadata
} from "./admin-roadmap-assignments-shell.js";
import {
  adminRoadmapSubmissionShellRoutes,
  type AdminRoadmapSubmissionShellRouteMetadata
} from "./admin-roadmap-submissions-shell.js";
import {
  adminRoadmapDefinitionShellRoutes,
  type AdminRoadmapDefinitionShellRouteMetadata
} from "./admin-roadmap-definitions-shell.js";

export type AdminShellRoute =
  | "/admin/dashboard"
  | AdminAuditLogShellRouteMetadata["path"]
  | AdminIdentityAccessShellRouteMetadata["path"]
  | AdminCandidateRequestShellRouteMetadata["path"]
  | AdminCandidateShellRouteMetadata["path"]
  | AdminOrganizationUnitShellRouteMetadata["path"]
  | AdminPrivacyWorkflowShellRouteMetadata["path"]
  | AdminRoadmapAssignmentShellRouteMetadata["path"]
  | AdminRoadmapDefinitionShellRouteMetadata["path"]
  | AdminRoadmapSubmissionShellRouteMetadata["path"]
  | AdminContentShellRouteMetadata["path"];

export interface AdminShellRouteMetadata {
  path: AdminShellRoute;
  label: string;
  screenRoute:
    | "AdminDashboard"
    | AdminAuditLogShellRouteMetadata["screenRoute"]
    | AdminIdentityAccessShellRouteMetadata["screenRoute"]
    | AdminCandidateRequestShellRouteMetadata["screenRoute"]
    | AdminCandidateShellRouteMetadata["screenRoute"]
    | AdminOrganizationUnitShellRouteMetadata["screenRoute"]
    | AdminPrivacyWorkflowShellRouteMetadata["screenRoute"]
    | AdminRoadmapAssignmentShellRouteMetadata["screenRoute"]
    | AdminRoadmapDefinitionShellRouteMetadata["screenRoute"]
    | AdminRoadmapSubmissionShellRouteMetadata["screenRoute"]
    | AdminContentShellRouteMetadata["screenRoute"];
}

export const adminShellRoutes: readonly AdminShellRouteMetadata[] = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    screenRoute: "AdminDashboard"
  },
  ...adminAuditLogShellRoutes,
  ...adminIdentityAccessShellRoutes,
  ...adminCandidateRequestShellRoutes,
  ...adminCandidateShellRoutes,
  ...adminOrganizationUnitShellRoutes,
  ...adminPrivacyWorkflowShellRoutes,
  ...adminRoadmapAssignmentShellRoutes,
  ...adminRoadmapDefinitionShellRoutes,
  ...adminRoadmapSubmissionShellRoutes,
  ...adminContentShellRoutes
];
