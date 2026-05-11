import { describe, expect, it } from "vitest";
import { designTokens } from "./index.js";

describe("design tokens", () => {
  it("centralizes the primary action color", () => {
    expect(designTokens.color.action.primary).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("centralizes documented mobile typography roles", () => {
    expect(designTokens.typography.fontFamily.mobile).toBe("Work Sans");
    expect(designTokens.typography.size.display).toBe(48);
    expect(designTokens.typography.size.screenTitle).toBe(32);
    expect(designTokens.typography.size.sectionTitle).toBe(24);
    expect(designTokens.typography.size.body).toBe(16);
    expect(designTokens.typography.weight.semibold).toBe("600");
    expect(designTokens.typography.weight.medium).toBe("500");
    expect(Object.values(designTokens.typography.letterSpacing)).toEqual([0, 0, 0, 0]);
  });

  it("centralizes the extracted Figma Gold/Grey palette", () => {
    expect(designTokens.color.background.app).toBe("#FBF8FF");
    expect(designTokens.color.brand.gold).toBe("#FECC00");
    expect(designTokens.color.brand.goldDark).toBe("#745C00");
    expect(designTokens.color.text.primary).toBe("#1A1B22");
    expect(designTokens.color.border.chrome).toBe("#E3E1EC");
  });
});
