export type SilentPrayerRealtimeProvider = "redis-socket" | "firebase-rtdb" | "in-memory";

export function readSilentPrayerRealtimeProvider(
  env: Record<string, string | undefined> = process.env
): SilentPrayerRealtimeProvider {
  const configured = env.SILENT_PRAYER_REALTIME_PROVIDER?.trim();

  if (configured) {
    if (
      configured === "redis-socket" ||
      configured === "firebase-rtdb" ||
      configured === "in-memory"
    ) {
      return configured;
    }

    throw new Error(`Unsupported SILENT_PRAYER_REALTIME_PROVIDER '${configured}'.`);
  }

  if (env.REDIS_URL || env.NODE_ENV === "production") {
    return "redis-socket";
  }

  return "in-memory";
}

export function isFirebaseRtdbSilentPrayerRealtime(
  env: Record<string, string | undefined> = process.env
): boolean {
  return readSilentPrayerRealtimeProvider(env) === "firebase-rtdb";
}
