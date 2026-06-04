import type { AdminContentScreenState } from "./admin-content-api.js";

export interface RenderAdminDocumentOptions {
  title: string;
  body: string;
}

export interface AdminRenderableAction {
  id: string;
  label: string;
  targetRoute: string;
  targetId?: string | undefined;
  requestMethod?: "GET" | "POST" | "PATCH" | undefined;
  requestPath?: string | undefined;
}

export interface RenderAdminHeaderOptions<TAction extends AdminRenderableAction> {
  title: string;
  body: string;
  actions: readonly TAction[];
  demoChromeVisible: boolean;
  renderAction: (action: TAction) => string;
}

export interface RenderAdminActionLinkOptions {
  href: string;
  danger?: boolean | undefined;
  secondary?: boolean | undefined;
}

export interface RenderAdminActionButtonOptions {
  danger?: boolean | undefined;
  secondary?: boolean | undefined;
}

export interface RenderAdminFormFieldOptions {
  label: string;
  name: string;
  value: string;
  required?: boolean | undefined;
  readOnly?: boolean | undefined;
  multiline?: boolean | undefined;
}

export function renderAdminDocument({ title, body }: RenderAdminDocumentOptions): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    "</head>",
    "<body>",
    `<main>${body}</main>`,
    "</body>",
    "</html>"
  ].join("");
}

export function adminStatusCodeForState(state: AdminContentScreenState): number {
  return adminStatusCodeForStateWithOptions(state);
}

export function adminStatusCodeForStateWithOptions(
  state: AdminContentScreenState,
  options: {
    empty?: number | undefined;
    error?: number | undefined;
    offline?: number | undefined;
  } = {}
): number {
  if (state === "forbidden") return 403;
  if (state === "empty") return options.empty ?? 404;
  if (state === "offline") return options.offline ?? 503;
  if (state === "error") return options.error ?? 500;
  return 200;
}

export function renderAdminHeader<TAction extends AdminRenderableAction>({
  title,
  body,
  actions,
  demoChromeVisible,
  renderAction
}: RenderAdminHeaderOptions<TAction>): string {
  const demoBadge = demoChromeVisible
    ? '<span class="admin-content__demo" aria-label="Demo mode">Demo</span>'
    : "";

  return [
    '<header class="admin-content__header">',
    "<div>",
    `<h1 class="admin-content__title">${escapeHtml(title)}</h1>`,
    `<p class="admin-content__body">${escapeHtml(body)}</p>`,
    demoBadge,
    "</div>",
    `<div class="admin-content__actions">${actions.map(renderAction).join("")}</div>`,
    "</header>"
  ].join("");
}

export function renderAdminEmptyState(
  title: string,
  body: string,
  className = "admin-content__empty"
) {
  return [
    `<div class="${className}" role="status">`,
    `<strong>${escapeHtml(title)}</strong>`,
    `<p>${escapeHtml(body)}</p>`,
    "</div>"
  ].join("");
}

export function renderAdminActionLink(
  action: AdminRenderableAction,
  { href, danger, secondary }: RenderAdminActionLinkOptions
): string {
  const modifier = danger ? " admin-content__button--danger" : "";
  const secondaryModifier = secondary ? " admin-content__button--secondary" : "";

  return [
    `<a class="admin-content__button${modifier}${secondaryModifier}" href="${escapeAttribute(href)}"`,
    ` data-action="${escapeAttribute(action.id)}"`,
    ` data-target-route="${escapeAttribute(action.targetRoute)}"`,
    action.targetId ? ` data-target-id="${escapeAttribute(action.targetId)}"` : "",
    action.requestMethod ? ` data-request-method="${escapeAttribute(action.requestMethod)}"` : "",
    action.requestPath ? ` data-request-path="${escapeAttribute(action.requestPath)}"` : "",
    ">",
    escapeHtml(action.label),
    "</a>"
  ].join("");
}

export function renderAdminActionButton(
  action: AdminRenderableAction,
  { danger, secondary }: RenderAdminActionButtonOptions = {}
): string {
  const modifier = danger ? " admin-content__button--danger" : "";
  const secondaryModifier = secondary ? " admin-content__button--secondary" : "";

  return [
    `<button type="button" class="admin-content__button${modifier}${secondaryModifier}"`,
    ` data-action="${escapeAttribute(action.id)}"`,
    ` data-target-route="${escapeAttribute(action.targetRoute)}"`,
    action.targetId ? ` data-target-id="${escapeAttribute(action.targetId)}"` : "",
    action.requestMethod ? ` data-request-method="${escapeAttribute(action.requestMethod)}"` : "",
    action.requestPath ? ` data-request-path="${escapeAttribute(action.requestPath)}"` : "",
    ">",
    escapeHtml(action.label),
    "</button>"
  ].join("");
}

export function renderAdminFormField(field: RenderAdminFormFieldOptions): string {
  const common = [
    `class="admin-content__input${field.multiline ? " admin-content__textarea" : ""}"`,
    `name="${escapeAttribute(field.name)}"`,
    field.multiline ? "" : `value="${escapeAttribute(field.value)}"`,
    field.required ? "required" : "",
    field.readOnly ? "readonly" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return [
    `<label class="admin-content__field${field.multiline ? " admin-content__field--wide" : ""}">`,
    `<span class="admin-content__label">${escapeHtml(field.label)}</span>`,
    field.multiline
      ? `<textarea ${common}>${escapeHtml(field.value)}</textarea>`
      : `<input ${common}>`,
    "</label>"
  ].join("");
}

export function cssBoxShadow(elevation: {
  offsetX: number;
  offsetY: number;
  radius: number;
  color: string;
  opacity: number;
}) {
  return `${elevation.offsetX}px ${elevation.offsetY}px ${elevation.radius}px ${elevation.color}${cssAlphaHex(elevation.opacity)}`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function cssAlphaHex(opacity: number) {
  return Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
}
