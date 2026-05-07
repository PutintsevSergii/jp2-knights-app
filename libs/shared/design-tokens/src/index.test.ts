import { describe, expect, it } from "vitest";
import { designTokens } from "./index.js";

describe("design tokens", () => {
  it("centralizes the primary action color", () => {
    expect(designTokens.color.action.primary).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("centralizes documented mobile typography roles", () => {
    expect(designTokens.typography.size.screenTitle).toBe(28);
    expect(designTokens.typography.size.sectionTitle).toBe(20);
    expect(designTokens.typography.size.body).toBe(16);
    expect(designTokens.typography.weight.medium).toBe("500");
  });
});
