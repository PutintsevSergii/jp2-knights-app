import { adminAuditLogRouteDefinition } from "./admin-audit-logs-shell.js";
import { adminCandidateRequestRouteDefinition } from "./admin-candidate-requests-shell.js";
import { adminCandidateRouteDefinition } from "./admin-candidates-shell.js";
import { adminContentRouteDefinition } from "./admin-content-shell.js";
import { adminDashboardRouteDefinition } from "./admin-dashboard-screen.js";
import { adminIdentityAccessRouteDefinition } from "./admin-identity-access-shell.js";
import { adminOrganizationUnitRouteDefinition } from "./admin-organization-units-shell.js";
import { adminPrivacyWorkflowRouteDefinition } from "./admin-privacy-workflows-screen.js";
import { adminRoadmapAssignmentRouteDefinition } from "./admin-roadmap-assignments-shell.js";
import { adminRoadmapDefinitionRouteDefinition } from "./admin-roadmap-definitions-shell.js";
import { adminRoadmapSubmissionRouteDefinition } from "./admin-roadmap-submissions-shell.js";
import type { AdminWebRouteDefinition } from "./admin-web-route-types.js";

export function normalizeAdminPath(path: string): string {
  const url = new URL(path, "http://admin.local");

  return url.pathname === "/admin" ? "/admin/dashboard" : url.pathname;
}

export function findAdminWebRoute(path: string): AdminWebRouteDefinition | undefined {
  return adminWebRouteDefinitions.find((route) => route.matches(path));
}

const adminWebRouteDefinitions: readonly AdminWebRouteDefinition[] = [
  adminDashboardRouteDefinition,
  adminAuditLogRouteDefinition,
  adminIdentityAccessRouteDefinition,
  adminCandidateRequestRouteDefinition,
  adminCandidateRouteDefinition,
  adminOrganizationUnitRouteDefinition,
  adminPrivacyWorkflowRouteDefinition,
  adminRoadmapAssignmentRouteDefinition,
  adminRoadmapDefinitionRouteDefinition,
  adminRoadmapSubmissionRouteDefinition,
  adminContentRouteDefinition
];
