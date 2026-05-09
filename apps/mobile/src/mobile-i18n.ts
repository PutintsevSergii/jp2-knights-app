import {
  createTranslator,
  type CreateTranslatorOptions,
  type TranslationKey,
  type TranslationValues
} from "@jp2/shared-i18n";

export function createMobileTranslator(options: CreateTranslatorOptions = {}) {
  return createTranslator(options);
}

export function mobileCopy(key: TranslationKey, values?: TranslationValues): string {
  return createMobileTranslator()(key, values);
}
