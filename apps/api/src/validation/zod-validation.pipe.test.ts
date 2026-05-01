import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ZodValidationPipe } from "./zod-validation.pipe.js";

describe("ZodValidationPipe", () => {
  it("returns parsed and transformed values from the shared schema", () => {
    const pipe = new ZodValidationPipe(z.object({ name: z.string().trim().min(1) }));

    expect(pipe.transform({ name: " Demo " })).toEqual({ name: "Demo" });
  });

  it("maps schema failures to Nest bad request errors", () => {
    const pipe = new ZodValidationPipe(z.object({ name: z.string().min(1) }));

    expect(() => pipe.transform({ name: "" })).toThrow(BadRequestException);
  });
});
