import { useState } from "react";
import type { RuntimeMode } from "@jp2/shared-types";
import type { PublicCandidateRequestResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  emptyJoinRequestFormDraft,
  submitDemoPublicCandidateRequest,
  type JoinRequestFormDraft
} from "./public-candidate-request.js";
import {
  publicCandidateRequestSubmitFailureState,
  submitPublicCandidateRequest
} from "./public-candidate-request-api.js";
import type { JoinRequestFieldId, PublicRoute, SignInFieldId } from "./public-screens.js";
import { JOIN_REQUEST_CONSENT_TEXT_VERSION } from "./public-screens.js";

export interface MobilePublicFormControllerOptions {
  runtimeMode: RuntimeMode;
  publicApiBaseUrl: string;
  onRouteChange: (route: PublicRoute) => void;
}

export function useMobilePublicFormController({
  runtimeMode,
  publicApiBaseUrl,
  onRouteChange
}: MobilePublicFormControllerOptions) {
  const [joinRequestState, setJoinRequestState] = useState<MobileScreenState>("ready");
  const [joinRequestDraft, setJoinRequestDraft] = useState<JoinRequestFormDraft>({
    ...emptyJoinRequestFormDraft
  });
  const [joinRequestConsentAccepted, setJoinRequestConsentAccepted] = useState(false);
  const [joinRequestErrorMessage, setJoinRequestErrorMessage] = useState<string | undefined>();
  const [joinRequestResponse, setJoinRequestResponse] = useState<
    PublicCandidateRequestResponseDto | undefined
  >();
  const [signInValues, setSignInValues] = useState<Record<SignInFieldId, string>>({
    email: "",
    password: ""
  });
  const [signInErrorMessage, setSignInErrorMessage] = useState<string | undefined>();

  function handleJoinRequestFieldChange(field: JoinRequestFieldId, value: string) {
    setJoinRequestDraft((current) => ({
      ...current,
      [field]: value
    }));
    setJoinRequestErrorMessage(undefined);
  }

  function handleJoinRequestConsentAcceptedChange(accepted: boolean) {
    setJoinRequestConsentAccepted(accepted);
    setJoinRequestErrorMessage(undefined);
  }

  function handleSignInFieldChange(field: SignInFieldId, value: string) {
    setSignInValues((current) => ({
      ...current,
      [field]: value
    }));
    setSignInErrorMessage(undefined);
  }

  function handleSignInSubmit() {
    setSignInErrorMessage(
      "Provider sign-in is not configured in this Expo shell yet. Use an approved bearer token for API-mode development."
    );
  }

  async function handleJoinRequestSubmit() {
    setJoinRequestState("loading");
    setJoinRequestErrorMessage(undefined);

    try {
      const request = buildJoinRequestPayload(
        joinRequestDraft,
        joinRequestConsentAccepted,
        createJoinRequestIdempotencyKey()
      );
      const response =
        runtimeMode === "demo"
          ? await submitDemoPublicCandidateRequest(request)
          : await submitPublicCandidateRequest({
              baseUrl: publicApiBaseUrl,
              request
            });

      setJoinRequestResponse(response);
      setJoinRequestState("ready");
      setJoinRequestDraft({ ...emptyJoinRequestFormDraft });
      setJoinRequestConsentAccepted(false);
      onRouteChange("JoinRequestConfirmation");
    } catch (error: unknown) {
      const failureState = publicCandidateRequestSubmitFailureState(error);
      setJoinRequestState(failureState === "offline" ? "offline" : "ready");
      setJoinRequestErrorMessage(joinRequestSubmitErrorMessage(error));
    }
  }

  return {
    joinRequestState,
    joinRequestDraft,
    joinRequestConsentAccepted,
    joinRequestErrorMessage,
    joinRequestResponse,
    signInValues,
    signInErrorMessage,
    handleJoinRequestFieldChange,
    handleJoinRequestConsentAcceptedChange,
    handleJoinRequestSubmit,
    handleSignInFieldChange,
    handleSignInSubmit
  };
}

function buildJoinRequestPayload(
  draft: JoinRequestFormDraft,
  consentAccepted: boolean,
  idempotencyKey: string
) {
  return {
    firstName: draft.firstName,
    lastName: draft.lastName,
    email: draft.email,
    phone: optionalNullable(draft.phone),
    country: draft.country,
    city: draft.city,
    preferredLanguage: optionalNullable(draft.preferredLanguage),
    message: optionalNullable(draft.message),
    consentAccepted,
    consentTextVersion: JOIN_REQUEST_CONSENT_TEXT_VERSION,
    idempotencyKey
  };
}

function optionalNullable(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function createJoinRequestIdempotencyKey() {
  return `mobile-${Date.now()}`;
}

function joinRequestSubmitErrorMessage(error: unknown) {
  if (publicCandidateRequestSubmitFailureState(error) === "offline") {
    return "Reconnect to submit your interest request.";
  }

  return "Check the required fields and consent, then try again.";
}
