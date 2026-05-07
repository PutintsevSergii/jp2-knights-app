import { describe, expect, it } from "vitest";
import {
  adminAnnouncementDetailResponseSchema,
  adminAnnouncementListResponseSchema,
  adminCandidateProfileDetailResponseSchema,
  adminCandidateProfileListResponseSchema,
  adminDashboardResponseSchema,
  adminCandidateRequestDetailResponseSchema,
  adminCandidateRequestListResponseSchema,
  adminEventDetailResponseSchema,
  adminEventListResponseSchema,
  adminOrganizationUnitListResponseSchema,
  adminPrayerDetailResponseSchema,
  adminPrayerListResponseSchema,
  attachmentStatusSchema,
  brotherEventDetailResponseSchema,
  brotherPrayerListQuerySchema,
  brotherPrayerListResponseSchema,
  brotherProfileResponseSchema,
  brotherTodayResponseSchema,
  candidateEventDetailResponseSchema,
  candidateEventListQuerySchema,
  candidateEventListResponseSchema,
  candidateDashboardResponseSchema,
  contentStatusSchema,
  convertCandidateRequestSchema,
  createAdminAnnouncementRequestSchema,
  createAdminEventRequestSchema,
  createAdminPrayerRequestSchema,
  createOrganizationUnitRequestSchema,
  createPublicCandidateRequestSchema,
  deviceTokenRegistrationResponseSchema,
  eventParticipationResponseSchema,
  membershipStatusSchema,
  myOrganizationUnitsResponseSchema,
  notificationPreferencesResponseSchema,
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
  registerDeviceTokenRequestSchema,
  updateAdminAnnouncementRequestSchema,
  updateAdminEventRequestSchema,
  updateAdminCandidateProfileSchema,
  updateAdminCandidateRequestSchema,
  updateAdminPrayerRequestSchema,
  updateNotificationPreferencesRequestSchema,
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

  it("validates candidate event list and detail contracts without participant lists", () => {
    expect(candidateEventListQuerySchema.parse({ limit: "10", offset: "2" })).toEqual({
      limit: 10,
      offset: 2
    });

    const event = {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Candidate Gathering",
      type: "formation",
      startAt: "2026-06-01T10:00:00.000Z",
      endAt: null,
      locationLabel: "Riga",
      visibility: "CANDIDATE" as const
    };

    expect(
      candidateEventListResponseSchema.parse({
        events: [event],
        pagination: {
          limit: 10,
          offset: 2
        }
      })
    ).toEqual({
      events: [event],
      pagination: {
        limit: 10,
        offset: 2
      }
    });

    expect(
      candidateEventDetailResponseSchema.parse({
        event: {
          ...event,
          description: "Formation gathering for active candidates.",
          currentUserParticipation: {
            id: "22222222-2222-4222-8222-222222222222",
            eventId: event.id,
            intentStatus: "planning_to_attend",
            createdAt: "2026-05-06T12:00:00.000Z",
            cancelledAt: null
          }
        }
      })
    ).toEqual({
      event: {
        ...event,
        description: "Formation gathering for active candidates.",
        currentUserParticipation: {
          id: "22222222-2222-4222-8222-222222222222",
          eventId: event.id,
          intentStatus: "planning_to_attend",
          createdAt: "2026-05-06T12:00:00.000Z",
          cancelledAt: null
        }
      }
    });

    expect(() =>
      candidateEventDetailResponseSchema.parse({
        event: {
          ...event,
          participants: []
        }
      })
    ).toThrow();
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

  it("validates brother prayer list DTOs with visibility scope metadata", () => {
    expect(brotherPrayerListQuerySchema.parse({ language: " en ", limit: "10" })).toEqual({
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
    const prayer = {
      id: "33333333-3333-4333-8333-333333333333",
      title: "Brother Prayer",
      excerpt: "A brother-visible prayer.",
      language: "en",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      category
    };

    expect(
      brotherPrayerListResponseSchema.parse({
        categories: [category],
        prayers: [prayer],
        pagination: { limit: 10, offset: 0 }
      })
    ).toEqual({
      categories: [category],
      prayers: [prayer],
      pagination: { limit: 10, offset: 0 }
    });
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

  it("validates admin announcement write and response DTOs", () => {
    const announcement = {
      id: "55555555-5555-4555-8555-555555555555",
      title: "Formation Evening",
      body: "Join the formation evening this Friday.",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      pinned: true,
      status: "PUBLISHED",
      publishedAt: "2026-05-07T18:00:00.000Z",
      archivedAt: null
    };

    expect(
      createAdminAnnouncementRequestSchema.parse({
        title: " Formation Evening ",
        body: " Join the formation evening this Friday. ",
        visibility: "ORGANIZATION_UNIT",
        targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
        pinned: true,
        status: "PUBLISHED"
      })
    ).toEqual({
      title: "Formation Evening",
      body: "Join the formation evening this Friday.",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      pinned: true,
      status: "PUBLISHED"
    });
    expect(() =>
      createAdminAnnouncementRequestSchema.parse({
        title: "Scoped",
        body: "Scoped body",
        visibility: "ORGANIZATION_UNIT",
        status: "DRAFT"
      })
    ).toThrow();
    expect(updateAdminAnnouncementRequestSchema.parse({ status: "ARCHIVED" })).toEqual({
      status: "ARCHIVED"
    });
    expect(() => updateAdminAnnouncementRequestSchema.parse({})).toThrow();
    expect(adminAnnouncementListResponseSchema.parse({ announcements: [announcement] })).toEqual({
      announcements: [announcement]
    });
    expect(adminAnnouncementDetailResponseSchema.parse({ announcement })).toEqual({
      announcement
    });
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
    expect(
      convertCandidateRequestSchema.parse({
        assignedOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
        responsibleOfficerId: null
      })
    ).toEqual({
      assignedOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      responsibleOfficerId: null
    });
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
    expect(
      adminCandidateProfileListResponseSchema.parse({
        candidateProfiles: [
          {
            id: "77777777-7777-4777-8777-777777777777",
            userId: "88888888-8888-4888-8888-888888888888",
            candidateRequestId: candidateRequest.id,
            displayName: "Anna Nowak",
            email: candidateRequest.email,
            preferredLanguage: "en",
            assignedOrganizationUnitId: candidateRequest.assignedOrganizationUnitId,
            assignedOrganizationUnitName: candidateRequest.assignedOrganizationUnitName,
            responsibleOfficerId: "99999999-9999-4999-8999-999999999999",
            responsibleOfficerName: "Demo Officer",
            status: "active",
            createdAt: candidateRequest.createdAt,
            updatedAt: candidateRequest.updatedAt,
            archivedAt: null
          }
        ]
      })
    ).toMatchObject({
      candidateProfiles: [
        {
          displayName: "Anna Nowak",
          status: "active"
        }
      ]
    });
    expect(updateAdminCandidateProfileSchema.parse({ status: "paused" })).toEqual({
      status: "paused"
    });
    expect(updateAdminCandidateProfileSchema.parse({ responsibleOfficerId: null })).toEqual({
      responsibleOfficerId: null
    });
    expect(() =>
      updateAdminCandidateProfileSchema.parse({ status: "converted_to_brother" })
    ).toThrow();
    expect(
      adminCandidateProfileDetailResponseSchema.parse({
        candidateProfile: {
          id: "77777777-7777-4777-8777-777777777777",
          userId: "88888888-8888-4888-8888-888888888888",
          candidateRequestId: candidateRequest.id,
          displayName: "Anna Nowak",
          email: candidateRequest.email,
          preferredLanguage: "en",
          assignedOrganizationUnitId: candidateRequest.assignedOrganizationUnitId,
          assignedOrganizationUnitName: candidateRequest.assignedOrganizationUnitName,
          responsibleOfficerId: "99999999-9999-4999-8999-999999999999",
          responsibleOfficerName: "Demo Officer",
          status: "active",
          createdAt: candidateRequest.createdAt,
          updatedAt: candidateRequest.updatedAt,
          archivedAt: null
        }
      })
    ).toMatchObject({
      candidateProfile: {
        displayName: "Anna Nowak",
        status: "active"
      }
    });
  });

  it("validates admin dashboard scoped counts and task links", () => {
    const response = {
      scope: {
        adminKind: "OFFICER",
        organizationUnitIds: ["11111111-1111-4111-8111-111111111111"]
      },
      counts: {
        identityAccessReviews: 1,
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

  it("validates candidate dashboard profile, next step, and safe event visibility", () => {
    const response = {
      profile: {
        id: "11111111-1111-4111-8111-111111111111",
        userId: "22222222-2222-4222-8222-222222222222",
        displayName: "Demo Candidate",
        email: "candidate@example.test",
        preferredLanguage: "en",
        status: "active",
        assignedOrganizationUnit: {
          id: "33333333-3333-4333-8333-333333333333",
          name: "Pilot Choragiew",
          city: "Riga",
          country: "Latvia",
          parish: null
        },
        responsibleOfficer: {
          id: "44444444-4444-4444-8444-444444444444",
          displayName: "Responsible Officer",
          email: "officer@example.test",
          phone: null
        }
      },
      nextStep: {
        id: "review-roadmap",
        label: "Review your candidate path",
        body: "Review upcoming candidate steps.",
        targetRoute: "CandidateRoadmap",
        priority: "normal"
      },
      upcomingEvents: [
        {
          id: "55555555-5555-4555-8555-555555555555",
          title: "Candidate Gathering",
          type: "formation",
          startAt: "2026-06-01T10:00:00.000Z",
          endAt: null,
          locationLabel: "Riga",
          visibility: "CANDIDATE"
        }
      ],
      announcements: []
    };

    expect(candidateDashboardResponseSchema.parse(response)).toEqual(response);
    expect(
      candidateDashboardResponseSchema.safeParse({
        ...response,
        upcomingEvents: [{ ...response.upcomingEvents[0], visibility: "BROTHER" }]
      }).success
    ).toBe(false);
  });

  it("validates brother profile and today DTOs with brother-safe event visibility", () => {
    const organizationUnit = {
      id: "11111111-1111-4111-8111-111111111111",
      type: "CHORAGIEW",
      parentUnitId: null,
      name: "Pilot Choragiew",
      city: "Riga",
      country: "Latvia",
      parish: null,
      publicDescription: "Pilot community",
      status: "active"
    };
    const profileResponse = {
      profile: {
        id: "22222222-2222-4222-8222-222222222222",
        displayName: "Demo Brother",
        email: "brother@example.test",
        phone: null,
        preferredLanguage: "en",
        status: "active",
        roles: ["BROTHER"],
        memberships: [
          {
            id: "33333333-3333-4333-8333-333333333333",
            currentDegree: "First Degree",
            joinedAt: "2026-01-15",
            organizationUnit
          }
        ]
      }
    };
    const todayResponse = {
      profileSummary: {
        displayName: "Demo Brother",
        currentDegree: "First Degree",
        organizationUnitName: "Pilot Choragiew"
      },
      cards: [
        {
          id: "profile",
          label: "Review profile",
          body: "Your brother profile and choragiew assignment are available.",
          targetRoute: "BrotherProfile",
          priority: "normal"
        }
      ],
      upcomingEvents: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          title: "Brother Gathering",
          type: "formation",
          startAt: "2026-06-01T10:00:00.000Z",
          endAt: null,
          locationLabel: "Riga",
          visibility: "ORGANIZATION_UNIT"
        }
      ],
      organizationUnits: [organizationUnit]
    };

    expect(brotherProfileResponseSchema.parse(profileResponse)).toEqual(profileResponse);
    expect(brotherTodayResponseSchema.parse(todayResponse)).toEqual(todayResponse);
    expect(
      brotherTodayResponseSchema.safeParse({
        ...todayResponse,
        upcomingEvents: [{ ...todayResponse.upcomingEvents[0], visibility: "CANDIDATE" }]
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

  it("validates event participation intent responses without exposing participant lists", () => {
    const response = {
      participation: {
        id: "55555555-5555-4555-8555-555555555555",
        eventId: "44444444-4444-4444-8444-444444444444",
        intentStatus: "planning_to_attend",
        createdAt: "2026-05-06T12:00:00.000Z",
        cancelledAt: null
      }
    };

    expect(eventParticipationResponseSchema.parse(response)).toEqual(response);
    expect(
      eventParticipationResponseSchema.safeParse({
        participation: {
          ...response.participation,
          participants: ["22222222-2222-4222-8222-222222222222"]
        }
      }).success
    ).toBe(false);
  });

  it("validates brother event detail with only the current user's participation intent", () => {
    const response = {
      event: {
        id: "44444444-4444-4444-8444-444444444444",
        title: "Brother Gathering",
        type: "formation",
        startAt: "2026-06-01T10:00:00.000Z",
        endAt: null,
        locationLabel: "Riga",
        visibility: "BROTHER",
        description: "Private formation gathering.",
        currentUserParticipation: {
          id: "55555555-5555-4555-8555-555555555555",
          eventId: "44444444-4444-4444-8444-444444444444",
          intentStatus: "planning_to_attend",
          createdAt: "2026-05-06T12:00:00.000Z",
          cancelledAt: null
        }
      }
    };

    expect(brotherEventDetailResponseSchema.parse(response)).toEqual(response);
    expect(
      brotherEventDetailResponseSchema.safeParse({
        event: {
          ...response.event,
          currentUserParticipation: {
            ...response.event.currentUserParticipation,
            userId: "22222222-2222-4222-8222-222222222222"
          }
        }
      }).success
    ).toBe(false);
  });

  it("validates notification preference and device-token DTOs without returning token material", () => {
    expect(
      registerDeviceTokenRequestSchema.parse({
        platform: "ios",
        token: "ExponentPushToken[abc1234567890]"
      })
    ).toEqual({
      platform: "ios",
      token: "ExponentPushToken[abc1234567890]"
    });
    expect(
      registerDeviceTokenRequestSchema.safeParse({
        platform: "desktop",
        token: "short"
      }).success
    ).toBe(false);
    expect(
      deviceTokenRegistrationResponseSchema.parse({
        deviceToken: {
          id: "55555555-5555-4555-8555-555555555555",
          platform: "android",
          lastSeenAt: "2026-05-07T10:00:00.000Z",
          revokedAt: null
        }
      })
    ).toEqual({
      deviceToken: {
        id: "55555555-5555-4555-8555-555555555555",
        platform: "android",
        lastSeenAt: "2026-05-07T10:00:00.000Z",
        revokedAt: null
      }
    });
    expect(
      updateNotificationPreferencesRequestSchema.parse({
        announcements: false,
        prayerReminders: true
      })
    ).toEqual({
      announcements: false,
      prayerReminders: true
    });
    expect(updateNotificationPreferencesRequestSchema.safeParse({}).success).toBe(false);
    expect(
      notificationPreferencesResponseSchema.parse({
        preferences: {
          events: true,
          announcements: false,
          roadmapUpdates: true,
          prayerReminders: false
        }
      })
    ).toEqual({
      preferences: {
        events: true,
        announcements: false,
        roadmapUpdates: true,
        prayerReminders: false
      }
    });
  });
});
