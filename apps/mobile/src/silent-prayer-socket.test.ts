import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SILENT_PRAYER_SOCKET_EVENTS,
  buildSilentPrayerSocketUrl,
  startBrotherSilentPrayerRealtime,
  startPublicSilentPrayerRealtime,
  type SilentPrayerSocketFactory,
  type SilentPrayerSocketTransport
} from "./silent-prayer-socket.js";
import {
  fallbackBrotherSilentPrayerJoin,
  fallbackPublicSilentPrayerJoin
} from "./silent-prayer.js";

describe("silent prayer socket client", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds the backend Socket.IO namespace URL", () => {
    expect(buildSilentPrayerSocketUrl("https://api.example.test")).toBe(
      "https://api.example.test/silent-prayer"
    );
  });

  it("joins public sessions, starts heartbeats, and leaves aggregate rooms", () => {
    vi.useFakeTimers();
    const socket = new FakeSilentPrayerSocket();
    const socketFactory = vi.fn(() => socket) satisfies SilentPrayerSocketFactory;
    const onJoined = vi.fn();
    const onPresence = vi.fn();
    const session = startPublicSilentPrayerRealtime({
      baseUrl: "https://api.example.test",
      eventId: fallbackPublicSilentPrayerJoin.session.id,
      anonymousSessionId: "anon-test",
      heartbeatIntervalMs: 1000,
      socketFactory,
      onJoined,
      onPresence
    });

    socket.trigger(SILENT_PRAYER_SOCKET_EVENTS.connect);
    expect(socketFactory).toHaveBeenCalledWith("https://api.example.test/silent-prayer", {
      autoConnect: false,
      transports: ["websocket"]
    });
    expect(socket.emitted[0]).toEqual({
      event: "silent-prayer:public:join",
      payload: {
        eventId: fallbackPublicSilentPrayerJoin.session.id,
        anonymousSessionId: "anon-test"
      }
    });

    socket.trigger(SILENT_PRAYER_SOCKET_EVENTS.joined, fallbackPublicSilentPrayerJoin);
    socket.trigger(SILENT_PRAYER_SOCKET_EVENTS.presence, fallbackPublicSilentPrayerJoin.presence);
    vi.advanceTimersByTime(1000);

    expect(onJoined).toHaveBeenCalledWith(fallbackPublicSilentPrayerJoin);
    expect(onPresence).toHaveBeenCalledWith(fallbackPublicSilentPrayerJoin.presence);
    expect(socket.emitted).toContainEqual({
      event: "silent-prayer:heartbeat",
      payload: {
        eventId: fallbackPublicSilentPrayerJoin.session.id
      }
    });

    session.leave();
    expect(socket.emitted.at(-1)).toEqual({
      event: "silent-prayer:leave",
      payload: {
        eventId: fallbackPublicSilentPrayerJoin.session.id
      }
    });
    expect(socket.disconnected).toBe(true);
  });

  it("joins brother sessions with auth handshake and reconnect join replay", () => {
    const socket = new FakeSilentPrayerSocket();
    const socketFactory = vi.fn(() => socket) satisfies SilentPrayerSocketFactory;
    const session = startBrotherSilentPrayerRealtime({
      baseUrl: "https://api.example.test",
      eventId: fallbackBrotherSilentPrayerJoin.session.id,
      authToken: "token",
      socketFactory
    });

    socket.trigger(SILENT_PRAYER_SOCKET_EVENTS.connect);
    socket.trigger(SILENT_PRAYER_SOCKET_EVENTS.connect);

    expect(socketFactory).toHaveBeenCalledWith("https://api.example.test/silent-prayer", {
      auth: {
        token: "token"
      },
      autoConnect: false,
      transports: ["websocket"]
    });
    expect(socket.emitted).toEqual([
      {
        event: "silent-prayer:brother:join",
        payload: {
          eventId: fallbackBrotherSilentPrayerJoin.session.id
        }
      },
      {
        event: "silent-prayer:brother:join",
        payload: {
          eventId: fallbackBrotherSilentPrayerJoin.session.id
        }
      }
    ]);

    session.disconnect();
    expect(socket.disconnected).toBe(true);
    expect(socket.emitted.some((entry) => entry.event === "silent-prayer:leave")).toBe(false);
  });

  it("maps socket errors and invalid payloads without exposing identity fields", () => {
    const socket = new FakeSilentPrayerSocket();
    const onError = vi.fn();

    startBrotherSilentPrayerRealtime({
      baseUrl: "https://api.example.test",
      eventId: fallbackBrotherSilentPrayerJoin.session.id,
      authToken: "token",
      socketFactory: () => socket,
      onError
    });

    socket.trigger(SILENT_PRAYER_SOCKET_EVENTS.error, {
      code: "FORBIDDEN",
      message: "Authentication is required.",
      userId: "should-not-surface"
    });
    socket.trigger(SILENT_PRAYER_SOCKET_EVENTS.presence, {
      eventId: "not-a-uuid",
      activeCount: -1
    });

    expect(onError).toHaveBeenNthCalledWith(1, {
      code: "FORBIDDEN",
      message: "Authentication is required."
    });
    expect(JSON.stringify(onError.mock.calls)).not.toContain("should-not-surface");
    expect(onError).toHaveBeenNthCalledWith(2, {
      code: "INTERNAL_ERROR",
      message: "Invalid silent-prayer presence payload."
    });
  });
});

class FakeSilentPrayerSocket implements SilentPrayerSocketTransport {
  readonly emitted: Array<{ event: string; payload: unknown }> = [];
  readonly handlers = new Map<string, Set<(payload: unknown) => void>>();
  connected = false;
  disconnected = false;

  connect(): void {
    this.connected = true;
  }

  disconnect(): void {
    this.disconnected = true;
  }

  emit(event: string, payload: unknown): void {
    this.emitted.push({ event, payload });
  }

  on(event: string, handler: (payload: unknown) => void): void {
    const handlers = this.handlers.get(event) ?? new Set();
    handlers.add(handler);
    this.handlers.set(event, handlers);
  }

  off(event: string, handler: (payload: unknown) => void): void {
    this.handlers.get(event)?.delete(handler);
  }

  trigger(event: string, payload?: unknown): void {
    for (const handler of this.handlers.get(event) ?? []) {
      handler(payload);
    }
  }
}
