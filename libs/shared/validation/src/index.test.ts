import { describe, expect, it } from "vitest";
import { contentStatusSchema, parseRuntimeMode, roleSchema, visibilitySchema } from "./index.js";

describe("shared validation", () => {
  it("defaults runtime mode to api", () => {
    expect(parseRuntimeMode(undefined)).toBe("api");
  });

  it("validates visibility values from the shared contract", () => {
    expect(visibilitySchema.parse("BROTHER")).toBe("BROTHER");
  });

  it("validates role values from the shared contract", () => {
    expect(roleSchema.parse("OFFICER")).toBe("OFFICER");
  });

  it("validates content status values from the shared contract", () => {
    expect(contentStatusSchema.parse("PUBLISHED")).toBe("PUBLISHED");
  });
});
