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
  "admin.roadmapSubmissions.list.body",
  "admin.roadmapSubmissions.ready.body",
  "admin.roadmapSubmissions.loading.title",
  "admin.roadmapSubmissions.loading.body",
  "admin.roadmapSubmissions.empty.body",
  "admin.roadmapSubmissions.error.title",
  "admin.roadmapSubmissions.error.body",
  "admin.roadmapSubmissions.offline.body",
  "admin.roadmapSubmissions.forbidden.body",
  "admin.roadmapSubmissions.view",
  "admin.roadmapSubmissions.review",
  "admin.roadmapSubmissions.approve",
  "admin.roadmapSubmissions.reject",
  "admin.roadmapSubmissions.back",
  "admin.roadmapSubmissions.global",
  "admin.roadmapSubmissions.noPreview",
  "admin.roadmapSubmissions.attachmentCount",
  "admin.roadmapSubmissions.detail.fallbackTitle",
  "admin.roadmapSubmissions.detail.title",
  "admin.roadmapSubmissions.detail.review.body",
  "admin.roadmapSubmissions.detail.readOnly.body",
  "admin.roadmapSubmissions.detail.ready.body",
  "admin.roadmapSubmissions.detail.loading.title",
  "admin.roadmapSubmissions.detail.loading.body",
  "admin.roadmapSubmissions.detail.empty.title",
  "admin.roadmapSubmissions.detail.empty.body",
  "admin.roadmapSubmissions.detail.error.title",
  "admin.roadmapSubmissions.detail.error.body",
  "admin.roadmapSubmissions.detail.offline.body",
  "admin.roadmapSubmissions.detail.submitter",
  "admin.roadmapSubmissions.detail.email",
  "admin.roadmapSubmissions.detail.roadmap",
  "admin.roadmapSubmissions.detail.stage",
  "admin.roadmapSubmissions.detail.step",
  "admin.roadmapSubmissions.detail.organizationUnit",
  "admin.roadmapSubmissions.detail.currentStatus",
  "admin.roadmapSubmissions.detail.submittedAt",
  "admin.roadmapSubmissions.detail.submission",
  "admin.roadmapSubmissions.detail.attachments",
  "admin.roadmapSubmissions.detail.reviewStatus",
  "admin.roadmapSubmissions.detail.reviewStatusOptions",
  "admin.roadmapSubmissions.detail.reviewComment",
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
  "admin.roadmapSubmissions.list.body":
    "Review scoped formation submissions. Decisions are audited and do not automatically change degrees.",
  "admin.roadmapSubmissions.ready.body": "Roadmap submissions are ready.",
  "admin.roadmapSubmissions.loading.title": "Loading Roadmap Submissions",
  "admin.roadmapSubmissions.loading.body": "Roadmap submissions are loading.",
  "admin.roadmapSubmissions.empty.body": "No roadmap submissions need review.",
  "admin.roadmapSubmissions.error.title": "Unable to Load Roadmap Submissions",
  "admin.roadmapSubmissions.error.body": "Roadmap submissions could not be loaded.",
  "admin.roadmapSubmissions.offline.body": "Reconnect to refresh roadmap submissions.",
  "admin.roadmapSubmissions.forbidden.body":
    "Admin Lite access is required to review roadmap submissions.",
  "admin.roadmapSubmissions.view": "View",
  "admin.roadmapSubmissions.review": "Review",
  "admin.roadmapSubmissions.approve": "Approve",
  "admin.roadmapSubmissions.reject": "Reject",
  "admin.roadmapSubmissions.back": "Back to Queue",
  "admin.roadmapSubmissions.global": "Global",
  "admin.roadmapSubmissions.noPreview": "No preview available.",
  "admin.roadmapSubmissions.attachmentCount": "{{count}} attachment{{pluralSuffix}}",
  "admin.roadmapSubmissions.detail.fallbackTitle": "Roadmap Submission",
  "admin.roadmapSubmissions.detail.title": "Roadmap Submission: {{stepTitle}}",
  "admin.roadmapSubmissions.detail.review.body":
    "Approve or reject this scoped submission. Rejections require a review comment.",
  "admin.roadmapSubmissions.detail.readOnly.body":
    "Review the submitted roadmap step and recorded decision.",
  "admin.roadmapSubmissions.detail.ready.body": "Roadmap submission is ready.",
  "admin.roadmapSubmissions.detail.loading.title": "Loading Roadmap Submission",
  "admin.roadmapSubmissions.detail.loading.body": "Roadmap submission is loading.",
  "admin.roadmapSubmissions.detail.empty.title": "Roadmap Submission Not Found",
  "admin.roadmapSubmissions.detail.empty.body":
    "The requested roadmap submission is not available in the current admin scope.",
  "admin.roadmapSubmissions.detail.error.title": "Unable to Load Roadmap Submission",
  "admin.roadmapSubmissions.detail.error.body": "Roadmap submission could not be loaded.",
  "admin.roadmapSubmissions.detail.offline.body":
    "Reconnect to refresh this roadmap submission.",
  "admin.roadmapSubmissions.detail.submitter": "Submitter",
  "admin.roadmapSubmissions.detail.email": "Email",
  "admin.roadmapSubmissions.detail.roadmap": "Roadmap",
  "admin.roadmapSubmissions.detail.stage": "Stage",
  "admin.roadmapSubmissions.detail.step": "Step",
  "admin.roadmapSubmissions.detail.organizationUnit": "Organization Unit",
  "admin.roadmapSubmissions.detail.currentStatus": "Current Status",
  "admin.roadmapSubmissions.detail.submittedAt": "Submitted At",
  "admin.roadmapSubmissions.detail.submission": "Submission",
  "admin.roadmapSubmissions.detail.attachments": "Attachments",
  "admin.roadmapSubmissions.detail.reviewStatus": "Review Status",
  "admin.roadmapSubmissions.detail.reviewStatusOptions": "approved / rejected",
  "admin.roadmapSubmissions.detail.reviewComment": "Review Comment",
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
