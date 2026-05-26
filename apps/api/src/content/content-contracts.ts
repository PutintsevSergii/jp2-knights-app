import {
  CONTENT_STATUSES,
  EVENT_STATUSES,
  VISIBILITIES,
  type ContentStatus,
  type EventStatus,
  type Visibility
} from "@jp2/shared-types";

export function toVisibility(value: string, context: string): Visibility {
  return toSharedEnumValue(value, VISIBILITIES, `${context} visibility`);
}

export function toContentStatus(value: string, context: string): ContentStatus {
  return toSharedEnumValue(value, CONTENT_STATUSES, `${context} status`);
}

export function toEventStatus(value: string, context: string): EventStatus {
  return toSharedEnumValue(value, EVENT_STATUSES, `${context} status`);
}

export function contentStatusCreateTimestamps(status: ContentStatus, now = new Date()) {
  return {
    publishedAt: status === "PUBLISHED" ? now : null,
    archivedAt: status === "ARCHIVED" ? now : null
  };
}

export function contentStatusUpdateTimestamps(
  status: ContentStatus | undefined,
  now = new Date()
) {
  return {
    ...(status === "PUBLISHED" ? { publishedAt: now } : {}),
    ...(status === "ARCHIVED" ? { archivedAt: now } : {})
  };
}

export function approvalContentStatusCreateMetadata(
  status: ContentStatus,
  actorUserId: string,
  now = new Date()
) {
  return {
    approvedBy: status === "APPROVED" || status === "PUBLISHED" ? actorUserId : null,
    publishedBy: status === "PUBLISHED" ? actorUserId : null,
    approvedAt: status === "APPROVED" || status === "PUBLISHED" ? now : null,
    ...contentStatusCreateTimestamps(status, now)
  };
}

export function approvalContentStatusUpdateMetadata(
  status: ContentStatus | undefined,
  actorUserId: string,
  now = new Date()
) {
  return {
    ...(status === "APPROVED" || status === "PUBLISHED"
      ? { approvedBy: actorUserId, approvedAt: now }
      : {}),
    ...(status === "PUBLISHED" ? { publishedBy: actorUserId } : {}),
    ...contentStatusUpdateTimestamps(status, now)
  };
}

export function eventStatusCreateTimestamps(status: EventStatus, now = new Date()) {
  return {
    publishedAt: status === "published" ? now : null,
    cancelledAt: status === "cancelled" ? now : null,
    archivedAt: status === "archived" ? now : null
  };
}

export function eventStatusUpdateTimestamps(status: EventStatus | undefined, now = new Date()) {
  return {
    ...(status === "published" ? { publishedAt: now } : {}),
    ...(status === "cancelled" ? { cancelledAt: now } : {}),
    ...(status === "archived" ? { archivedAt: now } : {})
  };
}

function toSharedEnumValue<const TValues extends readonly string[]>(
  value: string,
  values: TValues,
  label: string
): TValues[number] {
  if (values.includes(value)) {
    return value;
  }

  throw new Error(`Repository returned an unknown ${label}.`);
}
