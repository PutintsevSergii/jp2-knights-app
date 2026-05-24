import { designTokens } from "@jp2/shared-design-tokens";
import { escapeAttribute, escapeHtml, renderAdminEmptyState } from "./admin-render-primitives.js";

export interface AdminRoadmapReadOnlySection {
  id: string;
  title: string;
  body: string;
}

export function renderRoadmapReadOnlyStyle(): string {
  return [
    "<style>",
    `.admin-content{padding:${designTokens.space[8]}px ${designTokens.space[6]}px;font-family:${designTokens.typography.fontFamily.web};background:${designTokens.color.background.app};color:${designTokens.color.text.primary};}`,
    ".admin-content__header{display:flex;justify-content:space-between;gap:24px;max-width:1120px;margin:0 auto 28px;}",
    `.admin-content__title{font-size:44px;line-height:50px;margin:0 0 8px;color:${designTokens.color.brand.goldDarker};}`,
    `.admin-content__body{margin:0;color:${designTokens.color.text.muted};max-width:640px;}`,
    ".admin-content__actions{display:flex;gap:8px;flex-wrap:wrap;}",
    ".admin-content__cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;max-width:1120px;margin:0 auto;}",
    `.admin-content__card,.admin-content__sections{border:1px solid ${designTokens.color.border.subtle};border-radius:${designTokens.radius.lg}px;padding:${designTokens.space[4]}px;background:${designTokens.color.background.surface};}`,
    ".admin-content__name{font-size:18px;line-height:24px;margin:0 0 6px;}",
    `.admin-content__meta,.admin-content__preview{color:${designTokens.color.text.muted};font-size:14px;line-height:20px;}`,
    ".admin-content__badge{display:inline-block;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:700;text-transform:uppercase;}",
    `.admin-content__badge--published,.admin-content__badge--active{background:${designTokens.color.brand.gold};color:${designTokens.color.brand.goldDeep};}`,
    `.admin-content__badge--draft,.admin-content__badge--review,.admin-content__badge--approved,.admin-content__badge--completed{background:${designTokens.color.border.soft};color:${designTokens.color.text.muted};}`,
    `.admin-content__badge--archived{background:${designTokens.color.border.soft};color:${designTokens.color.status.danger};}`,
    `.admin-content__button{border:1px solid ${designTokens.color.action.primary};border-radius:${designTokens.radius.md}px;padding:8px 12px;text-decoration:none;color:${designTokens.color.action.primaryText};background:${designTokens.color.action.primary};font-weight:700;display:inline-flex;margin-right:8px;}`,
    `.admin-content__button--secondary{background:${designTokens.color.background.surface};color:${designTokens.color.text.primary};border-color:${designTokens.color.border.subtle};}`,
    ".admin-content__sections{display:grid;gap:16px;max-width:1120px;margin:0 auto;}",
    `.admin-content__section{border-bottom:1px solid ${designTokens.color.border.subtle};padding-bottom:14px;}`,
    ".admin-content__section:last-child{border-bottom:0;padding-bottom:0;}",
    ".admin-content__section-title{font-size:18px;line-height:24px;margin:0 0 6px;}",
    "@media (max-width:760px){.admin-content__header{display:block;}.admin-content__actions{margin-top:16px;}}",
    "</style>"
  ].join("");
}

export function roadmapReadOnlyStatusClass(status: string): string {
  return `admin-content__badge--${status.toLowerCase().replaceAll("_", "-")}`;
}

export function renderRoadmapReadOnlySections(options: {
  sections: readonly AdminRoadmapReadOnlySection[];
  emptyTitle: string;
  emptyBody: string;
  containerAttributeName: string;
  containerId: string;
}): string {
  if (options.sections.length === 0) {
    return renderAdminEmptyState(options.emptyTitle, options.emptyBody);
  }

  return [
    `<div class="admin-content__sections" ${options.containerAttributeName}="${escapeAttribute(options.containerId)}">`,
    options.sections.map(renderRoadmapReadOnlySection).join(""),
    "</div>"
  ].join("");
}

function renderRoadmapReadOnlySection(section: AdminRoadmapReadOnlySection): string {
  return [
    `<section class="admin-content__section" data-roadmap-section-id="${escapeAttribute(section.id)}">`,
    `<h2 class="admin-content__section-title">${escapeHtml(section.title)}</h2>`,
    `<p class="admin-content__preview">${escapeHtml(section.body)}</p>`,
    "</section>"
  ].join("");
}
