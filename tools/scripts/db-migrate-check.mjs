import { existsSync } from "node:fs";

const requiredInputs = [
  "docs/data/database-design.md",
  "docs/data/seed-data.md",
  "infra/docker/docker-compose.yml",
  "prisma/schema.prisma",
  "prisma/migrations/000001_core_identity_foundation/migration.sql",
  "prisma/seed.mjs"
];

const missingInputs = requiredInputs.filter((path) => !existsSync(path));

if (missingInputs.length > 0) {
  throw new Error(`Migration check baseline is incomplete; missing ${missingInputs.join(", ")}`);
}

console.log("Database migration check target is registered; Prisma migrations start in Phase 2.");
