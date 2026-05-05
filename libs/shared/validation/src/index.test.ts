import { describe, expect, it } from "vitest";
import {
  adminDashboardResponseSchema,
  adminCandidateRequestDetailResponseSchema,
  adminCandidateRequestListResponseSchema,
  adminEventDetailResponseSchema,
  adminEventListResponseSchema,
  adminOrganizationUnitListResponseSchema,
  adminPrayerDetailResponseSchema,
  adminPrayerListResponseSchema,
  attachmentStatusSchema,
  contentStatusSchema,
  createAdminEventRequestSchema,
  createAdminPrayerRequestSchema,
  createOrganizationUnitRequestSchema,
  createPublicCandidateRequestSchema,
  membershipStatusSchema,
  myOrganizationUnitsResponseSchema,
  organizationUnitStatusSchema,
  organizationUnitTypeSchema,
  parseRuntimeMode,
  publicContentPageQuerySchema,
  publicContentPageResponseSchema,
  publicContentPageSlugSchema,
  publicCandidateRequestResponseSchema,
  publicEventDetailResponseSchema,
  publicEventListQuerySchema,
  publicEventListResponseSchema,
  publicHomeQuerySchema,
  publicHomeResponseSchema,
  publicPrayerDetailResponseSchema,
  publicPrayerListQuerySchema,
  publicPrayerListResponseSchema,
  roleSchema,
  updateAdminEventRequestSchema,
  updateAdminCandidateRequestSchema,
  updateAdminPrayerRequestSchema,
  updateOrganizationUnitRequestSchema,
  visibilitySchema
} from "./index.js";

