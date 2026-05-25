import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { SilentPrayerPresenceService } from "./silent-prayer-presence.service.js";
import { InMemorySilentPrayerPresenceStore } from "./silent-prayer-presence.store.js";

const eventId = "silent-prayer-event-1";
const firstJoin = new Date("2026-05-25T10:00:00.000Z");

describe("SilentPrayerPresenceService", () => {
  it("counts duplicate authenticated joins once and does not expose participant identities", async () => {
    const service = serviceWithStore();

    await expect(
      service.join(eventId, { type: "authenticated", userId: "brother-1" }, firstJoin)
    ).resolves.toEqual({
      eventId,
      activeCount: 1,
      expiresAt: "2026-05-25T10:00:45.000Z"
    });

    await expect(
      service.join(eventId, { type: "authenticated", userId: "brother-1" }, firstJoin)
    ).resolves.toEqual({
      eventId,
      activeCount: 1,
      expiresAt: "2026-05-25T10:00:45.000Z"
    });
  });

  it("keeps anonymous and authenticated participant counters independent per event", async () => {
    const service = serviceWithStore();

    await service.join(eventId, { type: "anonymous", sessionId: "guest-1" }, firstJoin);
    await service.join(eventId, { type: "anonymous", sessionId: "guest-2" }, firstJoin);
    await service.join(eventId, { type: "authenticated", userId: "brother-1" }, firstJoin);
    await service.join("other-event", { type: "anonymous", sessionId: "guest-3" }, firstJoin);

    await expect(service.count(eventId, firstJoin)).resolves.toMatchObject({
      eventId,
      activeCount: 3
    });
    await expect(service.count("other-event", firstJoin)).resolves.toMatchObject({
      eventId: "other-event",
      activeCount: 1
    });
  });

  it("refreshes presence on heartbeat so reconnects before ttl do not inflate counts", async () => {
    const service = serviceWithStore();

    await service.join(eventId, { type: "authenticated", userId: "brother-1" }, firstJoin);
    await service.heartbeat(
      eventId,
      { type: "authenticated", userId: "brother-1" },
      new Date("2026-05-25T10:00:40.000Z")
    );

    await expect(
      service.count(eventId, new Date("2026-05-25T10:01:20.000Z"))
    ).resolves.toMatchObject({
      activeCount: 1
    });
    await expect(
      service.count(eventId, new Date("2026-05-25T10:01:25.001Z"))
    ).resolves.toMatchObject({
      activeCount: 0
    });
  });

  it("expires disconnected participants by ttl and removes explicit leaves immediately", async () => {
    const service = serviceWithStore();

    await service.join(eventId, { type: "anonymous", sessionId: "guest-1" }, firstJoin);
    await service.join(eventId, { type: "anonymous", sessionId: "guest-2" }, firstJoin);

    await expect(
      service.leave(eventId, { type: "anonymous", sessionId: "guest-1" }, firstJoin)
    ).resolves.toMatchObject({
      activeCount: 1
    });
    await expect(
      service.count(eventId, new Date("2026-05-25T10:00:45.001Z"))
    ).resolves.toMatchObject({
      activeCount: 0
    });
  });

  it("keeps aggregate counts multi-instance safe when services share the same store", async () => {
    const store = new InMemorySilentPrayerPresenceStore();
    const firstInstance = new SilentPrayerPresenceService(store);
    const secondInstance = new SilentPrayerPresenceService(store);

    await firstInstance.join(eventId, { type: "anonymous", sessionId: "guest-1" }, firstJoin);
    await secondInstance.join(eventId, { type: "authenticated", userId: "brother-1" }, firstJoin);

    await expect(firstInstance.count(eventId, firstJoin)).resolves.toMatchObject({
      activeCount: 2
    });
    await expect(
      secondInstance.leave(eventId, { type: "anonymous", sessionId: "guest-1" }, firstJoin)
    ).resolves.toMatchObject({
      activeCount: 1
    });
  });

  it("rejects empty event and participant identifiers", async () => {
    const service = serviceWithStore();

    await expect(
      service.join(" ", { type: "anonymous", sessionId: "guest-1" }, firstJoin)
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.join(eventId, { type: "anonymous", sessionId: " " }, firstJoin)
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.join(eventId, { type: "authenticated", userId: " " }, firstJoin)
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

function serviceWithStore(): SilentPrayerPresenceService {
  return new SilentPrayerPresenceService(new InMemorySilentPrayerPresenceStore());
}
