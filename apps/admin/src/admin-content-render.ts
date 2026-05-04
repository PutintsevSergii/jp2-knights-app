import type {
  AdminContentAction,
  AdminContentListScreen,
  AdminContentRow
} from "./admin-content-screens.js";

export interface RenderedAdminContentScreen {
  route: AdminContentListScreen["route"];
  state: AdminContentListScreen["state"];
  html: string;
}

export function renderAdminContentListScreen(
  screen: AdminContentListScreen
): RenderedAdminContentScreen {
  return {
    route: screen.route,
    state: screen.state,
    html: [
      `<section class="admin-content" data-route="${screen.route}" data-state="${screen.state}">`,
      renderStyle(screen),
      renderHeader(screen),
      renderRows(screen),
      "</section>"
    ].join("")
  };
}

function renderStyle(screen: AdminContentListScreen): string {
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
    ".admin-content__table{width:100%;border-collapse:collapse;background:",
    screen.theme.surface,
    `;border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;overflow:hidden;}`,
    `.admin-content__table th,.admin-content__table td{border-bottom:1px solid ${screen.theme.border};padding:12px;text-align:left;vertical-align:top;}`,
    `.admin-content__meta{color:${screen.theme.mutedText};font-size:13px;}`,
    `.admin-content__badge{display:inline-block;border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:2px 6px;font-size:12px;}`,
    `.admin-content__button{background:${screen.theme.primaryAction};color:${screen.theme.primaryActionText};border:0;border-radius:${screen.theme.radius}px;padding:8px 10px;font-weight:600;}`,
    `.admin-content__button--secondary{background:${screen.theme.surface};color:${screen.theme.text};border:1px solid ${screen.theme.border};}`,
    `.admin-content__button--danger{background:${screen.theme.danger};color:${screen.theme.primaryActionText};}`,
    `.admin-content__empty{background:${screen.theme.surface};border:1px solid ${screen.theme.border};border-radius:${screen.theme.radius}px;padding:16px;}`,
    ".admin-content__demo{font-size:12px;font-weight:700;text-transform:uppercase;}",
    "</style>"
  ].join("");
}

function renderHeader(screen: AdminContentListScreen): string {
  const demoBadge = screen.demoChromeVisible
    ? '<span class="admin-content__demo" aria-label="Demo mode">Demo</span>'
    : "";

  return [
    '<header class="admin-content__header">',
    "<div>",
    `<h1 class="admin-content__title">${escapeHtml(screen.title)}</h1>`,
    `<p class="admin-content__body">${escapeHtml(screen.body)}</p>`,
    demoBadge,
    "</div>",
    `<div class="admin-content__actions">${screen.actions.map(renderAction).join("")}</div>`,
    "</header>"
  ].join("");
}

function renderRows(screen: AdminContentListScreen): string {
  if (screen.rows.length === 0) {
    return [
      '<div class="admin-content__empty" role="status">',
      `<strong>${escapeHtml(screen.title)}</strong>`,
      `<p>${escapeHtml(screen.body)}</p>`,
      "</div>"
    ].join("");
  }

  return [
    '<table class="admin-content__table">',
    "<thead><tr>",
    '<th scope="col">Title</th>',
    '<th scope="col">Status</th>',
    '<th scope="col">Visibility</th>',
    '<th scope="col">Scope</th>',
    '<th scope="col">Actions</th>',
    "</tr></thead>",
    "<tbody>",
    screen.rows.map(renderRow).join(""),
    "</tbody></table>"
  ].join("");
}

function renderRow(row: AdminContentRow): string {
  return [
    `<tr data-content-id="${escapeAttribute(row.id)}">`,
    "<td>",
    `<strong>${escapeHtml(row.title)}</strong>`,
    `<div class="admin-content__meta">${escapeHtml(row.primaryMeta)}</div>`,
    `<div class="admin-content__meta">${escapeHtml(row.secondaryMeta)}</div>`,
    "</td>",
    `<td><span class="admin-content__badge">${escapeHtml(row.status)}</span></td>`,
    `<td>${escapeHtml(row.visibility)}</td>`,
    `<td>${escapeHtml(row.targetOrganizationUnitId ?? "Global")}</td>`,
    `<td><div class="admin-content__actions">${row.actions.map(renderAction).join("")}</div></td>`,
    "</tr>"
  ].join("");
}

function renderAction(action: AdminContentAction): string {
  const modifier =
    action.id === "archive" || action.id === "cancel" ? " admin-content__button--danger" : "";
  const secondary =
    action.id === "refresh" || action.id === "edit" ? " admin-content__button--secondary" : "";

  return [
    `<button type="button" class="admin-content__button${modifier}${secondary}"`,
    ` data-action="${action.id}"`,
    ` data-target-route="${action.targetRoute}"`,
    action.targetId ? ` data-target-id="${escapeAttribute(action.targetId)}"` : "",
    ">",
    escapeHtml(action.label),
    "</button>"
  ].join("");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
