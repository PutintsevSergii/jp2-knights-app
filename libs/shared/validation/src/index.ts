import { z } from "zod";
import { RUNTIME_MODES, VISIBILITIES } from "@jp2/shared-types";

export const runtimeModeSchema = z.enum(RUNTIME_MODES);
export const visibilitySchema = z.enum(VISIBILITIES);

export const healthStatusSchema = z.object({
  app: z.enum(["api", "admin", "mobile"]),
  runtimeMode: runtimeModeSchema,
  status: z.literal("ok")
});

export function parseRuntimeMode(value: string | undefined) {
  return runtimeModeSchema.parse(value ?? "api");
}
