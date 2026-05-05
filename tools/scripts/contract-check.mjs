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

const requiredPaths = [
  "/api/health",
  "/api/public/home",
  "/api/public/content-pages/{slug}",
  "/api/public/prayers",
  "/api/public/prayers/{id}",
  "/api/public/events",
  "/api/public/events/{id}",
  "/api/public/candidate-requests",
  "/api/auth/session",
  "/api/auth/logout",
  "/api/auth/refresh",
  "/api/auth/me",
  "/api/brother/my-organization-units",
  "/api/admin/dashboard",
  "/api/admin/organization-units",
  "/api/admin/organization-units/{id}",
  "/api/admin/candidate-requests",
  "/api/admin/candidate-requests/{id}",
  "/api/admin/prayers",
  "/api/admin/prayers/{id}",
  "/api/admin/events",
  "/api/admin/events/{id}"
];
const missingPaths = requiredPaths.filter((path) => !openApi.paths?.[path]);

if (missingPaths.length > 0) {
  throw new Error(`Generated OpenAPI contract is missing ${missingPaths.join(", ")}.`);
}

const responseSchemaChecks = [
  ["/api/health", "get", "200"],
  ["/api/public/home", "get", "200"],
  ["/api/public/content-pages/{slug}", "get", "200"],
  ["/api/public/prayers", "get", "200"],
  ["/api/public/prayers/{id}", "get", "200"],
  ["/api/public/events", "get", "200"],
  ["/api/public/events/{id}", "get", "200"],
  ["/api/public/candidate-requests", "post", "200"],
  ["/api/public/candidate-requests", "post", "400"],
  ["/api/public/candidate-requests", "post", "409"],
  ["/api/public/candidate-requests", "post", "429"],
  ["/api/auth/session", "post", "200"],
  ["/api/auth/session", "post", "401"],
  ["/api/auth/logout", "post", "200"],
  ["/api/auth/refresh", "post", "200"],
  ["/api/auth/me", "get", "200"],
  ["/api/auth/me", "get", "401"],
  ["/api/auth/me", "get", "403"],
  ["/api/brother/my-organization-units", "get", "200"],
  ["/api/brother/my-organization-units", "get", "403"],
  ["/api/brother/my-organization-units", "get", "404"],
  ["/api/admin/dashboard", "get", "200"],
  ["/api/admin/dashboard", "get", "403"],
  ["/api/admin/organization-units", "get", "200"],
  ["/api/admin/organization-units", "get", "403"],
  ["/api/admin/organization-units", "post", "200"],
  ["/api/admin/organization-units", "post", "400"],
  ["/api/admin/organization-units", "post", "403"],
  ["/api/admin/organization-units/{id}", "patch", "200"],
  ["/api/admin/organization-units/{id}", "patch", "400"],
  ["/api/admin/organization-units/{id}", "patch", "403"],
  ["/api/admin/candidate-requests", "get", "200"],
  ["/api/admin/candidate-requests", "get", "403"],
  ["/api/admin/candidate-requests/{id}", "get", "200"],
  ["/api/admin/candidate-requests/{id}", "get", "403"],
  ["/api/admin/candidate-requests/{id}", "get", "404"],
  ["/api/admin/candidate-requests/{id}", "patch", "200"],
  ["/api/admin/candidate-requests/{id}", "patch", "400"],
  ["/api/admin/candidate-requests/{id}", "patch", "403"],
  ["/api/admin/candidate-requests/{id}", "patch", "404"],
  ["/api/admin/prayers", "get", "200"],
  ["/api/admin/prayers", "get", "403"],
  ["/api/admin/prayers", "post", "200"],
  ["/api/admin/prayers", "post", "400"],
  ["/api/admin/prayers", "post", "403"],
  ["/api/admin/prayers/{id}", "patch", "200"],
  ["/api/admin/prayers/{id}", "patch", "400"],
  ["/api/admin/prayers/{id}", "patch", "403"],
  ["/api/admin/events", "get", "200"],
  ["/api/admin/events", "get", "403"],
  ["/api/admin/events", "post", "200"],
  ["/api/admin/events", "post", "400"],
  ["/api/admin/events", "post", "403"],
  ["/api/admin/events/{id}", "patch", "200"],
  ["/api/admin/events/{id}", "patch", "400"],
  ["/api/admin/events/{id}", "patch", "403"]
];
const missingResponseSchemas = responseSchemaChecks.filter(([path, method, status]) => {
  const response = openApi.paths?.[path]?.[method]?.responses?.[status];
  return !response?.content?.["application/json"]?.schema;
});

if (missingResponseSchemas.length > 0) {
  throw new Error(
    `Generated OpenAPI contract is missing response schemas for ${missingResponseSchemas
      .map(([path, method, status]) => `${method.toUpperCase()} ${path} ${status}`)
      .join(", ")}.`
  );
}

const requestSchemaChecks = [
  ["/api/public/candidate-requests", "post"],
  ["/api/auth/session", "post"],
  ["/api/admin/organization-units", "post"],
  ["/api/admin/organization-units/{id}", "patch"],
  ["/api/admin/candidate-requests/{id}", "patch"],
  ["/api/admin/prayers", "post"],
  ["/api/admin/prayers/{id}", "patch"],
  ["/api/admin/events", "post"],
  ["/api/admin/events/{id}", "patch"]
];
const missingRequestSchemas = requestSchemaChecks.filter(([path, method]) => {
  const requestBody = openApi.paths?.[path]?.[method]?.requestBody;
  return !requestBody?.content?.["application/json"]?.schema;
});

if (missingRequestSchemas.length > 0) {
  throw new Error(
    `Generated OpenAPI contract is missing request schemas for ${missingRequestSchemas
      .map(([path, method]) => `${method.toUpperCase()} ${path}`)
      .join(", ")}.`
  );
}

console.log("Contract documentation inputs and generated OpenAPI are present.");
