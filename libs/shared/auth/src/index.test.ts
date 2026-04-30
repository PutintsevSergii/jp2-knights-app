import { describe, expect, it } from "vitest";
import { assertActive, hasRole } from "./index.js";

describe("shared auth helpers", () => {
  it("detects assigned roles", () => {
    expect(
      hasRole({ id: "user_1", roles: ["BROTHER"], status: "active" }, "BROTHER")
    ).toBe(true);
  });

  it("blocks inactive principals", () => {
    expect(() =>
      assertActive({ id: "user_1", roles: ["BROTHER"], status: "inactive" })
    ).toThrow("Inactive principals");
  });

  it("allows active principals", () => {
    expect(() =>
      assertActive({ id: "user_1", roles: ["BROTHER"], status: "active" })
    ).not.toThrow();
  });
});
