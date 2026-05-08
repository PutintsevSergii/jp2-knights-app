import {
  adminIdentityAccessReviewDetailResponseSchema,
  adminIdentityAccessReviewListResponseSchema,
  type AdminIdentityAccessReviewDetailResponseDto,
  type AdminIdentityAccessReviewListResponseDto,
  type ConfirmIdentityAccessReviewDto,
  type RejectIdentityAccessReviewDto
} from "@jp2/shared-validation";
import {
  requestAdminApi,
  type AdminContentRequestOptions
} from "./admin-content-api.js";

export async function fetchAdminIdentityAccessReviews(
  options: AdminContentRequestOptions = {}
): Promise<AdminIdentityAccessReviewListResponseDto> {
  const response = await requestAdminApi("admin/identity-access-reviews", options);

  return adminIdentityAccessReviewListResponseSchema.parse(await response.json());
}

export async function fetchAdminIdentityAccessReview(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminIdentityAccessReviewDetailResponseDto> {
  const response = await requestAdminApi(`admin/identity-access-reviews/${id}`, options);

  return adminIdentityAccessReviewDetailResponseSchema.parse(await response.json());
}

export async function confirmAdminIdentityAccessReview(
  id: string,
  data: ConfirmIdentityAccessReviewDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminIdentityAccessReviewDetailResponseDto> {
  const response = await requestAdminApi(
    `admin/identity-access-reviews/${id}/confirm`,
    options,
    {
      method: "POST",
      body: JSON.stringify(data)
    }
  );

  return adminIdentityAccessReviewDetailResponseSchema.parse(await response.json());
}

export async function rejectAdminIdentityAccessReview(
  id: string,
  data: RejectIdentityAccessReviewDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminIdentityAccessReviewDetailResponseDto> {
  const response = await requestAdminApi(
    `admin/identity-access-reviews/${id}/reject`,
    options,
    {
      method: "POST",
      body: JSON.stringify(data)
    }
  );

  return adminIdentityAccessReviewDetailResponseSchema.parse(await response.json());
}
