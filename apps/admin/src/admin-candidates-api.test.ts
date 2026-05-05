import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminCandidateProfiles } from "./admin-content-fixtures.js";
import {
  fetchAdminCandidateProfile,
  fetchAdminCandidateProfiles,
  updateAdminCandidateProfile
} from "./admin-candidates-api.js";

const candidateProfile = fallbackAdminCandidateProfiles[0]!;

describe("admin candidate API client", () => {
  it("fetches and validates list and detail responses", async () => {
    const listFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ candidateProfiles: [candidateProfile] })
      })
    );
    const detailFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ candidateProfile })
      })
    );

    await expect(
      fetchAdminCandidateProfiles({
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: listFetch
      })
    ).resolves.toEqual({ candidateProfiles: [candidateProfile] });
    await expect(
      fetchAdminCandidateProfile(candidateProfile.id, {
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: detailFetch
      })
    ).resolves.toEqual({ candidateProfile });
  });

  it("sends profile updates as JSON and maps non-OK responses", async () => {
    const updateFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ candidateProfile: { ...candidateProfile, status: "paused" } })
      })
    );
    const forbiddenFetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve({}) })
    );

    await expect(
      updateAdminCandidateProfile(
        candidateProfile.id,
        { status: "paused" },
        { baseUrl: "https://api.example.test", fetchImpl: updateFetch }
      )
    ).resolves.toMatchObject({ candidateProfile: { status: "paused" } });
    await expect(fetchAdminCandidateProfiles({ fetchImpl: forbiddenFetch })).rejects.toBeInstanceOf(
      AdminContentHttpError
    );
    expect(updateFetch).toHaveBeenCalledWith(
      `https://api.example.test/admin/candidates/${candidateProfile.id}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "paused" })
      }
    );
  });
});
