import { describe, expect, it, vi } from "vitest";
import {
  BrotherSilentPrayerHttpError,
  PublicSilentPrayerHttpError,
  brotherSilentPrayerLoadFailureState,
  buildBrotherSilentPrayerHeartbeatUrl,
  buildBrotherSilentPrayerJoinUrl,
  buildBrotherSilentPrayerLeaveUrl,
  buildBrotherSilentPrayerSessionsUrl,
  buildPublicSilentPrayerHeartbeatUrl,
  buildPublicSilentPrayerJoinUrl,
  buildPublicSilentPrayerLeaveUrl,
  buildPublicSilentPrayerSessionsUrl,
  fetchBrotherSilentPrayerSessions,
  fetchPublicSilentPrayerSessions,
  heartbeatBrotherSilentPrayerSession,
  heartbeatPublicSilentPrayerSession,
  joinBrotherSilentPrayerSession,
  joinPublicSilentPrayerSession,
  leaveBrotherSilentPrayerSession,
  leavePublicSilentPrayerSession,
  publicSilentPrayerLoadFailureState,
  silentPrayerAnonymousSessionId
} from "./silent-prayer-api.js";
import {
  fallbackBrotherSilentPrayerJoin,
  fallbackBrotherSilentPrayerSessions,
  fallbackPublicSilentPrayerJoin,
  fallbackPublicSilentPrayerSessions
} from "./silent-prayer.js";

