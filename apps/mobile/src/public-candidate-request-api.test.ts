import { describe, expect, it, vi } from "vitest";
import {
  buildPublicCandidateRequestUrl,
  publicCandidateRequestSubmitFailureState,
  PublicCandidateRequestHttpError,
  submitPublicCandidateRequest
} from "./public-candidate-request-api.js";

const candidateRequestPayload = {
  firstName: "Anna",
  lastName: "Nowak",
  email: "ANNA@example.test",
  phone: null,
  country: "Latvia",
  city: "Riga",
  preferredLanguage: "en",
  message: "I would like to learn more.",
  consentAccepted: true,
  consentTextVersion: "candidate-request-v1",
  idempotencyKey: "mobile-test-1"
};

const candidateRequestResponse = {
  request: {
    id: "11111111-1111-4111-8111-111111111111",
    status: "new"
  }
};

describe("mobile public candidate request API client", () => {
  it("builds the public candidate request URL from the API base URL", () => {
    expect(buildPublicCandidateRequestUrl("https://api.example.test")).toBe(
      "https://api.example.test/public/candidate-requests"
    );
    expect(buildPublicCandidateRequestUrl("https://api.example.test/")).toBe(
      "https://api.example.test/public/candidate-requests"
    );
  });

  it("posts a schema-normalized request and validates the response", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(candidateRequestResponse)
      })
    );

    await expect(
      submitPublicCandidateRequest({
        baseUrl: "https://api.example.test",
        request: candidateRequestPayload,
        fetchImpl
      })
    ).resolves.toEqual(candidateRequestResponse);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/public/candidate-requests",
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          ...candidateRequestPayload,
          email: "anna@example.test"
        })
      })
    );
  });

  it("rejects invalid requests before hitting the network", async () => {
    const fetchImpl = vi.fn();

    await expect(
      submitPublicCandidateRequest({
        request: {
          ...candidateRequestPayload,
          consentAccepted: false
        },
        fetchImpl
      })
    ).rejects.toThrow();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("maps HTTP and network failures into screen states", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 429,
        json: () => Promise.resolve({})
      })
    );

    await expect(submitPublicCandidateRequest({ request: candidateRequestPayload, fetchImpl }))
      .rejects.toBeInstanceOf(PublicCandidateRequestHttpError);
    expect(publicCandidateRequestSubmitFailureState(new PublicCandidateRequestHttpError(429))).toBe(
      "error"
    );
    expect(
      publicCandidateRequestSubmitFailureState(new TypeError("Network request failed"))
    ).toBe("offline");
  });
});
