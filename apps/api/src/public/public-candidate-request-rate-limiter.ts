import { Injectable } from "@nestjs/common";

const DEFAULT_WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 5;

export abstract class PublicCandidateRequestRateLimiter {
  abstract consume(key: string, now?: Date): boolean;
}

@Injectable()
export class InMemoryPublicCandidateRequestRateLimiter extends PublicCandidateRequestRateLimiter {
  private readonly attemptsByKey = new Map<string, RateLimitBucket>();
  private readonly windowMs = DEFAULT_WINDOW_MS;
  private readonly maxAttempts = DEFAULT_MAX_ATTEMPTS;

  consume(key: string, now = new Date()): boolean {
    const nowMs = now.getTime();
    const current = this.attemptsByKey.get(key);

    if (!current || current.resetAtMs <= nowMs) {
      this.attemptsByKey.set(key, {
        count: 1,
        resetAtMs: nowMs + this.windowMs
      });

      return true;
    }

    if (current.count >= this.maxAttempts) {
      return false;
    }

    current.count += 1;
    return true;
  }
}

interface RateLimitBucket {
  count: number;
  resetAtMs: number;
}