describe("silent prayer mobile api", () => {
  it("fetches and joins public silent-prayer sessions with anonymous ids", async () => {
    const fetchImpl = vi.fn((input: string) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve(
            input.includes("/join")
              ? fallbackPublicSilentPrayerJoin
              : fallbackPublicSilentPrayerSessions
          )
      })
    );

    await expect(
      fetchPublicSilentPrayerSessions({
        baseUrl: "https://api.example.test",
        limit: 10,
        offset: 5,
        fetchImpl
      })
    ).resolves.toEqual(fallbackPublicSilentPrayerSessions);
    await expect(
      joinPublicSilentPrayerSession({
        id: fallbackPublicSilentPrayerSessions.sessions[0]!.id,
        anonymousSessionId: "anon-test",
        baseUrl: "https://api.example.test",
        fetchImpl
      })
    ).resolves.toEqual(fallbackPublicSilentPrayerJoin);

    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.example.test/public/silent-prayer-events?limit=10&offset=5"
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://api.example.test/public/silent-prayer-events/12121212-1212-4121-8121-121212121212/join",
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ anonymousSessionId: "anon-test" })
      }
    );
  });

  it("fetches and joins brother silent-prayer sessions with bearer auth", async () => {
    const fetchImpl = vi.fn((input: string) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve(
            input.includes("/join")
              ? fallbackBrotherSilentPrayerJoin
              : fallbackBrotherSilentPrayerSessions
          )
      })
    );

    await expect(
      fetchBrotherSilentPrayerSessions({
        baseUrl: "https://api.example.test",
        authToken: "token",
        limit: 10,
        offset: 5,
        fetchImpl
      })
    ).resolves.toEqual(fallbackBrotherSilentPrayerSessions);
    await expect(
      joinBrotherSilentPrayerSession({
        id: fallbackBrotherSilentPrayerSessions.sessions[0]!.id,
        baseUrl: "https://api.example.test",
        authToken: "token",
        fetchImpl
      })
    ).resolves.toEqual(fallbackBrotherSilentPrayerJoin);

    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.example.test/brother/silent-prayer-events?limit=10&offset=5",
      {
        method: "GET",
        headers: { authorization: "Bearer token" }
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://api.example.test/brother/silent-prayer-events/34343434-3434-4343-8343-343434343434/join",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer token"
        },
        body: JSON.stringify({})
      }
    );
  });

  it("refreshes and leaves silent-prayer presence through API-owned REST contracts", async () => {
    const presenceResponse = {
      presence: {
        activeCount: 3,
        expiresAt: "2026-06-09T12:00:00.000Z"
      }
    };
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(presenceResponse)
      })
    );

    await expect(
      heartbeatPublicSilentPrayerSession({
        id: fallbackPublicSilentPrayerJoin.session.id,
        anonymousSessionId: "anon-test",
        baseUrl: "https://api.example.test",
        fetchImpl
      })
    ).resolves.toEqual(presenceResponse);
    await expect(
      leavePublicSilentPrayerSession({
        id: fallbackPublicSilentPrayerJoin.session.id,
        anonymousSessionId: "anon-test",
        baseUrl: "https://api.example.test",
        fetchImpl
      })
    ).resolves.toEqual(presenceResponse);
    await expect(
      heartbeatBrotherSilentPrayerSession({
        id: fallbackBrotherSilentPrayerJoin.session.id,
        authToken: "token",
        baseUrl: "https://api.example.test",
        fetchImpl
      })
    ).resolves.toEqual(presenceResponse);
    await expect(
      leaveBrotherSilentPrayerSession({
        id: fallbackBrotherSilentPrayerJoin.session.id,
        authToken: "token",
        baseUrl: "https://api.example.test",
        fetchImpl
      })
    ).resolves.toEqual(presenceResponse);

    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.example.test/public/silent-prayer-events/12121212-1212-4121-8121-121212121212/heartbeat",
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          anonymousSessionId: "anon-test",
          eventId: fallbackPublicSilentPrayerJoin.session.id
        })
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://api.example.test/public/silent-prayer-events/12121212-1212-4121-8121-121212121212/leave",
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          anonymousSessionId: "anon-test",
          eventId: fallbackPublicSilentPrayerJoin.session.id
        })
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      3,
      "https://api.example.test/brother/silent-prayer-events/34343434-3434-4343-8343-343434343434/heartbeat",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer token"
        },
        body: JSON.stringify({
          eventId: fallbackBrotherSilentPrayerJoin.session.id
        })
      }
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      4,
      "https://api.example.test/brother/silent-prayer-events/34343434-3434-4343-8343-343434343434/leave",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer token"
        },
        body: JSON.stringify({
          eventId: fallbackBrotherSilentPrayerJoin.session.id
        })
      }
    );
  });

  it("builds URLs, anonymous ids, and failure states", async () => {
    expect(buildPublicSilentPrayerSessionsUrl("https://api.example.test")).toBe(
      "https://api.example.test/public/silent-prayer-events"
    );
    expect(
      buildPublicSilentPrayerJoinUrl(
        "12121212-1212-4121-8121-121212121212",
        "https://api.example.test"
      )
    ).toBe(
      "https://api.example.test/public/silent-prayer-events/12121212-1212-4121-8121-121212121212/join"
    );
    expect(
      buildPublicSilentPrayerHeartbeatUrl(
        "12121212-1212-4121-8121-121212121212",
        "https://api.example.test"
      )
    ).toBe(
      "https://api.example.test/public/silent-prayer-events/12121212-1212-4121-8121-121212121212/heartbeat"
    );
    expect(
      buildPublicSilentPrayerLeaveUrl(
        "12121212-1212-4121-8121-121212121212",
        "https://api.example.test"
      )
    ).toBe(
      "https://api.example.test/public/silent-prayer-events/12121212-1212-4121-8121-121212121212/leave"
    );
    expect(buildBrotherSilentPrayerSessionsUrl("https://api.example.test")).toBe(
      "https://api.example.test/brother/silent-prayer-events"
    );
    expect(
      buildBrotherSilentPrayerJoinUrl(
        "34343434-3434-4343-8343-343434343434",
        "https://api.example.test"
      )
    ).toBe(
      "https://api.example.test/brother/silent-prayer-events/34343434-3434-4343-8343-343434343434/join"
    );
    expect(
      buildBrotherSilentPrayerHeartbeatUrl(
        "34343434-3434-4343-8343-343434343434",
        "https://api.example.test"
      )
    ).toBe(
      "https://api.example.test/brother/silent-prayer-events/34343434-3434-4343-8343-343434343434/heartbeat"
    );
    expect(
      buildBrotherSilentPrayerLeaveUrl(
        "34343434-3434-4343-8343-343434343434",
        "https://api.example.test"
      )
    ).toBe(
      "https://api.example.test/brother/silent-prayer-events/34343434-3434-4343-8343-343434343434/leave"
    );
    expect(silentPrayerAnonymousSessionId(1)).toBe("anon-1");

    await expect(
      fetchPublicSilentPrayerSessions({
        fetchImpl: () =>
          Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({})
          })
      })
    ).rejects.toBeInstanceOf(PublicSilentPrayerHttpError);

    expect(publicSilentPrayerLoadFailureState(new TypeError("offline"))).toBe("offline");
    expect(publicSilentPrayerLoadFailureState(new PublicSilentPrayerHttpError(404))).toBe("empty");
    expect(publicSilentPrayerLoadFailureState(new Error("boom"))).toBe("error");
    expect(brotherSilentPrayerLoadFailureState(new BrotherSilentPrayerHttpError(401))).toBe(
      "forbidden"
    );
    expect(brotherSilentPrayerLoadFailureState(new BrotherSilentPrayerHttpError(404))).toBe(
      "empty"
    );
    expect(
      brotherSilentPrayerLoadFailureState(
        new BrotherSilentPrayerHttpError(403, "IDLE_APPROVAL_REQUIRED")
      )
    ).toBe("idleApproval");
    expect(brotherSilentPrayerLoadFailureState(new TypeError("offline"))).toBe("offline");
  });
});
