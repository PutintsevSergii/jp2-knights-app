import { existsSync } from "node:fs";

const requiredDocs = [
  "docs/api/api-contract-format.md",
  "docs/api/api-contract-overview.md",
  "docs/api/error-contract.md"
];

const missingDocs = requiredDocs.filter((path) => !existsSync(path));

if (missingDocs.length > 0) {
  throw new Error(`Cannot prepare contract generation; missing ${missingDocs.join(", ")}`);
}

console.log("OpenAPI generation target is registered; implementation will add generated output.");
