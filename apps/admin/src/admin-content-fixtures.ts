import type {
  AdminDashboardResponseDto,
  AdminEventListResponseDto,
  AdminIdentityAccessReviewListResponseDto,
  AdminCandidateRequestDetailDto,
  AdminCandidateProfileDetailDto,
  AdminOrganizationUnitListResponseDto,
  AdminPrayerListResponseDto
} from "@jp2/shared-validation";

export const fallbackAdminDashboard: AdminDashboardResponseDto = {
  scope: {
    adminKind: "OFFICER",
    organizationUnitIds: ["11111111-1111-4111-8111-111111111111"]
  },
  counts: {
    identityAccessReviews: 1,
    organizationUnits: 1,
    prayers: 1,
    events: 1
  },
  tasks: [
    {
      id: "review-identity-access",
      label: "Confirm sign-in requests",
      count: 1,
      targetRoute: "/admin/identity-access-reviews",
      priority: "attention"
    },
    {
      id: "manage-organization-units",
      label: "Review organization units",
      count: 1,
      targetRoute: "/admin/organization-units",
      priority: "normal"
    },
    {
      id: "manage-prayers",
      label: "Review prayers",
      count: 1,
      targetRoute: "/admin/prayers",
      priority: "normal"
    },
    {
      id: "manage-events",
      label: "Review events",
      count: 1,
      targetRoute: "/admin/events",
      priority: "normal"
    }
  ]
};

export const fallbackAdminIdentityAccessReviews: AdminIdentityAccessReviewListResponseDto = {
  identityAccessReviews: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      userId: "12121212-1212-4121-8121-121212121212",
      displayName: "Piotr Kowalski",
      email: "piotr.kowalski@example.test",
      provider: "firebase",
      providerSubject: "firebase-demo-subject",
      status: "pending",
      scopeOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      scopeOrganizationUnitName: "Pilot Organization Unit",
      requestedRole: "BROTHER",
      assignedRole: null,
      expiresAt: "2026-06-04T08:00:00.000Z",
      decidedBy: null,
      decidedAt: null,
      decisionNote: null,
      createdAt: "2026-05-05T08:00:00.000Z",
      updatedAt: "2026-05-05T08:00:00.000Z"
    }
  ]
};

export const fallbackAdminCandidateRequestDetails: AdminCandidateRequestDetailDto[] = [
  {
    id: "66666666-6666-4666-8666-666666666666",
    firstName: "Jan",
    lastName: "Nowak",
    email: "jan.nowak@example.test",
    phone: "+371 2000 0000",
    country: "LV",
    city: "Riga",
    status: "new",
    assignedOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
    assignedOrganizationUnitName: "Pilot Organization Unit",
    createdAt: "2026-05-05T08:00:00.000Z",
    updatedAt: "2026-05-05T08:00:00.000Z",
    archivedAt: null,
    preferredLanguage: "en",
    message: "I would like to learn more about the Order.",
    consentTextVersion: "candidate-request-v1",
    consentAt: "2026-05-05T08:00:00.000Z",
    officerNote: null
  }
];

export const fallbackAdminCandidateProfiles: AdminCandidateProfileDetailDto[] = [
  {
    id: "77777777-7777-4777-8777-777777777777",
    userId: "88888888-8888-4888-8888-888888888888",
    candidateRequestId: fallbackAdminCandidateRequestDetails[0]?.id ?? null,
    displayName: "Jan Nowak",
    email: "jan.nowak@example.test",
    preferredLanguage: "en",
    assignedOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
    assignedOrganizationUnitName: "Pilot Organization Unit",
    responsibleOfficerId: "99999999-9999-4999-8999-999999999999",
    responsibleOfficerName: "Demo Officer",
    status: "active",
    createdAt: "2026-05-05T10:05:00.000Z",
    updatedAt: "2026-05-05T10:05:00.000Z",
    archivedAt: null
  }
];

export const fallbackAdminPrayers: AdminPrayerListResponseDto = {
  prayers: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      categoryId: null,
      title: "Morning Offering",
      body: "Lord, receive this day and guide our service in truth, fraternity, and charity.",
      language: "en",
      visibility: "PUBLIC",
      targetOrganizationUnitId: null,
      status: "DRAFT",
      publishedAt: null,
      archivedAt: null
    }
  ]
};

export const fallbackAdminOrganizationUnits: AdminOrganizationUnitListResponseDto = {
  organizationUnits: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      type: "CHORAGIEW",
      parentUnitId: null,
      name: "Pilot Organization Unit",
      city: "Riga",
      country: "LV",
      parish: null,
      publicDescription: "Demo officer scope for local Admin Lite review.",
      status: "active"
    }
  ]
};

export const fallbackAdminEvents: AdminEventListResponseDto = {
  events: [
    {
      id: "44444444-4444-4444-8444-444444444444",
      title: "Open Evening",
      description: "A public introduction evening for people exploring the Order.",
      type: "open-evening",
      startAt: "2026-06-10T18:00:00.000Z",
      endAt: "2026-06-10T20:00:00.000Z",
      locationLabel: "Riga",
      visibility: "PUBLIC",
      targetOrganizationUnitId: null,
      status: "draft",
      publishedAt: null,
      cancelledAt: null,
      archivedAt: null
    }
  ]
};
