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
      previous.status === "PUBLISHED" ||
      Boolean(previous.approvedAt))
  ) {
    return;
  }

  throw new BadRequestException(`${label} must be approved before it can be published.`);
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

  if (
    previous &&
    (previous.status === "published" || Boolean(previous.approvedAt))
  ) {
    return;
  }

  throw new BadRequestException(`${label} must be approved before it can be published.`);
}
