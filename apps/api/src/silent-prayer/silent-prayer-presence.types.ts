export type SilentPrayerParticipant =
  | {
      readonly type: "anonymous";
      readonly sessionId: string;
    }
  | {
      readonly type: "authenticated";
      readonly userId: string;
    };

export interface SilentPrayerPresenceResult {
  readonly eventId: string;
  readonly activeCount: number;
  readonly expiresAt: string;
}

export abstract class SilentPrayerPresenceStore {
  abstract upsertPresence(key: string, ttlMs: number, now: Date): Promise<void>;
  abstract deletePresence(key: string): Promise<void>;
  abstract countPresence(prefix: string, now: Date): Promise<number>;
}
