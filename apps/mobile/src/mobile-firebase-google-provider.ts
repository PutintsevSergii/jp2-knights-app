import { useMemo } from "react";
import * as Google from "expo-auth-session/providers/google.js";
import * as WebBrowser from "expo-web-browser";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  type UserCredential
} from "firebase/auth";
import {
  createExpoFirebaseGoogleSignInProvider,
  type ExpoFirebaseGoogleSignInConfig,
  type ExpoFirebaseOptions,
  type ExpoGoogleClientOptions
} from "./mobile-firebase-google-provider-core.js";
import type { MobileProviderSignIn } from "./mobile-provider-sign-in.js";

export type {
  CreateExpoFirebaseGoogleProviderOptions,
  ExpoFirebaseGoogleSignInConfig,
  ExpoFirebaseOptions,
  ExpoGoogleClientOptions,
  ExpoGooglePromptResult
} from "./mobile-firebase-google-provider-core.js";
export {
  createExpoFirebaseGoogleSignInProvider,
  readExpoFirebaseGoogleSignInConfig
} from "./mobile-firebase-google-provider-core.js";

const FIREBASE_APP_NAME = "jp2-mobile";

export function useExpoFirebaseGoogleSignInProvider(
  config: ExpoFirebaseGoogleSignInConfig
): MobileProviderSignIn {
  WebBrowser.maybeCompleteAuthSession();

  const [, , promptAsync] = Google.useIdTokenAuthRequest(
    buildGoogleAuthRequestConfig(config.google),
    config.redirectScheme
      ? {
          scheme: config.redirectScheme,
          path: "auth"
        }
      : undefined
  );

  return useMemo(
    () =>
      createExpoFirebaseGoogleSignInProvider({
        config,
        promptAsync,
        exchangeGoogleIdToken: exchangeGoogleIdTokenForFirebaseIdToken
      }),
    [config, promptAsync]
  );
}

async function exchangeGoogleIdTokenForFirebaseIdToken(
  firebase: ExpoFirebaseOptions,
  googleIdToken: string
): Promise<string> {
  const app = getOrCreateFirebaseApp(firebase);
  const credential = GoogleAuthProvider.credential(googleIdToken);
  const userCredential: UserCredential = await signInWithCredential(getAuth(app), credential);

  return userCredential.user.getIdToken();
}

function getOrCreateFirebaseApp(firebase: ExpoFirebaseOptions): FirebaseApp {
  if (getApps().some((app) => app.name === FIREBASE_APP_NAME)) {
    return getApp(FIREBASE_APP_NAME);
  }

  return initializeApp(firebase, FIREBASE_APP_NAME);
}

function buildGoogleAuthRequestConfig(
  google: ExpoGoogleClientOptions
): Partial<Google.GoogleAuthRequestConfig> {
  return {
    selectAccount: true,
    ...optionalObjectProperty("webClientId", google.webClientId),
    ...optionalObjectProperty("iosClientId", google.iosClientId),
    ...optionalObjectProperty("androidClientId", google.androidClientId)
  };
}

function optionalObjectProperty<TKey extends string>(
  key: TKey,
  value: string | undefined
): Partial<Record<TKey, string>> {
  return value ? ({ [key]: value } as Partial<Record<TKey, string>>) : {};
}
