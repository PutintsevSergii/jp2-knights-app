import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import { mergeNotificationPreferenceRecords } from "../auth/notification-preference-settings.js";
import type { NotificationPreferenceSettings } from "../auth/auth-notification.types.js";
import type {
  AdminCandidateProfileDetail,
  AdminCandidateProfileBrotherMembership,
  AdminCandidateProfileDeviceTokenExport,
  AdminCandidateProfileEventParticipationExport,
  AdminCandidateProfileIdentityAccessReviewExport,
  AdminCandidateProfileMembershipExport,
  AdminCandidateProfileOfficerAssignmentExport,
  AdminCandidateProfileProviderAccountExport,
  AdminCandidateProfileRoadmapAssignmentExport,
  AdminCandidateProfileSummary,
  AdminCandidateProfileUserRoleExport,
  ConvertCandidateProfileToBrother,
  UpdateAdminCandidateProfile
} from "./admin-candidate.types.js";

export abstract class AdminCandidateRepository {
  abstract listCandidateProfiles(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateProfileSummary[]>;
  abstract findCandidateProfile(
    id: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateProfileDetail | null>;
  abstract findCandidateProfileForExport(id: string): Promise<AdminCandidateProfileDetail | null>;
  abstract listProviderAccountsForUser(
    userId: string
  ): Promise<AdminCandidateProfileProviderAccountExport[]>;
  abstract listDeviceTokensForUser(userId: string): Promise<AdminCandidateProfileDeviceTokenExport[]>;
  abstract listUserRolesForUser(userId: string): Promise<AdminCandidateProfileUserRoleExport[]>;
  abstract listIdentityAccessReviewsForUser(
    userId: string
  ): Promise<AdminCandidateProfileIdentityAccessReviewExport[]>;
  abstract listMembershipsForUser(userId: string): Promise<AdminCandidateProfileMembershipExport[]>;
  abstract listOfficerAssignmentsForUser(
    userId: string
  ): Promise<AdminCandidateProfileOfficerAssignmentExport[]>;
  abstract listRoadmapAssignmentsForUser(
    userId: string
  ): Promise<AdminCandidateProfileRoadmapAssignmentExport[]>;
  abstract listEventParticipationsForUser(
    userId: string
  ): Promise<AdminCandidateProfileEventParticipationExport[]>;
  abstract findNotificationPreferencesForUser(
    userId: string
  ): Promise<NotificationPreferenceSettings>;
  abstract candidateProfileUserHasActiveNonCandidateAccess(
    userId: string,
    asOf: Date
  ): Promise<boolean>;
  abstract eraseCandidateProfile(
    id: string,
    erasedAt: Date
  ): Promise<AdminCandidateProfileDetail | null>;
  abstract convertCandidateProfileToBrother(
    id: string,
    data: ConvertCandidateProfileToBrother,
    actorUserId: string,
    convertedAt: Date,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<{
    candidateProfile: AdminCandidateProfileDetail;
    membership: AdminCandidateProfileBrotherMembership;
  } | null>;
  abstract updateCandidateProfile(
    id: string,
    data: UpdateAdminCandidateProfile,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateProfileDetail | null>;
}

@Injectable()
export class PrismaAdminCandidateRepository extends AdminCandidateRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async listCandidateProfiles(
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateProfileSummary[]> {
    const records = await this.prisma.candidateProfile.findMany({
      where: scopedCandidateProfileWhere(scopeOrganizationUnitIds),
      include: candidateProfileInclude,
      orderBy: [{ updatedAt: "desc" }]
    });

    return records.map(toAdminCandidateProfile);
  }

  async findCandidateProfile(
    id: string,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateProfileDetail | null> {
    const record = await this.prisma.candidateProfile.findFirst({
      where: {
        ...scopedCandidateProfileWhere(scopeOrganizationUnitIds),
        id
      },
      include: candidateProfileInclude
    });

    return record ? toAdminCandidateProfile(record) : null;
  }

  async findCandidateProfileForExport(id: string): Promise<AdminCandidateProfileDetail | null> {
    const record = await this.prisma.candidateProfile.findUnique({
      where: { id },
      include: candidateProfileInclude
    });

    return record ? toAdminCandidateProfile(record) : null;
  }

  async listProviderAccountsForUser(
    userId: string
  ): Promise<AdminCandidateProfileProviderAccountExport[]> {
    const records = await this.prisma.identityProviderAccount.findMany({
      where: { userId },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        provider: true,
        providerSubject: true,
        email: true,
        emailVerified: true,
        phone: true,
        displayName: true,
        photoUrl: true,
        lastSignInAt: true,
        createdAt: true,
        updatedAt: true,
        revokedAt: true
      }
    });

    return records.map(toProviderAccountExport);
  }

  async listDeviceTokensForUser(userId: string): Promise<AdminCandidateProfileDeviceTokenExport[]> {
    const records = await this.prisma.deviceToken.findMany({
      where: { userId },
      orderBy: [{ lastSeenAt: "desc" }],
      select: {
        id: true,
        platform: true,
        lastSeenAt: true,
        createdAt: true,
        updatedAt: true,
        revokedAt: true
      }
    });

    return records.map(toDeviceTokenExport);
  }

  async listUserRolesForUser(userId: string): Promise<AdminCandidateProfileUserRoleExport[]> {
    const records = await this.prisma.userRole.findMany({
      where: { userId },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        role: true,
        createdBy: true,
        createdAt: true,
        revokedAt: true
      }
    });

    return records.map(toUserRoleExport);
  }

  async listIdentityAccessReviewsForUser(
    userId: string
  ): Promise<AdminCandidateProfileIdentityAccessReviewExport[]> {
    const records = await this.prisma.identityAccessReview.findMany({
      where: { userId },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        providerAccountId: true,
        status: true,
        scopeOrganizationUnitId: true,
        requestedRole: true,
        assignedRole: true,
        expiresAt: true,
        decidedBy: true,
        decidedAt: true,
        decisionNote: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return records.map(toIdentityAccessReviewExport);
  }

  async listMembershipsForUser(userId: string): Promise<AdminCandidateProfileMembershipExport[]> {
    const records = await this.prisma.membership.findMany({
      where: { userId },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        organizationUnitId: true,
        status: true,
        currentDegree: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
        archivedAt: true
      }
    });

    return records.map(toMembershipExport);
  }

  async listOfficerAssignmentsForUser(
    userId: string
  ): Promise<AdminCandidateProfileOfficerAssignmentExport[]> {
    const records = await this.prisma.officerAssignment.findMany({
      where: { userId },
      orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        organizationUnitId: true,
        title: true,
        startsAt: true,
        endsAt: true,
        createdBy: true,
        createdAt: true
      }
    });

    return records.map(toOfficerAssignmentExport);
  }

  async listRoadmapAssignmentsForUser(
    userId: string
  ): Promise<AdminCandidateProfileRoadmapAssignmentExport[]> {
    const records = await this.prisma.roadmapAssignment.findMany({
      where: { userId },
      orderBy: [{ assignedAt: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        roadmapDefinitionId: true,
        roadmapDefinition: {
          select: {
            targetRole: true,
            status: true
          }
        },
        organizationUnitId: true,
        status: true,
        assignedBy: true,
        assignedAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        archivedAt: true,
        submissions: {
          select: {
            status: true
          }
        }
      }
    });

    return records.map(toRoadmapAssignmentExport);
  }

  async listEventParticipationsForUser(
    userId: string
  ): Promise<AdminCandidateProfileEventParticipationExport[]> {
    const records = await this.prisma.eventParticipation.findMany({
      where: { userId },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        eventId: true,
        intentStatus: true,
        createdAt: true,
        updatedAt: true,
        cancelledAt: true,
        event: {
          select: {
            title: true,
            type: true,
            visibility: true,
            status: true,
            targetOrganizationUnitId: true,
            startAt: true,
            endAt: true
          }
        }
      }
    });

    return records.map(toEventParticipationExport);
  }

  async findNotificationPreferencesForUser(
    userId: string
  ): Promise<NotificationPreferenceSettings> {
    const records = await this.prisma.notificationPreference.findMany({
      where: { userId }
    });

    return mergeNotificationPreferenceRecords(records);
  }

  async candidateProfileUserHasActiveNonCandidateAccess(
    userId: string,
    asOf: Date
  ): Promise<boolean> {
    const [role, membership, officerAssignment] = await Promise.all([
      this.prisma.userRole.findFirst({
        where: {
          userId,
          role: { in: ["BROTHER", "OFFICER", "SUPER_ADMIN"] },
          revokedAt: null
        },
        select: { id: true }
      }),
      this.prisma.membership.findFirst({
        where: {
          userId,
          status: "active",
          archivedAt: null
        },
        select: { id: true }
      }),
      this.prisma.officerAssignment.findFirst({
        where: {
          userId,
          OR: [{ endsAt: null }, { endsAt: { gte: asOf } }]
        },
        select: { id: true }
      })
    ]);

    return Boolean(role || membership || officerAssignment);
  }

  async eraseCandidateProfile(
    id: string,
    erasedAt: Date
  ): Promise<AdminCandidateProfileDetail | null> {
    const existing = await this.prisma.candidateProfile.findUnique({
      where: { id },
      select: { id: true, userId: true }
    });

    if (!existing) {
      return null;
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.userRole.updateMany({
        where: {
          userId: existing.userId,
          role: "CANDIDATE",
          revokedAt: null
        },
        data: {
          revokedAt: erasedAt
        }
      });
      await tx.identityProviderAccount.updateMany({
        where: {
          userId: existing.userId,
          revokedAt: null
        },
        data: {
          provider: "erased",
          providerSubject: erasedCandidateProfileProviderSubject(id),
          email: null,
          emailVerified: null,
          phone: null,
          displayName: null,
          photoUrl: null,
          revokedAt: erasedAt
        }
      });
      await tx.deviceToken.updateMany({
        where: {
          userId: existing.userId,
          revokedAt: null
        },
        data: {
          revokedAt: erasedAt
        }
      });
      await tx.notificationPreference.deleteMany({
        where: {
          userId: existing.userId
        }
      });
      await tx.user.update({
        where: { id: existing.userId },
        data: {
          email: erasedCandidateProfileEmail(id),
          phone: null,
          displayName: "Erased candidate",
          preferredLanguage: null,
          status: "archived",
          archivedAt: erasedAt
        }
      });
      await tx.candidateProfile.updateMany({
        where: {
          userId: existing.userId,
          status: { in: ["active", "paused"] }
        },
        data: {
          status: "archived",
          archivedAt: erasedAt
        }
      });

      const record = await tx.candidateProfile.findUnique({
        where: { id },
        include: candidateProfileInclude
      });

      return record ? toAdminCandidateProfile(record) : null;
    });
  }

  async updateCandidateProfile(
    id: string,
    data: UpdateAdminCandidateProfile,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<AdminCandidateProfileDetail | null> {
    const existing = await this.prisma.candidateProfile.findFirst({
      where: {
        ...scopedCandidateProfileWhere(scopeOrganizationUnitIds),
        id
      },
      select: { id: true }
    });

    if (!existing) {
      return null;
    }

    const updateData: Prisma.CandidateProfileUncheckedUpdateInput = {};

    if (data.status !== undefined) {
      updateData.status = data.status;
      updateData.archivedAt = data.status === "archived" ? new Date() : null;
    }
    if (data.assignedOrganizationUnitId !== undefined) {
      updateData.assignedOrganizationUnitId = data.assignedOrganizationUnitId;
    }
    if (data.responsibleOfficerId !== undefined) {
      updateData.responsibleOfficerId = data.responsibleOfficerId;
    }

    const record = await this.prisma.candidateProfile.update({
      where: { id },
      data: updateData,
      include: candidateProfileInclude
    });

    return toAdminCandidateProfile(record);
  }

  async convertCandidateProfileToBrother(
    id: string,
    data: ConvertCandidateProfileToBrother,
    actorUserId: string,
    convertedAt: Date,
    scopeOrganizationUnitIds: readonly string[] | null
  ): Promise<{
    candidateProfile: AdminCandidateProfileDetail;
    membership: AdminCandidateProfileBrotherMembership;
  } | null> {
    const existing = await this.prisma.candidateProfile.findFirst({
      where: {
        ...scopedCandidateProfileWhere(scopeOrganizationUnitIds),
        id
      },
      select: {
        id: true,
        userId: true,
        assignedOrganizationUnitId: true
      }
    });

    if (!existing || !existing.assignedOrganizationUnitId) {
      return null;
    }
    const organizationUnitId = existing.assignedOrganizationUnitId;

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existing.userId },
        data: { status: "active" }
      });
      await tx.userRole.updateMany({
        where: {
          userId: existing.userId,
          role: "CANDIDATE",
          revokedAt: null
        },
        data: {
          revokedAt: convertedAt
        }
      });

      const existingBrotherRole = await tx.userRole.findFirst({
        where: {
          userId: existing.userId,
          role: "BROTHER",
          revokedAt: null
        },
        select: { id: true }
      });

      if (!existingBrotherRole) {
        await tx.userRole.create({
          data: {
            userId: existing.userId,
            role: "BROTHER",
            createdBy: actorUserId
          }
        });
      }

      const membershipData = {
        status: "active" as const,
        ...(data.currentDegree !== undefined ? { currentDegree: data.currentDegree } : {}),
        joinedAt: data.joinedAt ? new Date(`${data.joinedAt}T00:00:00.000Z`) : convertedAt,
        archivedAt: null
      };
      const existingMembership = await tx.membership.findFirst({
        where: {
          userId: existing.userId,
          organizationUnitId
        },
        orderBy: [{ createdAt: "asc" }],
        select: { id: true }
      });

      const membership = existingMembership
        ? await tx.membership.update({
            where: { id: existingMembership.id },
            data: membershipData
          })
        : await tx.membership.create({
            data: {
              userId: existing.userId,
              organizationUnitId,
              ...membershipData
            }
          });

      const candidateProfile = await tx.candidateProfile.update({
        where: { id },
        data: {
          status: "converted_to_brother",
          archivedAt: null
        },
        include: candidateProfileInclude
      });

      return {
        candidateProfile: toAdminCandidateProfile(candidateProfile),
        membership: toBrotherMembership(membership)
      };
    });
  }
}

