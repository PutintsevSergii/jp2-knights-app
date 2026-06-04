import type {
  AdminAuditLogListResponseDto,
  AdminAnnouncementListResponseDto,
  AdminDashboardResponseDto,
  AdminEventListResponseDto,
  AdminIdentityAccessReviewListResponseDto,
  AdminCandidateRequestDetailDto,
  AdminCandidateProfileDetailDto,
  AdminOrganizationUnitListResponseDto,
  AdminRoadmapAssignmentDetailDto,
  AdminRoadmapDefinitionDetailDto,
  AdminRoadmapSubmissionDetailDto,
  AdminPrayerListResponseDto,
  AdminSilentPrayerEventListResponseDto
} from "@jp2/shared-validation";

export const fallbackAdminAuditLogs: AdminAuditLogListResponseDto = {
  auditLogs: [
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      actorUserId: "11111111-1111-4111-8111-111111111111",
      actorDisplayName: "Demo Admin",
      action: "admin.silentPrayerEvent.update",
      entityType: "silent_prayer_event",
      entityId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      scopeOrganizationUnitId: null,
      beforeSummary: {
        status: "APPROVED"
      },
      afterSummary: {
        status: "PUBLISHED"
      },
      requestId: "req_demo_audit",
      createdAt: "2026-05-27T08:00:00.000Z"
    }
  ],
  pagination: {
    limit: 50,
    offset: 0,
    total: 1
  }
};

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
    messagePreview: "I would like to learn more about the Order.",
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

export const fallbackAdminRoadmapSubmissions: AdminRoadmapSubmissionDetailDto[] = [
  {
    id: "89898989-8989-4989-8989-898989898989",
    assignmentId: "99999999-9999-4999-8999-999999999999",
    stepId: "88888888-8888-4888-8888-888888888888",
    submitterUserId: "33333333-3333-4333-8333-333333333333",
    submitterName: "Demo Brother",
    submitterEmail: "brother@example.test",
    roadmapTitle: "Brother Formation Roadmap",
    roadmapTargetRole: "BROTHER",
    stageTitle: "Discernment",
    stepTitle: "Meet your officer",
    organizationUnitId: "11111111-1111-4111-8111-111111111111",
    organizationUnitName: "Pilot Organization Unit",
    status: "pending_review",
    bodyPreview: "Reflection text for officer review.",
    attachmentCount: 1,
    reviewComment: null,
    reviewedAt: null,
    createdAt: "2026-05-11T09:00:00.000Z",
    updatedAt: "2026-05-11T09:00:00.000Z",
    body: "Reflection text for officer review.",
    attachmentMetadata: [
      {
        originalFilename: "reflection.pdf",
        mimeType: "application/pdf",
        sizeBytes: 512
      }
    ]
  }
];

export const fallbackAdminRoadmapDefinitions: AdminRoadmapDefinitionDetailDto[] = [
  {
    id: "00000000-0000-4000-8000-000000000029",
    title: "Brother Formation Roadmap",
    targetRole: "BROTHER",
    language: "en",
    status: "PUBLISHED",
    publishedAt: "2026-05-09T09:00:00.000Z",
    stageCount: 1,
    stepCount: 1,
    assignmentCount: 1,
    createdAt: "2026-05-09T09:00:00.000Z",
    updatedAt: "2026-05-09T09:00:00.000Z",
    archivedAt: null,
    stages: [
      {
        id: "00000000-0000-4000-8000-000000000030",
        title: "Discernment",
        sortOrder: 1,
        steps: [
          {
            id: "88888888-8888-4888-8888-888888888888",
            title: "Meet your officer",
            description: "Complete the required officer conversation.",
            requiresSubmission: true,
            sortOrder: 1,
            status: "PUBLISHED",
            publishedAt: "2026-05-09T09:00:00.000Z"
          }
        ]
      }
    ]
  }
];

export const fallbackAdminRoadmapAssignments: AdminRoadmapAssignmentDetailDto[] = [
  {
    id: "99999999-9999-4999-8999-999999999999",
    assigneeUserId: "33333333-3333-4333-8333-333333333333",
    assigneeName: "Demo Brother",
    assigneeEmail: "brother@example.test",
    roadmapDefinitionId: fallbackAdminRoadmapDefinitions[0]!.id,
    roadmapTitle: fallbackAdminRoadmapDefinitions[0]!.title,
    roadmapTargetRole: "BROTHER",
    roadmapStatus: "PUBLISHED",
    organizationUnitId: "11111111-1111-4111-8111-111111111111",
    organizationUnitName: "Pilot Organization Unit",
    status: "active",
    assignedByUserId: "3f3f3f3f-3333-4333-8333-333333333333",
    assignedByName: "Demo Officer",
    assignedAt: "2026-05-09T09:00:00.000Z",
    completedAt: null,
    submissionCount: 1,
    pendingSubmissionCount: 1,
    createdAt: "2026-05-09T09:00:00.000Z",
    updatedAt: "2026-05-09T09:00:00.000Z",
    archivedAt: null,
    submissions: [
      {
        id: fallbackAdminRoadmapSubmissions[0]!.id,
        stepId: fallbackAdminRoadmapSubmissions[0]!.stepId,
        stageTitle: fallbackAdminRoadmapSubmissions[0]!.stageTitle,
        stepTitle: fallbackAdminRoadmapSubmissions[0]!.stepTitle,
        status: fallbackAdminRoadmapSubmissions[0]!.status,
        attachmentCount: fallbackAdminRoadmapSubmissions[0]!.attachmentCount,
        reviewComment: fallbackAdminRoadmapSubmissions[0]!.reviewComment,
        reviewedAt: fallbackAdminRoadmapSubmissions[0]!.reviewedAt,
        createdAt: fallbackAdminRoadmapSubmissions[0]!.createdAt,
        updatedAt: fallbackAdminRoadmapSubmissions[0]!.updatedAt
      }
    ]
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
      approvedByUserId: null,
      publishedByUserId: null,
      approvedAt: null,
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
      approvedByUserId: null,
      publishedByUserId: null,
      approvedAt: null,
      publishedAt: null,
      cancelledAt: null,
      archivedAt: null
    }
  ]
};

export const fallbackAdminAnnouncements: AdminAnnouncementListResponseDto = {
  announcements: [
    {
      id: "55555555-5555-4555-8555-555555555555",
      title: "Service Schedule Update",
      body: "The June service rota has been updated for the pilot organization unit.",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      pinned: true,
      status: "DRAFT",
      approvedByUserId: null,
      publishedByUserId: null,
      approvedAt: null,
      publishedAt: null,
      archivedAt: null
    }
  ]
};

export const fallbackAdminSilentPrayerEvents: AdminSilentPrayerEventListResponseDto = {
  silentPrayerEvents: [
    {
      id: "66666666-6666-4666-8666-666666666667",
      title: "Evening Silent Prayer",
      intention: "For pilot families and brothers.",
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111",
      status: "DRAFT",
      startsAt: "2026-06-12T18:00:00.000Z",
      endsAt: "2026-06-12T18:30:00.000Z",
      approvedByUserId: null,
      publishedByUserId: null,
      approvedAt: null,
      publishedAt: null,
      cancelledAt: null,
      archivedAt: null
    }
  ]
};
