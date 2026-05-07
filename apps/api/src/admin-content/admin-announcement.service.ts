import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessAdminLite, hasRole } from "@jp2/shared-auth";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
import { AnnouncementPushRecipientRepository } from "../notifications/announcement-push-recipient.repository.js";
import { PushNotificationAdapter } from "../notifications/push-notification.adapter.js";
import { AdminAnnouncementRepository } from "./admin-announcement.repository.js";
import type {
  AdminAnnouncementDetailResponse,
  AdminAnnouncementListResponse,
  CreateAdminAnnouncementRequest,
  UpdateAdminAnnouncementRequest
} from "./admin-announcement.types.js";

@Injectable()
export class AdminAnnouncementService {
  constructor(
    private readonly adminAnnouncementRepository: AdminAnnouncementRepository,
    private readonly announcementPushRecipientRepository: AnnouncementPushRecipientRepository,
    private readonly pushNotificationAdapter: PushNotificationAdapter,
    private readonly auditLog: AuditLogService
  ) {}

  async listAdminAnnouncements(
    principal: CurrentUserPrincipal
  ): Promise<AdminAnnouncementListResponse> {
    if (!canAccessAdminLite(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Admin Lite access is required.");
    }

    return {
      announcements: await this.adminAnnouncementRepository.listManageableAnnouncements(
        scopeFor(principal)
      )
    };
  }

  async createAdminAnnouncement(
    principal: CurrentUserPrincipal,
    data: CreateAdminAnnouncementRequest
  ): Promise<AdminAnnouncementDetailResponse> {
    assertCanWriteAnnouncement(principal, data.targetOrganizationUnitId ?? null);

    const announcement = await this.adminAnnouncementRepository.createAnnouncement(data);
    await this.dispatchAnnouncementPushIfNeeded(principal, null, announcement);
    await this.auditLog.record({
      action: "admin.announcement.create",
      actorUserId: principal.id,
      entityType: "announcement",
      entityId: announcement.id,
      scopeOrganizationUnitId: announcement.targetOrganizationUnitId,
      beforeSummary: null,
      afterSummary: summarizeAnnouncementForAudit(announcement)
    });

    return { announcement };
  }

  async updateAdminAnnouncement(
    principal: CurrentUserPrincipal,
    id: string,
    data: UpdateAdminAnnouncementRequest
  ): Promise<AdminAnnouncementDetailResponse> {
    if (data.targetOrganizationUnitId !== undefined) {
      assertCanWriteAnnouncement(principal, data.targetOrganizationUnitId);
    } else if (!canAccessAdminLite(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Admin Lite access is required.");
    }

    const scopeOrganizationUnitIds = scopeFor(principal);
    const beforeAnnouncement = await this.adminAnnouncementRepository.findAnnouncementForAudit(
      id,
      scopeOrganizationUnitIds
    );
    const announcement = await this.adminAnnouncementRepository.updateAnnouncement(
      id,
      data,
      scopeOrganizationUnitIds
    );

    if (!announcement) {
      throw new NotFoundException("Announcement was not found in the current admin scope.");
    }

    await this.dispatchAnnouncementPushIfNeeded(principal, beforeAnnouncement, announcement);
    await this.auditLog.record({
      action: "admin.announcement.update",
      actorUserId: principal.id,
      entityType: "announcement",
      entityId: announcement.id,
      scopeOrganizationUnitId: announcement.targetOrganizationUnitId,
      beforeSummary: beforeAnnouncement
        ? summarizeAnnouncementForAudit(beforeAnnouncement)
        : null,
      afterSummary: summarizeAnnouncementForAudit(announcement)
    });

    return { announcement };
  }

  private async dispatchAnnouncementPushIfNeeded(
    principal: CurrentUserPrincipal,
    beforeAnnouncement: AdminAnnouncementDetailResponse["announcement"] | null,
    announcement: AdminAnnouncementDetailResponse["announcement"]
  ): Promise<void> {
    if (!shouldDispatchAnnouncementPush(beforeAnnouncement, announcement)) {
      return;
    }

    const tokenIds =
      await this.announcementPushRecipientRepository.findRecipientTokenIds(announcement);

    if (tokenIds.length === 0) {
      await this.auditLog.record({
        action: "admin.announcement.push_dispatch",
        actorUserId: principal.id,
        entityType: "announcement",
        entityId: announcement.id,
        scopeOrganizationUnitId: announcement.targetOrganizationUnitId,
        beforeSummary: null,
        afterSummary: {
          category: "announcements",
          attempted: 0,
          accepted: 0,
          failed: 0
        }
      });
      return;
    }

    const result = await this.pushNotificationAdapter.dispatch({
      tokenIds,
      category: "announcements",
      title: "New announcement",
      body: "Open the app to read the latest announcement.",
      deepLinkPath: `/announcements/${announcement.id}`,
      recordId: announcement.id
    });

    await this.auditLog.record({
      action: "admin.announcement.push_dispatch",
      actorUserId: principal.id,
      entityType: "announcement",
      entityId: announcement.id,
      scopeOrganizationUnitId: announcement.targetOrganizationUnitId,
      beforeSummary: null,
      afterSummary: {
        category: "announcements",
        attempted: result.attempted,
        accepted: result.accepted,
        failed: result.failed
      }
    });
  }
}

function scopeFor(principal: CurrentUserPrincipal): readonly string[] | null {
  return hasRole(principal, "SUPER_ADMIN") ? null : (principal.officerOrganizationUnitIds ?? []);
}

function assertCanWriteAnnouncement(
  principal: CurrentUserPrincipal,
  targetOrganizationUnitId: string | null
): void {
  if (!canAccessAdminLite(principal)) {
    assertNotIdleApprovalPrincipal(principal);
    throw new ForbiddenException("Admin Lite access is required.");
  }

  if (hasRole(principal, "SUPER_ADMIN")) {
    return;
  }

  if (
    targetOrganizationUnitId &&
    (principal.officerOrganizationUnitIds ?? []).includes(targetOrganizationUnitId)
  ) {
    return;
  }

  throw new ForbiddenException(
    "Officer announcement writes must stay within assigned organization units."
  );
}

function summarizeAnnouncementForAudit(
  announcement: AdminAnnouncementDetailResponse["announcement"]
): AuditSummary {
  return {
    title: announcement.title,
    visibility: announcement.visibility,
    targetOrganizationUnitId: announcement.targetOrganizationUnitId,
    pinned: announcement.pinned,
    status: announcement.status,
    publishedAt: announcement.publishedAt,
    archivedAt: announcement.archivedAt
  };
}

function shouldDispatchAnnouncementPush(
  beforeAnnouncement: AdminAnnouncementDetailResponse["announcement"] | null,
  announcement: AdminAnnouncementDetailResponse["announcement"]
): boolean {
  if (
    announcement.status !== "PUBLISHED" ||
    !announcement.publishedAt ||
    announcement.archivedAt
  ) {
    return false;
  }

  return beforeAnnouncement?.status !== "PUBLISHED";
}
