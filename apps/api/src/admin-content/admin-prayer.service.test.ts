import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import type { AdminPrayerRepository } from "./admin-prayer.repository.js";
import { AdminPrayerService } from "./admin-prayer.service.js";
import type { AdminPrayerSummary } from "./admin-prayer.types.js";

const publicPrayer: AdminPrayerSummary = {
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

const scopedPrayer: AdminPrayerSummary = {
  ...publicPrayer,
  id: "44444444-4444-4444-8444-444444444444",
  title: "Scoped Prayer",
  visibility: "ORGANIZATION_UNIT",
  targetOrganizationUnitId: "11111111-1111-4111-8111-111111111111"
};

const brother: CurrentUserPrincipal = {
  id: "brother_1",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"]
};

const officer: CurrentUserPrincipal = {
  id: "officer_1",
  email: "officer@example.test",
  displayName: "Demo Officer",
  status: "active",
  roles: ["OFFICER"],
  officerOrganizationUnitIds: ["11111111-1111-4111-8111-111111111111"]
};

const superAdmin: CurrentUserPrincipal = {
  id: "admin_1",
  email: "admin@example.test",
  displayName: "Demo Admin",
  status: "active",
  roles: ["SUPER_ADMIN"]
};

describe("AdminPrayerService", () => {
  it("lists prayers for officers using their assigned organization-unit scope", async () => {
    await expect(service().listAdminPrayers(officer)).resolves.toEqual({
      prayers: [publicPrayer, scopedPrayer]
    });
  });

  it("allows super admins to list all manageable prayers", async () => {
    await expect(service().listAdminPrayers(superAdmin)).resolves.toEqual({
      prayers: [publicPrayer, scopedPrayer]
    });
  });

  it("blocks non-admin principals from admin prayer listing", async () => {
    await expect(service().listAdminPrayers(brother)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows super admins to create and update prayer records", async () => {
    await expect(
      service().createAdminPrayer(superAdmin, {
        title: "New Prayer",
        body: "New prayer body.",
        language: "en",
        visibility: "PUBLIC",
        status: "DRAFT"
      })
    ).resolves.toEqual({
      prayer: {
        ...publicPrayer,
        title: "New Prayer",
        body: "New prayer body."
      }
    });
    await expect(
      service().updateAdminPrayer(superAdmin, publicPrayer.id, {
        status: "ARCHIVED"
      })
    ).resolves.toEqual({
      prayer: {
        ...publicPrayer,
        status: "ARCHIVED",
        archivedAt: "2026-05-04T00:00:00.000Z"
      }
    });
  });

  it("blocks officers from creating or updating prayer records in this slice", async () => {
    await expect(
      service().createAdminPrayer(officer, {
        title: "Blocked",
        body: "Blocked",
        language: "en",
        visibility: "PUBLIC",
        status: "DRAFT"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service().updateAdminPrayer(officer, publicPrayer.id, {
        status: "PUBLISHED"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

function service(): AdminPrayerService {
  return new AdminPrayerService(repository());
}

function repository(): AdminPrayerRepository {
  return {
    listManageablePrayers: () => Promise.resolve([publicPrayer, scopedPrayer]),
    createPrayer: (data) =>
      Promise.resolve({
        ...publicPrayer,
        ...data,
        categoryId: data.categoryId ?? null,
        targetOrganizationUnitId: data.targetOrganizationUnitId ?? null,
        publishedAt: data.status === "PUBLISHED" ? "2026-05-04T00:00:00.000Z" : null,
        archivedAt: null
      }),
    updatePrayer: (_id, data) => {
      const updated: AdminPrayerSummary = { ...publicPrayer };

      if (data.categoryId !== undefined) updated.categoryId = data.categoryId;
      if (data.title !== undefined) updated.title = data.title;
      if (data.body !== undefined) updated.body = data.body;
      if (data.language !== undefined) updated.language = data.language;
      if (data.visibility !== undefined) updated.visibility = data.visibility;
      if (data.targetOrganizationUnitId !== undefined) {
        updated.targetOrganizationUnitId = data.targetOrganizationUnitId;
      }
      if (data.status !== undefined) updated.status = data.status;
      if (data.status === "ARCHIVED") updated.archivedAt = "2026-05-04T00:00:00.000Z";

      return Promise.resolve(updated);
    }
  };
}
