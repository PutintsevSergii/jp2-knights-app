import { describe, expect, it, vi } from "vitest";
import {
  createExpoFirebaseGoogleSignInProvider,
  readExpoFirebaseGoogleSignInConfig
} from "./mobile-firebase-google-provider-core.js";
import { MobileProviderSignInError } from "./mobile-provider-sign-in.js";

describe("mobile Firebase Google provider", () => {
  it("reads Expo public Firebase and Google sign-in configuration", () => {
    expect(
      readExpoFirebaseGoogleSignInConfig({
        EXPO_PUBLIC_FIREBASE_API_KEY: " api-key ",
        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: " jp2.firebaseapp.com ",
        EXPO_PUBLIC_FIREBASE_PROJECT_ID: " jp2-project ",
        EXPO_PUBLIC_FIREBASE_APP_ID: " app-id ",
        EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: " sender ",
        EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: " bucket ",
        EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: " web-client ",
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: " ios-client ",
        EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: " android-client ",
        EXPO_PUBLIC_APP_SCHEME: " jp2 "
      })
    ).toEqual({
      firebase: {
        apiKey: "api-key",
        authDomain: "jp2.firebaseapp.com",
        projectId: "jp2-project",
        appId: "app-id",
        messagingSenderId: "sender",
        storageBucket: "bucket"
      },
      google: {
        webClientId: "web-client",
        iosClientId: "ios-client",
        androidClientId: "android-client"
      },
      redirectScheme: "jp2"
    });
  });

  it("stays unconfigured until both Firebase app and Google client IDs exist", () => {
    expect(readExpoFirebaseGoogleSignInConfig({})).toBeNull();
    expect(
      readExpoFirebaseGoogleSignInConfig({
        EXPO_PUBLIC_FIREBASE_API_KEY: "api-key",
        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: "jp2.firebaseapp.com",
        EXPO_PUBLIC_FIREBASE_PROJECT_ID: "jp2-project",
        EXPO_PUBLIC_FIREBASE_APP_ID: "app-id"
      })
    ).toBeNull();
    expect(
      readExpoFirebaseGoogleSignInConfig({
        EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "web-client"
      })
    ).toBeNull();
  });

  it("exchanges a Google ID token for a Firebase ID token through the injected exchanger", async () => {
    const exchangeGoogleIdToken = vi.fn(() => Promise.resolve("firebase-id-token"));
    const provider = createExpoFirebaseGoogleSignInProvider({
      config: configuredSignIn(),
      promptAsync: () =>
        Promise.resolve({
          type: "success",
          params: {
            id_token: " google-id-token "
          }
        }),
      exchangeGoogleIdToken
    });

    await expect(provider.signIn()).resolves.toEqual({
      provider: "firebase-google",
      idToken: "firebase-id-token"
    });
    expect(exchangeGoogleIdToken).toHaveBeenCalledWith(
      configuredSignIn().firebase,
      "google-id-token"
    );
  });

  it("fails without returning a token when Google sign-in is cancelled or incomplete", async () => {
    await expect(
      createExpoFirebaseGoogleSignInProvider({
        config: configuredSignIn(),
        promptAsync: () =>
          Promise.resolve({
            type: "cancel"
          }),
        exchangeGoogleIdToken: () => Promise.resolve("firebase-id-token")
      }).signIn()
    ).rejects.toBeInstanceOf(MobileProviderSignInError);

    await expect(
      createExpoFirebaseGoogleSignInProvider({
        config: configuredSignIn(),
        promptAsync: () =>
          Promise.resolve({
            type: "success",
            params: {}
          }),
        exchangeGoogleIdToken: () => Promise.resolve("firebase-id-token")
      }).signIn()
    ).rejects.toBeInstanceOf(MobileProviderSignInError);
  });
});

function configuredSignIn() {
  return {
    firebase: {
      apiKey: "api-key",
      authDomain: "jp2.firebaseapp.com",
      projectId: "jp2-project",
      appId: "app-id"
    },
    google: {
      webClientId: "web-client"
    }
  };
}
