import {
  adminAnnouncementDetailResponseSchema,
  adminAnnouncementListResponseSchema,
  adminEventDetailResponseSchema,
  adminEventListResponseSchema,
  adminPrayerDetailResponseSchema,
  adminPrayerListResponseSchema,
  type AdminAnnouncementDetailResponseDto,
  type AdminAnnouncementListResponseDto,
  type AdminEventDetailResponseDto,
  type AdminEventListResponseDto,
  type AdminPrayerDetailResponseDto,
  type AdminPrayerListResponseDto,
  type CreateAdminAnnouncementRequestDto,
  type CreateAdminEventRequestDto,
  type CreateAdminPrayerRequestDto,
  type UpdateAdminAnnouncementRequestDto,
  type UpdateAdminEventRequestDto,
  type UpdateAdminPrayerRequestDto
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
