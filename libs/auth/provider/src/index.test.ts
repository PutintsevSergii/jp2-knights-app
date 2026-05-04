import { describe, expect, it } from "vitest";
import {
  ExternalAuthError,
  FirebaseAdminAuthProvider,
  FirebaseAuthProvider,
  StaticTokenAuthProvider,
  type FirebaseVerifiedToken
} from "./index.js";

describe("FirebaseAuthProvider", () => {
  it("normalizes verified Firebase token claims", async () => {
    const provider = new FirebaseAuthProvider(() =>
      Promise.resolve({
        uid: "firebase-user-1",
        aud: "jp2-app",
        email: "user@example.test",
        email_verified: true,
        phone_number: "+37100000000",
        name: "Demo User",
        picture: "https://example.test/avatar.png",
        auth_time: 1_765_000_000,
        iat: 1_765_000_001,
        exp: 4_102_444_800
      })
    );

    await expect(
      provider.verifyAccessToken("valid-token", { requiredAudience: "jp2-app" })
    ).resolves.toMatchObject({
      provider: "firebase",
      subject: "firebase-user-1",
      email: "user@example.test",
      emailVerified: true,
      displayName: "Demo User"
    });
  });

  it("rejects expired, wrong-audience, revoked, disabled, malformed, and provider-invalid tokens", async () => {
    await expect(
      firebaseWith({ uid: "u", exp: 1 }).verifyAccessToken("expired")
    ).rejects.toMatchObject({
      code: "expired-token"
    });
    await expect(
      firebaseWith({ uid: "u", aud: "other", exp: 4_102_444_800 }).verifyAccessToken("wrong", {
        requiredAudience: "jp2-app"
      })
    ).rejects.toMatchObject({ code: "wrong-audience" });
    await expect(
      firebaseWith({ uid: "u", exp: 4_102_444_800, revoked: true }).verifyAccessToken("revoked", {
        checkRevoked: true
      })
    ).rejects.toMatchObject({ code: "revoked-token" });
    await expect(
      firebaseWith({ uid: "u", exp: 4_102_444_800, disabled: true }).verifyAccessToken("disabled")
    ).rejects.toMatchObject({ code: "disabled-user" });
    await expect(
      firebaseWith({ exp: 4_102_444_800 }).verifyAccessToken("malformed")
    ).rejects.toMatchObject({
      code: "malformed-token"
    });
    await expect(
      new FirebaseAuthProvider(() => Promise.reject(new Error("bad signature"))).verifyAccessToken(
        "invalid"
      )
    ).rejects.toBeInstanceOf(ExternalAuthError);
    await expect(
      new FirebaseAuthProvider(() =>
        Promise.reject(new ExternalAuthError("provider-unconfigured", "missing config"))
      ).verifyAccessToken("invalid")
    ).rejects.toMatchObject({ code: "provider-unconfigured" });
  });
});

describe("StaticTokenAuthProvider", () => {
  it("supports fake-provider replacement tests without Firebase classes", async () => {
    const provider = StaticTokenAuthProvider.fromRecords("fake", {
      "fake-token": {
        subject: "subject-1",
        email: "user@example.test",
        emailVerified: true
      }
    });

    await expect(provider.verifyAccessToken("fake-token")).resolves.toMatchObject({
      provider: "fake",
      subject: "subject-1"
    });
    await expect(
      Promise.resolve().then(() => provider.verifyAccessToken("missing"))
    ).rejects.toMatchObject({
      code: "invalid-token"
    });
  });

  it("rejects expired fake-provider tokens", async () => {
    const provider = StaticTokenAuthProvider.fromRecords("fake", {
      expired: {
        subject: "subject-1",
        expiresAt: new Date(0)
      }
    });

    await expect(provider.verifyAccessToken("expired")).rejects.toMatchObject({
      code: "expired-token"
    });
  });
});

describe("FirebaseAdminAuthProvider", () => {
  it("adapts Firebase Admin session cookie, verification, and revocation methods", async () => {
    const calls: string[] = [];
    const provider = new FirebaseAdminAuthProvider({
      createSessionCookie: (idToken: string, options: { expiresIn: number }) => {
        calls.push(`${idToken}:${options.expiresIn}`);
        return Promise.resolve("cookie_1");
      },
      verifyIdToken: () => Promise.reject(new Error("verifyIdToken should not be called")),
      verifySessionCookie: () =>
        Promise.resolve({
          uid: "firebase-user-1",
          email: "user@example.test",
          exp: 4_102_444_800
        }),
      revokeRefreshTokens: (providerSubject: string) => {
        calls.push(`revoke:${providerSubject}`);
        return Promise.resolve();
      }
    } as never);

    await expect(
      provider.createSessionCookie("id-token", {
        expiresInMs: 60_000,
        secure: true,
        httpOnly: true,
        sameSite: "lax"
      })
    ).resolves.toBe("cookie_1");
    await expect(provider.verifySessionCookie("cookie_1")).resolves.toMatchObject({
      provider: "firebase",
      subject: "firebase-user-1",
      email: "user@example.test"
    });
    await expect(provider.revokeUserSessions("firebase-user-1")).resolves.toBeUndefined();
    expect(calls).toEqual(["id-token:60000", "revoke:firebase-user-1"]);
  });
});

function firebaseWith(claims: Partial<FirebaseVerifiedToken>): FirebaseAuthProvider {
  return new FirebaseAuthProvider(() => Promise.resolve(claims as FirebaseVerifiedToken));
}
