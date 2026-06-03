import { Injectable, NotFoundException } from "@nestjs/common";
import {
  requireAdminLite,
  requireScopedAdminWrite
} from "../admin/admin-access.policy.js";
import { adminContentScopeFor } from "../admin/admin-content-access.policy.js";
import { AuditLogService, type AuditSummary } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { contentMutationAuditAction } from "../content/content-audit-actions.js";
import { assertPublishHasPriorApproval } from "../content/content-approval.policy.js";
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
    requireAdminLite(principal);

    return {
      announcements: await this.adminAnnouncementRepository.listManageableAnnouncements(
        adminContentScopeFor(principal)
      )
    };
  }

  async createAdminAnnouncement(
    principal: CurrentUserPrincipal,
    data: CreateAdminAnnouncementRequest
  ): Promise<AdminAnnouncementDetailResponse> {
    requireScopedAdminWrite(
      principal,
      data.targetOrganizationUnitId ?? null,
      "Officer announcement writes must stay within assigned organization units."
    );
    assertPublishHasPriorApproval(data.status, null, "Announcement");

    const announcement = await this.adminAnnouncementRepository.createAnnouncement(
      data,
      principal.id
    );
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
      requireScopedAdminWrite(
        principal,
        data.targetOrganizationUnitId,
        "Officer announcement writes must stay within assigned organization units."
      );
    } else {
      requireAdminLite(principal);
    }

    const scope = adminContentScopeFor(principal);
    const beforeAnnouncement = await this.adminAnnouncementRepository.findAnnouncementForAudit(
      id,
      scope
    );
    assertPublishHasPriorApproval(data.status, beforeAnnouncement, "Announcement");
    const announcement = await this.adminAnnouncementRepository.updateAnnouncement(
      id,
      data,
      scope,
      principal.id
    );

    if (!announcement) {
      throw new NotFoundException("Announcement was not found in the current admin scope.");
    }

    await this.dispatchAnnouncementPushIfNeeded(principal, beforeAnnouncement, announcement);
    await this.auditLog.record({
      action: contentMutationAuditAction("announcement", data, beforeAnnouncement),
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

function summarizeAnnouncementForAudit(
  announcement: AdminAnnouncementDetailResponse["announcement"]
): AuditSummary {
  return {
    title: announcement.title,
    visibility: announcement.visibility,
    targetOrganizationUnitId: announcement.targetOrganizationUnitId,
    pinned: announcement.pinned,
    status: announcement.status,
    approvedAt: announcement.approvedAt,
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
