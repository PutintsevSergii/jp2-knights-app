export const SUPPORTED_LOCALES = ["en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";

export const TRANSLATION_KEYS = [
  "common.accessDenied.title",
  "common.accessDenied.body",
  "common.demoMode",
  "common.empty.title",
  "common.error.title",
  "common.loading",
  "common.offline.title",
  "common.offline.body",
  "common.refresh",
  "mobile.candidate.roadmap.title",
  "mobile.candidate.roadmap.empty.body",
  "mobile.candidate.roadmap.stepDetail.title",
  "mobile.brother.roadmap.title",
  "mobile.brother.roadmap.empty.body",
  "mobile.brother.roadmap.stepDetail.title",
  "mobile.brother.roadmap.noStepDescription",
  "mobile.brother.roadmap.submitReflection",
  "admin.roadmapDefinitions.title",
  "admin.roadmapDefinitions.empty.body",
  "admin.roadmapDefinitions.create",
  "admin.roadmapSubmissions.title",
  "admin.roadmapSubmissions.empty.body",
  "admin.roadmapSubmissions.approve",
  "admin.roadmapSubmissions.reject",
  "admin.roadmapAssignments.title",
  "admin.roadmapAssignments.list.body",
  "admin.roadmapAssignments.ready.body",
  "admin.roadmapAssignments.loading.title",
  "admin.roadmapAssignments.loading.body",
  "admin.roadmapAssignments.empty.body",
  "admin.roadmapAssignments.error.title",
  "admin.roadmapAssignments.error.body",
  "admin.roadmapAssignments.offline.body",
  "admin.roadmapAssignments.forbidden.body",
  "admin.roadmapAssignments.create",
  "admin.roadmapAssignments.create.submit",
  "admin.roadmapAssignments.view",
  "admin.roadmapAssignments.back",
  "admin.roadmapAssignments.global",
  "admin.roadmapAssignments.counts",
  "admin.roadmapAssignments.detail.fallbackTitle",
  "admin.roadmapAssignments.detail.title",
  "admin.roadmapAssignments.detail.ready.body",
  "admin.roadmapAssignments.detail.loading.title",
  "admin.roadmapAssignments.detail.loading.body",
  "admin.roadmapAssignments.detail.empty.title",
  "admin.roadmapAssignments.detail.empty.body",
  "admin.roadmapAssignments.detail.error.title",
  "admin.roadmapAssignments.detail.error.body",
  "admin.roadmapAssignments.detail.offline.body",
  "admin.roadmapAssignments.detail.section.assignment",
  "admin.roadmapAssignments.detail.section.submissions",
  "admin.roadmapAssignments.detail.assignedAt",
  "admin.roadmapAssignments.detail.completedAt",
  "admin.roadmapAssignments.detail.notCompleted",
  "admin.roadmapAssignments.detail.noSubmissions",
  "admin.roadmapAssignments.detail.submissionLine",
  "admin.roadmapAssignments.editor.title",
  "admin.roadmapAssignments.editor.body",
  "admin.roadmapAssignments.editor.ready.body",
  "admin.roadmapAssignments.editor.loading.title",
  "admin.roadmapAssignments.editor.loading.body",
  "admin.roadmapAssignments.editor.empty.body",
  "admin.roadmapAssignments.editor.error.title",
  "admin.roadmapAssignments.editor.error.body",
  "admin.roadmapAssignments.editor.offline.body",
  "admin.roadmapAssignments.editor.forbidden.body",
  "admin.roadmapAssignments.editor.assigneeUserId",
  "admin.roadmapAssignments.editor.roadmapDefinitionId",
  "admin.roadmapAssignments.editor.organizationUnitId",
  "roadmap.stage.count",
  "roadmap.step.count",
  "roadmap.step.submissionRequired",
  "roadmap.step.readOnly",
  "roadmap.step.statusLine",
  "roadmap.status.notStarted",
  "roadmap.status.inProgress",
  "roadmap.status.pendingReview",
  "roadmap.status.approved",
  "roadmap.status.rejected"
] as const;

export type TranslationKey = (typeof TRANSLATION_KEYS)[number];
export type TranslationValues = Readonly<Record<string, string | number>>;
export type TranslationCatalog = Readonly<Record<TranslationKey, string>>;
export type TranslationCatalogOverrides = Partial<Record<TranslationKey, string>>;
export type TranslationCatalogMap = Partial<Record<SupportedLocale, TranslationCatalogOverrides>>;
export type Translator = (key: TranslationKey, values?: TranslationValues) => string;

export const ENGLISH_TRANSLATIONS: TranslationCatalog = {
  "common.accessDenied.title": "Access Denied",
  "common.accessDenied.body": "Your current account cannot open this screen.",
  "common.demoMode": "Demo mode",
  "common.empty.title": "Nothing Listed Yet",
  "common.error.title": "Unable to Load",
  "common.loading": "Loading",
  "common.offline.title": "Offline",
  "common.offline.body": "Reconnect and try again.",
  "common.refresh": "Refresh",
  "mobile.candidate.roadmap.title": "Candidate Roadmap",
  "mobile.candidate.roadmap.empty.body": "Your formation roadmap is being prepared.",
  "mobile.candidate.roadmap.stepDetail.title": "Candidate Step",
  "mobile.brother.roadmap.title": "Formation Roadmap",
  "mobile.brother.roadmap.empty.body": "No formation roadmap is assigned yet.",
  "mobile.brother.roadmap.stepDetail.title": "Formation Step",
  "mobile.brother.roadmap.noStepDescription": "No step description is recorded yet.",
  "mobile.brother.roadmap.submitReflection": "Submit reflection",
  "admin.roadmapDefinitions.title": "Roadmap Definitions",
  "admin.roadmapDefinitions.empty.body": "No roadmap definitions are configured.",
  "admin.roadmapDefinitions.create": "Create Roadmap",
  "admin.roadmapSubmissions.title": "Roadmap Submissions",
  "admin.roadmapSubmissions.empty.body": "No roadmap submissions need review.",
  "admin.roadmapSubmissions.approve": "Approve",
  "admin.roadmapSubmissions.reject": "Reject",
  "admin.roadmapAssignments.title": "Roadmap Assignments",
  "admin.roadmapAssignments.list.body":
    "Inspect and create assignments from already-published candidate or brother roadmaps.",
  "admin.roadmapAssignments.ready.body": "Roadmap assignments are ready.",
  "admin.roadmapAssignments.loading.title": "Loading Roadmap Assignments",
  "admin.roadmapAssignments.loading.body": "Roadmap assignments are loading.",
  "admin.roadmapAssignments.empty.body": "No roadmap assignments are configured.",
  "admin.roadmapAssignments.error.title": "Unable to Load Roadmap Assignments",
  "admin.roadmapAssignments.error.body": "Roadmap assignments could not be loaded.",
  "admin.roadmapAssignments.offline.body": "Reconnect to refresh roadmap assignments.",
  "admin.roadmapAssignments.forbidden.body":
    "Super Admin access is required to inspect roadmap assignments.",
  "admin.roadmapAssignments.create": "Create Assignment",
  "admin.roadmapAssignments.create.submit": "Create",
  "admin.roadmapAssignments.view": "View",
  "admin.roadmapAssignments.back": "Back to Assignments",
  "admin.roadmapAssignments.global": "Global assignment",
  "admin.roadmapAssignments.counts": "{{submissionCount}} submissions · {{pendingCount}} pending",
  "admin.roadmapAssignments.detail.fallbackTitle": "Roadmap Assignment",
  "admin.roadmapAssignments.detail.title": "Roadmap Assignment: {{assigneeName}}",
  "admin.roadmapAssignments.detail.ready.body": "Roadmap assignment is ready.",
  "admin.roadmapAssignments.detail.loading.title": "Loading Roadmap Assignment",
  "admin.roadmapAssignments.detail.loading.body": "Roadmap assignment is loading.",
  "admin.roadmapAssignments.detail.empty.title": "Roadmap Assignment Not Found",
  "admin.roadmapAssignments.detail.empty.body":
    "The requested roadmap assignment is not available.",
  "admin.roadmapAssignments.detail.error.title": "Unable to Load Roadmap Assignment",
  "admin.roadmapAssignments.detail.error.body": "Roadmap assignment could not be loaded.",
  "admin.roadmapAssignments.detail.offline.body":
    "Reconnect to refresh this roadmap assignment.",
  "admin.roadmapAssignments.detail.section.assignment": "Assignment",
  "admin.roadmapAssignments.detail.section.submissions": "Submission Status",
  "admin.roadmapAssignments.detail.assignedAt": "Assigned {{assignedAt}}",
  "admin.roadmapAssignments.detail.completedAt": "Completed {{completedAt}}",
  "admin.roadmapAssignments.detail.notCompleted": "Not completed",
  "admin.roadmapAssignments.detail.noSubmissions": "No submissions recorded.",
  "admin.roadmapAssignments.detail.submissionLine":
    "{{stageTitle}}: {{stepTitle}} · {{statusLabel}} · {{attachmentCount}} attachments",
  "admin.roadmapAssignments.editor.title": "Create Roadmap Assignment",
  "admin.roadmapAssignments.editor.body":
    "Assign an already-published candidate or brother roadmap to an eligible user in the matching scope.",
  "admin.roadmapAssignments.editor.ready.body": "Roadmap assignment form is ready.",
  "admin.roadmapAssignments.editor.loading.title": "Loading Roadmap Assignment Form",
  "admin.roadmapAssignments.editor.loading.body": "Roadmap assignment form is loading.",
  "admin.roadmapAssignments.editor.empty.body": "No roadmap assignment form is available.",
  "admin.roadmapAssignments.editor.error.title":
    "Unable to Load Roadmap Assignment Form",
  "admin.roadmapAssignments.editor.error.body": "Roadmap assignment form could not be loaded.",
  "admin.roadmapAssignments.editor.offline.body": "Reconnect to create a roadmap assignment.",
  "admin.roadmapAssignments.editor.forbidden.body":
    "Super Admin access is required to create roadmap assignments.",
  "admin.roadmapAssignments.editor.assigneeUserId": "Assignee User ID",
  "admin.roadmapAssignments.editor.roadmapDefinitionId": "Roadmap Definition ID",
  "admin.roadmapAssignments.editor.organizationUnitId": "Organization Unit ID",
  "roadmap.stage.count": "{{count}} roadmap stages",
  "roadmap.step.count": "{{count}} roadmap steps",
  "roadmap.step.submissionRequired": "Submission required.",
  "roadmap.step.readOnly": "Read-only step.",
  "roadmap.step.statusLine": "Status: {{statusLabel}}.",
  "roadmap.status.notStarted": "Not started",
  "roadmap.status.inProgress": "In progress",
  "roadmap.status.pendingReview": "Pending review",
  "roadmap.status.approved": "Approved",
  "roadmap.status.rejected": "Rejected"
};

export interface CreateTranslatorOptions {
  locale?: string | undefined;
  catalogs?: TranslationCatalogMap | undefined;
}

export function createTranslator(options: CreateTranslatorOptions = {}): Translator {
  const locale = normalizeLocale(options.locale);
  const catalog = {
    ...ENGLISH_TRANSLATIONS,
    ...(options.catalogs?.[locale] ?? {})
  };

  return (key, values) => interpolate(catalog[key] ?? ENGLISH_TRANSLATIONS[key], values);
}

export function getTranslation(key: string, values?: TranslationValues): string {
  return hasTranslation(key) ? createTranslator()(key, values) : key;
}

export function hasTranslation(key: string): key is TranslationKey {
  return (TRANSLATION_KEYS as readonly string[]).includes(key);
}

export function normalizeLocale(locale: string | undefined): SupportedLocale {
  const normalized = locale?.trim().toLowerCase().split("-")[0];

  return SUPPORTED_LOCALES.find((supportedLocale) => supportedLocale === normalized) ?? DEFAULT_LOCALE;
}

function interpolate(template: string, values: TranslationValues = {}): string {
  return template.replaceAll(/\{\{([a-zA-Z0-9_.-]+)\}\}/g, (placeholder, name: string) => {
    const value = values[name];

    return value === undefined ? placeholder : String(value);
  });
}
