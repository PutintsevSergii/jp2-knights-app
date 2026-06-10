import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import type {
  SilentPrayerFirebaseRealtimeConfig,
  SilentPrayerRealtimeCountClient
} from "./silent-prayer-realtime.js";

const FIREBASE_APP_NAME = "jp2-mobile";

export function createFirebaseSilentPrayerCountClient(
  config: SilentPrayerFirebaseRealtimeConfig
): SilentPrayerRealtimeCountClient {
  const app = getOrCreateFirebaseApp(config);
  const database = getDatabase(app, config.databaseURL);

  return {
    subscribeCount(path, onCount, onError) {
      return onValue(
        ref(database, path),
        (snapshot) => {
          const value = snapshot.val() as unknown;

          if (isAggregateCountSnapshot(value)) {
            onCount(value.activeCount);
          }
        },
        (error) => {
          onError?.(error);
        }
      );
    }
  };
}

function getOrCreateFirebaseApp(config: SilentPrayerFirebaseRealtimeConfig): FirebaseApp {
  const existing = getApps().find((app) => app.name === FIREBASE_APP_NAME);

  if (existing) {
    return existing;
  }

  return initializeApp(config, FIREBASE_APP_NAME);
}

function isAggregateCountSnapshot(value: unknown): value is { activeCount: number } {
  const activeCount =
    typeof value === "object" && value !== null && "activeCount" in value
      ? value.activeCount
      : undefined;

  return (
    typeof activeCount === "number" &&
    Number.isInteger(activeCount) &&
    activeCount >= 0
  );
}
