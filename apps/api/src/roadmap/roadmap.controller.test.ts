import { describe, expect, it, vi } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { RoadmapController } from "./roadmap.controller.js";
import type { RoadmapService } from "./roadmap.service.js";
import type { AssignedRoadmapResponse } from "./roadmap.types.js";

const principal: CurrentUserPrincipal = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "candidate@example.test",
  displayName: "Demo Candidate",
  status: "active",
  roles: ["CANDIDATE"]
};

const response: AssignedRoadmapResponse = {
  roadmap: null
};

describe("RoadmapController", () => {
  it("delegates candidate and brother roadmap reads using the guard-attached principal", async () => {
    const getCandidateRoadmap = vi.fn(() => Promise.resolve(response));
    const getBrotherRoadmap = vi.fn(() => Promise.resolve(response));
    const controller = new RoadmapController({
      getCandidateRoadmap,
      getBrotherRoadmap
    } as unknown as RoadmapService);

    await expect(controller.getCandidateRoadmap({ principal })).resolves.toBe(response);
    await expect(controller.getBrotherRoadmap({ principal })).resolves.toBe(response);
    expect(getCandidateRoadmap).toHaveBeenCalledWith(principal);
    expect(getBrotherRoadmap).toHaveBeenCalledWith(principal);
  });

  it("fails closed if the guard did not attach a principal", () => {
    const controller = new RoadmapController({
      getCandidateRoadmap: vi.fn(),
      getBrotherRoadmap: vi.fn()
    } as unknown as RoadmapService);

    expect(() => controller.getCandidateRoadmap({})).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
    expect(() => controller.getBrotherRoadmap({})).toThrow(
      "CurrentUserGuard did not attach a principal."
    );
  });
});
