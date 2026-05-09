import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  ENGLISH_TRANSLATIONS,
  TRANSLATION_KEYS,
  createTranslator,
  getTranslation,
  hasTranslation,
  normalizeLocale
} from "./index.js";

describe("shared i18n", () => {
  it("keeps every declared translation key covered by the default English catalog", () => {
    expect(Object.keys(ENGLISH_TRANSLATIONS).sort()).toEqual([...TRANSLATION_KEYS].sort());
  });

  it("normalizes unsupported or regional locales to the default locale", () => {
    expect(normalizeLocale("en-US")).toBe(DEFAULT_LOCALE);
    expect(normalizeLocale("pl")).toBe(DEFAULT_LOCALE);
    expect(normalizeLocale(undefined)).toBe(DEFAULT_LOCALE);
  });

  it("translates with interpolation without mutating the default catalog", () => {
    const translator = createTranslator();

    expect(translator("roadmap.step.count", { count: 3 })).toBe("3 roadmap steps");
    expect(ENGLISH_TRANSLATIONS["roadmap.step.count"]).toBe("{{count}} roadmap steps");
  });

  it("falls back to English when an override catalog does not include a key", () => {
    const translator = createTranslator({
      catalogs: {
        en: {
          "common.loading": "Loading from override"
        }
      }
    });

    expect(translator("common.loading")).toBe("Loading from override");
    expect(translator("common.offline.body")).toBe("Reconnect and try again.");
  });

  it("supports dynamic key checks for app adapters", () => {
    expect(hasTranslation("mobile.candidate.roadmap.title")).toBe(true);
    expect(hasTranslation("unknown.key")).toBe(false);
    expect(getTranslation("unknown.key")).toBe("unknown.key");
  });
});
