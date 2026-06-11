#!/usr/bin/env node

const VALID_PLATFORMS = new Set(["ios", "android"]);

export function validateMobileRtdbNativeEnv({
  env = process.env,
  platform,
  allowLocalApi = false
} = {}) {
  const issues = [];
  const resolvedPlatform = normalizePlatform(platform);

  if (!resolvedPlatform) {
    issues.push({
      key: "platform",
      message: "Pass --platform ios or --platform android."
    });
  }

  expectExact(env, issues, "APP_RUNTIME_MODE", "api");
  expectExact(env, issues, "EXPO_PUBLIC_APP_RUNTIME_MODE", "api");
  expectExact(env, issues, "EXPO_PUBLIC_SILENT_PRAYER_REALTIME_PROVIDER", "firebase-rtdb");

  expectRequired(env, issues, "EXPO_PUBLIC_FIREBASE_API_KEY");
  expectRequired(env, issues, "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN");
  expectRequired(env, issues, "EXPO_PUBLIC_FIREBASE_PROJECT_ID");
  expectRequired(env, issues, "EXPO_PUBLIC_FIREBASE_APP_ID");
  expectDatabaseUrl(env, issues, "EXPO_PUBLIC_FIREBASE_DATABASE_URL");

  expectApiBaseUrl(env, issues, "EXPO_PUBLIC_API_BASE_URL", { allowLocalApi });

  expectRequired(env, issues, "EXPO_PUBLIC_APP_SCHEME");
  expectRequired(env, issues, "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID");

  if (resolvedPlatform === "ios") {
    expectRequired(env, issues, "EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER");
    expectRequired(env, issues, "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID");
  }

  if (resolvedPlatform === "android") {
    expectRequired(env, issues, "EXPO_PUBLIC_ANDROID_PACKAGE");
    expectRequired(env, issues, "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID");
  }

  return {
    ok: issues.length === 0,
    platform: resolvedPlatform,
    issues
  };
}

export function formatNativeRtdbValidationReport(result) {
  const platform = result.platform ?? "unknown";

  if (!result.ok) {
    return [
      `Mobile RTDB native preflight failed for ${platform}.`,
      "",
      ...result.issues.map((issue) => `- ${issue.key}: ${issue.message}`),
      "",
      "No secret values were printed. Fix the environment and rerun the command before native-device validation."
    ].join("\n");
  }

  return [
    `Mobile RTDB native preflight passed for ${platform}.`,
    "",
    "Next native-device validation steps:",
    "- Start the API with SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb and the matching Firebase Admin RTDB values.",
    "- Start Expo on a physical device or native simulator using this environment.",
    "- Confirm the Expo app scheme and native bundle/package identifier match the Firebase app registration.",
    "- As a guest, join a public silent-prayer session and confirm the aggregate count updates from RTDB.",
    "- Sign in as a brother, join a brother-visible silent-prayer session, and confirm only the aggregate private count updates.",
    "- Confirm the client cannot read presence, grant, participant, anonymous-session, or user-id paths."
  ].join("\n");
}

function parseArgs(argv) {
  let platform;
  let allowLocalApi = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--platform") {
      platform = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--platform=")) {
      platform = arg.slice("--platform=".length);
      continue;
    }

    if (arg === "--allow-local-api") {
      allowLocalApi = true;
    }
  }

  return { platform, allowLocalApi };
}

function normalizePlatform(platform) {
  if (typeof platform !== "string") {
    return null;
  }

  const normalized = platform.trim().toLowerCase();

  return VALID_PLATFORMS.has(normalized) ? normalized : null;
}

function readEnvString(env, key) {
  const value = env[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function expectRequired(env, issues, key) {
  if (!readEnvString(env, key)) {
    issues.push({
      key,
      message: "Required for native Firebase/RTDB validation."
    });
  }
}

function expectExact(env, issues, key, expected) {
  const value = readEnvString(env, key);

  if (value !== expected) {
    issues.push({
      key,
      message: `Expected ${expected}.`
    });
  }
}

function expectDatabaseUrl(env, issues, key) {
  const value = readEnvString(env, key);

  if (!value) {
    expectRequired(env, issues, key);
    return;
  }

  const url = parseUrl(value);

  if (!url || url.protocol !== "https:") {
    issues.push({
      key,
      message: "Expected an HTTPS Firebase Realtime Database URL."
    });
    return;
  }

  if (!url.hostname.endsWith("firebasedatabase.app") && !url.hostname.endsWith("firebaseio.com")) {
    issues.push({
      key,
      message: "Expected a Firebase Realtime Database host."
    });
  }
}

function expectApiBaseUrl(env, issues, key, { allowLocalApi }) {
  const value = readEnvString(env, key);

  if (!value) {
    expectRequired(env, issues, key);
    return;
  }

  const url = parseUrl(value);

  if (!url || url.protocol !== "https:") {
    issues.push({
      key,
      message: "Expected an HTTPS API base URL for pilot native-device validation."
    });
    return;
  }

  if (!allowLocalApi && isLocalHost(url.hostname)) {
    issues.push({
      key,
      message: "Native-device validation must use a device-reachable API URL, not localhost."
    });
  }
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validateMobileRtdbNativeEnv(parseArgs(process.argv.slice(2)));
  const report = formatNativeRtdbValidationReport(result);

  if (result.ok) {
    console.log(report);
  } else {
    console.error(report);
    process.exitCode = 1;
  }
}
