import { describe, expect, it } from "vitest";
import { designTokens } from "./index.js";

describe("design tokens", () => {
  it("centralizes the primary action color", () => {
    expect(designTokens.color.action.primary).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("centralizes documented mobile typography roles", () => {
    expect(designTokens.typography.fontFamily.mobile).toBe("Inter");
    expect(designTokens.typography.size.display).toBe(48);
    expect(designTokens.typography.size.screenTitle).toBe(32);
    expect(designTokens.typography.size.sectionTitle).toBe(24);
    expect(designTokens.typography.size.body).toBe(16);
    expect(designTokens.typography.weight.semibold).toBe("600");
    expect(designTokens.typography.weight.medium).toBe("500");
    expect(Object.values(designTokens.typography.letterSpacing)).toEqual([0, 0, 0, 0]);
  });

  it("centralizes the extracted Stitch Ecclesia palette", () => {
    expect(designTokens.color.background.app).toBe("#FEF9EF");
    expect(designTokens.color.brand.gold).toBe("#D6A21E");
    expect(designTokens.color.brand.goldDark).toBe("#795900");
    expect(designTokens.color.text.primary).toBe("#1D1C16");
    expect(designTokens.color.border.chrome).toBe("#E7E2D8");
  });
});
