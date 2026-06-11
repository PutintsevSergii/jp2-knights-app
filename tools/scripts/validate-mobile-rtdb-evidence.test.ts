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
        scenario("guest-public-count"),
        scenario("brother-private-count", "failed"),
        scenario("privacy-denial")
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
        scenario("guest-public-count"),
        {
          ...scenario("brother-private-count"),
          firebaseUid: "firebase-user-123",
          participantIds: ["participant-1"],
          evidence: ["jp2_session=raw-cookie-value"]
        },
        scenario("privacy-denial"),
        {
          ...scenario("leave-cleanup"),
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

function scenario(id: string, status = "passed") {
  return {
    id,
    status,
    evidence: ["route validated, HTTP 200, aggregate count changed 0 -> 1 -> 0"]
  };
}

const validEvidence = {
  platform: "ios",
  preflightPassed: true,
  validatedAt: "2026-06-11T12:00:00.000Z",
  apiBaseUrl: "https://api.pilot.example.test/api",
  firebaseProjectId: "jp2-pilot",
  deviceTarget: "iPhone physical device",
  scenarios: [
    scenario("guest-public-count"),
    scenario("brother-private-count"),
    scenario("privacy-denial"),
    scenario("leave-cleanup")
  ]
};
