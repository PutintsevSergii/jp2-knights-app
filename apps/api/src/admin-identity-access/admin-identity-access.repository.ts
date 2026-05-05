import { Injectable } from "@nestjs/common";
import type { Prisma, Role } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  AdminIdentityAccessReviewSummary,
  ConfirmIdentityAccessReview,
  RejectIdentityAccessReview
} from "./admin-identity-access.types.js";

export abstract class AdminIdentityAccessRepository {
  abstract listReviews(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminIdentityAccessReviewSummary[]>;
  abstract findReview(
    id: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminIdentityAccessReviewSummary | null>;
  abstract canApproveScope(userId: string, organizationUnitId: string): Promise<boolean>;
  abstract confirmReview(
    id: string,
    data: ConfirmIdentityAccessReview,
    actorUserId: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminIdentityAccessReviewSummary | null>;
  abstract rejectReview(
    id: string,
    data: RejectIdentityAccessReview,
    actorUserId: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminIdentityAccessReviewSummary | null>;
  abstract expirePendingReviews(now: Date): Promise<number>;
}

@Injectable()
export class PrismaAdminIdentityAccessRepository extends AdminIdentityAccessRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async listReviews(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminIdentityAccessReviewSummary[]> {
    await this.expirePendingReviews(new Date());

    const records = await this.prisma.identityAccessReview.findMany({
      where: scopedReviewWhere(scopeOrganizationUnitIds),
      include: reviewInclude,
      orderBy: [{ createdAt: "desc" }]
    });

    return records.map(toSummary);
  }

  async findReview(
    id: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminIdentityAccessReviewSummary | null> {
    await this.expirePendingReviews(new Date());

    const record = await this.prisma.identityAccessReview.findFirst({
      where: {
        ...scopedReviewWhere(scopeOrganizationUnitIds),
        id
      },
      include: reviewInclude
    });

    return record ? toSummary(record) : null;
  }

  async canApproveScope(userId: string, organizationUnitId: string): Promise<boolean> {
    const assignment = await this.prisma.identityAccessApproverAssignment.findFirst({
      where: {
        userId,
        organizationUnitId,
        revokedAt: null
      },
      select: { id: true }
    });

    return Boolean(assignment);
  }

  async confirmReview(
    id: string,
    data: ConfirmIdentityAccessReview,
    actorUserId: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminIdentityAccessReviewSummary | null> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.identityAccessReview.findFirst({
        where: {
          ...scopedReviewWhere(scopeOrganizationUnitIds),
          id,
          status: "pending"
        },
        include: reviewInclude
      });

      if (!existing) {
        return null;
      }

      await tx.user.update({
        where: { id: existing.userId },
        data: { status: "active" }
      });

      const existingRole = await tx.userRole.findFirst({
        where: {
          userId: existing.userId,
          role: data.assignedRole
        },
        select: { id: true }
      });

      if (existingRole) {
        await tx.userRole.update({
          where: { id: existingRole.id },
          data: { revokedAt: null }
        });
      } else {
        await tx.userRole.create({
          data: {
          userId: existing.userId,
          role: data.assignedRole,
          createdBy: actorUserId
          }
        });
      }

      await applyAssignedScope(tx, existing.userId, data, actorUserId);

      const updated = await tx.identityAccessReview.update({
        where: { id },
        data: {
          status: "confirmed",
          assignedRole: data.assignedRole,
          scopeOrganizationUnitId: data.organizationUnitId,
          decidedBy: actorUserId,
          decidedAt: new Date(),
          decisionNote: data.note ?? null
        },
        include: reviewInclude
      });

      return toSummary(updated);
    });
  }

  async rejectReview(
    id: string,
    data: RejectIdentityAccessReview,
    actorUserId: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminIdentityAccessReviewSummary | null> {
    const updated = await this.prisma.identityAccessReview.updateMany({
      where: {
        ...scopedReviewWhere(scopeOrganizationUnitIds),
        id,
        status: "pending"
      },
      data: {
        status: "rejected",
        decidedBy: actorUserId,
        decidedAt: new Date(),
        decisionNote: data.note ?? null
      }
    });

    if (updated.count === 0) {
      return null;
    }

    return this.findReview(id, scopeOrganizationUnitIds);
  }

  async expirePendingReviews(now: Date): Promise<number> {
    const result = await this.prisma.identityAccessReview.updateMany({
      where: {
        status: "pending",
        expiresAt: {
          lte: now
        }
      },
      data: {
        status: "expired",
        decidedAt: now,
        decisionNote: "Expired after 30 days without approval."
      }
    });

    return result.count;
  }
}

type TransactionClient = Prisma.TransactionClient;

async function applyAssignedScope(
  tx: TransactionClient,
  userId: string,
  data: ConfirmIdentityAccessReview,
  actorUserId: string
): Promise<void> {
  if (data.assignedRole === "CANDIDATE") {
    const existingProfile = await tx.candidateProfile.findFirst({
      where: {
        userId,
        status: "active",
        archivedAt: null
      },
      select: { id: true }
    });

    if (existingProfile) {
      await tx.candidateProfile.update({
        where: { id: existingProfile.id },
        data: { assignedOrganizationUnitId: data.organizationUnitId }
      });
    } else {
      await tx.candidateProfile.create({
        data: {
          userId,
          assignedOrganizationUnitId: data.organizationUnitId,
          status: "active"
        }
      });
    }
    return;
  }

  if (data.assignedRole === "BROTHER") {
    const existingMembership = await tx.membership.findFirst({
      where: {
        userId,
        organizationUnitId: data.organizationUnitId,
        status: "active",
        archivedAt: null
      },
      select: { id: true }
    });

    if (!existingMembership) {
      await tx.membership.create({
        data: {
          userId,
          organizationUnitId: data.organizationUnitId,
          status: "active"
        }
      });
    }
    return;
  }

  const existingOfficerAssignment = await tx.officerAssignment.findFirst({
    where: {
      userId,
      organizationUnitId: data.organizationUnitId,
      OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }]
    },
    select: { id: true }
  });

  if (!existingOfficerAssignment) {
    await tx.officerAssignment.create({
      data: {
        userId,
        organizationUnitId: data.organizationUnitId,
        startsAt: new Date(),
        createdBy: actorUserId
      }
    });
  }
}

export function scopedReviewWhere(
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.IdentityAccessReviewWhereInput {
  if (scopeOrganizationUnitIds === null) {
    return {};
  }

  return {
    scopeOrganizationUnitId: {
      in: [...scopeOrganizationUnitIds]
    }
  };
}

const reviewInclude = {
  user: {
    select: {
      displayName: true,
      email: true
    }
  },
  providerAccount: {
    select: {
      provider: true,
      providerSubject: true
    }
  },
  scopeUnit: {
    select: {
      name: true
    }
  }
} as const;

interface ReviewRecord {
  id: string;
  userId: string;
  status: "pending" | "confirmed" | "rejected" | "expired";
  scopeOrganizationUnitId: string | null;
  requestedRole: Role | null;
  assignedRole: Role | null;
  expiresAt: Date;
  decidedBy: string | null;
  decidedAt: Date | null;
  decisionNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    displayName: string;
    email: string;
  };
  providerAccount: {
    provider: string;
    providerSubject: string;
  };
  scopeUnit: {
    name: string;
  } | null;
}

function toSummary(record: ReviewRecord): AdminIdentityAccessReviewSummary {
  return {
    id: record.id,
    userId: record.userId,
    displayName: record.user.displayName,
    email: record.user.email,
    provider: record.providerAccount.provider,
    providerSubject: record.providerAccount.providerSubject,
    status: record.status,
    scopeOrganizationUnitId: record.scopeOrganizationUnitId,
    scopeOrganizationUnitName: record.scopeUnit?.name ?? null,
    requestedRole: record.requestedRole,
    assignedRole: record.assignedRole,
    expiresAt: record.expiresAt.toISOString(),
    decidedBy: record.decidedBy,
    decidedAt: record.decidedAt?.toISOString() ?? null,
    decisionNote: record.decisionNote,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}
