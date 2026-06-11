import { describe, expect, it } from "vitest";

interface ValidationIssue {
  key: string;
  message: string;
}

interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

interface EvidenceModule {
  validateNativeRtdbEvidence(evidence: unknown): ValidationResult;
  formatNativeRtdbEvidenceReport(result: ValidationResult): string;
}

const evidenceModule = (await import("./validate-mobile-rtdb-evidence.mjs")) as EvidenceModule;

describe("mobile RTDB native validation evidence", () => {
  it("passes sanitized evidence with all required native RTDB scenarios", () => {
    const result = evidenceModule.validateNativeRtdbEvidence(validEvidence);

    expect(result).toEqual({
      ok: true,
      issues: []
    });
    expect(evidenceModule.formatNativeRtdbEvidenceReport(result)).toContain(
      "Native RTDB validation evidence passed local checks."
    );
  });

  it("rejects missing or failed required scenarios", () => {
    const result = evidenceModule.validateNativeRtdbEvidence({
      ...validEvidence,
      scenarios: [
        scenario("guest-public-count", guestPublicEvidence),
        scenario("brother-private-count", brotherPrivateEvidence, "failed"),
        scenario("privacy-denial", privacyDenialEvidence)
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual({
      key: "scenarios.brother-private-count.status",
      message: "Required scenario must have status passed."
    });
    expect(result.issues).toContainEqual({
      key: "scenarios.leave-cleanup",
      message: "Required scenario is missing."
    });
  });

  it("rejects secret-shaped, participant, session, user, roster, and email evidence", () => {
    const result = evidenceModule.validateNativeRtdbEvidence({
      ...validEvidence,
      operatorEmail: "officer@example.test",
      rawLog: "DATABASE_URL=postgresql://user:pass@example/db",
      scenarios: [
        scenario("guest-public-count", guestPublicEvidence),
        {
          ...scenario("brother-private-count", brotherPrivateEvidence),
          firebaseUid: "firebase-user-123",
          participantIds: ["participant-1"],
          evidence: ["jp2_session=raw-cookie-value"]
        },
        scenario("privacy-denial", privacyDenialEvidence),
        {
          ...scenario("leave-cleanup", leaveCleanupEvidence),
          roster: ["Brother One"]
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.key)).toEqual(
      expect.arrayContaining([
        "$.operatorEmail",
        "$.rawLog",
        "$.scenarios[1].firebaseUid",
        "$.scenarios[1].participantIds",
        "$.scenarios[1].evidence[0]",
        "$.scenarios[3].roster"
      ])
    );
  });

  it("rejects vague evidence that does not prove aggregate-only RTDB observations", () => {
    const result = evidenceModule.validateNativeRtdbEvidence({
      ...validEvidence,
      scenarios: [
        scenario("guest-public-count", ["The screen worked."]),
        scenario("brother-private-count", ["Brother route passed."]),
        scenario("privacy-denial", ["Privacy looked okay."]),
        scenario("leave-cleanup", ["Closed the app."])
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        {
          key: "scenarios.guest-public-count.evidence",
          message: "Evidence must include public aggregate count change."
        },
        {
          key: "scenarios.brother-private-count.evidence",
          message: "Evidence must include API-issued private read grant."
        },
        {
          key: "scenarios.privacy-denial.evidence",
          message: "Evidence must include client read/write denial."
        },
        {
          key: "scenarios.leave-cleanup.evidence",
          message: "Evidence must include listener cleanup."
        }
      ])
    );
  });

  it("rejects non-string evidence notes", () => {
    const result = evidenceModule.validateNativeRtdbEvidence({
      ...validEvidence,
      scenarios: [
        scenario("guest-public-count", [{ note: "public aggregate count changed" }]),
        scenario("brother-private-count", brotherPrivateEvidence),
        scenario("privacy-denial", privacyDenialEvidence),
        scenario("leave-cleanup", leaveCleanupEvidence)
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual({
      key: "scenarios.guest-public-count.evidence",
      message: "Evidence notes must be non-empty strings."
    });
  });

  it("rejects malformed top-level evidence metadata", () => {
    const result = evidenceModule.validateNativeRtdbEvidence({
      ...validEvidence,
      platform: "web",
      preflightPassed: false,
      validatedAt: "not-a-date",
      apiBaseUrl: "http://localhost:3000/api",
      firebaseProjectId: "",
      deviceTarget: ""
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        {
          key: "platform",
          message: "Expected one of: ios, android."
        },
        {
          key: "preflightPassed",
          message: "Expected true."
        },
        {
          key: "validatedAt",
          message: "Expected an ISO date/time string."
        },
        {
          key: "apiBaseUrl",
          message: "Expected an HTTPS URL."
        },
        {
          key: "firebaseProjectId",
          message: "Expected a non-empty string."
        },
        {
          key: "deviceTarget",
          message: "Expected a non-empty string."
        }
      ])
    );
  });
});

function scenario(id: string, evidence: unknown[], status = "passed") {
  return {
    id,
    status,
    evidence
  };
}

const guestPublicEvidence = [
  "Public silent-prayer list route loaded through API with HTTP 200.",
  "Guest join used REST heartbeat and RTDB public aggregate count changed 0 -> 1 -> 0."
];

const brotherPrivateEvidence = [
  "Brother sign-in resolved through API session and brother silent-prayer list loaded with HTTP 200.",
  "Brother join used REST heartbeat and RTDB private aggregate count changed 0 -> 1 -> 0 with API-issued read grant."
];

const privacyDenialEvidence = [
  "Client reads and writes outside aggregate count paths were denied by RTDB rules.",
  "No participant, session, user, roster, or private data was visible to the app."
];

const leaveCleanupEvidence = [
  "Leaving the screen unsubscribed the listener, sent REST leave, and aggregate count decremented after leave or expiry."
];

const validEvidence = {
  platform: "ios",
  preflightPassed: true,
  validatedAt: "2026-06-11T12:00:00.000Z",
  apiBaseUrl: "https://api.pilot.example.test/api",
  firebaseProjectId: "jp2-pilot",
  deviceTarget: "iPhone physical device",
  scenarios: [
    scenario("guest-public-count", guestPublicEvidence),
    scenario("brother-private-count", brotherPrivateEvidence),
    scenario("privacy-denial", privacyDenialEvidence),
    scenario("leave-cleanup", leaveCleanupEvidence)
  ]
};
