import {
  adminIdentityAccessReviewDetailResponseSchema,
  adminIdentityAccessReviewListResponseSchema,
  type AdminIdentityAccessReviewDetailResponseDto,
  type AdminIdentityAccessReviewListResponseDto,
  type ConfirmIdentityAccessReviewDto,
  type RejectIdentityAccessReviewDto
} from "@jp2/shared-validation";
import {
  AdminContentHttpError,
  buildAdminContentUrl,
  type AdminContentFetch,
  type AdminContentRequestOptions
} from "./admin-content-api.js";

export async function fetchAdminIdentityAccessReviews(
  options: AdminContentRequestOptions = {}
): Promise<AdminIdentityAccessReviewListResponseDto> {
  const response = await requestAdminIdentityAccess("admin/identity-access-reviews", options);

  return adminIdentityAccessReviewListResponseSchema.parse(await response.json());
}

export async function fetchAdminIdentityAccessReview(
  id: string,
  options: AdminContentRequestOptions = {}
): Promise<AdminIdentityAccessReviewDetailResponseDto> {
  const response = await requestAdminIdentityAccess(`admin/identity-access-reviews/${id}`, options);

  return adminIdentityAccessReviewDetailResponseSchema.parse(await response.json());
}

export async function confirmAdminIdentityAccessReview(
  id: string,
  data: ConfirmIdentityAccessReviewDto,
  options: AdminContentRequestOptions = {}
): Promise<AdminIdentityAccessReviewDetailResponseDto> {
  const response = await requestAdminIdentityAccess(
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
  const response = await requestAdminIdentityAccess(
    `admin/identity-access-reviews/${id}/reject`,
    options,
    {
      method: "POST",
      body: JSON.stringify(data)
    }
  );

  return adminIdentityAccessReviewDetailResponseSchema.parse(await response.json());
}

async function requestAdminIdentityAccess(
  path: string,
  options: AdminContentRequestOptions,
  init: {
    method?: "GET" | "POST";
    body?: string;
  } = {}
) {
  const fetcher = options.fetchImpl ?? getGlobalFetch();
  const headers: Record<string, string> = {};

  if (init.body) {
    headers["content-type"] = "application/json";
  }

  if (options.authToken) {
    headers.authorization = `Bearer ${options.authToken}`;
  }

  if (options.authCookie) {
    headers.cookie = options.authCookie;
  }

  const response = await fetcher(buildAdminContentUrl(path, options.baseUrl), {
    method: init.method ?? "GET",
    headers,
    ...(init.body ? { body: init.body } : {})
  });

  if (!response.ok) {
    throw new AdminContentHttpError(response.status);
  }

  return response;
}

function getGlobalFetch(): AdminContentFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return (input, init) => globalThis.fetch(input, init);
}
