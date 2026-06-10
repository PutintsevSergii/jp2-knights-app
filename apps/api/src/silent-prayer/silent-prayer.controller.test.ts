import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import {
  BrotherSilentPrayerController,
  PublicSilentPrayerController
} from "./silent-prayer.controller.js";
import type { SilentPrayerService } from "./silent-prayer.service.js";
import type { SilentPrayerPresenceActionResponse } from "./silent-prayer.types.js";

const eventId = "11111111-1111-4111-8111-111111111111";
const otherEventId = "22222222-2222-4222-8222-222222222222";

const principal: CurrentUserPrincipal = {
  id: "33333333-3333-4333-8333-333333333333",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"],
  memberOrganizationUnitIds: ["44444444-4444-4444-8444-444444444444"]
};

describe("PublicSilentPrayerController", () => {
  it("delegates public heartbeat and leave without exposing participant identifiers", async () => {
    const service = new FakeSilentPrayerService();
    const controller = new PublicSilentPrayerController(service as unknown as SilentPrayerService);

    await expect(
      controller.heartbeatPublicSession(eventId, {
        eventId,
        anonymousSessionId: "guest-session-1"
      })
    ).resolves.toEqual(presenceResponse(2));
    await expect(
      controller.leavePublicSession(eventId, {
        anonymousSessionId: "guest-session-1"
      })
    ).resolves.toEqual(presenceResponse(1));

    expect(service.calls).toEqual([
      "public-heartbeat:11111111-1111-4111-8111-111111111111:guest-session-1",
      "public-leave:11111111-1111-4111-8111-111111111111:guest-session-1"
    ]);
    expect(JSON.stringify(service.responses)).not.toContain("guest-session-1");
    expect(JSON.stringify(service.responses)).not.toContain("socketRoom");
  });

  it("rejects public heartbeat and leave when route and body event ids differ", () => {
    const service = new FakeSilentPrayerService();
    const controller = new PublicSilentPrayerController(service as unknown as SilentPrayerService);

    expect(() =>
      controller.heartbeatPublicSession(eventId, {
        eventId: otherEventId,
        anonymousSessionId: "guest-session-1"
      })
    ).toThrow(BadRequestException);
    expect(() =>
      controller.leavePublicSession(eventId, {
        eventId: otherEventId,
        anonymousSessionId: "guest-session-1"
      })
    ).toThrow(BadRequestException);
    expect(service.calls).toEqual([]);
  });
});

describe("BrotherSilentPrayerController", () => {
  it("delegates brother heartbeat and leave through the guard-attached principal", async () => {
    const service = new FakeSilentPrayerService();
    const controller = new BrotherSilentPrayerController(service as unknown as SilentPrayerService);

    await expect(
      controller.heartbeatBrotherSession({ principal }, eventId, { eventId })
    ).resolves.toEqual(presenceResponse(2));
    await expect(controller.leaveBrotherSession({ principal }, eventId, {})).resolves.toEqual(
      presenceResponse(1)
    );

    expect(service.calls).toEqual([
      "brother-heartbeat:33333333-3333-4333-8333-333333333333:11111111-1111-4111-8111-111111111111",
      "brother-leave:33333333-3333-4333-8333-333333333333:11111111-1111-4111-8111-111111111111"
    ]);
    expect(JSON.stringify(service.responses)).not.toContain(principal.id);
    expect(JSON.stringify(service.responses)).not.toContain("socketRoom");
  });

  it("rejects brother heartbeat and leave when route and body event ids differ", () => {
    const service = new FakeSilentPrayerService();
    const controller = new BrotherSilentPrayerController(service as unknown as SilentPrayerService);

    expect(() =>
      controller.heartbeatBrotherSession({ principal }, eventId, { eventId: otherEventId })
    ).toThrow(BadRequestException);
    expect(() =>
      controller.leaveBrotherSession({ principal }, eventId, { eventId: otherEventId })
    ).toThrow(BadRequestException);
    expect(service.calls).toEqual([]);
  });
});

class FakeSilentPrayerService {
  readonly calls: string[] = [];
  readonly responses: SilentPrayerPresenceActionResponse[] = [];

  heartbeatPublicSession(id: string, anonymousSessionId: string) {
    this.calls.push(`public-heartbeat:${id}:${anonymousSessionId}`);
    return Promise.resolve(this.rememberResponse(2));
  }

  leavePublicSession(id: string, anonymousSessionId: string) {
    this.calls.push(`public-leave:${id}:${anonymousSessionId}`);
    return Promise.resolve(this.rememberResponse(1));
  }

  heartbeatBrotherSession(receivedPrincipal: CurrentUserPrincipal, id: string) {
    this.calls.push(`brother-heartbeat:${receivedPrincipal.id}:${id}`);
    return Promise.resolve(this.rememberResponse(2));
  }

  leaveBrotherSession(receivedPrincipal: CurrentUserPrincipal, id: string) {
    this.calls.push(`brother-leave:${receivedPrincipal.id}:${id}`);
    return Promise.resolve(this.rememberResponse(1));
  }

  private rememberResponse(activeCount: number): SilentPrayerPresenceActionResponse {
    const response = presenceResponse(activeCount);
    this.responses.push(response);
    return response;
  }
}

function presenceResponse(activeCount: number): SilentPrayerPresenceActionResponse {
  return {
    presence: {
      activeCount,
      expiresAt: "2026-05-25T12:00:45.000Z"
    }
  };
}