type CandidateProfileRecord = {
  id: string;
  userId: string;
  candidateRequestId: string | null;
  assignedOrganizationUnitId: string | null;
  assignedOrganizationUnit: { name: string } | null;
  responsibleOfficerId: string | null;
  responsibleOfficer: { displayName: string } | null;
  status: "active" | "paused" | "converted_to_brother" | "archived";
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  user: {
    displayName: string;
    email: string;
    preferredLanguage: string | null;
  };
};

type ProviderAccountExportRecord = {
  id: string;
  provider: string;
  providerSubject: string;
  email: string | null;
  emailVerified: boolean | null;
  phone: string | null;
  displayName: string | null;
  photoUrl: string | null;
  lastSignInAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  revokedAt: Date | null;
};

type DeviceTokenExportRecord = {
  id: string;
  platform: string;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
  revokedAt: Date | null;
};

type UserRoleExportRecord = {
  id: string;
  role: string;
  createdBy: string | null;
  createdAt: Date;
  revokedAt: Date | null;
};

type IdentityAccessReviewExportRecord = {
  id: string;
  providerAccountId: string;
  status: "pending" | "confirmed" | "rejected" | "expired";
  scopeOrganizationUnitId: string | null;
  requestedRole: string | null;
  assignedRole: string | null;
  expiresAt: Date;
  decidedBy: string | null;
  decidedAt: Date | null;
  decisionNote: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type MembershipExportRecord = {
  id: string;
  organizationUnitId: string;
  status: "active" | "archived" | "inactive";
  currentDegree: string | null;
  joinedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

type BrotherMembershipRecord = MembershipExportRecord & {
  userId: string;
};

type OfficerAssignmentExportRecord = {
  id: string;
  organizationUnitId: string;
  title: string | null;
  startsAt: Date;
  endsAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
};

type RoadmapAssignmentExportRecord = {
  id: string;
  roadmapDefinitionId: string;
  roadmapDefinition: {
    targetRole: string;
    status: "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
  };
  organizationUnitId: string | null;
  status: "active" | "completed" | "archived";
  assignedBy: string | null;
  assignedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  submissions: readonly {
    status: string;
  }[];
};

type EventParticipationExportRecord = {
  id: string;
  eventId: string;
  intentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt: Date | null;
  event: {
    title: string;
    type: string;
    visibility: string;
    status: string;
    targetOrganizationUnitId: string | null;
    startAt: Date;
    endAt: Date | null;
  };
};

const candidateProfileInclude = {
  user: {
    select: {
      displayName: true,
      email: true,
      preferredLanguage: true
    }
  },
  assignedOrganizationUnit: {
    select: {
      name: true
    }
  },
  responsibleOfficer: {
    select: {
      displayName: true
    }
  }
} as const;

export function scopedCandidateProfileWhere(
  scopeOrganizationUnitIds: readonly string[] | null
): Prisma.CandidateProfileWhereInput {
  const activeWhere: Prisma.CandidateProfileWhereInput = {
    archivedAt: null
  };

  if (scopeOrganizationUnitIds === null) {
    return activeWhere;
  }

  return {
    ...activeWhere,
    assignedOrganizationUnitId: {
      in: [...scopeOrganizationUnitIds]
    }
  };
}

function toAdminCandidateProfile(record: CandidateProfileRecord): AdminCandidateProfileDetail {
  return {
    id: record.id,
    userId: record.userId,
    candidateRequestId: record.candidateRequestId,
    displayName: record.user.displayName,
    email: record.user.email,
    preferredLanguage: record.user.preferredLanguage,
    assignedOrganizationUnitId: record.assignedOrganizationUnitId,
    assignedOrganizationUnitName: record.assignedOrganizationUnit?.name ?? null,
    responsibleOfficerId: record.responsibleOfficerId,
    responsibleOfficerName: record.responsibleOfficer?.displayName ?? null,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    archivedAt: record.archivedAt?.toISOString() ?? null
  };
}

function toProviderAccountExport(
  record: ProviderAccountExportRecord
): AdminCandidateProfileProviderAccountExport {
  return {
    id: record.id,
    provider: record.provider,
    providerSubject: record.providerSubject,
    email: record.email,
    emailVerified: record.emailVerified,
    phone: record.phone,
    displayName: record.displayName,
    photoUrl: record.photoUrl,
    lastSignInAt: record.lastSignInAt ? record.lastSignInAt.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    revokedAt: record.revokedAt ? record.revokedAt.toISOString() : null
  };
}

function toDeviceTokenExport(record: DeviceTokenExportRecord): AdminCandidateProfileDeviceTokenExport {
  return {
    id: record.id,
    platform: toDeviceTokenPlatform(record.platform),
    lastSeenAt: record.lastSeenAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    revokedAt: record.revokedAt ? record.revokedAt.toISOString() : null
  };
}

function toUserRoleExport(record: UserRoleExportRecord): AdminCandidateProfileUserRoleExport {
  return {
    id: record.id,
    role: toRole(record.role),
    createdBy: record.createdBy,
    createdAt: record.createdAt.toISOString(),
    revokedAt: record.revokedAt ? record.revokedAt.toISOString() : null
  };
}

function toIdentityAccessReviewExport(
  record: IdentityAccessReviewExportRecord
): AdminCandidateProfileIdentityAccessReviewExport {
  return {
    id: record.id,
    providerAccountId: record.providerAccountId,
    status: record.status,
    scopeOrganizationUnitId: record.scopeOrganizationUnitId,
    requestedRole: record.requestedRole ? toRole(record.requestedRole) : null,
    assignedRole: record.assignedRole ? toRole(record.assignedRole) : null,
    expiresAt: record.expiresAt.toISOString(),
    decidedBy: record.decidedBy,
    decidedAt: record.decidedAt ? record.decidedAt.toISOString() : null,
    decisionNote: record.decisionNote,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function toMembershipExport(record: MembershipExportRecord): AdminCandidateProfileMembershipExport {
  return {
    id: record.id,
    organizationUnitId: record.organizationUnitId,
    status: record.status,
    currentDegree: record.currentDegree,
    joinedAt: record.joinedAt ? toDateOnly(record.joinedAt) : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null
  };
}

function toBrotherMembership(record: BrotherMembershipRecord): AdminCandidateProfileBrotherMembership {
  return {
    id: record.id,
    userId: record.userId,
    organizationUnitId: record.organizationUnitId,
    status: record.status,
    currentDegree: record.currentDegree,
    joinedAt: record.joinedAt ? toDateOnly(record.joinedAt) : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null
  };
}

function toOfficerAssignmentExport(
  record: OfficerAssignmentExportRecord
): AdminCandidateProfileOfficerAssignmentExport {
  return {
    id: record.id,
    organizationUnitId: record.organizationUnitId,
    title: record.title,
    startsAt: toDateOnly(record.startsAt),
    endsAt: record.endsAt ? toDateOnly(record.endsAt) : null,
    createdBy: record.createdBy,
    createdAt: record.createdAt.toISOString()
  };
}

function toRoadmapAssignmentExport(
  record: RoadmapAssignmentExportRecord
): AdminCandidateProfileRoadmapAssignmentExport {
  return {
    id: record.id,
    roadmapDefinitionId: record.roadmapDefinitionId,
    roadmapTargetRole: toRoadmapTargetRole(record.roadmapDefinition.targetRole),
    roadmapStatus: record.roadmapDefinition.status,
    organizationUnitId: record.organizationUnitId,
    status: record.status,
    assignedByUserId: record.assignedBy,
    assignedAt: record.assignedAt.toISOString(),
    completedAt: record.completedAt ? record.completedAt.toISOString() : null,
    submissionCount: record.submissions.length,
    pendingSubmissionCount: record.submissions.filter(
      (submission) => submission.status === "pending_review"
    ).length,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null
  };
}

function toEventParticipationExport(
  record: EventParticipationExportRecord
): AdminCandidateProfileEventParticipationExport {
  return {
    id: record.id,
    eventId: record.eventId,
    eventTitle: record.event.title,
    eventType: record.event.type,
    eventVisibility: toVisibility(record.event.visibility),
    eventStatus: toEventStatus(record.event.status),
    eventTargetOrganizationUnitId: record.event.targetOrganizationUnitId,
    eventStartAt: record.event.startAt.toISOString(),
    eventEndAt: record.event.endAt ? record.event.endAt.toISOString() : null,
    intentStatus: toParticipationStatus(record.intentStatus),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    cancelledAt: record.cancelledAt ? record.cancelledAt.toISOString() : null
  };
}

function toRole(value: string): AdminCandidateProfileUserRoleExport["role"] {
  if (
    value === "CANDIDATE" ||
    value === "BROTHER" ||
    value === "OFFICER" ||
    value === "SUPER_ADMIN"
  ) {
    return value;
  }

  throw new Error("Repository returned an unknown user role.");
}

function toRoadmapTargetRole(
  value: string
): AdminCandidateProfileRoadmapAssignmentExport["roadmapTargetRole"] {
  if (value === "CANDIDATE" || value === "BROTHER") {
    return value;
  }

  throw new Error("Repository returned an unknown roadmap target role.");
}

function toDeviceTokenPlatform(value: string): AdminCandidateProfileDeviceTokenExport["platform"] {
  if (value === "ios" || value === "android" || value === "web") {
    return value;
  }

  throw new Error("Repository returned an unknown device token platform.");
}

function toVisibility(value: string): AdminCandidateProfileEventParticipationExport["eventVisibility"] {
  if (
    value === "PUBLIC" ||
    value === "FAMILY_OPEN" ||
    value === "CANDIDATE" ||
    value === "BROTHER" ||
    value === "ORGANIZATION_UNIT" ||
    value === "OFFICER" ||
    value === "ADMIN"
  ) {
    return value;
  }

  throw new Error("Repository returned an unknown event visibility.");
}

function toEventStatus(value: string): AdminCandidateProfileEventParticipationExport["eventStatus"] {
  if (value === "draft" || value === "published" || value === "cancelled" || value === "archived") {
    return value;
  }

  throw new Error("Repository returned an unknown event status.");
}

function toParticipationStatus(
  value: string
): AdminCandidateProfileEventParticipationExport["intentStatus"] {
  if (value === "planning_to_attend" || value === "cancelled") {
    return value;
  }

  throw new Error("Repository returned an unknown event participation status.");
}

function erasedCandidateProfileEmail(id: string): string {
  return `erased-candidate-profile+${id}@privacy.local`;
}

function erasedCandidateProfileProviderSubject(id: string): string {
  return `erased-candidate-profile:${id}`;
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}
