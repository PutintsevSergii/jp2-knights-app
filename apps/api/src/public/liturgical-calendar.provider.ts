import { Injectable } from "@nestjs/common";
import { publicHomeTodaySchema } from "@jp2/shared-validation";
import {
  readLiturgicalCalendarConfig,
  type LiturgicalCalendarConfig
} from "./liturgical-calendar.config.js";
import type { PublicHomeQuery, PublicHomeResponse } from "./public.types.js";

export type PublicHomeToday = PublicHomeResponse["today"];

export interface LiturgicalCalendarContext {
  date?: string | undefined;
  language?: string | undefined;
  country?: string | undefined;
}

export abstract class LiturgicalCalendarProvider {
  abstract getToday(context: LiturgicalCalendarContext): Promise<PublicHomeToday>;
}

export type LiturgicalCalendarFetch = (
  input: string | URL,
  init?: RequestInit
) => Promise<Response>;

@Injectable()
export class LocalFallbackLiturgicalCalendarProvider extends LiturgicalCalendarProvider {
  getToday(context: PublicHomeQuery): Promise<PublicHomeToday> {
    const date = context.date ?? currentIsoDate();
    const displayLabel = formatCivilDate(date, context.language);

    return Promise.resolve({
      civilDate: {
        date,
        displayLabel
      },
      liturgicalDay: {
        name: "Liturgical calendar unavailable",
        season: null,
        rank: null,
        color: null,
        source: "local-fallback",
        state: "fallback"
      }
    });
  }
}

export class CachedHttpLiturgicalCalendarProvider extends LiturgicalCalendarProvider {
  private readonly cache = new Map<string, CachedToday>();

  constructor(
    private readonly config: LiturgicalCalendarConfig,
    private readonly fallbackProvider = new LocalFallbackLiturgicalCalendarProvider(),
    private readonly fetchImpl: LiturgicalCalendarFetch = fetch
  ) {
    super();
  }

  async getToday(context: LiturgicalCalendarContext): Promise<PublicHomeToday> {
    const normalizedContext = normalizeContext(context);
    const cacheKey = calendarCacheKey(normalizedContext);
    const cached = this.readCache(cacheKey);

    if (cached) {
      return cached;
    }

    const remoteToday = await this.fetchWithFallback(normalizedContext);

    if (remoteToday.liturgicalDay.state !== "fallback") {
      this.writeCache(cacheKey, remoteToday);
    }

    return remoteToday;
  }

  private async fetchWithFallback(context: NormalizedLiturgicalCalendarContext): Promise<PublicHomeToday> {
    try {
      return await this.fetchWithRetry(context);
    } catch {
      return this.fallbackProvider.getToday(context);
    }
  }

  private async fetchWithRetry(context: NormalizedLiturgicalCalendarContext): Promise<PublicHomeToday> {
    const attempts = this.config.retryAttempts + 1;
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        return await this.fetchOnce(context);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }

  private async fetchOnce(context: NormalizedLiturgicalCalendarContext): Promise<PublicHomeToday> {
    if (!this.config.url) {
      throw new Error("Liturgical calendar HTTP provider URL is not configured.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await this.fetchImpl(this.buildUrl(context), {
        headers: {
          accept: "application/json"
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Liturgical calendar request failed with ${response.status}.`);
      }

      return publicHomeTodaySchema.parse(await response.json());
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUrl(context: NormalizedLiturgicalCalendarContext): URL {
    const url = new URL(this.config.url ?? "http://localhost");
    url.searchParams.set("date", context.date);

    if (context.language) {
      url.searchParams.set("language", context.language);
    }

    if (context.country) {
      url.searchParams.set("country", context.country);
    }

    return url;
  }

  private readCache(cacheKey: string): PublicHomeToday | null {
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      return null;
    }

    if (cached.expiresAt <= Date.now()) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.today;
  }

  private writeCache(cacheKey: string, today: PublicHomeToday): void {
    if (this.config.cacheTtlMs <= 0) {
      return;
    }

    this.cache.set(cacheKey, {
      expiresAt: Date.now() + this.config.cacheTtlMs,
      today
    });
  }
}

export function createConfiguredLiturgicalCalendarProvider(
  env: Record<string, unknown> = process.env
): LiturgicalCalendarProvider {
  const config = readLiturgicalCalendarConfig(env);
  const fallbackProvider = new LocalFallbackLiturgicalCalendarProvider();

  if (config.provider === "http") {
    return new CachedHttpLiturgicalCalendarProvider(config, fallbackProvider);
  }

  return fallbackProvider;
}

interface CachedToday {
  expiresAt: number;
  today: PublicHomeToday;
}

type NormalizedLiturgicalCalendarContext = Omit<LiturgicalCalendarContext, "date"> & {
  date: string;
};

function normalizeContext(context: LiturgicalCalendarContext): NormalizedLiturgicalCalendarContext {
  return {
    ...context,
    date: context.date ?? currentIsoDate()
  };
}

function calendarCacheKey(context: NormalizedLiturgicalCalendarContext) {
  return [context.date, context.language ?? "", context.country ?? ""].join("|");
}

function currentIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatCivilDate(date: string, language = "en") {
  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    weekday: "long"
  }).format(parsedDate);
}
