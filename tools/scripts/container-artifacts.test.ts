import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function read(path: string) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

describe("Phase 13 container artifacts", () => {
  it("keeps the API image aligned to the Cloud Run runtime contract", async () => {
    const dockerfile = await read("infra/docker/api.Dockerfile");

    expect(dockerfile).toContain("FROM node:22-bookworm-slim AS base");
    expect(dockerfile).toContain("COPY apps/mobile/package.json apps/mobile/package.json");
    expect(dockerfile).toContain("RUN pnpm nx run api:build");
    expect(dockerfile).toContain('ENV NODE_ENV="production"');
    expect(dockerfile).toContain('ENV APP_RUNTIME_MODE="api"');
    expect(dockerfile).toContain('ENV API_PORT="8080"');
    expect(dockerfile).toContain("USER node");
    expect(dockerfile).toContain("EXPOSE 8080");
    expect(dockerfile).toContain('CMD ["node", "apps/api/dist/main.js"]');
  });

  it("keeps the Admin image on the built Next runtime without demo defaults", async () => {
    const dockerfile = await read("infra/docker/admin.Dockerfile");

    expect(dockerfile).toContain("FROM node:22-bookworm-slim AS base");
    expect(dockerfile).toContain("COPY apps/mobile/package.json apps/mobile/package.json");
    expect(dockerfile).toContain("RUN pnpm nx run admin:typecheck");
    expect(dockerfile).toContain("RUN pnpm nx run admin:build");
    expect(dockerfile).toContain('ENV NODE_ENV="production"');
    expect(dockerfile).toContain('ENV APP_RUNTIME_MODE="api"');
    expect(dockerfile).toContain('ENV PORT="8080"');
    expect(dockerfile).toContain('ENV HOSTNAME="0.0.0.0"');
    expect(dockerfile).toContain("USER node");
    expect(dockerfile).toContain("EXPOSE 8080");
    expect(dockerfile).toContain('CMD ["pnpm", "--dir", "apps/admin", "start"]');
  });

  it("keeps local compose app containers profile-gated and documents no live Redis dependency", async () => {
    const compose = await read("infra/docker/docker-compose.yml");
    const docs = await read("infra/docker/README.md");

    expect(compose).toContain('profiles: ["app"]');
    expect(compose).toContain("dockerfile: infra/docker/api.Dockerfile");
    expect(compose).toContain("dockerfile: infra/docker/admin.Dockerfile");
    expect(compose).toContain("API_BASE_URL: http://api:8080/api/");
    expect(docs).toContain("must not provision Redis/Memorystore");
  });

  it("excludes generated, secret, and dependency-heavy files from image contexts", async () => {
    const dockerignore = await read(".dockerignore");

    expect(dockerignore).toContain("node_modules");
    expect(dockerignore).toContain(".git");
    expect(dockerignore).toContain("apps/admin/.next");
    expect(dockerignore).toContain("apps/*/dist");
    expect(dockerignore).toContain(".env.*");
    expect(dockerignore).toContain("!.env.example");
  });
});
