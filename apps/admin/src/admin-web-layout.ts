import { designTokens } from "@jp2/shared-design-tokens";
import type { RuntimeMode } from "@jp2/shared-types";
import { adminShellRoutes } from "./admin-shell.js";

export const htmlHeaders = {
  "content-type": "text/html; charset=utf-8"
};

export function mountRenderedRoute(
  document: string,
  options: {
    title: string;
    path: string;
    runtimeMode: RuntimeMode;
  }
): string {
  return renderMountedAdminDocument({
    ...options,
    body: extractMainHtml(document)
  });
}

export function renderMountedAdminDocument(options: {
  title: string;
  path: string;
  runtimeMode: RuntimeMode;
  body: string;
}): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(options.title)}</title>`,
    renderMountedStyle(),
    "</head>",
    "<body>",
    `<div class="admin-app" data-runtime-mode="${options.runtimeMode}">`,
    renderMountedHeader(options.path, options.runtimeMode),
    `<main class="admin-app__main">${options.body}</main>`,
    "</div>",
    "</body>",
    "</html>"
  ].join("");
}

export function renderStatusMain(title: string, body: string): string {
  return `<section class="admin-content"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(body)}</p></section>`;
}

function renderMountedHeader(path: string, runtimeMode: RuntimeMode): string {
  return [
    '<header class="admin-app__header">',
    '<a class="admin-app__brand" href="/admin">JP2 Admin Lite</a>',
    `<nav class="admin-app__nav" aria-label="Admin Lite">${adminShellRoutes
      .map((route) => renderMountedNavLink(route.path, route.label, path))
      .join("")}</nav>`,
    `<span class="admin-app__mode" aria-label="Runtime mode">${runtimeMode}</span>`,
    "</header>"
  ].join("");
}

function renderMountedNavLink(routePath: string, label: string, currentPath: string): string {
  const active = isActiveRoute(routePath, currentPath);

  return [
    `<a class="admin-app__nav-link${active ? " admin-app__nav-link--active" : ""}" href="${escapeAttribute(routePath)}"`,
    active ? ' aria-current="page"' : "",
    ">",
    escapeHtml(label),
    "</a>"
  ].join("");
}

function isActiveRoute(routePath: string, currentPath: string): boolean {
  if (routePath === "/admin/identity-access-reviews") {
    return currentPath === routePath;
  }

  if (routePath === "/admin/candidate-requests") {
    return currentPath === routePath || currentPath.startsWith("/admin/candidate-requests/");
  }

  if (routePath === "/admin/candidates") {
    return currentPath === routePath || currentPath.startsWith("/admin/candidates/");
  }

  if (routePath === "/admin/organization-units") {
    return currentPath === routePath || currentPath.startsWith("/admin/organization-units/");
  }

  if (routePath === "/admin/announcements") {
    return currentPath === routePath || currentPath.startsWith("/admin/announcements/");
  }

  return currentPath === routePath;
}

function renderMountedStyle(): string {
  return [
    "<style>",
    "body{margin:0;}",
    `.admin-app{min-height:100vh;background:${designTokens.color.background.app};color:${designTokens.color.text.primary};font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}`,
    `.admin-app__header{position:sticky;top:0;z-index:1;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:${designTokens.space[3]}px ${designTokens.space[4]}px;background:${designTokens.color.background.surface};border-bottom:1px solid ${designTokens.color.border.subtle};}`,
    `.admin-app__brand{font-weight:700;color:${designTokens.color.text.primary};text-decoration:none;}`,
    ".admin-app__nav{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}",
    `.admin-app__nav-link{color:${designTokens.color.text.primary};border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.md}px;padding:7px 10px;text-decoration:none;font-weight:600;}`,
    `.admin-app__nav-link--active{background:${designTokens.color.action.primary};border-color:${designTokens.color.action.primary};color:${designTokens.color.action.primaryText};}`,
    `.admin-app__mode{margin-left:auto;color:${designTokens.color.text.muted};font-size:12px;font-weight:700;text-transform:uppercase;}`,
    ".admin-app__main{min-width:0;}",
    "</style>"
  ].join("");
}

function extractMainHtml(document: string): string {
  const match = /<main[^>]*>([\s\S]*)<\/main>/i.exec(document);

  return match?.[1] ?? document;
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
