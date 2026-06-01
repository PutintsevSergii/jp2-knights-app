import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminCandidateProfiles } from "./admin-content-fixtures.js";
import {
  eraseAdminCandidateProfile,
  exportAdminCandidateProfile,
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
    const exportFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            candidateProfile: {
              ...candidateProfile,
              status: "archived",
              archivedAt: "2026-05-30T08:00:00.000Z"
            },
            exportedAt: "2026-06-01T17:00:00.000Z"
          })
      })
    );
    const eraseFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            candidateProfileId: candidateProfile.id,
            userId: candidateProfile.userId,
            erasedAt: "2026-06-01T17:05:00.000Z",
            archivedAt: "2026-06-01T17:05:00.000Z"
          })
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
    await expect(
      exportAdminCandidateProfile(candidateProfile.id, {
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: exportFetch
      })
    ).resolves.toMatchObject({
      candidateProfile: { id: candidateProfile.id, status: "archived" },
      exportedAt: "2026-06-01T17:00:00.000Z"
    });
    expect(exportFetch).toHaveBeenCalledWith(
      `https://api.example.test/admin/candidates/${candidateProfile.id}/export`,
      {
        method: "GET",
        headers: { authorization: "Bearer token_1" }
      }
    );
    await expect(
      eraseAdminCandidateProfile(candidateProfile.id, {
        baseUrl: "https://api.example.test",
        authToken: "token_1",
        fetchImpl: eraseFetch
      })
    ).resolves.toEqual({
      candidateProfileId: candidateProfile.id,
      userId: candidateProfile.userId,
      erasedAt: "2026-06-01T17:05:00.000Z",
      archivedAt: "2026-06-01T17:05:00.000Z"
    });
    expect(eraseFetch).toHaveBeenCalledWith(
      `https://api.example.test/admin/candidates/${candidateProfile.id}/erase`,
      {
        method: "POST",
        headers: { authorization: "Bearer token_1" }
      }
    );
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
