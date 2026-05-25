import { Injectable } from "@nestjs/common";
import type { SilentPrayerPresenceStore } from "./silent-prayer-presence.types.js";

@Injectable()
export class InMemorySilentPrayerPresenceStore implements SilentPrayerPresenceStore {
  private readonly entries = new Map<string, { readonly expiresAtMs: number }>();

  upsertPresence(key: string, ttlMs: number, now: Date): Promise<void> {
    this.entries.set(key, {
      expiresAtMs: now.getTime() + ttlMs
    });

    return Promise.resolve();
  }

  deletePresence(key: string): Promise<void> {
    this.entries.delete(key);

    return Promise.resolve();
  }

  countPresence(prefix: string, now: Date): Promise<number> {
    this.purgeExpired(now);

    let count = 0;
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) {
        count += 1;
      }
    }

    return Promise.resolve(count);
  }

  private purgeExpired(now: Date): void {
    const nowMs = now.getTime();

    for (const [key, entry] of this.entries) {
      if (entry.expiresAtMs <= nowMs) {
        this.entries.delete(key);
      }
    }
  }
}
