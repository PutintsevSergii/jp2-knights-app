import { describe, expect, it, vi } from "vitest";
import {
  authSessionFailureMessage,
  buildAuthSessionUrl,
  buildCurrentUserUrl,
  createAuthSession,
  currentUserLoadFailureState,
  fetchCurrentUser,
  MobileAuthHttpError,
  readMobileAuthToken,
  toMobilePrincipal
} from "./mobile-auth-api.js";
import type { CurrentUserResponseDto } from "@jp2/shared-validation";

const currentUser: CurrentUserResponseDto = {
  user: {
    id: "user-1",
    email: "candidate@example.test",
    displayName: "Candidate User",
    preferredLanguage: "en",
    status: "active",
    roles: ["CANDIDATE"]
  },
  access: {
    mobileMode: "candidate",
    adminLite: false,
    candidateOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
    memberOrganizationUnitIds: [],
    officerOrganizationUnitIds: [],
    approval: null
  }
};

describe("mobile auth API", () => {
  it("builds the current-user URL from the configured API base", () => {
    expect(buildCurrentUserUrl("https://api.example.test")).toBe(
      "https://api.example.test/auth/me"
    );
    expect(buildCurrentUserUrl("https://api.example.test/")).toBe(
      "https://api.example.test/auth/me"
    );
  });

  it("builds the auth-session URL from the configured API base", () => {
    expect(buildAuthSessionUrl("https://api.example.test")).toBe(
      "https://api.example.test/auth/session"
    );
  });

  it("fetches and validates the current user with a bearer token", async () => {
    const seen: Array<{ input: string; authorization?: string }> = [];
    const response = await fetchCurrentUser({
      baseUrl: "https://api.example.test",
      authToken: "provider-token",
      fetchImpl: (input, init) => {
        seen.push({ input, authorization: init?.headers?.authorization ?? "" });

        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(currentUser)
        });
      }
    });

    expect(response.user.id).toBe("user-1");
    expect(seen).toEqual([
      {
        input: "https://api.example.test/auth/me",
        authorization: "Bearer provider-token"
      }
    ]);
  });

  it("creates an auth session by posting a provider ID token", async () => {
    const seen: Array<{ input: string; method?: string; body?: string }> = [];
    const response = await createAuthSession({
      baseUrl: "https://api.example.test",
      request: {
        idToken: "firebase-id-token"
      },
      fetchImpl: (input, init) => {
        const entry: { input: string; method?: string; body?: string } = { input };

        if (init?.method) {
          entry.method = init.method;
        }

        if (init?.body) {
          entry.body = init.body;
        }

        seen.push(entry);

        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              currentUser,
              session: {
                transport: "bearer",
                expiresAt: null
              }
            })
        });
      }
    });

    expect(response.currentUser.user.id).toBe("user-1");
    expect(seen).toEqual([
      {
        input: "https://api.example.test/auth/session",
        method: "POST",
        body: "{\"idToken\":\"firebase-id-token\"}"
      }
    ]);
  });

  it("fetches the current user without credentials for public-only launch checks", async () => {
    const seen: Array<{ input: string; authorization: string | undefined }> = [];
    const response = await fetchCurrentUser({
      baseUrl: "https://api.example.test",
      fetchImpl: (input, init) => {
        seen.push({ input, authorization: init?.headers?.authorization });

        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(currentUser)
        });
      }
    });

    expect(response.access.mobileMode).toBe("candidate");
    expect(seen).toEqual([
      {
        input: "https://api.example.test/auth/me",
        authorization: undefined
      }
    ]);
  });

  it("maps current-user responses into mobile principals", () => {
    expect(toMobilePrincipal(currentUser)).toMatchObject({
      id: "user-1",
      roles: ["CANDIDATE"],
      candidateOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("reads Expo public auth tokens before generic tokens", () => {
    expect(
      readMobileAuthToken({
        EXPO_PUBLIC_AUTH_TOKEN: " expo-token ",
        APP_AUTH_TOKEN: "generic-token"
      })
    ).toBe("expo-token");
    expect(
      readMobileAuthToken({
        EXPO_PUBLIC_AUTH_TOKEN: " ",
        APP_AUTH_TOKEN: " generic-token "
      })
    ).toBe("generic-token");
    expect(
      readMobileAuthToken({
        EXPO_PUBLIC_AUTH_TOKEN: 42,
        APP_AUTH_TOKEN: "generic-token"
      })
    ).toBe("generic-token");
  });

  it("maps auth failures into launch fallback states", () => {
    expect(currentUserLoadFailureState(new TypeError("network"))).toBe("offline");
    expect(currentUserLoadFailureState(new MobileAuthHttpError(401))).toBe("ready");
    expect(currentUserLoadFailureState(new MobileAuthHttpError(403))).toBe("ready");
    expect(currentUserLoadFailureState(new MobileAuthHttpError(500))).toBe("error");
  });

  it("maps auth session failures into provider sign-in copy", () => {
    expect(authSessionFailureMessage(new TypeError("network"))).toBe(
      "Reconnect to sign in with Google."
    );
    expect(authSessionFailureMessage(new MobileAuthHttpError(401))).toBe(
      "Google sign-in was not accepted for private app access yet."
    );
    expect(authSessionFailureMessage(new Error("bad"))).toBe(
      "Google sign-in could not be completed. Try again."
    );
  });

  it("uses the global fetch implementation when one is available", async () => {
    const previousFetch = globalThis.fetch;
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(currentUser)
      })
    );

    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

    try {
      await expect(fetchCurrentUser({ baseUrl: "https://api.example.test" })).resolves.toEqual(
        currentUser
      );
      expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/auth/me", { headers: {} });
    } finally {
      globalThis.fetch = previousFetch;
    }
  });
});
