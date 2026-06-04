import { ADMIN_PRIVACY_WORKFLOWS, RETENTION_BUCKET_METADATA } from "@jp2/shared-types";
import { adminContentTheme, type AdminContentTheme } from "./admin-content-screen-contracts.js";
import type { AdminContentScreenState } from "./admin-content-api.js";
import {
  adminStatusCodeForState,
  escapeHtml,
  renderAdminDocument,
  renderAdminEmptyState,
  renderAdminHeader
} from "./admin-render-primitives.js";
import type { AdminWebRouteDefinition } from "./admin-web-route-types.js";

export type AdminPrivacyWorkflowRoute = "/admin/privacy-workflows";

export interface AdminPrivacyWorkflowShellRouteMetadata {
  path: AdminPrivacyWorkflowRoute;
  label: string;
  screenRoute: "AdminPrivacyWorkflowList";
}

export interface AdminPrivacyWorkflowOperationRow {
  id: "export" | "erase";
  label: string;
  method: "GET" | "POST";
  auditAction: string;
  destructive: boolean;
}

export interface AdminPrivacyWorkflowRow {
  id: string;
  label: string;
  entityType: string;
  retentionBucket: string;
  retentionLabel: string;
  durationPolicy: string;
  requiredCapability: string;
  examples: string;
  operations: AdminPrivacyWorkflowOperationRow[];
}

export interface AdminPrivacyWorkflowScreen {
  route: "AdminPrivacyWorkflowList";
  state: AdminContentScreenState;
  title: string;
  body: string;
  rows: AdminPrivacyWorkflowRow[];
  demoChromeVisible: boolean;
  theme: AdminContentTheme;
}

export const adminPrivacyWorkflowShellRoutes: readonly AdminPrivacyWorkflowShellRouteMetadata[] = [
  {
    path: "/admin/privacy-workflows",
    label: "Privacy Workflows",
    screenRoute: "AdminPrivacyWorkflowList"
  }
];

export const adminPrivacyWorkflowRouteDefinition: AdminWebRouteDefinition = {
  matches: (path) => path === "/admin/privacy-workflows",
  render: (context) => Promise.resolve({
    title: "Admin Privacy Workflows",
    ...renderAdminPrivacyWorkflowRoute({
      runtimeMode: context.runtimeMode,
      canManagePrivacy: context.canManagePrivacy
    })
  })
};

export function buildAdminPrivacyWorkflowScreen(options: {
  runtimeMode: "api" | "demo" | "test";
  canManagePrivacy: boolean;
}): AdminPrivacyWorkflowScreen {
  if (!options.canManagePrivacy) {
    return {
      route: "AdminPrivacyWorkflowList",
      state: "forbidden",
      title: "Access Denied",
      body: "Super Admin privacy workflow access is required.",
      rows: [],
      demoChromeVisible: options.runtimeMode === "demo",
      theme: adminContentTheme
    };
  }

  return {
    route: "AdminPrivacyWorkflowList",
    state: "ready",
    title: "Privacy Workflows",
    body: "Review implemented subject export and legal erasure workflow metadata.",
    rows: privacyWorkflowRows(),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: adminContentTheme
  };
}

export function renderAdminPrivacyWorkflowRoute(options: {
  runtimeMode: "api" | "demo" | "test";
  canManagePrivacy: boolean;
}) {
  const screen = buildAdminPrivacyWorkflowScreen(options);

  return {
    path: "/admin/privacy-workflows" as const,
    route: screen.route,
    state: screen.state,
    statusCode: adminStatusCodeForState(screen.state),
    document: renderAdminDocument({
      title: "Admin Privacy Workflows",
      body: renderAdminPrivacyWorkflowScreen(screen)
    })
  };
}

export function renderAdminPrivacyWorkflowScreen(screen: AdminPrivacyWorkflowScreen): string {
  return [
    `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}">`,
    renderStyle(screen),
    renderAdminHeader({
      title: screen.title,
      body: screen.body,
      actions: [],
      demoChromeVisible: screen.demoChromeVisible,
      renderAction: () => ""
    }),
    renderRows(screen),
    "</section>"
  ].join("");
}

