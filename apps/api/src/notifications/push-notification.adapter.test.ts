import { describe, expect, it } from "vitest";
import { NoopPushNotificationAdapter } from "./push-notification.adapter.js";

describe("NoopPushNotificationAdapter", () => {
  it("reports attempted token count without dispatching to a provider", async () => {
    await expect(
      new NoopPushNotificationAdapter().dispatch({
        tokenIds: ["token_1", "token_2"],
        category: "announcements",
        title: "New announcement",
        body: "Open the app for details.",
        deepLinkPath: "/announcements/55555555-5555-4555-8555-555555555555",
        recordId: "55555555-5555-4555-8555-555555555555"
      })
    ).resolves.toEqual({
      attempted: 2,
      accepted: 0,
      failed: 0
    });
  });
});
