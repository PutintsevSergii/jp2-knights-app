import {
  adminAnnouncementDetailResponseSchema,
  adminAnnouncementListResponseSchema,
  adminEventDetailResponseSchema,
  adminEventListResponseSchema,
  adminPrayerDetailResponseSchema,
  adminPrayerListResponseSchema,
  adminSilentPrayerEventDetailResponseSchema,
  adminSilentPrayerEventListResponseSchema,
  type AdminAnnouncementDetailResponseDto,
  type AdminAnnouncementListResponseDto,
  type AdminEventDetailResponseDto,
  type AdminEventListResponseDto,
  type AdminPrayerDetailResponseDto,
  type AdminPrayerListResponseDto,
  type AdminSilentPrayerEventDetailResponseDto,
  type AdminSilentPrayerEventListResponseDto,
  type CreateAdminSilentPrayerEventRequestDto,
  type CreateAdminAnnouncementRequestDto,
  type CreateAdminEventRequestDto,
  type CreateAdminPrayerRequestDto,
  type UpdateAdminAnnouncementRequestDto,
  type UpdateAdminEventRequestDto,
  type UpdateAdminPrayerRequestDto,
  type UpdateAdminSilentPrayerEventRequestDto
} from "@jp2/shared-validation";
export {
  adminContentFailureState,
  AdminContentHttpError,
  buildAdminContentUrl,
  DEFAULT_ADMIN_API_BASE_URL,
  requestAdminApi,
  type AdminContentFetch,
  type AdminContentFetchInit,
  type AdminContentFetchResponse,
  type AdminContentRequestOptions,
  type AdminContentScreenState
} from "./admin-api-client.js";
import { requestAdminApi, type AdminContentRequestOptions } from "./admin-api-client.js";

export interface ApproveAdminEventOptions extends AdminContentRequestOptions {
  approvedAt?: string | undefined;
}

export async function fetchAdminPrayers(
  options: AdminContentRequestOptions = {}
): Promise<AdminPrayerListResponseDto> {
  const response = await requestAdminApi("admin/prayers", options);

  return adminPrayerListResponseSchema.parse(await response.json());
}

