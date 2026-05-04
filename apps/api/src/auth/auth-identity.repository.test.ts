import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { ExternalIdentity } from "@jp2/auth-provider";
import type { PrismaService } from "../database/prisma.service.js";
import { PrismaAuthIdentityRepository } from "./auth-identity.repository.js";

const activeUser = {
  id: "user-1",
  email: "brother@example.test",
  displayName: "Demo Brother",
  preferredLanguage: "en",
  status: "active" as const,
  roles: [{ role: "BROTHER" as const, revokedAt: null }],
  memberships: [
    {
      organizationUnitId: "organizationUnit-a",
      status: "active" as const,
      archivedAt: null
    }
  ],
  officerAssignments: []
};

describe("PrismaAuthIdentityRepository", () => {
  it("loads an existing provider link into a local principal and mirrors safe profile fields", async () => {
    const { prisma, accountUpdate, userUpdate } = fakePrisma({
      linkedAccount: {
        id: "account-1",
        userId: "user-1",
        user: activeUser
      }
    });
    const repository = new PrismaAuthIdentityRepository(prisma);

    await expect(repository.resolvePrincipal(identity())).resolves.toMatchObject({
      id: "user-1",
      email: "brother@example.test",
      roles: ["BROTHER"],
      memberOrganizationUnitIds: ["organizationUnit-a"]
    });
    expect(accountUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "account-1" }
      })
    );
    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" }
      })
    );
  });

  it("links a verified provider email to a pre-provisioned local user on first login", async () => {
    const { prisma, accountCreate } = fakePrisma({
      userByEmail: activeUser
    });
    const repository = new PrismaAuthIdentityRepository(prisma);

    await expect(repository.resolvePrincipal(identity())).resolves.toMatchObject({
      id: "user-1",
      roles: ["BROTHER"]
    });
    expect(accountCreate.mock.calls[0]?.[0].data).toMatchObject({
      userId: "user-1",
      provider: "firebase",
      providerSubject: "firebase-subject-1"
    });
  });

  it("rejects first login linking without a verified provider email", async () => {
    const repository = new PrismaAuthIdentityRepository(fakePrisma({}).prisma);

    await expect(
      repository.resolvePrincipal({
        ...identity(),
        emailVerified: false
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

interface FakePrismaOptions {
  linkedAccount?: {
    id: string;
    userId: string;
    user: typeof activeUser;
  };
  userByEmail?: typeof activeUser;
}

interface IdentityProviderAccountCreateInput {
  data: {
    userId: string;
    provider: string;
    providerSubject: string;
  };
}

interface IdentityProviderAccountUpdateInput {
  where: {
    id: string;
  };
}

interface UserUpdateInput {
  where: {
    id: string;
  };
}

function fakePrisma(options: FakePrismaOptions) {
  const accountUpdate = vi.fn<(input: IdentityProviderAccountUpdateInput) => Promise<object>>();
  const accountCreate = vi.fn<(input: IdentityProviderAccountCreateInput) => Promise<object>>();
  const userUpdate = vi.fn<(input: UserUpdateInput) => Promise<object>>();
  const prisma = {
    identityProviderAccount: {
      findFirst: vi
        .fn()
        .mockResolvedValueOnce(options.linkedAccount ?? null)
        .mockResolvedValueOnce(null),
      update: accountUpdate.mockResolvedValue({}),
      create: accountCreate.mockResolvedValue({})
    },
    user: {
      findFirst: vi.fn().mockResolvedValue(options.userByEmail ?? null),
      update: userUpdate.mockResolvedValue({})
    }
  } as unknown as PrismaService;

  return {
    prisma,
    accountUpdate,
    accountCreate,
    userUpdate
  };
}

function identity(): ExternalIdentity {
  return {
    provider: "firebase",
    subject: "firebase-subject-1",
    email: "brother@example.test",
    emailVerified: true,
    displayName: "Demo Brother",
    claims: {}
  };
}
