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
