import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildSilentPrayerRtdbCountPath,
  readSilentPrayerRealtimeConfig,
  startBrotherSilentPrayerRealtime,
  startPublicSilentPrayerRealtime,
  type SilentPrayerRealtimeCountClient
} from "./silent-prayer-realtime.js";
import {
  fallbackBrotherSilentPrayerJoin,
  fallbackPublicSilentPrayerJoin
} from "./silent-prayer.js";

describe("silent prayer realtime client", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reads RTDB provider config without requiring Google OAuth client ids", () => {
    expect(
      readSilentPrayerRealtimeConfig({
        EXPO_PUBLIC_SILENT_PRAYER_REALTIME_PROVIDER: "firebase-rtdb",
        EXPO_PUBLIC_FIREBASE_API_KEY: "api-key",
        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: "jp2.firebaseapp.com",
        EXPO_PUBLIC_FIREBASE_PROJECT_ID: "jp2-project",
        EXPO_PUBLIC_FIREBASE_APP_ID: "app-id",
        EXPO_PUBLIC_FIREBASE_DATABASE_URL:
          "https://jp2-default-rtdb.europe-west1.firebasedatabase.app"
      })
    ).toEqual({
      provider: "firebase-rtdb",
      firebase: {
        apiKey: "api-key",
        authDomain: "jp2.firebaseapp.com",
        projectId: "jp2-project",
        appId: "app-id",
        databaseURL: "https://jp2-default-rtdb.europe-west1.firebasedatabase.app"
      }
    });
  });

  it("subscribes to public RTDB aggregate counts and uses REST heartbeat and leave", async () => {
    vi.useFakeTimers();
    const countClient = new FakeSilentPrayerCountClient();
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            presence: {
              activeCount: 2,
              expiresAt: "2026-06-09T12:00:00.000Z"
            }
          })
      })
    );
    const onPresence = vi.fn();
    const session = startPublicSilentPrayerRealtime({
      provider: "firebase-rtdb",
      baseUrl: "https://api.example.test",
      eventId: fallbackPublicSilentPrayerJoin.session.id,
      anonymousSessionId: "anon-test",
      heartbeatIntervalMs: 1000,
      countClient,
      fetchImpl,
      onPresence
    });

    await vi.runOnlyPendingTimersAsync();
    countClient.publish("silentPrayerPublicCounts/12121212-1212-4121-8121-121212121212", 4);
    vi.advanceTimersByTime(1000);
    await vi.runOnlyPendingTimersAsync();
    session.leave();
    await vi.runOnlyPendingTimersAsync();

    expect(countClient.subscriptions).toEqual([
      "silentPrayerPublicCounts/12121212-1212-4121-8121-121212121212"
    ]);
    expect(onPresence).toHaveBeenCalledWith({
      eventId: fallbackPublicSilentPrayerJoin.session.id,
      activeCount: 4,
      expiresAt: "2026-06-09T12:00:00.000Z",
      socketRoom: "silent-prayer:12121212-1212-4121-8121-121212121212"
    });
    expect(fetchImpl).toHaveBeenLastCalledWith(
      "https://api.example.test/public/silent-prayer-events/12121212-1212-4121-8121-121212121212/leave",
      expect.objectContaining({ method: "POST" })
    );
    expect(countClient.closed).toBe(true);
  });

  it("subscribes brother RTDB listeners only to private count paths", async () => {
    vi.useFakeTimers();
    const countClient = new FakeSilentPrayerCountClient();
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            presence: {
              activeCount: 1,
              expiresAt: "2026-06-09T12:00:00.000Z"
            }
          })
      })
    );

    const session = startBrotherSilentPrayerRealtime({
      provider: "firebase-rtdb",
      baseUrl: "https://api.example.test",
      eventId: fallbackBrotherSilentPrayerJoin.session.id,
      authToken: "token",
      countClient,
      fetchImpl
    });

    await vi.runOnlyPendingTimersAsync();
    session.disconnect();

    expect(countClient.subscriptions).toEqual([
      "silentPrayerPrivateCounts/34343434-3434-4343-8343-343434343434"
    ]);
    expect(fetchImpl.mock.calls.join("\n")).not.toContain("anonymousSessionId");
  });

  it("builds narrow RTDB count paths only", () => {
    expect(
      buildSilentPrayerRtdbCountPath("public", fallbackPublicSilentPrayerJoin.session.id)
    ).toBe("silentPrayerPublicCounts/12121212-1212-4121-8121-121212121212");
    expect(
      buildSilentPrayerRtdbCountPath("private", fallbackBrotherSilentPrayerJoin.session.id)
    ).toBe("silentPrayerPrivateCounts/34343434-3434-4343-8343-343434343434");
  });
});

class FakeSilentPrayerCountClient implements SilentPrayerRealtimeCountClient {
  readonly subscriptions: string[] = [];
  readonly handlers = new Map<string, (activeCount: number) => void>();
  closed = false;

  subscribeCount(path: string, onCount: (activeCount: number) => void): () => void {
    this.subscriptions.push(path);
    this.handlers.set(path, onCount);

    return () => {
      this.closed = true;
      this.handlers.delete(path);
    };
  }

  publish(path: string, activeCount: number): void {
    this.handlers.get(path)?.(activeCount);
  }
}
