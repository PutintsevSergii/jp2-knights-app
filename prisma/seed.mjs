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

  await linkExternalIdentity({
    id: "00000000-0000-0000-0000-000000000010",
    userId: superAdmin.id,
    provider: "firebase",
    providerSubject: "demo-admin",
    email: "admin@example.test",
    emailVerified: true,
    displayName: "Demo Super Admin"
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

  await linkExternalIdentity({
    id: "00000000-0000-0000-0000-000000000011",
    userId: officer.id,
    provider: "firebase",
    providerSubject: "demo-officer",
    email: "officer@example.test",
    emailVerified: true,
    displayName: "Demo Officer"
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

  const existingCandidate = await prisma.user.findFirst({
    where: { email: "candidate@example.test", archivedAt: null }
  });

  const candidate =
    existingCandidate ??
    (await prisma.user.create({
      data: {
        email: "candidate@example.test",
        displayName: "Demo Candidate",
        status: "active",
        preferredLanguage: "en"
      }
    }));

  await prisma.userRole.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000013"
    },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000013",
      userId: candidate.id,
      role: "CANDIDATE",
      createdBy: superAdmin.id
    }
  });

  await linkExternalIdentity({
    id: "00000000-0000-0000-0000-000000000014",
    userId: candidate.id,
    provider: "firebase",
    providerSubject: "demo-candidate",
    email: "candidate@example.test",
    emailVerified: true,
    displayName: "Demo Candidate"
  });

  await prisma.candidateProfile.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000015"
    },
    update: {
      userId: candidate.id,
      assignedOrganizationUnitId: pilotUnit.id,
      responsibleOfficerId: officer.id,
      status: "active",
      archivedAt: null
    },
    create: {
      id: "00000000-0000-0000-0000-000000000015",
      userId: candidate.id,
      assignedOrganizationUnitId: pilotUnit.id,
      responsibleOfficerId: officer.id,
      status: "active"
    }
  });

  await prisma.candidateRequest.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000012"
    },
    update: {
      firstName: "Demo",
      lastName: "Candidate",
      email: "candidate-request@example.test",
      phone: null,
      country: "LV",
      city: "Riga",
      preferredLanguage: "en",
      message: "Demo candidate request for local Admin Lite review flows.",
      consentTextVersion: "candidate-request-v1",
      consentAt: new Date("2026-01-01T00:00:00.000Z"),
      idempotencyKey: "demo-candidate-request-1",
      status: "new",
      assignedOrganizationUnitId: pilotUnit.id,
      officerNote: null,
      archivedAt: null
    },
    create: {
      id: "00000000-0000-0000-0000-000000000012",
      firstName: "Demo",
      lastName: "Candidate",
      email: "candidate-request@example.test",
      country: "LV",
      city: "Riga",
      preferredLanguage: "en",
      message: "Demo candidate request for local Admin Lite review flows.",
      consentTextVersion: "candidate-request-v1",
      consentAt: new Date("2026-01-01T00:00:00.000Z"),
      idempotencyKey: "demo-candidate-request-1",
      status: "new",
      assignedOrganizationUnitId: pilotUnit.id
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

async function linkExternalIdentity(data) {
  await prisma.identityProviderAccount.upsert({
    where: {
      id: data.id
    },
    update: {
      userId: data.userId,
      provider: data.provider,
      providerSubject: data.providerSubject,
      email: data.email,
      emailVerified: data.emailVerified,
      displayName: data.displayName,
      revokedAt: null
    },
    create: data
  });
}

await main();
await prisma.$disconnect();
