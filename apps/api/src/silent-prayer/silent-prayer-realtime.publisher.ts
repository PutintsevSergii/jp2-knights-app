import { Injectable } from "@nestjs/common";
import {
  createConfiguredSilentPrayerRtdbDatabase,
  type SilentPrayerRtdbDatabase
} from "./silent-prayer-presence.store.js";
import { readSilentPrayerRealtimeProvider } from "./silent-prayer-realtime.config.js";

export abstract class SilentPrayerRealtimePublisher {
  abstract publishPublicCount(eventId: string, activeCount: number, now: Date): Promise<void>;
  abstract publishPrivateCount(eventId: string, activeCount: number, now: Date): Promise<void>;
  abstract grantPrivateRead(
    firebaseUid: string,
    eventId: string,
    ttlMs: number,
    now: Date
  ): Promise<void>;
  abstract revokePrivateRead(firebaseUid: string, eventId: string): Promise<void>;
}

@Injectable()
export class NoopSilentPrayerRealtimePublisher implements SilentPrayerRealtimePublisher {
  publishPublicCount(_eventId: string, _activeCount: number, _now: Date): Promise<void> {
    void _eventId;
    void _activeCount;
    void _now;

    return Promise.resolve();
  }

  publishPrivateCount(_eventId: string, _activeCount: number, _now: Date): Promise<void> {
    void _eventId;
    void _activeCount;
    void _now;

    return Promise.resolve();
  }

  grantPrivateRead(
    _firebaseUid: string,
    _eventId: string,
    _ttlMs: number,
    _now: Date
  ): Promise<void> {
    void _firebaseUid;
    void _eventId;
    void _ttlMs;
    void _now;

    return Promise.resolve();
  }

  revokePrivateRead(_firebaseUid: string, _eventId: string): Promise<void> {
    void _firebaseUid;
    void _eventId;

    return Promise.resolve();
  }
}

@Injectable()
export class FirebaseRtdbSilentPrayerRealtimePublisher implements SilentPrayerRealtimePublisher {
  constructor(private readonly database: SilentPrayerRtdbDatabase) {}

  publishPublicCount(eventId: string, activeCount: number, now: Date): Promise<void> {
    return this.publishCount(`silentPrayerPublicCounts/${rtdbPathSegment(eventId)}`, activeCount, now);
  }

  publishPrivateCount(eventId: string, activeCount: number, now: Date): Promise<void> {
    return this.publishCount(`silentPrayerPrivateCounts/${rtdbPathSegment(eventId)}`, activeCount, now);
  }

  async grantPrivateRead(
    firebaseUid: string,
    eventId: string,
    ttlMs: number,
    now: Date
  ): Promise<void> {
    await this.database.ref(privateReadGrantPath(firebaseUid, eventId)).set({
      expiresAt: now.getTime() + ttlMs,
      updatedAt: now.toISOString()
    });
  }

  async revokePrivateRead(firebaseUid: string, eventId: string): Promise<void> {
    await this.database.ref(privateReadGrantPath(firebaseUid, eventId)).remove();
  }

  private async publishCount(path: string, activeCount: number, now: Date): Promise<void> {
    await this.database.ref(path).set({
      activeCount,
      updatedAt: now.toISOString()
    });
  }
}

export function createConfiguredSilentPrayerRealtimePublisher(): SilentPrayerRealtimePublisher {
  if (readSilentPrayerRealtimeProvider() !== "firebase-rtdb") {
    return new NoopSilentPrayerRealtimePublisher();
  }

  return new FirebaseRtdbSilentPrayerRealtimePublisher(createConfiguredSilentPrayerRtdbDatabase());
}

function privateReadGrantPath(firebaseUid: string, eventId: string): string {
  return `silentPrayerReadGrants/${rtdbPathSegment(firebaseUid)}/${rtdbPathSegment(eventId)}`;
}

function rtdbPathSegment(value: string): string {
  return encodeURIComponent(value);
}
