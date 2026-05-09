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
  "admin.roadmapDefinitions.title",
  "admin.roadmapDefinitions.empty.body",
  "admin.roadmapDefinitions.create",
  "admin.roadmapSubmissions.title",
  "admin.roadmapSubmissions.empty.body",
  "admin.roadmapSubmissions.approve",
  "admin.roadmapSubmissions.reject",
  "roadmap.stage.count",
  "roadmap.step.count",
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
  "admin.roadmapDefinitions.title": "Roadmap Definitions",
  "admin.roadmapDefinitions.empty.body": "No roadmap definitions are configured.",
  "admin.roadmapDefinitions.create": "Create Roadmap",
  "admin.roadmapSubmissions.title": "Roadmap Submissions",
  "admin.roadmapSubmissions.empty.body": "No roadmap submissions need review.",
  "admin.roadmapSubmissions.approve": "Approve",
  "admin.roadmapSubmissions.reject": "Reject",
  "roadmap.stage.count": "{{count}} roadmap stages",
  "roadmap.step.count": "{{count}} roadmap steps",
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
