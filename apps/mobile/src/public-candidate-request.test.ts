import { describe, expect, it } from "vitest";
import {
  emptyJoinRequestFormDraft,
  fallbackPublicCandidateRequestResponse,
  submitDemoPublicCandidateRequest
} from "./public-candidate-request.js";

describe("mobile public candidate request fallback", () => {
  it("provides an empty controlled draft for the join request form", () => {
    expect(emptyJoinRequestFormDraft).toEqual({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      preferredLanguage: "",
      message: ""
    });
  });

  it("validates demo submissions through the shared public request schema", async () => {
    await expect(
      submitDemoPublicCandidateRequest({
        firstName: "Anna",
        lastName: "Nowak",
        email: "anna@example.test",
        phone: null,
        country: "Latvia",
        city: "Riga",
        preferredLanguage: "en",
        message: null,
        consentAccepted: true,
        consentTextVersion: "candidate-request-v1",
        idempotencyKey: "demo-test-1"
      })
    ).resolves.toEqual(fallbackPublicCandidateRequestResponse);
  });
});
