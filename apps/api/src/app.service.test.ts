import { describe, expect, it } from "vitest";
import { AppService } from "./app.service.js";

describe("AppService", () => {
  it("rejects demo mode for production API runtime", () => {
    expect(() => new AppService().getHealth("demo", "production")).toThrow(
      "Demo runtime mode is not allowed in production."
    );
  });

  it("allows explicit demo mode outside production", () => {
    expect(new AppService().getHealth("demo", "development")).toEqual({
      app: "api",
      runtimeMode: "demo",
      status: "ok"
    });
  });
});
