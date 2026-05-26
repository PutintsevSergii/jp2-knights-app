import { audienceVisibilityValues, type MemberContentAudience } from "@jp2/shared-auth";
import type { AdminContentScope } from "../admin/admin-content-access.policy.js";

export function memberScopedVisibilityWhere<TWhere>(
  audience: MemberContentAudience,
  organizationUnitIds: readonly string[] | string | null | undefined
): TWhere[] {
  const visibilityValues = audienceVisibilityValues(audience);
  const visibilityWhere: Record<string, unknown>[] = [
    {
      visibility: {
        in: visibilityValues.filter((visibility) => visibility !== "ORGANIZATION_UNIT")
      }
    }
  ];
  const scopedOrganizationUnitIds: string[] =
    typeof organizationUnitIds === "string"
      ? [organizationUnitIds]
      : [...(organizationUnitIds ?? [])];

  if (scopedOrganizationUnitIds.length > 0) {
    visibilityWhere.push({
      visibility: "ORGANIZATION_UNIT",
      targetOrganizationUnitId:
        typeof organizationUnitIds === "string"
          ? scopedOrganizationUnitIds[0]
          : { in: [...scopedOrganizationUnitIds] }
    });
  }

  return visibilityWhere as TWhere[];
}

export function publishedAtNowOrUnset(now: Date) {
  return [{ publishedAt: null }, { publishedAt: { lte: now } }];
}

export function adminManageableContentWhere<TWhere>(scope: AdminContentScope): TWhere {
  if (scope.kind === "global") {
    return {} as TWhere;
  }

  return {
    OR: [
      { visibility: { in: ["PUBLIC", "FAMILY_OPEN"] } },
      { targetOrganizationUnitId: { in: [...scope.organizationUnitIds] } }
    ]
  } as TWhere;
}

export function adminScopedContentUpdateWhere<TWhere>(
  id: string,
  scope: AdminContentScope
): TWhere {
  if (scope.kind === "global") {
    return { id } as TWhere;
  }

  return {
    id,
    targetOrganizationUnitId: { in: [...scope.organizationUnitIds] }
  } as TWhere;
}
