import type { RuntimeMode } from "@jp2/shared-types";
import type { MobileScreenState } from "./navigation.js";
import {
  homeAction,
  publicScreenTheme,
  publicStateCopy,
  type PublicScreenAction,
  type PublicScreenSection,
  type PublicScreenTheme
} from "./public-screen-contracts.js";

export interface SignInProviderAction {
  id: "firebase-google";
  label: string;
  accessibilityLabel: string;
  provider: "firebase-google";
}

export interface SignInScreen {
  route: "Login";
  state: MobileScreenState;
  title: string;
  body: string;
  providerAction: SignInProviderAction | null;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface BuildSignInScreenOptions {
  state: MobileScreenState;
  runtimeMode: RuntimeMode;
  errorMessage?: string | undefined;
}

export function buildSignInScreen(options: BuildSignInScreenOptions): SignInScreen {
  const copy = publicStateCopy("signIn", options.state);

  return {
    route: "Login",
    state: options.state,
    title: copy.title,
    body: options.errorMessage ?? copy.body,
    providerAction: options.state === "ready" ? googleProviderAction : null,
    sections: [
      {
        id: "provider-sign-in",
        title: "Google account access",
        body: "Google verifies identity through Firebase. Private app access still depends on the local JP2 approval state."
      }
    ],
    actions: [
      {
        id: "create-account",
        label: "Create Account",
        targetRoute: "JoinRequestForm"
      },
      homeAction
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

const googleProviderAction: SignInProviderAction = {
  id: "firebase-google",
  label: "Continue with Google",
  accessibilityLabel: "Continue with Google",
  provider: "firebase-google"
};