export async function createAdminPrayer(
  data: CreateAdminPrayerRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminPrayerDetailResponseDto> {
  const response = await requestAdminApi("admin/prayers", options, {
    method: "POST",
    body: JSON.stringify(data)
  });

  return adminPrayerDetailResponseSchema.parse(await response.json());
}

export async function updateAdminPrayer(
  id: string,
  data: UpdateAdminPrayerRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminPrayerDetailResponseDto> {
  const response = await requestAdminApi(`admin/prayers/${id}`, options, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return adminPrayerDetailResponseSchema.parse(await response.json());
}

export async function approveAdminPrayer(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminPrayerDetailResponseDto> {
  return updateAdminPrayer(id, { status: "APPROVED" }, options);
}

export async function publishAdminPrayer(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminPrayerDetailResponseDto> {
  return updateAdminPrayer(id, { status: "PUBLISHED" }, options);
}

export async function archiveAdminPrayer(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminPrayerDetailResponseDto> {
  return updateAdminPrayer(id, { status: "ARCHIVED" }, options);
}

export async function fetchAdminEvents(
  options: AdminContentRequestOptions = {}
): Promise<AdminEventListResponseDto> {
  const response = await requestAdminApi("admin/events", options);

  return adminEventListResponseSchema.parse(await response.json());
}

export async function createAdminEvent(
  data: CreateAdminEventRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminEventDetailResponseDto> {
  const response = await requestAdminApi("admin/events", options, {
    method: "POST",
    body: JSON.stringify(data)
  });

  return adminEventDetailResponseSchema.parse(await response.json());
}

export async function updateAdminEvent(
  id: string,
  data: UpdateAdminEventRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminEventDetailResponseDto> {
  const response = await requestAdminApi(`admin/events/${id}`, options, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return adminEventDetailResponseSchema.parse(await response.json());
}

export async function approveAdminEvent(
  id: string,
  options: ApproveAdminEventOptions = {}
): Promise<AdminEventDetailResponseDto> {
  const { approvedAt, ...requestOptions } = options;

  return updateAdminEvent(
    id,
    { approvedAt: approvedAt ?? new Date().toISOString() },
    requestOptions
  );
}

export async function publishAdminEvent(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminEventDetailResponseDto> {
  return updateAdminEvent(id, { status: "published" }, options);
}

export async function cancelAdminEvent(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminEventDetailResponseDto> {
  return updateAdminEvent(id, { status: "cancelled" }, options);
}

export async function archiveAdminEvent(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminEventDetailResponseDto> {
  return updateAdminEvent(id, { status: "archived" }, options);
}

export async function fetchAdminAnnouncements(
  options: AdminContentRequestOptions = {}
): Promise<AdminAnnouncementListResponseDto> {
  const response = await requestAdminApi("admin/announcements", options);

  return adminAnnouncementListResponseSchema.parse(await response.json());
}

export async function createAdminAnnouncement(
  data: CreateAdminAnnouncementRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminAnnouncementDetailResponseDto> {
  const response = await requestAdminApi("admin/announcements", options, {
    method: "POST",
    body: JSON.stringify(data)
  });

  return adminAnnouncementDetailResponseSchema.parse(await response.json());
}

export async function updateAdminAnnouncement(
  id: string,
  data: UpdateAdminAnnouncementRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminAnnouncementDetailResponseDto> {
  const response = await requestAdminApi(`admin/announcements/${id}`, options, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return adminAnnouncementDetailResponseSchema.parse(await response.json());
}

export async function approveAdminAnnouncement(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminAnnouncementDetailResponseDto> {
  return updateAdminAnnouncement(id, { status: "APPROVED" }, options);
}

export async function publishAdminAnnouncement(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminAnnouncementDetailResponseDto> {
  return updateAdminAnnouncement(id, { status: "PUBLISHED" }, options);
}

export async function archiveAdminAnnouncement(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminAnnouncementDetailResponseDto> {
  return updateAdminAnnouncement(id, { status: "ARCHIVED" }, options);
}

export async function fetchAdminSilentPrayerEvents(
  options: AdminContentRequestOptions = {}
): Promise<AdminSilentPrayerEventListResponseDto> {
  const response = await requestAdminApi("admin/silent-prayer-events", options);

  return adminSilentPrayerEventListResponseSchema.parse(await response.json());
}

export async function createAdminSilentPrayerEvent(
  data: CreateAdminSilentPrayerEventRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminSilentPrayerEventDetailResponseDto> {
  const response = await requestAdminApi("admin/silent-prayer-events", options, {
    method: "POST",
    body: JSON.stringify(data)
  });

  return adminSilentPrayerEventDetailResponseSchema.parse(await response.json());
}

export async function updateAdminSilentPrayerEvent(
  id: string,
  data: UpdateAdminSilentPrayerEventRequestDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminSilentPrayerEventDetailResponseDto> {
  const response = await requestAdminApi(`admin/silent-prayer-events/${id}`, options, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return adminSilentPrayerEventDetailResponseSchema.parse(await response.json());
}

export async function approveAdminSilentPrayerEvent(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminSilentPrayerEventDetailResponseDto> {
  return updateAdminSilentPrayerEvent(id, { status: "APPROVED" }, options);
}

export async function publishAdminSilentPrayerEvent(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminSilentPrayerEventDetailResponseDto> {
  return updateAdminSilentPrayerEvent(id, { status: "PUBLISHED" }, options);
}

export async function cancelAdminSilentPrayerEvent(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminSilentPrayerEventDetailResponseDto> {
  return updateAdminSilentPrayerEvent(id, { cancelledAt: new Date().toISOString() }, options);
}

export async function archiveAdminSilentPrayerEvent(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminSilentPrayerEventDetailResponseDto> {
  return updateAdminSilentPrayerEvent(id, { status: "ARCHIVED" }, options);
}
