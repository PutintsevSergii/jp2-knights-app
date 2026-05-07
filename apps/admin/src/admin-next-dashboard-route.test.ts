import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fallbackAdminAnnouncements,
  fallbackAdminCandidateProfiles,
  fallbackAdminCandidateRequestDetails,
  fallbackAdminDashboard,
  fallbackAdminEvents,
  fallbackAdminIdentityAccessReviews,
  fallbackAdminOrganizationUnits,
  fallbackAdminPrayers
} from "./admin-content-fixtures.js";
import { GET as getCandidateRequestDetail } from "./app/admin/candidate-requests/[id]/route.js";
import { GET as getCandidateRequests } from "./app/admin/candidate-requests/route.js";
import { GET as getCandidateDetail } from "./app/admin/candidates/[id]/route.js";
import { GET as getCandidates } from "./app/admin/candidates/route.js";
import { GET as getEvents } from "./app/admin/events/route.js";
import { GET as getAnnouncements } from "./app/admin/announcements/route.js";
import { GET as getAnnouncementDetail } from "./app/admin/announcements/[id]/route.js";
import { GET as getAnnouncementNew } from "./app/admin/announcements/new/route.js";
import { GET as getOrganizationUnitDetail } from "./app/admin/organization-units/[id]/route.js";
import { GET as getOrganizationUnitNew } from "./app/admin/organization-units/new/route.js";
import { GET as getOrganizationUnits } from "./app/admin/organization-units/route.js";
import { GET as getAdminRoot } from "./app/admin/route.js";
import { GET as getAdminDashboard } from "./app/admin/dashboard/route.js";
import { GET as getIdentityAccessReviews } from "./app/admin/identity-access-reviews/route.js";
import { GET as getPrayers } from "./app/admin/prayers/route.js";

