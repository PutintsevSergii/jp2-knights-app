#!/usr/bin/env node
import { spawn } from "node:child_process";

const ACTIONS = new Set(["plan", "build", "push", "migrate", "deploy", "smoke", "all"]);
const mutableActions = new Set(["build", "push", "migrate", "deploy", "all"]);

const args = process.argv.slice(2);
const execute = consumeFlag(args, "--execute");
const help = consumeFlag(args, "--help") || consumeFlag(args, "-h");
const action = args[0] ?? "plan";

if (help) {
  printUsage();
  process.exit(0);
}

if (!ACTIONS.has(action)) {
  fail(`Unsupported deploy action '${action}'.`);
}

const config = readConfig();
const commands = commandPlan(config);

if (action === "plan") {
  printPlan(commands);
  process.exit(0);
}

if (action === "smoke") {
  await runSmokeChecks(config);
  process.exit(0);
}

if (mutableActions.has(action) && !execute) {
  printPlan(commandsForAction(commands, action));
  fail("Mutable deploy actions require --execute. Re-run with --execute after reviewing the plan.");
}

for (const command of commandsForAction(commands, action)) {
  await runCommand(command);
}

if (action === "all") {
  await runSmokeChecks(config);
}

function readConfig() {
  const projectId = readRequiredEnv("GCP_PROJECT_ID");
  const region = readEnv("GCP_REGION") ?? "europe-west4";
  const environment = readEnv("DEPLOY_ENVIRONMENT") ?? "pilot";
  const repository = readEnv("ARTIFACT_REPOSITORY") ?? "jp2";
  const imageTag = readEnv("IMAGE_TAG") ?? readEnv("GIT_SHA") ?? "manual";
  const apiService = readEnv("API_SERVICE_NAME") ?? `${environment}-jp2-api`;
  const adminService = readEnv("ADMIN_SERVICE_NAME") ?? `${environment}-jp2-admin`;
  const migrationJob = readEnv("MIGRATION_JOB_NAME") ?? `${environment}-jp2-migrate`;
  const apiPublicUrl = trimTrailingSlash(readEnv("API_PUBLIC_URL"));
  const adminPublicUrl = trimTrailingSlash(readEnv("ADMIN_PUBLIC_URL"));
  const imageBase = `${region}-docker.pkg.dev/${projectId}/${repository}`;

  return {
    projectId,
    region,
    environment,
    apiService,
    adminService,
    migrationJob,
    apiImage: `${imageBase}/api:${imageTag}`,
    adminImage: `${imageBase}/admin:${imageTag}`,
    apiPublicUrl,
    adminPublicUrl
  };
}

function commandPlan(config) {
  return {
    build: [
      {
        label: "Build API image",
        command: "docker",
        args: ["build", "-f", "infra/docker/api.Dockerfile", "-t", config.apiImage, "."]
      },
      {
        label: "Build Admin image",
        command: "docker",
        args: ["build", "-f", "infra/docker/admin.Dockerfile", "-t", config.adminImage, "."]
      }
    ],
    push: [
      {
        label: "Push API image",
        command: "docker",
        args: ["push", config.apiImage]
      },
      {
        label: "Push Admin image",
        command: "docker",
        args: ["push", config.adminImage]
      }
    ],
    migrate: [
      {
        label: "Run Cloud Run Prisma migration job",
        command: "gcloud",
        args: [
          "run",
          "jobs",
          "execute",
          config.migrationJob,
          "--region",
          config.region,
          "--project",
          config.projectId,
          "--wait"
        ]
      }
    ],
    deploy: [
      {
        label: "Deploy API revision",
        command: "gcloud",
        args: [
          "run",
          "services",
          "update",
          config.apiService,
          "--image",
          config.apiImage,
          "--region",
          config.region,
          "--project",
          config.projectId
        ]
      },
      {
        label: "Deploy Admin revision",
        command: "gcloud",
        args: [
          "run",
          "services",
          "update",
          config.adminService,
          "--image",
          config.adminImage,
          "--region",
          config.region,
          "--project",
          config.projectId
        ]
      }
    ]
  };
}

function commandsForAction(commands, actionName) {
  if (actionName === "all") {
    return [
      ...commands.build,
      ...commands.push,
      ...commands.migrate,
      ...commands.deploy
    ];
  }

  return commands[actionName] ?? [];
}

function printPlan(commands) {
  const sections = Array.isArray(commands) ? { selected: commands } : commands;

  for (const [section, sectionCommands] of Object.entries(sections)) {
    if (sectionCommands.length === 0) {
      continue;
    }

    console.log(`# ${section}`);

    for (const command of sectionCommands) {
      console.log(`${command.label}:`);
      console.log(formatCommand(command));
    }
  }
}

function formatCommand(command) {
  return [command.command, ...command.args.map(quoteArg)].join(" ");
}

function quoteArg(value) {
  return /^[A-Za-z0-9_./:=@-]+$/.test(value) ? value : JSON.stringify(value);
}

async function runCommand(command) {
  console.log(`Running: ${command.label}`);

  await new Promise((resolve, reject) => {
    const child = spawn(command.command, command.args, {
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command.label} failed with exit code ${code}.`));
    });
  });
}

async function runSmokeChecks(config) {
  if (!config.apiPublicUrl || !config.adminPublicUrl) {
    fail("API_PUBLIC_URL and ADMIN_PUBLIC_URL are required for smoke checks.");
  }

  await checkUrl(`${config.apiPublicUrl}/api/health`, "API health");
  await checkUrl(`${config.adminPublicUrl}/admin/dashboard`, "Admin dashboard");
  console.log("Cloud Run smoke checks passed.");
}

async function checkUrl(url, label) {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`${label} smoke check failed with HTTP ${response.status}: ${url}`);
  }

  console.log(`${label} smoke check passed: ${url}`);
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

function readRequiredEnv(name) {
  const value = readEnv(name);

  if (!value) {
    fail(`${name} is required.`);
  }

  return value;
}

function trimTrailingSlash(value) {
  return value?.replace(/\/+$/, "");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function printUsage() {
  console.log(`Usage: pnpm deploy:cloud-run [action] [--execute]

Actions:
  plan      Print build, push, migration, and deploy commands without running them.
  build     Build API/Admin container images. Requires --execute.
  push      Push API/Admin images to Artifact Registry. Requires --execute.
  migrate   Execute the Cloud Run Prisma migration job. Requires --execute.
  deploy    Update API/Admin Cloud Run services to the configured images. Requires --execute.
  smoke     Check deployed API/Admin public URLs.
  all       Build, push, migrate, deploy, then smoke. Requires --execute for mutable steps.

Required environment:
  GCP_PROJECT_ID

Common optional environment:
  GCP_REGION=europe-west4
  DEPLOY_ENVIRONMENT=pilot
  ARTIFACT_REPOSITORY=jp2
  IMAGE_TAG=<immutable tag>
  API_PUBLIC_URL=https://api.example.org
  ADMIN_PUBLIC_URL=https://admin.example.org`);
}
