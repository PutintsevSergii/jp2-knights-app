import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import net from "node:net";

const root = fileURLToPath(new URL("../..", import.meta.url));
const children = new Set();

async function main() {
  await smokeApiBoot();
  await smokeAdminNextDev();
  await smokeAdminNextStartWithCookieAuth();
  await smokeProductionDemoRejection();
  await smokeMobileDemoLaunch();

  console.log("Phase 8 smoke checks passed.");
}

async function smokeApiBoot() {
  const port = await freePort();
  const api = spawnManaged(process.execPath, ["apps/api/dist/main.js"], {
    API_PORT: String(port),
    APP_RUNTIME_MODE: "api",
    AUTH_PROVIDER_MODE: "fake",
    NODE_ENV: "development"
  });

  try {
    const response = await waitForJson(`http://127.0.0.1:${port}/api/health`, 15_000);

    assertEqual(response.body.app, "api", "API health app");
    assertEqual(response.body.runtimeMode, "api", "API health runtime mode");
    assertEqual(response.body.status, "ok", "API health status");
    assert(
      response.headers.get("x-request-id")?.startsWith("req_"),
      "API health did not include generated x-request-id"
    );
  } finally {
    await stopChild(api);
  }
}

async function smokeAdminNextDev() {
  const port = await freePort();
  const nextEnvPath = new URL("../../apps/admin/next-env.d.ts", import.meta.url);
  const nextEnvBefore = await readFile(nextEnvPath, "utf8");
  const admin = spawnManaged(
    "pnpm",
    ["--dir", "apps/admin", "exec", "next", "dev", "-p", String(port), "-H", "127.0.0.1"],
    {
      APP_RUNTIME_MODE: "demo",
      NODE_ENV: "development"
    }
  );

  try {
    const response = await waitForText(`http://127.0.0.1:${port}/admin/dashboard`, 30_000, {}, admin);

    assertEqual(response.status, 200, "Next dev dashboard status");
    assert(response.body.includes("JP2 Admin Lite"), "Next dev dashboard did not render shell");
    assert(
      response.body.includes('data-runtime-mode="demo"'),
      "Next dev dashboard did not render demo chrome"
    );
  } catch (error) {
    if (String(error).includes("NEXT_DEV_ALREADY_RUNNING")) {
      console.log("Next dev smoke skipped because an admin dev server is already running.");
      return;
    }

    throw error;
  } finally {
    await stopChild(admin);
    await writeFile(nextEnvPath, nextEnvBefore);
  }
}

async function smokeAdminNextStartWithCookieAuth() {
  const adminPort = await freePort();
  const fakeApi = await startFakeAdminApi();
  const admin = spawnManaged(
    "pnpm",
    ["--dir", "apps/admin", "exec", "next", "start", "-p", String(adminPort), "-H", "127.0.0.1"],
    {
      APP_RUNTIME_MODE: "api",
      API_BASE_URL: fakeApi.baseUrl,
      ADMIN_CAN_WRITE: "true"
    }
  );

  try {
    const response = await waitForText(`http://127.0.0.1:${adminPort}/admin/dashboard`, 30_000, {
      cookie: "jp2_session=session_smoke"
    });

    assertEqual(response.status, 200, "Next start dashboard status");
    assert(response.body.includes("Global V1 operations overview."), "Next start did not use API data");
    assertEqual(
      fakeApi.lastCookie(),
      "jp2_session=session_smoke",
      "Next start did not forward session cookie to API"
    );
  } finally {
    await stopChild(admin);
    await fakeApi.close();
  }
}

async function smokeProductionDemoRejection() {
  await expectNodeFailure(
    `import { AppService } from "./apps/api/dist/app.service.js";
new AppService().getHealth("demo", "production");`,
    "Demo runtime mode is not allowed in production.",
    "API production demo rejection"
  );

  await expectProcessFailure(
    process.execPath,
    ["apps/mobile/dist/main.js"],
    {
      APP_RUNTIME_MODE: "demo",
      NODE_ENV: "production"
    },
    "Demo runtime mode is not allowed in production.",
    "Mobile production demo rejection"
  );

  const port = await freePort();
  const admin = spawnManaged(
    "pnpm",
    ["--dir", "apps/admin", "exec", "next", "start", "-p", String(port), "-H", "127.0.0.1"],
    {
      APP_RUNTIME_MODE: "demo"
    }
  );

  try {
    const response = await waitForText(`http://127.0.0.1:${port}/admin/dashboard`, 30_000, {});

    assert(
      response.status >= 500,
      `Admin production demo rejection returned ${response.status}, expected 5xx`
    );
  } finally {
    await stopChild(admin);
  }
}

