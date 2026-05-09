import type { AuthSessionResponseDto } from "@jp2/shared-validation";
import {
  authSessionFailureMessage,
  createAuthSession,
  type MobileAuthFetch
} from "./mobile-auth-api.js";

export interface MobileProviderSignInResult {
  provider: "firebase-google";
  idToken: string;
}

export interface MobileProviderSignIn {
  signIn: () => Promise<MobileProviderSignInResult>;
}

export interface SubmitMobileProviderSignInOptions {
  provider: MobileProviderSignIn;
  baseUrl: string;
  fetchImpl?: MobileAuthFetch;
}

export interface MobileProviderSession {
  providerToken: string;
  response: AuthSessionResponseDto;
}

export async function submitMobileProviderSignIn({
  provider,
  baseUrl,
  fetchImpl
}: SubmitMobileProviderSignInOptions): Promise<MobileProviderSession> {
  const signIn = await provider.signIn();
  const response = await createAuthSession({
    baseUrl,
    request: {
      idToken: signIn.idToken
    },
    ...(fetchImpl ? { fetchImpl } : {})
  });

  return {
    providerToken: signIn.idToken,
    response
  };
}

export const unconfiguredGoogleSignInProvider: MobileProviderSignIn = {
  signIn(): Promise<MobileProviderSignInResult> {
    return Promise.reject(
      new MobileProviderSignInError(
        "Google/Firebase sign-in provider is not configured in this Expo build."
      )
    );
  }
};

export class MobileProviderSignInError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function mobileProviderSignInFailureMessage(error: unknown): string {
  if (error instanceof MobileProviderSignInError) {
    return error.message;
  }

  return authSessionFailureMessage(error);
}
