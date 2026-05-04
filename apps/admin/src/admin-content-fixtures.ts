import type {
  AdminDashboardResponseDto,
  AdminEventListResponseDto,
  AdminPrayerListResponseDto
} from "@jp2/shared-validation";

export const fallbackAdminDashboard: AdminDashboardResponseDto = {
  scope: {
    adminKind: "OFFICER",
    organizationUnitIds: ["11111111-1111-4111-8111-111111111111"]
  },
  counts: {
    organizationUnits: 1,
    prayers: 1,
    events: 1
  },
  tasks: [
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
