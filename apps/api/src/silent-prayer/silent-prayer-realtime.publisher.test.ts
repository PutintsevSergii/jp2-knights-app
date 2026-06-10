import { describe, expect, it } from "vitest";
import {
  FirebaseRtdbSilentPrayerRealtimePublisher,
  NoopSilentPrayerRealtimePublisher
} from "./silent-prayer-realtime.publisher.js";
import type {
  SilentPrayerRtdbDatabase,
  SilentPrayerRtdbReference
} from "./silent-prayer-presence.store.js";

describe("SilentPrayerRealtimePublisher", () => {
  it("publishes only aggregate public and private RTDB counts", async () => {
    const database = new FakeSilentPrayerRtdbDatabase();
    const publisher = new FirebaseRtdbSilentPrayerRealtimePublisher(database);
    const now = new Date("2026-06-09T12:00:00.000Z");

    await publisher.publishPublicCount("event-1", 4, now);
    await publisher.publishPrivateCount("event-2", 2, now);

    expect(database.values).toEqual(
      new Map<string, unknown>([
        [
          "silentPrayerPublicCounts/event-1",
          {
            activeCount: 4,
            updatedAt: "2026-06-09T12:00:00.000Z"
          }
        ],
        [
          "silentPrayerPrivateCounts/event-2",
          {
            activeCount: 2,
            updatedAt: "2026-06-09T12:00:00.000Z"
          }
        ]
      ])
    );
    expect(JSON.stringify([...database.values.values()])).not.toContain("participant");
  });

  it("grants and revokes private reads using Firebase uid and event id only", async () => {
    const database = new FakeSilentPrayerRtdbDatabase();
    const publisher = new FirebaseRtdbSilentPrayerRealtimePublisher(database);
    const now = new Date("2026-06-09T12:00:00.000Z");

    await publisher.grantPrivateRead("firebase-user-1", "event-1", 45_000, now);

    expect(database.values.get("silentPrayerReadGrants/firebase-user-1/event-1")).toEqual({
      expiresAt: now.getTime() + 45_000,
      updatedAt: "2026-06-09T12:00:00.000Z"
    });

    await publisher.revokePrivateRead("firebase-user-1", "event-1");

    expect(database.values.has("silentPrayerReadGrants/firebase-user-1/event-1")).toBe(false);
  });

  it("keeps noop publisher calls side-effect free", async () => {
    const publisher = new NoopSilentPrayerRealtimePublisher();

    await expect(publisher.publishPublicCount("event-1", 1, new Date())).resolves.toBeUndefined();
    await expect(publisher.publishPrivateCount("event-1", 1, new Date())).resolves.toBeUndefined();
    await expect(
      publisher.grantPrivateRead("firebase-user-1", "event-1", 45_000, new Date())
    ).resolves.toBeUndefined();
    await expect(publisher.revokePrivateRead("firebase-user-1", "event-1")).resolves.toBeUndefined();
  });
});

class FakeSilentPrayerRtdbDatabase implements SilentPrayerRtdbDatabase {
  readonly values = new Map<string, unknown>();

  ref(path: string): SilentPrayerRtdbReference {
    return new FakeSilentPrayerRtdbReference(path, this.values);
  }
}

class FakeSilentPrayerRtdbReference implements SilentPrayerRtdbReference {
  constructor(
    private readonly path: string,
    private readonly values: Map<string, unknown>
  ) {}

  set(value: unknown): Promise<void> {
    this.values.set(this.path, value);

    return Promise.resolve();
  }

  remove(): Promise<void> {
    this.values.delete(this.path);

    return Promise.resolve();
  }

  once(): Promise<{ val(): unknown }> {
    return Promise.resolve({ val: () => null });
  }
}
