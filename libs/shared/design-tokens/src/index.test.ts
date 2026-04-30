import { describe, expect, it } from "vitest";
import { designTokens } from "./index.js";

describe("design tokens", () => {
  it("centralizes the primary action color", () => {
    expect(designTokens.color.action.primary).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
