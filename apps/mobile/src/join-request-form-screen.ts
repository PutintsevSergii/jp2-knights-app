import type { RuntimeMode } from "@jp2/shared-types";
import type { MobileScreenState } from "./navigation.js";
import {
  homeAction,
  publicScreenTheme,
  publicStateCopy,
  type PublicScreenAction,
  type PublicScreenTheme
} from "./public-screen-contracts.js";

export type JoinRequestFieldId =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "country"
  | "city"
  | "preferredLanguage"
  | "message";

export interface JoinRequestFormField {
  id: JoinRequestFieldId;
  label: string;
  required: boolean;
  keyboardType: "default" | "email-address" | "phone-pad";
  multiline: boolean;
}

export interface JoinRequestConsent {
  label: string;
  textVersion: string;
}

export interface JoinRequestFormStep {
  id: string;
  stepNumber: string;
  title: string;
  body: string;
  fieldIds: JoinRequestFieldId[];
}

export interface JoinRequestFormScreen {
  route: "JoinRequestForm";
  state: MobileScreenState;
  title: string;
  body: string;
  fields: JoinRequestFormField[];
  steps: JoinRequestFormStep[];
  consent: JoinRequestConsent;
  errorMessage?: string | undefined;
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface BuildJoinRequestFormScreenOptions {
  state: MobileScreenState;
  runtimeMode: RuntimeMode;
  errorMessage?: string | undefined;
}

export const JOIN_REQUEST_CONSENT_TEXT_VERSION = "candidate-request-v1";

export function buildJoinRequestFormScreen(
  options: BuildJoinRequestFormScreenOptions
): JoinRequestFormScreen {
  const copy = publicStateCopy("joinRequestForm", options.state);

  return {
    route: "JoinRequestForm",
    state: options.state,
    title: copy.title,
    body: copy.body,
    fields: options.state === "ready" ? joinRequestFormFields : [],
    steps: options.state === "ready" ? joinRequestFormSteps : [],
    consent: joinRequestConsent,
    errorMessage: options.errorMessage,
    actions: [homeAction],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

const joinRequestFormFields: JoinRequestFormField[] = [
  {
    id: "firstName",
    label: "First name",
    required: true,
    keyboardType: "default",
    multiline: false
  },
  {
    id: "lastName",
    label: "Last name",
    required: true,
    keyboardType: "default",
    multiline: false
  },
  {
    id: "email",
    label: "Email",
    required: true,
    keyboardType: "email-address",
    multiline: false
  },
  {
    id: "phone",
    label: "Phone",
    required: false,
    keyboardType: "phone-pad",
    multiline: false
  },
  {
    id: "country",
    label: "Country",
    required: true,
    keyboardType: "default",
    multiline: false
  },
  {
    id: "city",
    label: "City",
    required: true,
    keyboardType: "default",
    multiline: false
  },
  {
    id: "preferredLanguage",
    label: "Preferred language",
    required: false,
    keyboardType: "default",
    multiline: false
  },
  {
    id: "message",
    label: "Message",
    required: false,
    keyboardType: "default",
    multiline: true
  }
];

const joinRequestFormSteps: JoinRequestFormStep[] = [
  {
    id: "identity",
    stepNumber: "01",
    title: "Your name",
    body: "Tell the local officers who is asking for formation information.",
    fieldIds: ["firstName", "lastName"]
  },
  {
    id: "contact",
    stepNumber: "02",
    title: "Contact details",
    body: "Use an email and optional phone number where a local officer can follow up.",
    fieldIds: ["email", "phone"]
  },
  {
    id: "location",
    stepNumber: "03",
    title: "Local context",
    body: "Share your country, city, and preferred language for the first response.",
    fieldIds: ["country", "city", "preferredLanguage"]
  },
  {
    id: "message",
    stepNumber: "04",
    title: "Personal note",
    body: "Add anything helpful for the officer review. This is optional.",
    fieldIds: ["message"]
  }
];

const joinRequestConsent: JoinRequestConsent = {
  label: "I consent to being contacted about my interest request.",
  textVersion: JOIN_REQUEST_CONSENT_TEXT_VERSION
};
