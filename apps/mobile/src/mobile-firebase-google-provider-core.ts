import {
  MobileProviderSignInError,
  type MobileProviderSignIn,
  type MobileProviderSignInResult
} from "./mobile-provider-sign-in.js";

export interface ExpoFirebaseOptions {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId?: string;
  storageBucket?: string;
}

export interface ExpoGoogleClientOptions {
  webClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
}

export interface ExpoFirebaseGoogleSignInConfig {
  firebase: ExpoFirebaseOptions;
  google: ExpoGoogleClientOptions;
  redirectScheme?: string;
}

export interface CreateExpoFirebaseGoogleProviderOptions {
  config: ExpoFirebaseGoogleSignInConfig;
  promptAsync: () => Promise<ExpoGooglePromptResult>;
  exchangeGoogleIdToken: (
    firebase: ExpoFirebaseOptions,
    googleIdToken: string
  ) => Promise<string>;
}

export type ExpoGooglePromptResult =
  | {
      type: "success";
      params: Record<string, string | undefined>;
    }
  | {
      type: "cancel" | "dismiss" | "opened" | "locked" | "error";
      params?: Record<string, string | undefined>;
    };

export function readExpoFirebaseGoogleSignInConfig(
  env: Record<string, unknown> = process.env
): ExpoFirebaseGoogleSignInConfig | null {
  const firebase = readFirebaseOptions(env);
  const google = readGoogleOptions(env);

  if (!firebase || !google) {
    return null;
  }

  return {
    firebase,
    google,
    ...optionalObjectProperty("redirectScheme", readEnvString(env, "EXPO_PUBLIC_APP_SCHEME"))
  };
}

export function createExpoFirebaseGoogleSignInProvider({
  config,
  promptAsync,
  exchangeGoogleIdToken
}: CreateExpoFirebaseGoogleProviderOptions): MobileProviderSignIn {
  return {
    async signIn(): Promise<MobileProviderSignInResult> {
      const result = await promptAsync();

      if (result.type !== "success") {
        throw new MobileProviderSignInError("Google sign-in was cancelled or did not complete.");
      }

      const googleIdToken = result.params.id_token?.trim();

      if (!googleIdToken) {
        throw new MobileProviderSignInError("Google sign-in did not return an ID token.");
      }

      return {
        provider: "firebase-google",
        idToken: await exchangeGoogleIdToken(config.firebase, googleIdToken)
      };
    }
  };
}

function readFirebaseOptions(env: Record<string, unknown>): ExpoFirebaseOptions | null {
  const apiKey = readEnvString(env, "EXPO_PUBLIC_FIREBASE_API_KEY");
  const authDomain = readEnvString(env, "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const projectId = readEnvString(env, "EXPO_PUBLIC_FIREBASE_PROJECT_ID");
  const appId = readEnvString(env, "EXPO_PUBLIC_FIREBASE_APP_ID");

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    ...optionalObjectProperty(
      "messagingSenderId",
      readEnvString(env, "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID")
    ),
    ...optionalObjectProperty(
      "storageBucket",
      readEnvString(env, "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET")
    )
  };
}

function readGoogleOptions(env: Record<string, unknown>): ExpoGoogleClientOptions | null {
  const google = {
    ...optionalObjectProperty("webClientId", readEnvString(env, "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID")),
    ...optionalObjectProperty("iosClientId", readEnvString(env, "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID")),
    ...optionalObjectProperty(
      "androidClientId",
      readEnvString(env, "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID")
    )
  };

  return google.webClientId || google.iosClientId || google.androidClientId ? google : null;
}

function readEnvString(env: Record<string, unknown>, key: string): string | undefined {
  const value = env[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function optionalObjectProperty<TKey extends string>(
  key: TKey,
  value: string | undefined
): Partial<Record<TKey, string>> {
  return value ? ({ [key]: value } as Partial<Record<TKey, string>>) : {};
}
