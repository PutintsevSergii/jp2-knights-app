import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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
}

await main();
await prisma.$disconnect();