describe("shared validation", () => {
  it("defaults runtime mode to api", () => {
    expect(parseRuntimeMode(undefined)).toBe("api");
  });

  it("rejects demo runtime mode in production", () => {
    expect(parseRuntimeMode("demo", { nodeEnv: "development" })).toBe("demo");
    expect(() => parseRuntimeMode("demo", { nodeEnv: "production" })).toThrow(
      "Demo runtime mode is not allowed in production."
    );
  });

  it("validates visibility values from the shared contract", () => {
    expect(visibilitySchema.parse("BROTHER")).toBe("BROTHER");
  });

  it("validates role values from the shared contract", () => {
    expect(roleSchema.parse("OFFICER")).toBe("OFFICER");
  });

  it("validates content status values from the shared contract", () => {
    expect(contentStatusSchema.parse("PUBLISHED")).toBe("PUBLISHED");
  });

  it("validates public candidate request payloads with required consent", () => {
    expect(
      createPublicCandidateRequestSchema.parse({
        firstName: " John ",
        lastName: " Paul ",
        email: "Candidate@Example.Test ",
        country: "LV",
        city: "Riga",
        preferredLanguage: "en",
        message: "I would like to learn more.",
        consentAccepted: true,
        consentTextVersion: "candidate-request-v1",
        idempotencyKey: "join-request-1"
      })
    ).toEqual({
      firstName: "John",
      lastName: "Paul",
      email: "candidate@example.test",
      country: "LV",
      city: "Riga",
      preferredLanguage: "en",
      message: "I would like to learn more.",
      consentAccepted: true,
      consentTextVersion: "candidate-request-v1",
      idempotencyKey: "join-request-1"
    });

    expect(() =>
      createPublicCandidateRequestSchema.parse({
        firstName: "John",
        lastName: "Paul",
        email: "candidate@example.test",
        country: "LV",
        city: "Riga",
        consentAccepted: false,
        consentTextVersion: "candidate-request-v1"
      })
    ).toThrow();
    expect(
      publicCandidateRequestResponseSchema.parse({
        request: {
          id: "11111111-1111-4111-8111-111111111111",
          status: "new"
        }
      })
    ).toEqual({
      request: {
        id: "11111111-1111-4111-8111-111111111111",
        status: "new"
      }
    });
  });

  it("validates attachment status values from the shared contract", () => {
    expect(attachmentStatusSchema.parse("archived")).toBe("archived");
  });

  it("validates organization lifecycle status values from the shared contract", () => {
    expect(organizationUnitTypeSchema.parse("CHORAGIEW")).toBe("CHORAGIEW");
    expect(organizationUnitStatusSchema.parse("active")).toBe("active");
    expect(membershipStatusSchema.parse("inactive")).toBe("inactive");
  });

  it("validates organization-unit API request and response DTOs", () => {
    expect(
      createOrganizationUnitRequestSchema.parse({
        name: " Pilot Organization Unit ",
        city: "Riga",
        country: "LV",
        parish: null
      })
    ).toEqual({
      type: "CHORAGIEW",
      name: "Pilot Organization Unit",
      city: "Riga",
      country: "LV",
      parish: null
    });
    expect(updateOrganizationUnitRequestSchema.parse({ status: "archived" })).toEqual({
      status: "archived"
    });
    expect(() => updateOrganizationUnitRequestSchema.parse({})).toThrow();
    expect(() => createOrganizationUnitRequestSchema.parse({ name: "Missing city" })).toThrow();

    const unit = {
      id: "11111111-1111-4111-8111-111111111111",
      type: "CHORAGIEW",
      parentUnitId: null,
      name: "Pilot Organization Unit",
      city: "Riga",
      country: "LV",
      parish: null,
      publicDescription: null,
      status: "active"
    };

    expect(myOrganizationUnitsResponseSchema.parse({ organizationUnits: [unit] })).toEqual({
      organizationUnits: [unit]
    });
    expect(adminOrganizationUnitListResponseSchema.parse({ organizationUnits: [unit] })).toEqual({
      organizationUnits: [unit]
    });
  });

  it("validates public home query and response DTOs", () => {
    expect(publicHomeQuerySchema.parse({ language: " en " })).toEqual({ language: "en" });
    expect(() => publicHomeQuerySchema.parse({ language: "e" })).toThrow();

    const response = {
      intro: {
        title: "JP2 App",
        body: "Public discovery content is being prepared for approval."
      },
      prayerOfDay: null,
      nextEvents: [],
      ctas: [
        {
          id: "join",
          label: "Join",
          action: "join",
          targetRoute: "JoinRequestForm"
        }
      ]
    };

    expect(publicHomeResponseSchema.parse(response)).toEqual(response);
  });

  it("validates public content page route and response DTOs", () => {
    expect(publicContentPageSlugSchema.parse(" about-order ")).toBe("about-order");
    expect(() => publicContentPageSlugSchema.parse("About Order")).toThrow();
    expect(publicContentPageQuerySchema.parse({ language: " pl " })).toEqual({ language: "pl" });

    const response = {
      page: {
        id: "11111111-1111-4111-8111-111111111111",
        slug: "about-order",
        title: "About the Order",
        body: "Approved public information.",
        language: "en"
      }
    };

    expect(publicContentPageResponseSchema.parse(response)).toEqual(response);
  });

  it("validates public prayer DTOs with safe pagination defaults", () => {
    expect(publicPrayerListQuerySchema.parse({ language: " en ", limit: "10" })).toEqual({
      language: "en",
      limit: 10,
      offset: 0
    });

    const category = {
      id: "22222222-2222-4222-8222-222222222222",
      slug: "daily",
      title: "Daily Prayer",
      language: "en"
    };
    const summary = {
      id: "33333333-3333-4333-8333-333333333333",
      title: "Morning Offering",
      excerpt: "A public morning prayer.",
      language: "en",
      category
    };

    expect(
      publicPrayerListResponseSchema.parse({
        categories: [category],
        prayers: [summary],
        pagination: { limit: 10, offset: 0 }
      })
    ).toEqual({
      categories: [category],
      prayers: [summary],
      pagination: { limit: 10, offset: 0 }
    });
    expect(
      publicPrayerDetailResponseSchema.parse({ prayer: { ...summary, body: summary.excerpt } })
    ).toEqual({ prayer: { ...summary, body: summary.excerpt } });
  });

  it("validates admin prayer write and response DTOs", () => {
    const prayer = {
      id: "33333333-3333-4333-8333-333333333333",
      categoryId: null,
      title: "Morning Offering",
      body: "A public morning prayer.",
      language: "en",
      visibility: "PUBLIC",
      targetOrganizationUnitId: null,
      status: "DRAFT",
      publishedAt: null,
      archivedAt: null
    };

    expect(
      createAdminPrayerRequestSchema.parse({
        title: " Morning Offering ",
        body: " A public morning prayer. ",
        language: " en ",
        visibility: "PUBLIC",
        status: "DRAFT"
      })
    ).toEqual({
      title: "Morning Offering",
      body: "A public morning prayer.",
      language: "en",
      visibility: "PUBLIC",
      status: "DRAFT"
    });
    expect(() =>
      createAdminPrayerRequestSchema.parse({
        title: "Scoped",
        body: "Scoped body",
        language: "en",
        visibility: "ORGANIZATION_UNIT",
        status: "DRAFT"
      })
    ).toThrow();
    expect(updateAdminPrayerRequestSchema.parse({ status: "ARCHIVED" })).toEqual({
      status: "ARCHIVED"
    });
    expect(() => updateAdminPrayerRequestSchema.parse({})).toThrow();
    expect(adminPrayerListResponseSchema.parse({ prayers: [prayer] })).toEqual({
      prayers: [prayer]
    });
    expect(adminPrayerDetailResponseSchema.parse({ prayer })).toEqual({ prayer });
  });

  it("validates admin event write and response DTOs", () => {
    const event = {
      id: "44444444-4444-4444-8444-444444444444",
      title: "Open Evening",
      description: "Public introduction evening.",
      type: "open-evening",
      startAt: "2026-05-10T18:00:00.000Z",
      endAt: null,
      locationLabel: "Riga",
      visibility: "FAMILY_OPEN",
      targetOrganizationUnitId: null,
      status: "draft",
      publishedAt: null,
      cancelledAt: null,
      archivedAt: null
    };

    expect(
      createAdminEventRequestSchema.parse({
        title: " Open Evening ",
        description: " Public introduction evening. ",
        type: " open-evening ",
        startAt: "2026-05-10T18:00:00.000Z",
        visibility: "FAMILY_OPEN",
        status: "draft"
      })
    ).toEqual({
      title: "Open Evening",
      description: "Public introduction evening.",
      type: "open-evening",
      startAt: "2026-05-10T18:00:00.000Z",
      visibility: "FAMILY_OPEN",
      status: "draft"
    });
    expect(() =>
      createAdminEventRequestSchema.parse({
        title: "Scoped",
        type: "retreat",
        startAt: "2026-05-10T18:00:00.000Z",
        visibility: "ORGANIZATION_UNIT",
        status: "draft"
      })
    ).toThrow();
    expect(() =>
      createAdminEventRequestSchema.parse({
        title: "Bad dates",
        type: "retreat",
        startAt: "2026-05-10T18:00:00.000Z",
        endAt: "2026-05-10T17:00:00.000Z",
        visibility: "PUBLIC",
        status: "draft"
      })
    ).toThrow();
    expect(updateAdminEventRequestSchema.parse({ status: "archived" })).toEqual({
      status: "archived"
    });
    expect(() => updateAdminEventRequestSchema.parse({})).toThrow();
    expect(adminEventListResponseSchema.parse({ events: [event] })).toEqual({
      events: [event]
    });
    expect(adminEventDetailResponseSchema.parse({ event })).toEqual({ event });
  });

  it("validates admin candidate request management DTOs", () => {
    const candidateRequest = {
      id: "55555555-5555-4555-8555-555555555555",
      firstName: "Anna",
      lastName: "Nowak",
      email: "anna@example.test",
      country: "Latvia",
      city: "Riga",
      status: "new",
      assignedOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      assignedOrganizationUnitName: "Riga Choragiew",
      createdAt: "2026-05-05T10:00:00.000Z",
      updatedAt: "2026-05-05T10:00:00.000Z",
      archivedAt: null,
      phone: null,
      preferredLanguage: "en",
      message: "I would like to learn more.",
      consentTextVersion: "candidate-request-v1",
      consentAt: "2026-05-05T10:00:00.000Z",
      officerNote: null
    };

    expect(
      updateAdminCandidateRequestSchema.parse({
        status: "contacted",
        officerNote: " Followed up by email. "
      })
    ).toEqual({
      status: "contacted",
      officerNote: "Followed up by email."
    });
    expect(updateAdminCandidateRequestSchema.parse({ assignedOrganizationUnitId: null })).toEqual({
      assignedOrganizationUnitId: null
    });
    expect(() =>
      updateAdminCandidateRequestSchema.parse({ status: "converted_to_candidate" })
    ).toThrow();
    expect(() => updateAdminCandidateRequestSchema.parse({})).toThrow();
    expect(
      adminCandidateRequestListResponseSchema.parse({
        candidateRequests: [candidateRequest]
      })
    ).toEqual({
      candidateRequests: [
        {
          id: candidateRequest.id,
          firstName: candidateRequest.firstName,
          lastName: candidateRequest.lastName,
          email: candidateRequest.email,
          country: candidateRequest.country,
          city: candidateRequest.city,
          status: candidateRequest.status,
          assignedOrganizationUnitId: candidateRequest.assignedOrganizationUnitId,
          assignedOrganizationUnitName: candidateRequest.assignedOrganizationUnitName,
          createdAt: candidateRequest.createdAt,
          updatedAt: candidateRequest.updatedAt,
          archivedAt: candidateRequest.archivedAt
        }
      ]
    });
    expect(
      adminCandidateRequestDetailResponseSchema.parse({
        candidateRequest
      })
    ).toEqual({
      candidateRequest
    });
  });

  it("validates admin dashboard scoped counts and task links", () => {
    const response = {
      scope: {
        adminKind: "OFFICER",
        organizationUnitIds: ["11111111-1111-4111-8111-111111111111"]
      },
      counts: {
        organizationUnits: 1,
        prayers: 2,
        events: 3
      },
      tasks: [
        {
          id: "manage-events",
          label: "Manage events",
          count: 3,
          targetRoute: "/admin/events",
          priority: "normal"
        }
      ]
    };

    expect(adminDashboardResponseSchema.parse(response)).toEqual(response);
    expect(
      adminDashboardResponseSchema.safeParse({
        ...response,
        tasks: [{ ...response.tasks[0], targetRoute: "/admin/brothers" }]
      }).success
    ).toBe(false);
  });

  it("validates public event DTOs with PUBLIC and FAMILY_OPEN visibility only", () => {
    expect(publicEventListQuerySchema.parse({ type: " open-evening ", limit: "5" })).toEqual({
      type: "open-evening",
      limit: 5,
      offset: 0
    });

    const event = {
      id: "44444444-4444-4444-8444-444444444444",
      title: "Open Evening",
      type: "open-evening",
      startAt: "2026-05-10T18:00:00.000Z",
      endAt: null,
      locationLabel: "Riga",
      visibility: "FAMILY_OPEN"
    };

    expect(
      publicEventListResponseSchema.parse({
        events: [event],
        pagination: { limit: 5, offset: 0 }
      })
    ).toEqual({
      events: [event],
      pagination: { limit: 5, offset: 0 }
    });
    expect(
      publicEventDetailResponseSchema.parse({
        event: { ...event, description: "Public introduction evening." }
      })
    ).toEqual({
      event: { ...event, description: "Public introduction evening." }
    });
    expect(
      publicEventListResponseSchema.safeParse({
        events: [{ ...event, visibility: "BROTHER" }],
        pagination: { limit: 5, offset: 0 }
      }).success
    ).toBe(false);
  });
});
