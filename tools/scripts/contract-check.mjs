import { existsSync } from "node:fs";

const contractInputs = [
  "docs/api/public-api.md",
  "docs/api/auth-api.md",
  "docs/api/admin-api.md",
  "docs/api/candidate-api.md",
  "docs/api/brother-api.md",
  "docs/traceability.md"
];

const missingInputs = contractInputs.filter((path) => !existsSync(path));

if (missingInputs.length > 0) {
  throw new Error(`Contract check cannot run; missing ${missingInputs.join(", ")}`);
}

console.log("Contract documentation inputs are present.");
