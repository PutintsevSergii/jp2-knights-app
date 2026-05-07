import { describe, expect, it } from "vitest";
import {
  buildCurrentUserUrl,
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
  });

  it("maps auth failures into launch fallback states", () => {
    expect(currentUserLoadFailureState(new TypeError("network"))).toBe("offline");
    expect(currentUserLoadFailureState(new MobileAuthHttpError(401))).toBe("ready");
    expect(currentUserLoadFailureState(new MobileAuthHttpError(500))).toBe("error");
  });
});
