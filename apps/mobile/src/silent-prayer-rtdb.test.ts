import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFirebaseSilentPrayerCountClient } from "./silent-prayer-rtdb.js";
import { getApps, initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";

vi.mock("firebase/app", () => ({
  getApps: vi.fn(),
  initializeApp: vi.fn()
}));

vi.mock("firebase/database", () => ({
  getDatabase: vi.fn(),
  onValue: vi.fn(),
  ref: vi.fn()
}));

describe("silent prayer RTDB count client", () => {
  beforeEach(() => {
    vi.mocked(getApps).mockReset();
    vi.mocked(initializeApp).mockReset();
    vi.mocked(getDatabase).mockReset();
    vi.mocked(ref).mockReset();
    vi.mocked(onValue).mockReset();
  });

  it("subscribes to aggregate count paths and ignores invalid snapshots", () => {
    const app = { name: "jp2-mobile" };
    const database = { id: "database" };
    const databaseRef = { path: "silentPrayerPublicCounts/event-1" };
    const unsubscribe = vi.fn();
    vi.mocked(getApps).mockReturnValue([]);
    vi.mocked(initializeApp).mockReturnValue(app as never);
    vi.mocked(getDatabase).mockReturnValue(database as never);
    vi.mocked(ref).mockReturnValue(databaseRef as never);
    vi.mocked(onValue).mockImplementation((_databaseRef, onSnapshot) => {
      onSnapshot({
        val: () => ({ activeCount: 7, updatedAt: "2026-06-09T12:00:00.000Z" })
      } as never);
      onSnapshot({
        val: () => ({ activeCount: -1, participantKey: "should-not-surface" })
      } as never);

      return unsubscribe;
    });
    const onCount = vi.fn();

    const client = createFirebaseSilentPrayerCountClient({
      apiKey: "api-key",
      authDomain: "jp2.firebaseapp.com",
      projectId: "jp2-project",
      appId: "app-id",
      databaseURL: "https://jp2-default-rtdb.europe-west1.firebasedatabase.app"
    });
    const close = client.subscribeCount("silentPrayerPublicCounts/event-1", onCount);
    close();

    expect(initializeApp).toHaveBeenCalledWith(
      {
        apiKey: "api-key",
        authDomain: "jp2.firebaseapp.com",
        projectId: "jp2-project",
        appId: "app-id",
        databaseURL: "https://jp2-default-rtdb.europe-west1.firebasedatabase.app"
      },
      "jp2-mobile"
    );
    expect(getDatabase).toHaveBeenCalledWith(
      app,
      "https://jp2-default-rtdb.europe-west1.firebasedatabase.app"
    );
    expect(ref).toHaveBeenCalledWith(database, "silentPrayerPublicCounts/event-1");
    expect(onCount).toHaveBeenCalledWith(7);
    expect(onCount).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("reuses the existing Firebase app and forwards listener errors", () => {
    const existingApp = { name: "jp2-mobile" };
    const listenerError = new Error("permission denied");
    vi.mocked(getApps).mockReturnValue([existingApp as never]);
    vi.mocked(getDatabase).mockReturnValue({ id: "database" } as never);
    vi.mocked(ref).mockReturnValue({ path: "silentPrayerPrivateCounts/event-1" } as never);
    vi.mocked(onValue).mockImplementation((_databaseRef, _onSnapshot, onError) => {
      onError?.(listenerError);

      return vi.fn();
    });
    const onError = vi.fn();

    createFirebaseSilentPrayerCountClient({
      apiKey: "api-key",
      authDomain: "jp2.firebaseapp.com",
      projectId: "jp2-project",
      appId: "app-id",
      databaseURL: "https://jp2-default-rtdb.europe-west1.firebasedatabase.app"
    }).subscribeCount("silentPrayerPrivateCounts/event-1", vi.fn(), onError);

    expect(initializeApp).not.toHaveBeenCalled();
    expect(getDatabase).toHaveBeenCalledWith(
      existingApp,
      "https://jp2-default-rtdb.europe-west1.firebasedatabase.app"
    );
    expect(onError).toHaveBeenCalledWith(listenerError);
  });
});