async function smokeMobileDemoLaunch() {
  const result = await runProcess(process.execPath, ["apps/mobile/dist/main.js"], {
    APP_RUNTIME_MODE: "demo",
    NODE_ENV: "development"
  });

  assertEqual(result.code, 0, "Mobile demo launch exit code");
  const health = JSON.parse(result.stdout);

  assertEqual(health.app, "mobile", "Mobile health app");
  assertEqual(health.runtimeMode, "demo", "Mobile health runtime mode");
  assertEqual(health.status, "ok", "Mobile health status");
}

async function startFakeAdminApi() {
  let lastCookie = null;
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");

    if (url.pathname !== "/api/admin/dashboard") {
      response.writeHead(404, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "not-found" }));
      return;
    }

    lastCookie = request.headers.cookie ?? null;
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(fakeAdminDashboard));
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();

  if (!address || typeof address !== "object") {
    throw new Error("Could not read fake API address.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}/api/`,
    lastCookie: () => lastCookie,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  };
}

const fakeAdminDashboard = {
  scope: {
    adminKind: "SUPER_ADMIN",
    organizationUnitIds: []
  },
  counts: {
    identityAccessReviews: 0,
    organizationUnits: 1,
    prayers: 2,
    events: 3
  },
  tasks: [
    {
      id: "smoke-dashboard",
      label: "Smoke dashboard",
      count: 0,
      targetRoute: "/admin/identity-access-reviews",
      priority: "normal"
    }
  ]
};

async function waitForJson(url, timeoutMs, headers = {}) {
  const response = await waitForHttp(url, timeoutMs, headers);

  return {
    status: response.status,
    headers: response.headers,
    body: await response.json()
  };
}

async function waitForText(url, timeoutMs, headers = {}, child = null) {
  const response = await waitForHttp(url, timeoutMs, headers, child);

  return {
    status: response.status,
    headers: response.headers,
    body: await response.text()
  };
}

async function waitForHttp(url, timeoutMs, headers, child = null) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    if (child && (child.exitCode !== null || child.signalCode !== null)) {
      if (child.output?.includes("Another next dev server is already running")) {
        throw new Error("NEXT_DEV_ALREADY_RUNNING");
      }

      throw new Error(`Process exited before ${url} became available:\n${child.output ?? ""}`);
    }

    try {
      return await fetch(url, { headers });
    } catch (error) {
      lastError = error;
      await delay(250);
    }
  }

  throw new Error(`Timed out waiting for ${url}: ${String(lastError)}`);
}

async function expectNodeFailure(source, expectedMessage, label) {
  await expectProcessFailure(
    process.execPath,
    ["--input-type=module", "--eval", source],
    {},
    expectedMessage,
    label
  );
}

async function expectProcessFailure(command, args, env, expectedMessage, label) {
  const result = await runProcess(command, args, env);

  assert(result.code !== 0, `${label} unexpectedly exited successfully`);
  assert(
    `${result.stdout}\n${result.stderr}`.includes(expectedMessage),
    `${label} did not include expected error: ${expectedMessage}`
  );
}

async function runProcess(command, args, env) {
  const child = spawn(command, args, {
    cwd: root,
    env: {
      ...process.env,
      ...env
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let stdout = "";
  let stderr = "";

  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const [code] = await once(child, "exit");

  return { code, stdout, stderr };
}

function spawnManaged(command, args, env) {
  const child = spawn(command, args, {
    cwd: root,
    env: {
      ...process.env,
      ...env
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  children.add(child);
  child.stdout.on("data", (chunk) => {
    child.output = `${child.output ?? ""}${chunk.toString()}`;
    if (process.env.SMOKE_VERBOSE === "true") {
      process.stdout.write(chunk);
    }
  });
  child.stderr.on("data", (chunk) => {
    child.output = `${child.output ?? ""}${chunk.toString()}`;
    if (process.env.SMOKE_VERBOSE === "true") {
      process.stderr.write(chunk);
    }
  });

  child.once("exit", () => children.delete(child));

  return child;
}

async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  child.kill("SIGTERM");
  const timeout = delay(2_000).then(() => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGKILL");
    }
  });

  await Promise.race([once(child, "exit"), timeout]);
}

async function freePort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));

  if (!address || typeof address !== "object") {
    throw new Error("Could not reserve a free port.");
  }

  return address.port;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

process.on("exit", () => {
  for (const child of children) {
    child.kill("SIGKILL");
  }
});

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
