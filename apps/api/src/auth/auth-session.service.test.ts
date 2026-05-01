import { describe, expect, it } from "vitest";
import { AuthSessionService } from "./auth-session.service.js";

describe("AuthSessionService", () => {
  it("resolves the principal already attached to the request abstraction", async () => {
    const principal = {
      id: "user_1",
      email: "brother@example.test",
      displayName: "Demo Brother",
      status: "active" as const,
      roles: ["BROTHER" as const]
    };

    await expect(new AuthSessionService().resolveCurrentUser({ principal })).resolves.toBe(
      principal
    );
  });

  it("returns null when no session provider has attached a principal", async () => {
    await expect(new AuthSessionService().resolveCurrentUser({})).resolves.toBeNull();
  });
});
