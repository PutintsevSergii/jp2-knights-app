import type { ContentStatus, EventStatus } from "@jp2/shared-types";

export interface ContentMutationState {
  status: ContentStatus;
  approvedAt?: string | null;
}

export interface EventMutationState {
  status: EventStatus;
  approvedAt?: string | null;
}

export function contentMutationAuditAction(
  entity: "announcement" | "prayer" | "silent_prayer_event",
  next: { status?: ContentStatus | undefined },
  previous: ContentMutationState | null
): string {
  if (next.status === "PUBLISHED" && previous?.status !== "PUBLISHED") {
    return `admin.${entity}.publish`;
  }

  if (next.status === "APPROVED" && previous?.status !== "APPROVED") {
    return `admin.${entity}.approve`;
  }

  if (next.status === "ARCHIVED" && previous?.status !== "ARCHIVED") {
    return `admin.${entity}.archive`;
  }

  return `admin.${entity}.update`;
}

export function eventMutationAuditAction(
  next: {
    status?: EventStatus | undefined;
    approvedAt?: string | null | undefined;
  },
  previous: EventMutationState | null
): string {
  if (next.status === "published" && previous?.status !== "published") {
    return "admin.event.publish";
  }

  if (next.status === "cancelled" && previous?.status !== "cancelled") {
    return "admin.event.cancel";
  }

  if (next.status === "archived" && previous?.status !== "archived") {
    return "admin.event.archive";
  }

  if (next.approvedAt && !previous?.approvedAt) {
    return "admin.event.approve";
  }

  return "admin.event.update";
}
