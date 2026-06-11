export type LiturgicalCalendarProviderMode = "fallback" | "http";

export interface LiturgicalCalendarConfig {
  provider: LiturgicalCalendarProviderMode;
  url?: string;
  timeoutMs: number;
  retryAttempts: number;
  cacheTtlMs: number;
}

const DEFAULT_TIMEOUT_MS = 1_500;
const DEFAULT_RETRY_ATTEMPTS = 1;
const DEFAULT_CACHE_TTL_MS = 6 * 60 * 60 * 1_000;

export function readLiturgicalCalendarConfig(
  env: Record<string, unknown> = process.env
): LiturgicalCalendarConfig {
  const provider = readProviderMode(env);
  const url = readEnvString(env, "LITURGICAL_CALENDAR_URL");

  if (provider === "http" && !url) {
    throw new Error("LITURGICAL_CALENDAR_URL is required when LITURGICAL_CALENDAR_PROVIDER=http.");
  }

  return {
    provider,
    ...optionalObjectProperty("url", url),
    timeoutMs: readIntegerInRange(
      env,
      "LITURGICAL_CALENDAR_TIMEOUT_MS",
      DEFAULT_TIMEOUT_MS,
      100,
      10_000
    ),
    retryAttempts: readIntegerInRange(
      env,
      "LITURGICAL_CALENDAR_RETRY_ATTEMPTS",
      DEFAULT_RETRY_ATTEMPTS,
      0,
      3
    ),
    cacheTtlMs: readIntegerInRange(
      env,
      "LITURGICAL_CALENDAR_CACHE_TTL_MS",
      DEFAULT_CACHE_TTL_MS,
      0,
      24 * 60 * 60 * 1_000
    )
  };
}

function readProviderMode(env: Record<string, unknown>): LiturgicalCalendarProviderMode {
  const configured = readEnvString(env, "LITURGICAL_CALENDAR_PROVIDER");

  if (!configured) {
    return "fallback";
  }

  if (configured === "fallback" || configured === "http") {
    return configured;
  }

  throw new Error(`Unsupported LITURGICAL_CALENDAR_PROVIDER '${configured}'.`);
}

function readEnvString(env: Record<string, unknown>, key: string): string | undefined {
  const value = env[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function readIntegerInRange(
  env: Record<string, unknown>,
  key: string,
  fallback: number,
  min: number,
  max: number
): number {
  const value = readEnvString(env, key);

  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function optionalObjectProperty<TKey extends string, TValue>(
  key: TKey,
  value: TValue | undefined
): Partial<Record<TKey, TValue>> {
  return value ? ({ [key]: value } as Partial<Record<TKey, TValue>>) : {};
}
