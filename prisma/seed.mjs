import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pilotChoragiew = await findOrCreateChoragiew({
    name: "Pilot Choragiew",
    city: "Riga",
    country: "LV",
    publicDescription: "Demo pilot choragiew for local development."
  });

  await findOrCreateChoragiew({
    name: "Second Scope Choragiew",
    city: "Warsaw",
    country: "PL",
    publicDescription: "Demo second choragiew for officer scope checks."
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
      choragiewId: pilotChoragiew.id,
      title: "Demo Officer",
      startsAt: new Date("2026-01-01T00:00:00.000Z"),
      createdBy: superAdmin.id
    }
  });
}

async function findOrCreateChoragiew(data) {
  const existing = await prisma.choragiew.findFirst({
    where: {
      name: data.name,
      city: data.city,
      archivedAt: null
    }
  });

  return (
    existing ??
    prisma.choragiew.create({
      data
    })
  );
}

await main();
await prisma.$disconnect();
