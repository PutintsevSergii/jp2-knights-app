import {
  createTranslator,
  type CreateTranslatorOptions,
  type TranslationKey,
  type TranslationValues
} from "@jp2/shared-i18n";

export function createAdminTranslator(options: CreateTranslatorOptions = {}) {
  return createTranslator(options);
}

export function adminCopy(key: TranslationKey, values?: TranslationValues): string {
  return createAdminTranslator()(key, values);
}
