import { describe, expect, it, vi } from "vitest";
import {
  mobileProviderSignInFailureMessage,
  MobileProviderSignInError,
  submitMobileProviderSignIn,
  unconfiguredGoogleSignInProvider
} from "./mobile-provider-sign-in.js";
import type { CurrentUserResponseDto } from "@jp2/shared-validation";

const currentUser: CurrentUserResponseDto = {
  user: {
    id: "brother-1",
    email: "brother@example.test",
    displayName: "Brother User",
    preferredLanguage: "en",
    status: "active",
    roles: ["BROTHER"]
  },
  access: {
    mobileMode: "brother",
    adminLite: false,
    candidateOrganizationUnitId: null,
    memberOrganizationUnitIds: ["11111111-1111-4111-8111-111111111111"],
    officerOrganizationUnitIds: [],
    approval: null
  }
};

describe("mobile provider sign-in", () => {
  it("exchanges a Firebase Google provider token for a JP2 auth session", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
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
      })
    );

    const session = await submitMobileProviderSignIn({
      baseUrl: "https://api.example.test",
      provider: {
        signIn: () =>
          Promise.resolve({
            provider: "firebase-google",
            idToken: "firebase-id-token"
          })
      },
      fetchImpl
    });

    expect(session.providerToken).toBe("firebase-id-token");
    expect(session.response.currentUser.access.mobileMode).toBe("brother");
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/auth/session", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: "{\"idToken\":\"firebase-id-token\"}"
    });
  });

  it("keeps the default provider explicit until a native Firebase SDK is installed", async () => {
    await expect(unconfiguredGoogleSignInProvider.signIn()).rejects.toBeInstanceOf(
      MobileProviderSignInError
    );
    expect(
      mobileProviderSignInFailureMessage(
        new MobileProviderSignInError("Google/Firebase sign-in provider is not configured.")
      )
    ).toBe("Google/Firebase sign-in provider is not configured.");
  });
});
