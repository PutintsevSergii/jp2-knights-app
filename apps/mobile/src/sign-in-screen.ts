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

export type SignInFieldId = "email" | "password";

export interface SignInFormField {
  id: SignInFieldId;
  label: string;
  keyboardType: "default" | "email-address";
  secureTextEntry: boolean;
}

export interface SignInScreen {
  route: "Login";
  state: MobileScreenState;
  title: string;
  body: string;
  fields: SignInFormField[];
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
    fields: options.state === "ready" ? signInFormFields : [],
    sections: [
      {
        id: "provider-sign-in",
        title: "Account access",
        body: "Approved private access is resolved through the configured authentication provider and local JP2 approval state."
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

const signInFormFields: SignInFormField[] = [
  {
    id: "email",
    label: "Email",
    keyboardType: "email-address",
    secureTextEntry: false
  },
  {
    id: "password",
    label: "Password",
    keyboardType: "default",
    secureTextEntry: true
  }
];
