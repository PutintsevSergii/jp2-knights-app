import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pilotUnit = await findOrCreateOrganizationUnit({
    type: "CHORAGIEW",
    name: "Pilot Choragiew",
    city: "Riga",
    country: "LV",
    publicDescription: "Demo pilot organization unit for local development."
  });

  await findOrCreateOrganizationUnit({
    type: "CHORAGIEW",
    name: "Second Scope Choragiew",
    city: "Warsaw",
    country: "PL",
    publicDescription: "Demo second organization unit for officer scope checks."
  });

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: "admin@example.test", archivedAt: null }
  });

  const superAdmin =
    existingSuperAdmin ??
    (await prisma.user.create({
      data: {
        email: "admin@example.test",
        displayName: "Demo Super Admin",
        status: "active",
        preferredLanguage: "en"
      }
    }));

  await prisma.userRole.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000001"
    },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      userId: superAdmin.id,
      role: "SUPER_ADMIN"
    }
  });

  const existingOfficer = await prisma.user.findFirst({
    where: { email: "officer@example.test", archivedAt: null }
  });

  const officer =
    existingOfficer ??
    (await prisma.user.create({
      data: {
        email: "officer@example.test",
        displayName: "Demo Officer",
        status: "active",
        preferredLanguage: "en"
      }
    }));

  await prisma.userRole.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000002"
    },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      userId: officer.id,
      role: "OFFICER",
      createdBy: superAdmin.id
    }
  });

  await prisma.officerAssignment.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000003"
    },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      userId: officer.id,
      organizationUnitId: pilotUnit.id,
      title: "Demo Officer",
      startsAt: new Date("2026-01-01T00:00:00.000Z"),
      createdBy: superAdmin.id
    }
  });

  await prisma.contentPage.upsert({
    where: {
      slug_language: {
        slug: "about-order",
        language: "en"
      }
    },
    update: {
      title: "About the Order",
      body: "Approved public information about the Order is prepared here for local development.",
      visibility: "PUBLIC",
      status: "PUBLISHED",
      approvedBy: superAdmin.id,
      publishedBy: superAdmin.id,
      approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      publishedAt: new Date("2026-01-01T00:00:00.000Z"),
      archivedAt: null
    },
    create: {
      id: "00000000-0000-0000-0000-000000000004",
      slug: "about-order",
      title: "About the Order",
      body: "Approved public information about the Order is prepared here for local development.",
      language: "en",
      visibility: "PUBLIC",
      status: "PUBLISHED",
      createdBy: superAdmin.id,
      updatedBy: superAdmin.id,
      approvedBy: superAdmin.id,
      publishedBy: superAdmin.id,
      approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      publishedAt: new Date("2026-01-01T00:00:00.000Z")
    }
  });

  const dailyPrayerCategory = await prisma.prayerCategory.upsert({
    where: {
      slug_language: {
        slug: "daily",
        language: "en"
      }
    },
    update: {
      title: "Daily Prayer",
      sortOrder: 10,
      status: "PUBLISHED",
      publishedAt: new Date("2026-01-01T00:00:00.000Z"),
      archivedAt: null
    },
    create: {
      id: "00000000-0000-0000-0000-000000000005",
      slug: "daily",
      title: "Daily Prayer",
      language: "en",
      sortOrder: 10,
      status: "PUBLISHED",
      publishedAt: new Date("2026-01-01T00:00:00.000Z")
    }
  });

  await prisma.prayer.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000006"
    },
    update: {
      categoryId: dailyPrayerCategory.id,
      title: "Morning Offering",
      body: "Lord, receive this day and guide our service in truth, fraternity, and charity.",
      language: "en",
      visibility: "PUBLIC",
      targetOrganizationUnitId: null,
      status: "PUBLISHED",
      updatedBy: superAdmin.id,
      approvedBy: superAdmin.id,
      publishedBy: superAdmin.id,
      approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      publishedAt: new Date("2026-01-01T00:00:00.000Z"),
      archivedAt: null
    },
    create: {
      id: "00000000-0000-0000-0000-000000000006",
      categoryId: dailyPrayerCategory.id,
      title: "Morning Offering",
      body: "Lord, receive this day and guide our service in truth, fraternity, and charity.",
      language: "en",
      visibility: "PUBLIC",
      status: "PUBLISHED",
      createdBy: superAdmin.id,
      updatedBy: superAdmin.id,
      approvedBy: superAdmin.id,
      publishedBy: superAdmin.id,
      approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      publishedAt: new Date("2026-01-01T00:00:00.000Z")
    }
  });

  await prisma.prayer.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000007"
    },
    update: {
      categoryId: dailyPrayerCategory.id,
      title: "Brother Only Prayer",
      body: "This local fixture must never appear in public prayer responses.",
      language: "en",
      visibility: "BROTHER",
      targetOrganizationUnitId: pilotUnit.id,
      status: "PUBLISHED",
      updatedBy: superAdmin.id,
      approvedBy: superAdmin.id,
      publishedBy: superAdmin.id,
      approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      publishedAt: new Date("2026-01-01T00:00:00.000Z"),
      archivedAt: null
    },
    create: {
      id: "00000000-0000-0000-0000-000000000007",
      categoryId: dailyPrayerCategory.id,
      title: "Brother Only Prayer",
      body: "This local fixture must never appear in public prayer responses.",
      language: "en",
      visibility: "BROTHER",
      targetOrganizationUnitId: pilotUnit.id,
      status: "PUBLISHED",
      createdBy: superAdmin.id,
      updatedBy: superAdmin.id,
      approvedBy: superAdmin.id,
      publishedBy: superAdmin.id,
      approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      publishedAt: new Date("2026-01-01T00:00:00.000Z")
    }
  });

  await prisma.event.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000008"
    },
    update: {
      title: "Open Evening",
      description: "A public introduction evening for people exploring the Order.",
      type: "open-evening",
      startAt: new Date("2026-06-10T18:00:00.000Z"),
      endAt: new Date("2026-06-10T20:00:00.000Z"),
      locationLabel: "Riga",
      visibility: "PUBLIC",
      targetOrganizationUnitId: null,
      status: "published",
      updatedBy: superAdmin.id,
      publishedBy: superAdmin.id,
      publishedAt: new Date("2026-01-01T00:00:00.000Z"),
      cancelledAt: null,
      archivedAt: null
    },
    create: {
      id: "00000000-0000-0000-0000-000000000008",
      title: "Open Evening",
      description: "A public introduction evening for people exploring the Order.",
      type: "open-evening",
      startAt: new Date("2026-06-10T18:00:00.000Z"),
      endAt: new Date("2026-06-10T20:00:00.000Z"),
      locationLabel: "Riga",
      visibility: "PUBLIC",
      status: "published",
      createdBy: superAdmin.id,
      updatedBy: superAdmin.id,
      publishedBy: superAdmin.id,
      publishedAt: new Date("2026-01-01T00:00:00.000Z")
    }
  });

  await prisma.event.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000009"
    },
    update: {
      title: "Brother Formation Evening",
      description: "This local fixture must never appear in public event responses.",
      type: "formation",
      startAt: new Date("2026-06-12T18:00:00.000Z"),
      endAt: new Date("2026-06-12T20:00:00.000Z"),
      locationLabel: "Riga",
      visibility: "BROTHER",
      targetOrganizationUnitId: pilotUnit.id,
      status: "published",
      updatedBy: superAdmin.id,
      publishedBy: superAdmin.id,
      publishedAt: new Date("2026-01-01T00:00:00.000Z"),
      cancelledAt: null,
      archivedAt: null
    },
    create: {
      id: "00000000-0000-0000-0000-000000000009",
      title: "Brother Formation Evening",
      description: "This local fixture must never appear in public event responses.",
      type: "formation",
      startAt: new Date("2026-06-12T18:00:00.000Z"),
      endAt: new Date("2026-06-12T20:00:00.000Z"),
      locationLabel: "Riga",
      visibility: "BROTHER",
      targetOrganizationUnitId: pilotUnit.id,
      status: "published",
      createdBy: superAdmin.id,
      updatedBy: superAdmin.id,
      publishedBy: superAdmin.id,
      publishedAt: new Date("2026-01-01T00:00:00.000Z")
    }
  });
}

async function findOrCreateOrganizationUnit(data) {
  const existing = await prisma.organizationUnit.findFirst({
    where: {
      type: data.type,
      name: data.name,
      city: data.city,
      archivedAt: null
    }
  });

  return (
    existing ??
    prisma.organizationUnit.create({
      data
    })
  );
}

await main();
await prisma.$disconnect();
