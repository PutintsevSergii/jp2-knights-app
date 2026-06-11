import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function read(path: string) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

describe("Phase 13 deployment artifacts", () => {
  it("exposes dry-run-first Cloud Run deployment scripts", async () => {
    const packageJson = await read("package.json");
    const script = await read("tools/deploy/cloud-run-deploy.mjs");

    expect(packageJson).toContain('"deploy:cloud-run": "node tools/deploy/cloud-run-deploy.mjs"');
    expect(packageJson).toContain(
      '"deploy:cloud-run:plan": "node tools/deploy/cloud-run-deploy.mjs plan"'
    );
    expect(packageJson).toContain('"deploy:domains": "node tools/deploy/domain-validate.mjs"');
    expect(packageJson).toContain(
      '"deploy:domains:plan": "node tools/deploy/domain-validate.mjs plan"'
    );
    expect(script).toContain("Mutable deploy actions require --execute");
    expect(script).toContain('args: ["build", "-f", "infra/docker/api.Dockerfile"');
    expect(script).toContain('args: ["build", "-f", "infra/docker/admin.Dockerfile"');
    expect(script).toContain('"jobs",');
    expect(script).toContain('"execute",');
    expect(script).toContain('"services",');
    expect(script).toContain('"update",');
    expect(script).toContain("/api/health");
    expect(script).toContain("/admin/dashboard");
    expect(script).not.toMatch(/DATABASE_URL=.*:|FIREBASE_SERVICE_ACCOUNT_JSON=.*\{/);
    expect(script).not.toMatch(/redis|memorystore/i);
  });

  it("documents backup restore and launch smoke gates without committing secret values", async () => {
    const backupRunbook = await read("docs/deployment/backup-restore-runbook.md");
    const secretRunbook = await read("docs/deployment/secret-version-runbook.md");
    const cloudSqlChecklist = await read("docs/deployment/cloud-sql-runtime-checklist.md");
    const domainRunbook = await read("docs/deployment/domain-and-dns-runbook.md");
    const authCookieChecklist = await read("docs/deployment/auth-cookie-cors-checklist.md");
    const launchChecklist = await read("docs/deployment/launch-smoke-checklist.md");
    const approvalRecord = await read("docs/deployment/pilot-launch-approval-record.md");
    const supportRunbook = await read("docs/deployment/support-and-rollback-runbook.md");
    const operatorHandoff = await read("docs/deployment/deployment-operator-handoff.md");
    const nativeRtdbEvidence = await read("docs/deployment/native-rtdb-validation-evidence.example.json");
    const deploymentReadme = await read("docs/deployment/README.md");
    const terraformReadme = await read("infra/terraform/README.md");
    const domainScript = await read("tools/deploy/domain-validate.mjs");
    const mobileExpoConfig = await read("apps/mobile/app.config.js");
    const packageJson = await read("package.json");
    const evidenceScript = await read("tools/scripts/validate-mobile-rtdb-evidence.mjs");

    expect(backupRunbook).toContain("Non-Production Restore Test");
    expect(backupRunbook).toContain("gcloud sql backups list");
    expect(backupRunbook).toContain("gcloud sql backups restore");
    expect(backupRunbook).toContain("Do not restore over pilot or production");
    expect(secretRunbook).toContain("gcloud secrets versions add");
    expect(secretRunbook).toContain("gcloud secrets versions list");
    expect(secretRunbook).toContain("gcloud secrets versions disable");
    expect(secretRunbook).toContain("Do not run `gcloud secrets versions access`");
    expect(secretRunbook).toContain("Redeploy After Secret Changes");
    expect(secretRunbook).not.toMatch(/DATABASE_URL=.*:|FIREBASE_SERVICE_ACCOUNT_JSON=.*\{/);
    expect(cloudSqlChecklist).toContain("Cloud SQL Runtime Checklist");
    expect(cloudSqlChecklist).toContain("gcloud run jobs executions list");
    expect(cloudSqlChecklist).toContain("gcloud logging read");
    expect(cloudSqlChecklist).toContain("PRISMA_CONNECTION_LIMIT=5");
    expect(cloudSqlChecklist).toContain("/api/health` remains a process/readiness check");
    expect(cloudSqlChecklist).not.toMatch(/DATABASE_URL=.*:|FIREBASE_SERVICE_ACCOUNT_JSON=.*\{/);
    expect(launchChecklist).toContain("Guest/Public Smoke");
    expect(launchChecklist).toContain("Idle Approval Smoke");
    expect(launchChecklist).toContain("Silent Prayer RTDB Smoke");
    expect(launchChecklist).toContain("Rollback Decision");
    expect(approvalRecord).toContain("Launch Metadata");
    expect(approvalRecord).toContain("Evidence Checklist");
    expect(approvalRecord).toContain("Product And Privacy Approvals");
    expect(approvalRecord).toContain("GO WITH EXCEPTION");
    expect(approvalRecord).toContain("This record does not approve");
    expect(approvalRecord).not.toMatch(/DATABASE_URL=.*:|FIREBASE_SERVICE_ACCOUNT_JSON=.*\{/);
    expect(domainRunbook).toContain("gcloud run domain-mappings create");
    expect(domainRunbook).toContain("pnpm deploy:domains check --execute");
    expect(domainRunbook).toContain("Firebase Authorized Domains");
    expect(authCookieChecklist).toContain("jp2_session");
    expect(authCookieChecklist).toContain("HttpOnly");
    expect(authCookieChecklist).toContain("SameSite=Lax");
    expect(authCookieChecklist).toContain("Firebase Redirect Domains");
    expect(authCookieChecklist).toContain("No wildcard credentialed REST CORS");
    expect(authCookieChecklist).toContain("SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb");
    expect(supportRunbook).toContain("Incident Intake");
    expect(supportRunbook).toContain("Rollback Procedure");
    expect(supportRunbook).toContain("gcloud run revisions list");
    expect(supportRunbook).toContain("gcloud run services update-traffic");
    expect(supportRunbook).toContain("Do not run destructive database rollback");
    expect(supportRunbook).toContain("Super Admin privacy workflows");
    expect(operatorHandoff).toContain("Deployment Operator Handoff");
    expect(operatorHandoff).toContain("pnpm deploy:cloud-run:plan");
    expect(operatorHandoff).toContain("pnpm deploy:cloud-run migrate --execute");
    expect(operatorHandoff).toContain("pnpm deploy:domains check --execute");
    expect(operatorHandoff).toContain("Stop Conditions");
    expect(operatorHandoff).toContain("Do not record secret values");
    expect(operatorHandoff).toContain("Owner/operator-owned during live launch");
    expect(operatorHandoff).not.toMatch(/DATABASE_URL=.*:|FIREBASE_SERVICE_ACCOUNT_JSON=.*\{/);
    expect(nativeRtdbEvidence).toContain('"guest-public-count"');
    expect(nativeRtdbEvidence).toContain('"brother-private-count"');
    expect(nativeRtdbEvidence).toContain('"privacy-denial"');
    expect(nativeRtdbEvidence).toContain('"leave-cleanup"');
    expect(nativeRtdbEvidence).not.toMatch(/DATABASE_URL=.*:|FIREBASE_SERVICE_ACCOUNT_JSON=.*\{/);
    expect(packageJson).toContain(
      '"validate:mobile-rtdb-evidence": "node tools/scripts/validate-mobile-rtdb-evidence.mjs"'
    );
    expect(evidenceScript).toContain("guest-public-count");
    expect(evidenceScript).toContain("brother-private-count");
    expect(evidenceScript).toContain("privacy-denial");
    expect(evidenceScript).toContain("leave-cleanup");
    expect(evidenceScript).toContain("Evidence must not include secret, token, cookie");
    expect(mobileExpoConfig).toContain("EXPO_PUBLIC_APP_SCHEME");
    expect(mobileExpoConfig).toContain("EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER");
    expect(mobileExpoConfig).toContain("bundleIdentifier");
    expect(mobileExpoConfig).toContain("EXPO_PUBLIC_ANDROID_PACKAGE");
    expect(domainScript).toContain("Domain validation checks require --execute");
    expect(domainScript).toContain("lookup(url.hostname)");
    expect(domainScript).toContain("/api/health");
    expect(domainScript).toContain("/admin/dashboard");
    expect(domainScript).not.toMatch(/DATABASE_URL=.*:|FIREBASE_SERVICE_ACCOUNT_JSON=.*\{/);
    expect(deploymentReadme).toContain("Backup And Restore Runbook");
    expect(deploymentReadme).toContain("Deployment Operator Handoff");
    expect(deploymentReadme).toContain("Secret Version Runbook");
    expect(deploymentReadme).toContain("Cloud SQL Runtime Checklist");
    expect(deploymentReadme).toContain("Launch Smoke Checklist");
    expect(deploymentReadme).toContain("Domain And DNS Runbook");
    expect(deploymentReadme).toContain("Auth Cookie, CORS, And Redirect Checklist");
    expect(deploymentReadme).toContain("Support And Rollback Runbook");
    expect(deploymentReadme).toContain("Pilot Launch Approval Record");
    expect(terraformReadme).toContain("pnpm deploy:cloud-run:plan");
    expect(terraformReadme).toContain("pnpm deploy:cloud-run all --execute");
    expect(terraformReadme).toContain("pnpm deploy:domains check --execute");
  });
});
