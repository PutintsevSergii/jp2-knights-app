import { describe, expect, it } from "vitest";
import {
  ExternalAuthError,
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
    await expect(firebaseWith({ uid: "u", exp: 1 }).verifyAccessToken("expired")).rejects.toMatchObject({
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
    await expect(firebaseWith({ exp: 4_102_444_800 }).verifyAccessToken("malformed")).rejects.toMatchObject({
      code: "malformed-token"
    });
    await expect(
      new FirebaseAuthProvider(() => Promise.reject(new Error("bad signature"))).verifyAccessToken(
        "invalid"
      )
    ).rejects.toBeInstanceOf(ExternalAuthError);
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
    await expect(Promise.resolve().then(() => provider.verifyAccessToken("missing"))).rejects.toMatchObject({
      code: "invalid-token"
    });
  });
});

function firebaseWith(claims: Partial<FirebaseVerifiedToken>): FirebaseAuthProvider {
  return new FirebaseAuthProvider(() => Promise.resolve(claims as FirebaseVerifiedToken));
}
