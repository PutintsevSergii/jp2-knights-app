import { describe, expect, it, vi } from "vitest";
import { PrismaService } from "./prisma.service.js";

describe("PrismaService", () => {
  it("disconnects the Prisma client during module shutdown", async () => {
    const service = new PrismaService();
    const disconnect = vi.spyOn(service, "$disconnect").mockResolvedValue(undefined);

    await expect(service.onModuleDestroy()).resolves.toBeUndefined();

    expect(disconnect).toHaveBeenCalledOnce();
  });
});
