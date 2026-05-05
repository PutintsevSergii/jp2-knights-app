import { ForbiddenException, Injectable } from "@nestjs/common";
import type { ExternalIdentity } from "@jp2/auth-provider";
import { PrismaService } from "../database/prisma.service.js";
import type { CurrentUserApproval, CurrentUserPrincipal } from "./current-user.types.js";

export abstract class AuthIdentityRepository {
  abstract resolvePrincipal(identity: ExternalIdentity): Promise<CurrentUserPrincipal>;
}

@Injectable()
export class PrismaAuthIdentityRepository implements AuthIdentityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async resolvePrincipal(identity: ExternalIdentity): Promise<CurrentUserPrincipal> {
    const linkedPrincipal = await this.resolveLinkedPrincipal(identity);

    if (linkedPrincipal) {
      return linkedPrincipal;
    }

    return this.createOrLinkIdlePrincipal(identity);
  }

  private async resolveLinkedPrincipal(
    identity: ExternalIdentity
  ): Promise<CurrentUserPrincipal | null> {
    const account = await this.prisma.identityProviderAccount.findFirst({
      where: {
        provider: identity.provider,
        providerSubject: identity.subject,
        revokedAt: null
      },
      include: principalUserInclude
    });

    if (!account) {
      return null;
    }

    await this.prisma.identityProviderAccount.update({
      where: { id: account.id },
      data: providerMirrorUpdate(identity)
    });

    await this.prisma.user.update({
      where: { id: account.userId },
      data: { lastLoginAt: new Date() }
    });

    const approval = await this.loadProviderApproval(account.id);

    if (approval) {
      return toPublicOnlyPrincipal(account.user, approval);
    }

    if (!hasApprovedAppAccess(account.user)) {
      const pendingApproval = await this.ensurePendingReview({
        providerAccountId: account.id,
        user: account.user
      });

      return toPublicOnlyPrincipal(account.user, pendingApproval);
    }

    return toPrincipal(account.user);
  }

  private async createOrLinkIdlePrincipal(identity: ExternalIdentity): Promise<CurrentUserPrincipal> {
    if (!identity.email || identity.emailVerified !== true) {
      throw new ForbiddenException("Verified provider email is required for first login.");
    }

    const existingAccount = await this.prisma.identityProviderAccount.findFirst({
      where: {
        provider: identity.provider,
        providerSubject: identity.subject
      }
    });

    if (existingAccount) {
      throw new ForbiddenException("The provider account link is revoked.");
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: identity.email,
        archivedAt: null
      },
      include: principalRelationsInclude
    });

    const user =
      existingUser ??
      (await this.prisma.user.create({
        data: {
          email: identity.email,
          displayName: identity.displayName ?? identity.email,
          phone: identity.phoneNumber ?? null,
          status: "invited",
          preferredLanguage: null
        },
        include: principalRelationsInclude
      }));

    const account = await this.prisma.identityProviderAccount.create({
      data: {
        userId: user.id,
        provider: identity.provider,
        providerSubject: identity.subject,
        ...providerMirrorUpdate(identity)
      }
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const approval = await this.ensurePendingReview({
      providerAccountId: account.id,
      user
    });

    return toPublicOnlyPrincipal(user, approval);
  }

  private async loadProviderApproval(
    providerAccountId: string
  ): Promise<CurrentUserApproval | null> {
    const review = await this.prisma.identityAccessReview.findFirst({
      where: {
        providerAccountId,
        status: {
          in: ["pending", "rejected", "expired"]
        }
      },
      orderBy: [{ createdAt: "desc" }]
    });

    if (!review) {
      return null;
    }

    if (review.status === "pending" && review.expiresAt <= new Date()) {
      const expired = await this.prisma.identityAccessReview.update({
        where: { id: review.id },
        data: {
          status: "expired",
          decidedAt: new Date(),
          decisionNote: review.decisionNote ?? "Expired after 30 days without approval."
        }
      });

      return toApproval(expired);
    }

    return toApproval(review);
  }

  private async ensurePendingReview(input: {
    providerAccountId: string;
    user: PrincipalUserRecord;
  }): Promise<CurrentUserApproval> {
    const existing = await this.prisma.identityAccessReview.findFirst({
      where: {
        providerAccountId: input.providerAccountId,
        status: "pending"
      },
      orderBy: [{ createdAt: "desc" }]
    });

    if (existing) {
      if (existing.expiresAt <= new Date()) {
        const expired = await this.prisma.identityAccessReview.update({
          where: { id: existing.id },
          data: {
            status: "expired",
            decidedAt: new Date(),
            decisionNote: existing.decisionNote ?? "Expired after 30 days without approval."
          }
        });

        return toApproval(expired);
      }

      return toApproval(existing);
    }

    const created = await this.prisma.identityAccessReview.create({
      data: {
        providerAccountId: input.providerAccountId,
        userId: input.user.id,
        status: "pending",
        scopeOrganizationUnitId: inferredScopeOrganizationUnitId(input.user),
        requestedRole: inferredRequestedRole(input.user),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    return toApproval(created);
  }
}

const principalRelationsInclude = {
  roles: true,
  memberships: true,
  candidateProfiles: true,
  officerAssignments: true
} as const;

const principalUserInclude = {
  user: {
    include: principalRelationsInclude
  }
} as const;

interface PrincipalUserRecord {
  id: string;
  email: string;
  displayName: string;
  preferredLanguage: string | null;
  status: "active" | "inactive" | "invited" | "archived";
  roles: readonly {
    role: "CANDIDATE" | "BROTHER" | "OFFICER" | "SUPER_ADMIN";
    revokedAt: Date | null;
  }[];
  memberships: readonly {
    organizationUnitId: string;
    status: "active" | "inactive" | "archived";
    archivedAt: Date | null;
  }[];
  candidateProfiles: readonly {
    assignedOrganizationUnitId: string | null;
    status: "active" | "paused" | "converted_to_brother" | "archived";
    archivedAt: Date | null;
  }[];
  officerAssignments: readonly {
    organizationUnitId: string;
    endsAt: Date | null;
  }[];
}

function toPrincipal(user: PrincipalUserRecord): CurrentUserPrincipal {
  const now = new Date();

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    preferredLanguage: user.preferredLanguage,
    status: user.status,
    roles: user.roles.filter((role) => !role.revokedAt).map((role) => role.role),
    candidateOrganizationUnitId:
      user.candidateProfiles.find(
        (profile) => profile.status === "active" && !profile.archivedAt
      )?.assignedOrganizationUnitId ?? null,
    memberOrganizationUnitIds: user.memberships
      .filter((membership) => membership.status === "active" && !membership.archivedAt)
      .map((membership) => membership.organizationUnitId),
    officerOrganizationUnitIds: user.officerAssignments
      .filter((assignment) => !assignment.endsAt || assignment.endsAt >= now)
      .map((assignment) => assignment.organizationUnitId)
  };
}

function toPublicOnlyPrincipal(
  user: PrincipalUserRecord,
  approval: CurrentUserApproval
): CurrentUserPrincipal {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    preferredLanguage: user.preferredLanguage,
    status: user.status,
    roles: [],
    candidateOrganizationUnitId: null,
    memberOrganizationUnitIds: [],
    officerOrganizationUnitIds: [],
    approval
  };
}

function hasApprovedAppAccess(user: PrincipalUserRecord): boolean {
  return (
    user.status === "active" &&
    user.roles.some((role) => !role.revokedAt) &&
    user.roles.some((role) => role.role !== "SUPER_ADMIN" || !role.revokedAt)
  );
}

function inferredScopeOrganizationUnitId(user: PrincipalUserRecord): string | null {
  return (
    user.candidateProfiles.find((profile) => profile.status === "active" && !profile.archivedAt)
      ?.assignedOrganizationUnitId ??
    user.memberships.find((membership) => membership.status === "active" && !membership.archivedAt)
      ?.organizationUnitId ??
    user.officerAssignments.find((assignment) => !assignment.endsAt || assignment.endsAt >= new Date())
      ?.organizationUnitId ??
    null
  );
}

function inferredRequestedRole(user: PrincipalUserRecord) {
  return user.roles.find((role) => !role.revokedAt)?.role ?? null;
}

interface IdentityAccessReviewRecord {
  status: "pending" | "confirmed" | "rejected" | "expired";
  expiresAt: Date;
  scopeOrganizationUnitId: string | null;
}

function toApproval(review: IdentityAccessReviewRecord): CurrentUserApproval {
  if (review.status === "confirmed") {
    throw new Error("Confirmed identity access reviews do not produce idle approval state.");
  }

  return {
    state: review.status,
    expiresAt: review.expiresAt.toISOString(),
    scopeOrganizationUnitId: review.scopeOrganizationUnitId
  };
}

function providerMirrorUpdate(identity: ExternalIdentity) {
  return {
    email: identity.email ?? null,
    emailVerified: identity.emailVerified ?? null,
    phone: identity.phoneNumber ?? null,
    displayName: identity.displayName ?? null,
    photoUrl: identity.photoUrl ?? null,
    lastSignInAt: new Date()
  };
}