function privacyWorkflowRows(): AdminPrivacyWorkflowRow[] {
  return Object.entries(ADMIN_PRIVACY_WORKFLOWS).map(([id, workflow]) => {
    const retention = RETENTION_BUCKET_METADATA[workflow.retentionBucket];

    return {
      id,
      label: workflow.label,
      entityType: workflow.entityType,
      retentionBucket: workflow.retentionBucket,
      retentionLabel: retention.label,
      durationPolicy: retention.durationPolicy,
      requiredCapability: retention.requiredCapability,
      examples: retention.examples.join(", "),
      operations: [
        {
          id: "export",
          label: "Export",
          method: workflow.operations.export.method,
          auditAction: workflow.operations.export.auditAction,
          destructive: workflow.operations.export.destructive
        },
        {
          id: "erase",
          label: "Erase",
          method: workflow.operations.erase.method,
          auditAction: workflow.operations.erase.auditAction,
          destructive: workflow.operations.erase.destructive
        }
      ]
    };
  });
}

function renderRows(screen: AdminPrivacyWorkflowScreen): string {
  if (screen.rows.length === 0) {
    return renderAdminEmptyState(screen.title, screen.body);
  }

  return [
    '<table class="admin-content__table">',
    "<thead><tr>",
    '<th scope="col">Workflow</th>',
    '<th scope="col">Retention</th>',
    '<th scope="col">Operations</th>',
    "</tr></thead>",
    "<tbody>",
    screen.rows.map(renderRow).join(""),
    "</tbody></table>"
  ].join("");
}

function renderRow(row: AdminPrivacyWorkflowRow): string {
  return [
    `<tr data-workflow-id="${escapeHtml(row.id)}">`,
    "<td>",
    `<strong>${escapeHtml(row.label)}</strong>`,
    `<div class="admin-content__meta">${escapeHtml(row.entityType)}</div>`,
    "</td>",
    "<td>",
    `<span class="admin-content__badge">${escapeHtml(row.retentionLabel)}</span>`,
    `<div class="admin-content__meta">${escapeHtml(row.retentionBucket)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.requiredCapability)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.durationPolicy)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.examples)}</div>`,
    "</td>",
    `<td><div class="admin-content__stack">${row.operations.map(renderOperation).join("")}</div></td>`,
    "</tr>"
  ].join("");
}

function renderOperation(operation: AdminPrivacyWorkflowOperationRow): string {
  return [
    `<div class="admin-content__operation" data-operation="${operation.id}" data-method="${operation.method}" data-destructive="${String(operation.destructive)}">`,
    `<strong>${escapeHtml(operation.label)}</strong>`,
    `<div class="admin-content__meta">${escapeHtml(operation.method)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(operation.auditAction)}</div>`,
    "</div>"
  ].join("");
}

function renderStyle(screen: AdminPrivacyWorkflowScreen): string {
  return [
    "<style>",
    ".admin-content{",
    `background:${screen.theme.background};`,
    `color:${screen.theme.text};`,
    `font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;`,
    `padding:${screen.theme.spacing}px;`,
    "}",
    ".admin-content__header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px;}",
    ".admin-content__title{font-size:24px;font-weight:700;margin:0 0 4px;}",
    `.admin-content__body{color:${screen.theme.mutedText};margin:0;}`,
    ".admin-content__actions{display:flex;gap:8px;flex-wrap:wrap;}",
    `.admin-content__table{width:100%;border-collapse:collapse;background:${screen.theme.surface};border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;overflow:hidden;}`,
    `.admin-content__table th,.admin-content__table td{border-bottom:1px solid ${screen.theme.border};padding:12px;text-align:left;vertical-align:top;}`,
    `.admin-content__meta{color:${screen.theme.mutedText};font-size:13px;}`,
    `.admin-content__badge{display:inline-block;border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:2px 6px;font-size:12px;}`,
    ".admin-content__stack{display:grid;gap:8px;}",
    `.admin-content__operation{border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:8px;}`,
    `.admin-content__empty{background:${screen.theme.surface};border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:16px;}`,
    ".admin-content__demo{font-size:12px;font-weight:700;text-transform:uppercase;}",
    "</style>"
  ].join("");
}
