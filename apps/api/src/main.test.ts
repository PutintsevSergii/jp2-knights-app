import { describe, expect, it } from "vitest";
import { buildOpenApiConfig } from "./main.js";

describe("API bootstrap", () => {
  it("defines the V1 OpenAPI document metadata", () => {
    expect(buildOpenApiConfig().info).toMatchObject({
      title: "JP2 Knights API",
      version: "0.1.0"
    });
  });
});
