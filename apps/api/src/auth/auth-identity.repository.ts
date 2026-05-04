import { ForbiddenException, Injectable } from "@nestjs/common";
import type { ExternalIdentity } from "@jp2/auth-provider";
import { PrismaService } from "../database/prisma.service.js";
import type { CurrentUserPrincipal } from "./current-user.types.js";

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

    return this.linkVerifiedEmailPrincipal(identity);
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

    return toPrincipal(account.user);
  }

  private async linkVerifiedEmailPrincipal(identity: ExternalIdentity): Promise<CurrentUserPrincipal> {
    if (!identity.email || identity.emailVerified !== true) {
      throw new ForbiddenException("Verified provider email is required for first login linking.");
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

    const user = await this.prisma.user.findFirst({
      where: {
        email: identity.email,
        archivedAt: null
      },
      include: principalRelationsInclude
    });

    if (!user) {
      throw new ForbiddenException("No local account is eligible for this provider identity.");
    }

    await this.prisma.identityProviderAccount.create({
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

    return toPrincipal(user);
  }
}

const principalRelationsInclude = {
  roles: true,
  memberships: true,
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
    candidateOrganizationUnitId: null,
    memberOrganizationUnitIds: user.memberships
      .filter((membership) => membership.status === "active" && !membership.archivedAt)
      .map((membership) => membership.organizationUnitId),
    officerOrganizationUnitIds: user.officerAssignments
      .filter((assignment) => !assignment.endsAt || assignment.endsAt >= now)
      .map((assignment) => assignment.organizationUnitId)
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
