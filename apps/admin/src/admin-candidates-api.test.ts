import { describe, expect, it, vi } from "vitest";
import { AdminContentHttpError } from "./admin-content-api.js";
import { fallbackAdminCandidateProfiles } from "./admin-content-fixtures.js";
import {
  convertAdminCandidateProfileToBrother,
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
            providerAccounts: [
              {
                id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                provider: "firebase",
                providerSubject: "firebase-subject-1",
                email: "anna@example.test",
                emailVerified: true,
                phone: "+37120000000",
                displayName: "Anna Provider",
                photoUrl: "https://example.test/photo.png",
                lastSignInAt: "2026-05-25T07:00:00.000Z",
                createdAt: "2026-05-01T07:00:00.000Z",
                updatedAt: "2026-05-25T07:00:00.000Z",
                revokedAt: null
              }
            ],
            deviceTokens: [
              {
                id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
                platform: "ios",
                lastSeenAt: "2026-05-26T07:00:00.000Z",
                createdAt: "2026-05-02T07:00:00.000Z",
                updatedAt: "2026-05-26T07:00:00.000Z",
                revokedAt: null
              }
            ],
            userRoles: [
              {
                id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
                role: "CANDIDATE",
                createdBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
                createdAt: "2026-05-03T07:00:00.000Z",
                revokedAt: null
              }
            ],
            identityAccessReviews: [
              {
                id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
                providerAccountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                status: "confirmed",
                scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
                requestedRole: "CANDIDATE",
                assignedRole: "CANDIDATE",
                expiresAt: "2026-06-02T07:00:00.000Z",
                decidedBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
                decidedAt: "2026-05-04T07:00:00.000Z",
                decisionNote: "Approved for candidate onboarding.",
                createdAt: "2026-05-03T07:00:00.000Z",
                updatedAt: "2026-05-04T07:00:00.000Z"
              }
            ],
            memberships: [
              {
                id: "99999999-9999-4999-8999-999999999999",
                organizationUnitId: "11111111-1111-4111-8111-111111111111",
                status: "active",
                currentDegree: "First Degree",
                joinedAt: "2026-05-05",
                createdAt: "2026-05-05T07:00:00.000Z",
                updatedAt: "2026-05-06T07:00:00.000Z",
                archivedAt: null
              }
            ],
            officerAssignments: [
              {
                id: "12121212-1212-4121-8121-121212121212",
                organizationUnitId: "11111111-1111-4111-8111-111111111111",
                title: "Secretary",
                startsAt: "2026-05-01",
                endsAt: null,
                createdBy: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
                createdAt: "2026-04-30T07:00:00.000Z"
              }
            ],
            roadmapAssignments: [
              {
                id: "56565656-5656-4565-8565-565656565656",
                roadmapDefinitionId: "78787878-7878-4787-8787-787878787878",
                roadmapTargetRole: "CANDIDATE",
                roadmapStatus: "PUBLISHED",
                organizationUnitId: "11111111-1111-4111-8111-111111111111",
                status: "active",
                assignedByUserId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
                assignedAt: "2026-05-07T07:00:00.000Z",
                completedAt: null,
                submissionCount: 2,
                pendingSubmissionCount: 1,
                createdAt: "2026-05-07T07:00:00.000Z",
                updatedAt: "2026-05-08T07:00:00.000Z",
                archivedAt: null
              }
            ],
            eventParticipations: [
              {
                id: "67676767-6767-4676-8676-676767676767",
                eventId: "89898989-8989-4898-8989-898989898989",
                eventTitle: "Candidate Formation Evening",
                eventType: "formation",
                eventVisibility: "CANDIDATE",
                eventStatus: "published",
                eventTargetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
                eventStartAt: "2026-05-20T17:00:00.000Z",
                eventEndAt: "2026-05-20T19:00:00.000Z",
                intentStatus: "planning_to_attend",
                createdAt: "2026-05-09T07:00:00.000Z",
                updatedAt: "2026-05-10T07:00:00.000Z",
                cancelledAt: null
              }
            ],
            notificationPreferences: {
              events: false,
              announcements: true,
              roadmapUpdates: true,
              prayerReminders: false
            },
            retentionBucket: "sensitive_review",
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
            retentionBucket: "sensitive_review",
            erasedAt: "2026-06-01T17:05:00.000Z",
            archivedAt: "2026-06-01T17:05:00.000Z"
          })
      })
    );
    const convertFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            candidateProfile: {
              ...candidateProfile,
              status: "converted_to_brother"
            },
            membership: {
              id: "34343434-3434-4343-8343-343434343434",
              userId: candidateProfile.userId,
              organizationUnitId: candidateProfile.assignedOrganizationUnitId,
              status: "active",
              currentDegree: null,
              joinedAt: "2026-06-11",
              createdAt: "2026-06-11T07:00:00.000Z",
              updatedAt: "2026-06-11T07:00:00.000Z",
              archivedAt: null
            }
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
      providerAccounts: [{ provider: "firebase", providerSubject: "firebase-subject-1" }],
      deviceTokens: [{ platform: "ios", id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }],
      userRoles: [{ role: "CANDIDATE" }],
      identityAccessReviews: [{ status: "confirmed" }],
      memberships: [{ status: "active" }],
      officerAssignments: [{ title: "Secretary" }],
      roadmapAssignments: [{ roadmapTargetRole: "CANDIDATE", submissionCount: 2 }],
      eventParticipations: [{ eventType: "formation", intentStatus: "planning_to_attend" }],
      notificationPreferences: {
        events: false,
        announcements: true,
        roadmapUpdates: true,
        prayerReminders: false
      },
      retentionBucket: "sensitive_review",
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
      retentionBucket: "sensitive_review",
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
    await expect(
      convertAdminCandidateProfileToBrother(
        candidateProfile.id,
        { joinedAt: "2026-06-11" },
        {
          baseUrl: "https://api.example.test",
          authToken: "token_1",
          fetchImpl: convertFetch
        }
      )
    ).resolves.toMatchObject({
      candidateProfile: { status: "converted_to_brother" },
      membership: { status: "active", joinedAt: "2026-06-11" }
    });
    expect(convertFetch).toHaveBeenCalledWith(
      `https://api.example.test/admin/candidates/${candidateProfile.id}/convert-to-brother`,
      {
        method: "POST",
        headers: {
          authorization: "Bearer token_1",
          "content-type": "application/json"
        },
        body: JSON.stringify({ joinedAt: "2026-06-11" })
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
