import { describe, expect, it } from "vitest";
import {
  applyPublicSilentPrayerJoin,
  applyPublicSilentPrayerPresence,
  applyPublicSilentPrayerPresenceToJoin
} from "./public-silent-prayer-state.js";

const session = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Silent Prayer",
  intention: "Pray silently together.",
  startsAt: "2026-05-26T18:00:00.000Z",
  endsAt: null,
  visibility: "PUBLIC" as const,
  activeCount: 1
};

const pagination = { limit: 20, offset: 0 };
const presence = {
  eventId: session.id,
  activeCount: 2,
  expiresAt: "2026-05-26T18:05:00.000Z",
  socketRoom: `silent-prayer:${session.id}`
};

describe("public silent prayer state helpers", () => {
  it("updates the joined session in a list", () => {
    expect(
      applyPublicSilentPrayerJoin(
        { sessions: [session], pagination },
        {
          session: { ...session, activeCount: 2 },
          presence
        }
      ).sessions[0]?.activeCount
    ).toBe(2);
  });

  it("applies presence updates to matching list and join state only", () => {
    const activePresence = { ...presence, activeCount: 3 };

    expect(
      applyPublicSilentPrayerPresence({ sessions: [session], pagination }, activePresence)
        .sessions[0]
    ).toEqual({
      ...session,
      activeCount: 3
    });
    expect(
      applyPublicSilentPrayerPresenceToJoin({ session, presence }, activePresence).session
        .activeCount
    ).toBe(3);
    expect(
      applyPublicSilentPrayerPresenceToJoin(
        { session, presence },
        {
          ...presence,
          eventId: "22222222-2222-4222-8222-222222222222",
          activeCount: 5,
          socketRoom: "silent-prayer:22222222-2222-4222-8222-222222222222"
        }
      ).session.activeCount
    ).toBe(1);
  });
});
