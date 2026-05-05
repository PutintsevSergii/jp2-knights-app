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
  candidateProfiles: [],
  memberships: [
    {
      organizationUnitId: "organizationUnit-a",
      status: "active" as const,
      archivedAt: null
    }
  ],
  officerAssignments: []
};

const activeCandidateUser = {
  ...activeUser,
  id: "candidate-user-1",
  email: "candidate@example.test",
  displayName: "Demo Candidate",
  roles: [{ role: "CANDIDATE" as const, revokedAt: null }],
  candidateProfiles: [
    {
      assignedOrganizationUnitId: "organizationUnit-candidate",
      status: "active" as const,
      archivedAt: null
    }
  ],
  memberships: []
};

interface FakePrincipalUser {
  id: string;
  email: string;
  displayName: string;
  preferredLanguage: string | null;
  status: "active" | "inactive" | "invited" | "archived";
  roles: readonly { role: "CANDIDATE" | "BROTHER" | "OFFICER" | "SUPER_ADMIN"; revokedAt: Date | null }[];
  candidateProfiles: readonly {
    assignedOrganizationUnitId: string | null;
    status: "active" | "paused" | "converted_to_brother" | "archived";
    archivedAt: Date | null;
  }[];
  memberships: readonly {
    organizationUnitId: string;
    status: "active" | "inactive" | "archived";
    archivedAt: Date | null;
  }[];
  officerAssignments: readonly {
    organizationUnitId: string;
    endsAt: Date | null;
  }[];
}

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

  it("creates a pending idle approval review before exposing a pre-provisioned local user", async () => {
    const { prisma, accountCreate, reviewCreate } = fakePrisma({
      userByEmail: activeUser
    });
    const repository = new PrismaAuthIdentityRepository(prisma);

    await expect(repository.resolvePrincipal(identity())).resolves.toMatchObject({
      id: "user-1",
      roles: [],
      approval: {
        state: "pending",
        scopeOrganizationUnitId: "organizationUnit-a"
      }
    });
    expect(accountCreate.mock.calls[0]?.[0].data).toMatchObject({
      userId: "user-1",
      provider: "firebase",
      providerSubject: "firebase-subject-1"
    });
    expect(reviewCreate.mock.calls[0]?.[0].data).toMatchObject({
      userId: "user-1",
      requestedRole: "BROTHER",
      scopeOrganizationUnitId: "organizationUnit-a",
      status: "pending"
    });
  });

  it("creates an idle local identity for a verified Firebase user without a local account", async () => {
    const { prisma, userCreate, reviewCreate } = fakePrisma({});
    const repository = new PrismaAuthIdentityRepository(prisma);

    await expect(repository.resolvePrincipal(identity())).resolves.toMatchObject({
      email: "brother@example.test",
      status: "invited",
      roles: [],
      approval: {
        state: "pending"
      }
    });
    expect(userCreate.mock.calls[0]?.[0].data).toMatchObject({
      email: "brother@example.test",
      status: "invited"
    });
    expect(reviewCreate).toHaveBeenCalled();
  });

  it("keeps an existing linked pending identity public-only", async () => {
    const { prisma } = fakePrisma({
      linkedAccount: {
        id: "account-3",
        userId: "user-1",
        user: activeUser
      },
      pendingReview: {
        id: "review-1",
        status: "pending",
        expiresAt: new Date("2026-06-04T08:00:00.000Z"),
        scopeOrganizationUnitId: "organizationUnit-a"
      }
    });
    const repository = new PrismaAuthIdentityRepository(prisma);

    await expect(repository.resolvePrincipal(identity())).resolves.toMatchObject({
      id: "user-1",
      roles: [],
      approval: {
        state: "pending",
        scopeOrganizationUnitId: "organizationUnit-a"
      }
    });
  });

  it("loads active candidate profile scope into the local principal", async () => {
    const { prisma } = fakePrisma({
      linkedAccount: {
        id: "account-2",
        userId: "candidate-user-1",
        user: activeCandidateUser
      }
    });
    const repository = new PrismaAuthIdentityRepository(prisma);

    await expect(repository.resolvePrincipal(identity())).resolves.toMatchObject({
      id: "candidate-user-1",
      roles: ["CANDIDATE"],
      candidateOrganizationUnitId: "organizationUnit-candidate"
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
    user: FakePrincipalUser;
  };
  userByEmail?: FakePrincipalUser;
  pendingReview?: FakeReview;
}

interface IdentityProviderAccountCreateInput {
  data: {
    userId: string;
    provider: string;
    providerSubject: string;
  };
}

interface IdentityAccessReviewCreateInput {
  data: {
    userId: string;
    providerAccountId: string;
    status: "pending";
    scopeOrganizationUnitId: string | null;
    requestedRole: "CANDIDATE" | "BROTHER" | "OFFICER" | "SUPER_ADMIN" | null;
  };
}

interface UserCreateInput {
  data: {
    email: string;
    status: "invited";
  };
}

interface FakeReview {
  id: string;
  status: "pending" | "rejected" | "expired";
  expiresAt: Date;
  scopeOrganizationUnitId: string | null;
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
  const userCreate = vi.fn<(input: UserCreateInput) => Promise<FakePrincipalUser>>();
  const reviewCreate = vi.fn<(input: IdentityAccessReviewCreateInput) => Promise<FakeReview>>();
  const prisma = {
    identityProviderAccount: {
      findFirst: vi
        .fn()
        .mockResolvedValueOnce(options.linkedAccount ?? null)
        .mockResolvedValueOnce(null),
      update: accountUpdate.mockResolvedValue({}),
      create: accountCreate.mockResolvedValue({ id: "account-created-1" })
    },
    identityAccessReview: {
      findFirst: vi
        .fn()
        .mockResolvedValueOnce(options.pendingReview ?? null)
        .mockResolvedValueOnce(null),
      create: reviewCreate.mockResolvedValue({
        id: "review-created-1",
        status: "pending",
        expiresAt: new Date("2026-06-04T08:00:00.000Z"),
        scopeOrganizationUnitId: options.userByEmail ? "organizationUnit-a" : null
      }),
      update: vi.fn()
    },
    user: {
      findFirst: vi.fn().mockResolvedValue(options.userByEmail ?? null),
      create: userCreate.mockResolvedValue({
        ...activeUser,
        id: "idle-user-1",
        status: "invited",
        roles: [],
        memberships: [],
        candidateProfiles: [],
        officerAssignments: []
      }),
      update: userUpdate.mockResolvedValue({})
    }
  } as unknown as PrismaService;

  return {
    prisma,
    accountUpdate,
    accountCreate,
    reviewCreate,
    userCreate,
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
