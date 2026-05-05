import { describe, expect, it } from "vitest";
import { InMemoryPublicCandidateRequestRateLimiter } from "./public-candidate-request-rate-limiter.js";

describe("InMemoryPublicCandidateRequestRateLimiter", () => {
  it("limits repeated public writes within a window and keeps keys independent", () => {
    const limiter = new InMemoryPublicCandidateRequestRateLimiter();
    const first = new Date("2026-05-05T12:00:00.000Z");

    expect(limiter.consume("candidate@example.test", first)).toBe(true);
    expect(limiter.consume("candidate@example.test", first)).toBe(true);
    expect(limiter.consume("candidate@example.test", first)).toBe(true);
    expect(limiter.consume("candidate@example.test", first)).toBe(true);
    expect(limiter.consume("candidate@example.test", first)).toBe(true);
    expect(limiter.consume("candidate@example.test", first)).toBe(false);
    expect(limiter.consume("other@example.test", first)).toBe(true);
    expect(limiter.consume("candidate@example.test", new Date("2026-05-05T13:00:00.001Z"))).toBe(
      true
    );
  });
});
