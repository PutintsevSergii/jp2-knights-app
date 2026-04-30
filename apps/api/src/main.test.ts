import { describe, expect, it } from "vitest";
import { getApiHealth } from "./main.js";

describe("api shell", () => {
  it("starts in api mode by default", () => {
    expect(getApiHealth().runtimeMode).toBe("api");
  });
});
