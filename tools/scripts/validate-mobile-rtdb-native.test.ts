import { describe, expect, it } from "vitest";

interface ValidationIssue {
  key: string;
  message: string;
}

interface ValidationResult {
  ok: boolean;
  platform: "ios" | "android" | null;
  issues: ValidationIssue[];
}

interface ValidationModule {
  validateMobileRtdbNativeEnv(options: {
    env: Record<string, string | undefined>;
    platform?: string;
    allowLocalApi?: boolean;
  }): ValidationResult;
  formatNativeRtdbValidationReport(result: ValidationResult): string;
}

const validationModule = (await import("./validate-mobile-rtdb-native.mjs")) as ValidationModule;

describe("mobile RTDB native validation preflight", () => {
  it("passes with iOS pilot RTDB and Google sign-in environment values", () => {
    const result = validationModule.validateMobileRtdbNativeEnv({
      platform: "ios",
      env: {
        ...basePilotEnv,
        EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER: "org.jp2.pilot",
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "ios-client-id"
      }
    });

    expect(result).toEqual({
      ok: true,
      platform: "ios",
      issues: []
    });
    expect(validationModule.formatNativeRtdbValidationReport(result)).toContain(
      "Mobile RTDB native preflight passed for ios."
    );
  });

  it("requires the Android package and native OAuth client for Android validation", () => {
    const result = validationModule.validateMobileRtdbNativeEnv({
      platform: "android",
      env: basePilotEnv
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual({
      key: "EXPO_PUBLIC_ANDROID_PACKAGE",
      message: "Required for native Firebase/RTDB validation."
    });
    expect(result.issues).toContainEqual({
      key: "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID",
      message: "Required for native Firebase/RTDB validation."
    });
  });

  it("rejects socket/default mode and localhost API URLs for pilot device runs", () => {
    const result = validationModule.validateMobileRtdbNativeEnv({
      platform: "ios",
      env: {
        ...basePilotEnv,
        EXPO_PUBLIC_APP_RUNTIME_MODE: "demo",
        EXPO_PUBLIC_SILENT_PRAYER_REALTIME_PROVIDER: "redis-socket",
        EXPO_PUBLIC_API_BASE_URL: "https://localhost:3000/api",
        EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER: "org.jp2.pilot",
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "ios-client-id"
      }
    });

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.key)).toEqual(
      expect.arrayContaining([
        "EXPO_PUBLIC_APP_RUNTIME_MODE",
        "EXPO_PUBLIC_SILENT_PRAYER_REALTIME_PROVIDER",
        "EXPO_PUBLIC_API_BASE_URL"
      ])
    );
  });

  it("rejects missing or non-Firebase RTDB database URLs", () => {
    const result = validationModule.validateMobileRtdbNativeEnv({
      platform: "ios",
      env: {
        ...basePilotEnv,
        EXPO_PUBLIC_FIREBASE_DATABASE_URL: "https://example.test",
        EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER: "org.jp2.pilot",
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "ios-client-id"
      }
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual({
      key: "EXPO_PUBLIC_FIREBASE_DATABASE_URL",
      message: "Expected a Firebase Realtime Database host."
    });
  });
});

const basePilotEnv = {
  APP_RUNTIME_MODE: "api",
  EXPO_PUBLIC_APP_RUNTIME_MODE: "api",
  EXPO_PUBLIC_SILENT_PRAYER_REALTIME_PROVIDER: "firebase-rtdb",
  EXPO_PUBLIC_API_BASE_URL: "https://api.pilot.example.test/api",
  EXPO_PUBLIC_FIREBASE_API_KEY: "firebase-api-key",
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: "jp2-pilot.firebaseapp.com",
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: "jp2-pilot",
  EXPO_PUBLIC_FIREBASE_APP_ID: "1:123:web:abc",
  EXPO_PUBLIC_FIREBASE_DATABASE_URL: "https://jp2-pilot-default-rtdb.europe-west1.firebasedatabase.app",
  EXPO_PUBLIC_APP_SCHEME: "jp2",
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "web-client-id"
};
