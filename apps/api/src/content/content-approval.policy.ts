import { BadRequestException } from "@nestjs/common";
import type { ContentStatus, EventStatus } from "@jp2/shared-types";

export interface PublishApprovalState {
  status: ContentStatus;
  approvedAt?: string | null;
}

export function assertPublishHasPriorApproval(
  nextStatus: ContentStatus | undefined,
  previous: PublishApprovalState | null,
  label: string
): void {
  if (nextStatus !== "PUBLISHED") {
    return;
  }

  if (
    previous &&
    (previous.status === "APPROVED" ||
      Boolean(previous.approvedAt))
  ) {
    return;
  }

  throw new BadRequestException(`${label} must be approved before it can be published.`);
}

export function assertPublishedContentRetainsApproval(
  nextStatus: ContentStatus | undefined,
  nextApprovedAt: string | null | undefined,
  previous: PublishApprovalState | null,
  label: string
): void {
  const resultingStatus = nextStatus ?? previous?.status;
  if (resultingStatus !== "PUBLISHED") {
    return;
  }

  if (nextStatus === "PUBLISHED" && nextApprovedAt !== null) {
    return;
  }

  const resultingApprovedAt =
    nextApprovedAt !== undefined ? nextApprovedAt : previous?.approvedAt;
  if (resultingApprovedAt) {
    return;
  }

  throw new BadRequestException(`${label} must keep approval metadata while published.`);
}

export interface EventPublishApprovalState {
  status: EventStatus;
  approvedAt?: string | null;
}

export function assertEventPublishHasPriorApproval(
  nextStatus: EventStatus | undefined,
  previous: EventPublishApprovalState | null,
  label: string
): void {
  if (nextStatus !== "published") {
    return;
  }

  if (previous && Boolean(previous.approvedAt)) {
    return;
  }

  throw new BadRequestException(`${label} must be approved before it can be published.`);
}

export function assertPublishedEventRetainsApproval(
  nextStatus: EventStatus | undefined,
  nextApprovedAt: string | null | undefined,
  previous: EventPublishApprovalState | null,
  label: string
): void {
  const resultingStatus = nextStatus ?? previous?.status;
  if (resultingStatus !== "published") {
    return;
  }

  if (nextStatus === "published" && nextApprovedAt !== null) {
    return;
  }

  const resultingApprovedAt =
    nextApprovedAt !== undefined ? nextApprovedAt : previous?.approvedAt;
  if (resultingApprovedAt) {
    return;
  }

  throw new BadRequestException(`${label} must keep approval metadata while published.`);
}
