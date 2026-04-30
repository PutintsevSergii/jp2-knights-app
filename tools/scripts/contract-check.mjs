import { existsSync, readFileSync } from "node:fs";

const contractInputs = [
  "docs/api/public-api.md",
  "docs/api/auth-api.md",
  "docs/api/admin-api.md",
  "docs/api/candidate-api.md",
  "docs/api/brother-api.md",
  "docs/traceability.md",
  "generated/openapi.json"
];

const missingInputs = contractInputs.filter((path) => !existsSync(path));

if (missingInputs.length > 0) {
  throw new Error(`Contract check cannot run; missing ${missingInputs.join(", ")}`);
}

const openApi = JSON.parse(readFileSync("generated/openapi.json", "utf8"));

if (openApi.openapi !== "3.1.0") {
  throw new Error(`Unexpected OpenAPI version ${String(openApi.openapi)}`);
}

if (!openApi.paths?.["/api/health"]) {
  throw new Error("Generated OpenAPI contract is missing /api/health.");
}

console.log("Contract documentation inputs and generated OpenAPI are present.");
