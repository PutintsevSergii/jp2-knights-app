import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type {
  SilentPrayerParticipant,
  SilentPrayerPresenceResult
} from "./silent-prayer-presence.types.js";
import { SilentPrayerPresenceStore } from "./silent-prayer-presence.types.js";

export const SILENT_PRAYER_PRESENCE_TTL_MS = 45_000;

@Injectable()
export class SilentPrayerPresenceService {
  private readonly ttlMs = SILENT_PRAYER_PRESENCE_TTL_MS;

  constructor(@Inject(SilentPrayerPresenceStore) private readonly store: SilentPrayerPresenceStore) {}

  async join(
    eventId: string,
    participant: SilentPrayerParticipant,
    now = new Date()
  ): Promise<SilentPrayerPresenceResult> {
    this.assertEventId(eventId);

    await this.store.upsertPresence(
      this.presenceKey(eventId, participant),
      this.ttlMs,
      now
    );

    return this.countResult(eventId, now);
  }

  async heartbeat(
    eventId: string,
    participant: SilentPrayerParticipant,
    now = new Date()
  ): Promise<SilentPrayerPresenceResult> {
    return this.join(eventId, participant, now);
  }

  async leave(
    eventId: string,
    participant: SilentPrayerParticipant,
    now = new Date()
  ): Promise<SilentPrayerPresenceResult> {
    this.assertEventId(eventId);

    await this.store.deletePresence(this.presenceKey(eventId, participant));

    return this.countResult(eventId, now);
  }

  async count(eventId: string, now = new Date()): Promise<SilentPrayerPresenceResult> {
    this.assertEventId(eventId);

    return this.countResult(eventId, now);
  }

  private async countResult(eventId: string, now: Date): Promise<SilentPrayerPresenceResult> {
    const activeCount = await this.store.countPresence(this.eventPrefix(eventId), now);

    return {
      eventId,
      activeCount,
      expiresAt: new Date(now.getTime() + this.ttlMs).toISOString()
    };
  }

  private presenceKey(eventId: string, participant: SilentPrayerParticipant): string {
    this.assertEventId(eventId);

    const identity =
      participant.type === "anonymous"
        ? this.requiredIdentity("anonymous session id", participant.sessionId)
        : this.requiredIdentity("authenticated user id", participant.userId);

    return `${this.eventPrefix(eventId)}${participant.type}:${encodeURIComponent(identity)}`;
  }

  private eventPrefix(eventId: string): string {
    return `silent-prayer:${encodeURIComponent(eventId)}:presence:`;
  }

  private assertEventId(eventId: string): void {
    this.requiredIdentity("silent prayer event id", eventId);
  }

  private requiredIdentity(label: string, value: string): string {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw new BadRequestException(`${label} is required`);
    }

    return trimmed;
  }
}
