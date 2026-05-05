import {
  createPublicCandidateRequestSchema,
  publicCandidateRequestResponseSchema,
  type PublicCandidateRequestResponseDto
} from "@jp2/shared-validation";
import type { JoinRequestFieldId } from "./public-screens.js";
import { JOIN_REQUEST_CONSENT_TEXT_VERSION } from "./public-screens.js";

export type JoinRequestFormDraft = Record<JoinRequestFieldId, string>;

export const emptyJoinRequestFormDraft: JoinRequestFormDraft = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  preferredLanguage: "",
  message: ""
};

export const fallbackPublicCandidateRequestResponse = publicCandidateRequestResponseSchema.parse({
  request: {
    id: "00000000-0000-4000-8000-000000000009",
    status: "new"
  }
}) satisfies PublicCandidateRequestResponseDto;

export function submitDemoPublicCandidateRequest(
  request: unknown
): Promise<PublicCandidateRequestResponseDto> {
  const parsedRequest = createPublicCandidateRequestSchema.parse(request);

  if (parsedRequest.consentTextVersion !== JOIN_REQUEST_CONSENT_TEXT_VERSION) {
    throw new Error("Unsupported candidate request consent text version.");
  }

  return Promise.resolve(fallbackPublicCandidateRequestResponse);
}
