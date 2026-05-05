import { designTokens } from "@jp2/shared-design-tokens";
import type { RuntimeMode } from "@jp2/shared-types";
import type { AdminIdentityAccessReviewSummaryDto } from "@jp2/shared-validation";
import type { AdminContentFetch, AdminContentScreenState } from "./admin-content-api.js";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminIdentityAccessReviews } from "./admin-content-fixtures.js";
import { fetchAdminIdentityAccessReviews } from "./admin-identity-access-api.js";

export interface AdminIdentityAccessScreen {
  route: "AdminIdentityAccessReviews";
  state: AdminContentScreenState;
  title: string;
  body: string;
  reviews: AdminIdentityAccessReviewSummaryDto[];
  canWrite: boolean;
  demoChromeVisible: boolean;
}

export interface RenderAdminIdentityAccessRouteOptions {
  runtimeMode: RuntimeMode;
  authToken?: string;
  baseUrl?: string;
  canWrite?: boolean;
  fetchImpl?: AdminContentFetch;
}

export interface RenderedAdminIdentityAccessRoute {
  path: "/admin/identity-access-reviews";
  route: "AdminIdentityAccessReviews";
  state: AdminContentScreenState;
  statusCode: number;
  document: string;
}

export async function renderAdminIdentityAccessRoute(
  options: RenderAdminIdentityAccessRouteOptions
): Promise<RenderedAdminIdentityAccessRoute> {
  const screen = await resolveIdentityAccessScreen(options);

  return {
    path: "/admin/identity-access-reviews",
    route: "AdminIdentityAccessReviews",
    state: screen.state,
    statusCode: statusCodeForState(screen.state),
    document: renderIdentityAccessDocument(screen)
  };
}

export function buildAdminIdentityAccessScreen(input: {
  state: AdminContentScreenState;
  reviews?: AdminIdentityAccessReviewSummaryDto[];
  runtimeMode: RuntimeMode;
  canWrite?: boolean;
}): AdminIdentityAccessScreen {
  const reviews = input.state === "ready" ? input.reviews ?? [] : [];

  return {
    route: "AdminIdentityAccessReviews",
    state: input.state === "ready" && reviews.length === 0 ? "empty" : input.state,
    title: "Identity Access Reviews",
    body:
      input.state === "forbidden"
        ? "Admin Lite access is required."
        : "Confirm or reject Firebase sign-ins before private access is granted.",
    reviews,
    canWrite: input.canWrite ?? false,
    demoChromeVisible: input.runtimeMode === "demo"
  };
}

async function resolveIdentityAccessScreen(
  options: RenderAdminIdentityAccessRouteOptions
): Promise<AdminIdentityAccessScreen> {
  if (options.runtimeMode === "demo") {
    return buildAdminIdentityAccessScreen({
      state: "ready",
      reviews: fallbackAdminIdentityAccessReviews.identityAccessReviews,
      runtimeMode: options.runtimeMode,
      ...(options.canWrite !== undefined ? { canWrite: options.canWrite } : {})
    });
  }

  try {
    const response = await fetchAdminIdentityAccessReviews({
      ...(options.authToken ? { authToken: options.authToken } : {}),
      ...(options.baseUrl ? { baseUrl: options.baseUrl } : {}),
      ...(options.fetchImpl ? { fetchImpl: options.fetchImpl } : {})
    });

    return buildAdminIdentityAccessScreen({
      state: "ready",
      reviews: response.identityAccessReviews,
      runtimeMode: options.runtimeMode,
      ...(options.canWrite !== undefined ? { canWrite: options.canWrite } : {})
    });
  } catch (error) {
    const state =
      error instanceof AdminContentHttpError && error.status === 403 ? "forbidden" : "error";
    return buildAdminIdentityAccessScreen({
      state,
      runtimeMode: options.runtimeMode,
      ...(options.canWrite !== undefined ? { canWrite: options.canWrite } : {})
    });
  }
}

