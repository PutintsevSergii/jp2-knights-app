import { afterEach, describe, expect, it, vi } from "vitest";
import type { ExternalAuthProvider } from "@jp2/auth-provider";
import type * as AuthProviderModule from "@jp2/auth-provider";

const createFirebaseAdminAuthProvider = vi.fn((options: unknown) => ({
  kind: "firebase",
  options
}));

vi.mock("@jp2/auth-provider", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthProviderModule>()),
  createFirebaseAdminAuthProvider
}));

describe("auth provider config", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    createFirebaseAdminAuthProvider.mockClear();
    vi.resetModules();
  });

  it("uses the fake provider outside production by default", async () => {
    delete process.env.AUTH_PROVIDER_MODE;
    process.env.NODE_ENV = "development";

    const { createConfiguredExternalAuthProvider } = await import("./auth-provider.config.js");
    const provider: ExternalAuthProvider = createConfiguredExternalAuthProvider();

    await expect(provider.verifyAccessToken("demo-admin-token")).resolves.toMatchObject({
      subject: "demo-admin",
      email: "admin@example.test"
    });
  });

  it("rejects the fake provider in production", async () => {
    process.env.AUTH_PROVIDER_MODE = "fake";
    process.env.NODE_ENV = "production";

    const { createConfiguredExternalAuthProvider } = await import("./auth-provider.config.js");

    expect(() => createConfiguredExternalAuthProvider()).toThrow(
      "AUTH_PROVIDER_MODE=fake is not allowed in production."
    );
  });

  it("passes defined Firebase settings to the Firebase provider", async () => {
    process.env.AUTH_PROVIDER_MODE = "firebase";
    process.env.FIREBASE_PROJECT_ID = "jp2";
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    const { createConfiguredExternalAuthProvider } = await import("./auth-provider.config.js");

    expect(createConfiguredExternalAuthProvider()).toEqual({
      kind: "firebase",
      options: { projectId: "jp2" }
    });
    expect(createFirebaseAdminAuthProvider).toHaveBeenCalledWith({ projectId: "jp2" });
  });

  it("rejects unsupported provider modes", async () => {
    process.env.AUTH_PROVIDER_MODE = "oauth";

    const { createConfiguredExternalAuthProvider } = await import("./auth-provider.config.js");

    expect(() => createConfiguredExternalAuthProvider()).toThrow(
      "Unsupported AUTH_PROVIDER_MODE 'oauth'."
    );
  });
});
