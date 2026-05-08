export type MemberAudienceVisibility = "CANDIDATE" | "BROTHER";

export function memberScopedVisibilityWhere<TWhere>(
  audienceVisibility: MemberAudienceVisibility,
  organizationUnitIds: readonly string[] | string | null | undefined
): TWhere[] {
  const visibilityWhere: Record<string, unknown>[] = [
    { visibility: { in: ["PUBLIC", "FAMILY_OPEN", audienceVisibility] } }
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
