#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const REQUIRED_SCENARIOS = [
  "guest-public-count",
  "brother-private-count",
  "privacy-denial",
  "leave-cleanup"
];

const REQUIRED_SCENARIO_EVIDENCE = {
  "guest-public-count": [
    {
      name: "public aggregate count change",
      pattern: /\bpublic\b[\s\S]*\baggregate\b[\s\S]*(0\s*[-=]>\s*1|1\s*[-=]>\s*0|increment|decrement|changed)/i
    },
    {
      name: "REST join or heartbeat path",
      pattern: /\b(rest|http)\b[\s\S]*\b(join|heartbeat)\b/i
    }
  ],
  "brother-private-count": [
    {
      name: "private aggregate count change",
      pattern: /\b(private|brother)\b[\s\S]*\baggregate\b[\s\S]*(0\s*[-=]>\s*1|1\s*[-=]>\s*0|increment|decrement|changed)/i
    },
    {
      name: "API-issued private read grant",
      pattern: /\b(api-issued|api issued|server-issued|server issued)\b[\s\S]*\bread grant\b/i
    }
  ],
  "privacy-denial": [
    {
      name: "client read/write denial",
      pattern: /\b(client|app)\b[\s\S]*\b(read|write|reads|writes)\b[\s\S]*\b(denied|deny|rejected|blocked)\b/i
    },
    {
      name: "no private identity/roster data visible",
      pattern: /\bno\b[\s\S]*(participant|session|user|roster|identity|private data)[\s\S]*(visible|exposed|returned|readable)\b/i
    }
  ],
  "leave-cleanup": [
    {
      name: "listener cleanup",
      pattern: /\b(unsubscribed|unsubscribe|listener cleanup|listener removed)\b/i
    },
    {
      name: "leave or expiry decremented aggregate count",
      pattern: /\b(leave|left|expiry|expired)\b[\s\S]*\b(aggregate count|count)\b[\s\S]*(decrement|0\s*[-=]>\s*1|1\s*[-=]>\s*0|returned to 0|changed)/i
    }
  ]
};

const FORBIDDEN_KEY_PARTS = [
  "accessToken",
  "anonymousSessionId",
  "attendee",
  "cookie",
  "databaseUrl",
  "firebaseServiceAccount",
  "firebaseUid",
  "idToken",
  "jp2Session",
  "participant",
  "presenceKey",
  "privateKey",
  "providerRefreshToken",
  "providerSubject",
  "rawLog",
  "refreshToken",
  "roster",
  "secret",
  "sessionId",
  "token",
  "userId"
];

const FORBIDDEN_VALUE_PATTERNS = [
  /DATABASE_URL=/i,
  /FIREBASE_SERVICE_ACCOUNT_JSON=/i,
  /-----BEGIN [^-]+PRIVATE KEY-----/i,
  /\bjp2_session=/i,
  /\b(id_token|refresh_token|access_token)=/i,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
];

export function validateNativeRtdbEvidence(evidence) {
  const issues = [];

  if (!isPlainObject(evidence)) {
    return {
      ok: false,
      issues: [{ key: "$", message: "Evidence must be a JSON object." }]
    };
  }

  expectOneOf(evidence, issues, "platform", ["ios", "android"]);
  expectTrue(evidence, issues, "preflightPassed");
  expectIsoDateString(evidence, issues, "validatedAt");
  expectHttpsUrl(evidence, issues, "apiBaseUrl");
  expectNonEmptyString(evidence, issues, "firebaseProjectId");
  expectNonEmptyString(evidence, issues, "deviceTarget");
  expectRequiredScenarios(evidence, issues);
  collectUnsafeEvidence(evidence, issues);

  return {
    ok: issues.length === 0,
    issues
  };
}

export async function readNativeRtdbEvidenceFile(path) {
  const raw = await readFile(path, "utf8");

  try {
    return JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON.";
    return {
      __invalidJson: message
    };
  }
}

export function formatNativeRtdbEvidenceReport(result) {
  if (result.ok) {
    return [
      "Native RTDB validation evidence passed local checks.",
      "",
      "The evidence is still owner/operator-provided manual proof; this command only verifies required scenario coverage and blocks obvious unsafe secret/private-data capture."
    ].join("\n");
  }

  return [
    "Native RTDB validation evidence failed local checks.",
    "",
    ...result.issues.map((issue) => `- ${issue.key}: ${issue.message}`),
    "",
    "Do not attach this evidence to a launch ticket until the issues are fixed."
  ].join("\n");
}