describe("Next admin dashboard route scaffold", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("mounts /admin/dashboard in demo mode without backend calls", async () => {
    const fetchImpl = vi.fn();
    vi.stubEnv("APP_RUNTIME_MODE", "demo");
    vi.stubGlobal("fetch", fetchImpl);

    const response = await getAdminDashboard(
      new Request("https://admin.example.test/admin/dashboard")
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(body).toContain("JP2 Admin Lite");
    expect(body).toContain('data-runtime-mode="demo"');
    expect(body).toContain("Sign-In Reviews");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("reuses the current dashboard API client and bearer forwarding in API mode", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminDashboard)
      })
    );
    vi.stubEnv("APP_RUNTIME_MODE", "api");
    vi.stubEnv("API_BASE_URL", "https://api.example.test");
    vi.stubGlobal("fetch", fetchImpl);

    const response = await getAdminDashboard(
      new Request("https://admin.example.test/admin/dashboard", {
        headers: {
          authorization: "Bearer token_1"
        }
      })
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("Scoped V1 operations overview.");
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/dashboard", {
      method: "GET",
      headers: { authorization: "Bearer token_1" }
    });
  });

  it("forwards session cookies through Next route handlers in API mode", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminDashboard)
      })
    );
    vi.stubEnv("APP_RUNTIME_MODE", "api");
    vi.stubEnv("API_BASE_URL", "https://api.example.test");
    vi.stubGlobal("fetch", fetchImpl);

    const response = await getAdminDashboard(
      new Request("https://admin.example.test/admin/dashboard", {
        headers: {
          cookie: "jp2_session=session_1"
        }
      })
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("Scoped V1 operations overview.");
    expect(fetchImpl).toHaveBeenCalledWith("https://api.example.test/admin/dashboard", {
      method: "GET",
      headers: { cookie: "jp2_session=session_1" }
    });
  });

  it("mounts /admin through the same dashboard shell", async () => {
    const fetchImpl = vi.fn();
    vi.stubEnv("APP_RUNTIME_MODE", "demo");
    vi.stubGlobal("fetch", fetchImpl);

    const response = await getAdminRoot(new Request("https://admin.example.test/admin"));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("JP2 Admin Lite");
    expect(body).toContain('href="/admin/dashboard" aria-current="page"');
    expect(body).toContain('data-runtime-mode="demo"');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("mounts identity access reviews through the existing API client", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallbackAdminIdentityAccessReviews)
      })
    );
    vi.stubEnv("APP_RUNTIME_MODE", "api");
    vi.stubEnv("API_BASE_URL", "https://api.example.test");
    vi.stubEnv("ADMIN_CAN_WRITE", "true");
    vi.stubGlobal("fetch", fetchImpl);

    const response = await getIdentityAccessReviews(
      new Request("https://admin.example.test/admin/identity-access-reviews", {
        headers: {
          authorization: "Bearer token_2"
        }
      })
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("Piotr Kowalski");
    expect(body).toContain('href="/admin/identity-access-reviews" aria-current="page"');
    expect(body).toContain('data-action="confirm"');
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/admin/identity-access-reviews",
      {
        method: "GET",
        headers: { authorization: "Bearer token_2" }
      }
    );
  });

  it("mounts all remaining list routes through the Next scaffold in demo mode", async () => {
    const fetchImpl = vi.fn();
    vi.stubEnv("APP_RUNTIME_MODE", "demo");
    vi.stubEnv("ADMIN_CAN_WRITE", "true");
    vi.stubGlobal("fetch", fetchImpl);

    const cases: Array<{
      label: string;
      get: (request: Request) => Promise<Response>;
      path: string;
      expected: string;
    }> = [
      {
        label: "candidate requests",
        get: getCandidateRequests,
        path: "/admin/candidate-requests",
        expected: fallbackAdminCandidateRequestDetails[0]!.firstName
      },
      {
        label: "candidates",
        get: getCandidates,
        path: "/admin/candidates",
        expected: fallbackAdminCandidateProfiles[0]!.displayName
      },
      {
        label: "organization units",
        get: getOrganizationUnits,
        path: "/admin/organization-units",
        expected: fallbackAdminOrganizationUnits.organizationUnits[0]!.name
      },
      {
        label: "prayers",
        get: getPrayers,
        path: "/admin/prayers",
        expected: fallbackAdminPrayers.prayers[0]!.title
      },
      {
        label: "events",
        get: getEvents,
        path: "/admin/events",
        expected: fallbackAdminEvents.events[0]!.title
      },
      {
        label: "announcements",
        get: getAnnouncements,
        path: "/admin/announcements",
        expected: fallbackAdminAnnouncements.announcements[0]!.title
      }
    ];

    for (const route of cases) {
      const response = await route.get(new Request(`https://admin.example.test${route.path}`));
      const body = await response.text();

      expect(response.status, route.label).toBe(200);
      expect(body, route.label).toContain("JP2 Admin Lite");
      expect(body, route.label).toContain(`href="${route.path}" aria-current="page"`);
      expect(body, route.label).toContain(route.expected);
    }

    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("mounts dynamic detail and form routes through the Next scaffold in demo mode", async () => {
    const fetchImpl = vi.fn();
    const candidateRequest = fallbackAdminCandidateRequestDetails[0]!;
    const candidateProfile = fallbackAdminCandidateProfiles[0]!;
    const organizationUnit = fallbackAdminOrganizationUnits.organizationUnits[0]!;
    vi.stubEnv("APP_RUNTIME_MODE", "demo");
    vi.stubEnv("ADMIN_CAN_WRITE", "true");
    vi.stubGlobal("fetch", fetchImpl);

    const requestDetail = await getCandidateRequestDetail(
      new Request(`https://admin.example.test/admin/candidate-requests/${candidateRequest.id}`),
      { params: Promise.resolve({ id: candidateRequest.id }) }
    );
    const requestBody = await requestDetail.text();
    expect(requestDetail.status).toBe(200);
    expect(requestBody).toContain("Save Follow-up");
    expect(requestBody).toContain(candidateRequest.firstName);

    const candidateDetail = await getCandidateDetail(
      new Request(`https://admin.example.test/admin/candidates/${candidateProfile.id}`),
      { params: Promise.resolve({ id: candidateProfile.id }) }
    );
    const candidateBody = await candidateDetail.text();
    expect(candidateDetail.status).toBe(200);
    expect(candidateBody).toContain("Save Candidate");
    expect(candidateBody).toContain(candidateProfile.displayName);

    const createOrganizationUnit = await getOrganizationUnitNew(
      new Request("https://admin.example.test/admin/organization-units/new")
    );
    const createOrganizationUnitBody = await createOrganizationUnit.text();
    expect(createOrganizationUnit.status).toBe(200);
    expect(createOrganizationUnitBody).toContain("Create Organization Unit");

    const organizationUnitDetail = await getOrganizationUnitDetail(
      new Request(`https://admin.example.test/admin/organization-units/${organizationUnit.id}`),
      { params: Promise.resolve({ id: organizationUnit.id }) }
    );
    const organizationUnitBody = await organizationUnitDetail.text();
    expect(organizationUnitDetail.status).toBe(200);
    expect(organizationUnitBody).toContain(`Organization Unit: ${organizationUnit.name}`);

    const createAnnouncement = await getAnnouncementNew(
      new Request("https://admin.example.test/admin/announcements/new")
    );
    const createAnnouncementBody = await createAnnouncement.text();
    expect(createAnnouncement.status).toBe(200);
    expect(createAnnouncementBody).toContain("Create Announcement");

    const announcement = fallbackAdminAnnouncements.announcements[0]!;
    const announcementDetail = await getAnnouncementDetail(
      new Request(`https://admin.example.test/admin/announcements/${announcement.id}`),
      { params: Promise.resolve({ id: announcement.id }) }
    );
    const announcementBody = await announcementDetail.text();
    expect(announcementDetail.status).toBe(200);
    expect(announcementBody).toContain(`Announcement: ${announcement.title}`);

    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