function renderIdentityAccessDocument(screen: AdminIdentityAccessScreen): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>Identity Access Reviews</title>",
    "</head>",
    "<body>",
    `<main>${renderIdentityAccessHtml(screen)}</main>`,
    "</body>",
    "</html>"
  ].join("");
}

function renderIdentityAccessHtml(screen: AdminIdentityAccessScreen): string {
  return [
    `<section class="admin-identity" data-route="${screen.route}" data-state="${screen.state}">`,
    renderStyle(),
    `<header class="admin-identity__header"><div><h1>${escapeHtml(screen.title)}</h1><p>${escapeHtml(
      screen.body
    )}</p></div>${screen.demoChromeVisible ? '<span class="admin-identity__demo">Demo</span>' : ""}</header>`,
    renderReviews(screen),
    "</section>"
  ].join("");
}

function renderReviews(screen: AdminIdentityAccessScreen): string {
  if (screen.state !== "ready") {
    return `<div class="admin-identity__panel" role="status">${escapeHtml(screen.body)}</div>`;
  }

  return [
    '<div class="admin-identity__list">',
    ...screen.reviews.map((review) => renderReview(review, screen.canWrite)),
    "</div>"
  ].join("");
}

function renderReview(review: AdminIdentityAccessReviewSummaryDto, canWrite: boolean): string {
  const actions =
    review.status === "pending" && canWrite
      ? [
          `<button type="button" data-action="confirm" data-review-id="${escapeAttribute(
            review.id
          )}">Confirm</button>`,
          `<button type="button" data-action="reject" data-review-id="${escapeAttribute(
            review.id
          )}">Reject</button>`
        ].join("")
      : "";

  return [
    '<article class="admin-identity__panel">',
    `<h2>${escapeHtml(review.displayName)}</h2>`,
    `<p>${escapeHtml(review.email)} · ${escapeHtml(review.provider)}</p>`,
    `<dl><dt>Status</dt><dd>${escapeHtml(review.status)}</dd><dt>Scope</dt><dd>${escapeHtml(
      review.scopeOrganizationUnitName ?? "Super Admin review"
    )}</dd><dt>Requested</dt><dd>${escapeHtml(review.requestedRole ?? "Unspecified")}</dd><dt>Expires</dt><dd>${escapeHtml(
      review.expiresAt
    )}</dd></dl>`,
    actions ? `<div class="admin-identity__actions">${actions}</div>` : "",
    "</article>"
  ].join("");
}

function renderStyle(): string {
  return [
    "<style>",
    `.admin-identity{background:${designTokens.color.background.app};color:${designTokens.color.text.primary};font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:${designTokens.space[4]}px;}`,
    ".admin-identity__header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px;}",
    ".admin-identity h1{font-size:24px;margin:0 0 4px;}",
    `.admin-identity p{color:${designTokens.color.text.muted};margin:0;}`,
    ".admin-identity__list{display:grid;gap:12px;}",
    `.admin-identity__panel{background:${designTokens.color.background.surface};border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.md}px;padding:14px;}`,
    ".admin-identity__panel h2{font-size:18px;margin:0 0 4px;}",
    ".admin-identity dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 12px;margin:12px 0 0;}",
    `.admin-identity dt{color:${designTokens.color.text.muted};}`,
    ".admin-identity dd{margin:0;}",
    ".admin-identity__actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;}",
    `.admin-identity button{background:${designTokens.color.action.primary};color:${designTokens.color.action.primaryText};border:0;border-radius:${designTokens.radius.md}px;padding:8px 10px;font-weight:700;}`,
    ".admin-identity__demo{font-size:12px;font-weight:700;text-transform:uppercase;}",
    "</style>"
  ].join("");
}

function statusCodeForState(state: AdminContentScreenState): number {
  if (state === "forbidden") return 403;
  if (state === "error" || state === "offline") return 503;
  return 200;
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