function expectRequiredScenarios(evidence, issues) {
  if (!Array.isArray(evidence.scenarios)) {
    issues.push({
      key: "scenarios",
      message: "Expected an array with every required RTDB validation scenario."
    });
    return;
  }

  const byId = new Map();

  for (const scenario of evidence.scenarios) {
    if (!isPlainObject(scenario)) {
      issues.push({
        key: "scenarios",
        message: "Each scenario must be an object."
      });
      continue;
    }

    if (typeof scenario.id === "string") {
      byId.set(scenario.id, scenario);
    }
  }

  for (const id of REQUIRED_SCENARIOS) {
    const scenario = byId.get(id);

    if (!scenario) {
      issues.push({
        key: `scenarios.${id}`,
        message: "Required scenario is missing."
      });
      continue;
    }

    if (scenario.status !== "passed") {
      issues.push({
        key: `scenarios.${id}.status`,
        message: "Required scenario must have status passed."
      });
    }

    if (!Array.isArray(scenario.evidence) || scenario.evidence.length === 0) {
      issues.push({
        key: `scenarios.${id}.evidence`,
        message: "Record sanitized evidence notes such as route names, status codes, and aggregate counts."
      });
      continue;
    }

    if (scenario.evidence.some((item) => typeof item !== "string" || item.trim().length === 0)) {
      issues.push({
        key: `scenarios.${id}.evidence`,
        message: "Evidence notes must be non-empty strings."
      });
      continue;
    }

    expectScenarioEvidence(id, scenario.evidence, issues);
  }
}

function expectScenarioEvidence(id, evidence, issues) {
  const requiredChecks = REQUIRED_SCENARIO_EVIDENCE[id] ?? [];
  const notes = evidence.join("\n");

  for (const check of requiredChecks) {
    if (!check.pattern.test(notes)) {
      issues.push({
        key: `scenarios.${id}.evidence`,
        message: `Evidence must include ${check.name}.`
      });
    }
  }
}

function collectUnsafeEvidence(value, issues, path = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectUnsafeEvidence(item, issues, `${path}[${index}]`));
    return;
  }

  if (isPlainObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      const childPath = `${path}.${key}`;

      if (isForbiddenKey(key)) {
        issues.push({
          key: childPath,
          message: "Evidence must not include secret, token, cookie, participant, session, user, roster, or raw-log fields."
        });
      }

      collectUnsafeEvidence(child, issues, childPath);
    }
    return;
  }

  if (typeof value === "string" && FORBIDDEN_VALUE_PATTERNS.some((pattern) => pattern.test(value))) {
    issues.push({
      key: path,
      message: "Evidence contains a secret-shaped value, raw cookie/token, private key, database URL, or email address."
    });
  }
}

function expectOneOf(object, issues, key, values) {
  if (!values.includes(object[key])) {
    issues.push({
      key,
      message: `Expected one of: ${values.join(", ")}.`
    });
  }
}

function expectTrue(object, issues, key) {
  if (object[key] !== true) {
    issues.push({
      key,
      message: "Expected true."
    });
  }
}

function expectNonEmptyString(object, issues, key) {
  if (typeof object[key] !== "string" || object[key].trim().length === 0) {
    issues.push({
      key,
      message: "Expected a non-empty string."
    });
  }
}

function expectIsoDateString(object, issues, key) {
  if (typeof object[key] !== "string" || Number.isNaN(Date.parse(object[key]))) {
    issues.push({
      key,
      message: "Expected an ISO date/time string."
    });
  }
}

function expectHttpsUrl(object, issues, key) {
  if (typeof object[key] !== "string") {
    issues.push({
      key,
      message: "Expected an HTTPS URL."
    });
    return;
  }

  try {
    const url = new URL(object[key]);

    if (url.protocol !== "https:") {
      issues.push({
        key,
        message: "Expected an HTTPS URL."
      });
    }
  } catch {
    issues.push({
      key,
      message: "Expected an HTTPS URL."
    });
  }
}

function isForbiddenKey(key) {
  const normalized = key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  return FORBIDDEN_KEY_PARTS.some((part) => normalized.includes(part.toLowerCase()));
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseArgs(argv) {
  let file;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--file") {
      file = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--file=")) {
      file = arg.slice("--file=".length);
    }
  }

  return { file };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { file } = parseArgs(process.argv.slice(2));

  if (!file) {
    console.error("Pass --file path/to/native-rtdb-evidence.json.");
    process.exitCode = 1;
  } else {
    const evidence = await readNativeRtdbEvidenceFile(file);
    const result = evidence.__invalidJson
      ? {
          ok: false,
          issues: [{ key: "file", message: evidence.__invalidJson }]
        }
      : validateNativeRtdbEvidence(evidence);
    const report = formatNativeRtdbEvidenceReport(result);

    if (result.ok) {
      console.log(report);
    } else {
      console.error(report);
      process.exitCode = 1;
    }
  }
}
