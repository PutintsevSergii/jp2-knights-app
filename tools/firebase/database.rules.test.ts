import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

const hasDatabaseEmulator = Boolean(process.env["FIREBASE_DATABASE_EMULATOR_HOST"]);
const describeWithEmulator = hasDatabaseEmulator ? describe : describe.skip;

const projectId = process.env["GCLOUD_PROJECT"] ?? "jp2-rules-test";
const rules = readFileSync(join(process.cwd(), "infra/firebase/database.rules.json"), "utf8");
const futureGrantExpiry = Date.now() + 60 * 60 * 1000;
const expiredGrantExpiry = Date.now() - 60 * 1000;

describeWithEmulator("Firebase RTDB silent-prayer rules", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId,
      database: {
        rules
      }
    });
  });

  beforeEach(async () => {
    await testEnv.clearDatabase();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.database();

      await db.ref("silentPrayerPublicCounts/public-event").set({
        activeCount: 3,
        updatedAt: "2026-06-10T10:00:00.000Z"
      });
      await db.ref("silentPrayerPrivateCounts/brother-event").set({
        activeCount: 7,
        updatedAt: "2026-06-10T10:00:00.000Z"
      });
      await db.ref("silentPrayerReadGrants/firebase-uid/brother-event").set({
        expiresAt: futureGrantExpiry
      });
      await db.ref("silentPrayerReadGrants/expired-firebase-uid/brother-event").set({
        expiresAt: expiredGrantExpiry
      });
      await db.ref("silentPrayerPresence/brother-event/hashed-participant").set({
        expiresAt: futureGrantExpiry
      });
    });
  });

  afterEach(async () => {
    await testEnv.clearDatabase();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("allows unauthenticated reads of public aggregate counts only", async () => {
    const db = testEnv.unauthenticatedContext().database();

    const snapshot = await assertSucceeds(db.ref("silentPrayerPublicCounts/public-event").get());

    expect(snapshot.val()).toEqual({
      activeCount: 3,
      updatedAt: "2026-06-10T10:00:00.000Z"
    });
    await assertFails(db.ref("silentPrayerPresence/brother-event/hashed-participant").get());
    await assertFails(db.ref("silentPrayerReadGrants/firebase-uid/brother-event").get());
    await assertFails(db.ref("silentPrayerPrivateCounts/brother-event").get());
  });

  it("allows private aggregate reads only for API-issued unexpired read grants", async () => {
    const grantedDb = testEnv.authenticatedContext("firebase-uid").database();
    const ungrantedDb = testEnv.authenticatedContext("other-firebase-uid").database();
    const expiredGrantDb = testEnv.authenticatedContext("expired-firebase-uid").database();

    const snapshot = await assertSucceeds(
      grantedDb.ref("silentPrayerPrivateCounts/brother-event").get()
    );

    expect(snapshot.val()).toEqual({
      activeCount: 7,
      updatedAt: "2026-06-10T10:00:00.000Z"
    });
    await assertFails(ungrantedDb.ref("silentPrayerPrivateCounts/brother-event").get());
    await assertFails(expiredGrantDb.ref("silentPrayerPrivateCounts/brother-event").get());
  });

  it("denies all client writes to counts, presence rows, and private read grants", async () => {
    const anonymousDb = testEnv.unauthenticatedContext().database();
    const authenticatedDb = testEnv.authenticatedContext("firebase-uid").database();

    await assertFails(
      anonymousDb.ref("silentPrayerPublicCounts/public-event").set({
        activeCount: 4,
        updatedAt: "2026-06-10T10:01:00.000Z"
      })
    );
    await assertFails(
      authenticatedDb.ref("silentPrayerPrivateCounts/brother-event").set({
        activeCount: 8,
        updatedAt: "2026-06-10T10:01:00.000Z"
      })
    );
    await assertFails(
      authenticatedDb.ref("silentPrayerPresence/brother-event/another-hash").set({
        expiresAt: futureGrantExpiry
      })
    );
    await assertFails(
      authenticatedDb.ref("silentPrayerReadGrants/firebase-uid/another-event").set({
        expiresAt: futureGrantExpiry
      })
    );
  });
});

