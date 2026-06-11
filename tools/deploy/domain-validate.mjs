#!/usr/bin/env node
import { lookup } from "node:dns/promises";

const ACTIONS = new Set(["plan", "check"]);

const args = process.argv.slice(2);
const execute = consumeFlag(args, "--execute");
const help = consumeFlag(args, "--help") || consumeFlag(args, "-h");
const action = args[0] ?? "plan";

if (help) {
  printUsage();
  process.exit(0);
}

if (!ACTIONS.has(action)) {
  fail(`Unsupported domain validation action '${action}'.`);
}

const config = readConfig();

if (action === "plan" || !execute) {
  printPlan(config);

  if (action === "check" && !execute) {
    fail("Domain validation checks require --execute after reviewing the plan.");
  }

  process.exit(0);
}

await validateDomain(config.apiPublicUrl, "/api/health", "API custom domain");
await validateDomain(config.adminPublicUrl, "/admin/dashboard", "Admin custom domain");
validateFirebaseDomain(config);
console.log("Domain validation checks passed.");

function readConfig() {
  return {
    apiPublicUrl: readHttpsUrl("API_PUBLIC_URL"),
    adminPublicUrl: readHttpsUrl("ADMIN_PUBLIC_URL"),
    firebaseAuthDomain: readEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN")
  };
}

function printPlan(config) {
  console.log("# domain validation");
  console.log(`API host: ${config.apiPublicUrl.hostname}`);
  console.log(`Admin host: ${config.adminPublicUrl.hostname}`);
  console.log("Checks:");
  console.log("- both URLs must use HTTPS");
  console.log("- DNS must resolve for both hosts");
  console.log("- API /api/health must return a successful status");
  console.log("- Admin /admin/dashboard must return a successful status");
  console.log("- Firebase authorized domains must include the Admin host");

  if (config.firebaseAuthDomain) {
    console.log(`Firebase auth domain configured for mobile: ${config.firebaseAuthDomain}`);
  } else {
    console.log("Firebase auth domain is not set in this shell; verify it in Firebase console.");
  }
}

async function validateDomain(url, path, label) {
  if (url.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS: ${url.toString()}`);
  }

  const resolved = await lookup(url.hostname);
  console.log(`${label} DNS resolves: ${url.hostname} -> ${resolved.address}`);

  const response = await fetch(new URL(path, url), {
    headers: {
      accept: "text/html,application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`${label} smoke check failed with HTTP ${response.status}.`);
  }

  console.log(`${label} HTTPS smoke passed: ${new URL(path, url).toString()}`);
}

function validateFirebaseDomain(config) {
  if (!config.firebaseAuthDomain) {
    console.log("Firebase auth domain not checked from env; verify authorized domains manually.");
    return;
  }

  if (!config.firebaseAuthDomain.includes(".")) {
    throw new Error("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN does not look like a hostname.");
  }

  console.log(`Firebase auth domain value is hostname-shaped: ${config.firebaseAuthDomain}`);
}

function consumeFlag(values, flag) {
  const index = values.indexOf(flag);

  if (index === -1) {
    return false;
  }

  values.splice(index, 1);
  return true;
}

function readEnv(name) {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}

function readHttpsUrl(name) {
  const value = readEnv(name);

  if (!value) {
    fail(`${name} is required.`);
  }

  try {
    return new URL(value);
  } catch {
    fail(`${name} must be a valid URL.`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function printUsage() {
  console.log(`Usage: pnpm deploy:domains [plan|check] [--execute]

Default action:
  plan    Print the domain validation plan without network checks.

Actions:
  plan    Print required domain checks.
  check   Resolve DNS and run HTTPS API/Admin smoke checks. Requires --execute.

Required environment:
  API_PUBLIC_URL=https://api.example.org
  ADMIN_PUBLIC_URL=https://admin.example.org

Optional environment:
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<firebase-auth-domain>`);
}
