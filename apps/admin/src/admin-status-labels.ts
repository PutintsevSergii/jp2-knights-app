import type { StatusMetadata } from "@jp2/shared-types";
import type { TranslationKey } from "@jp2/shared-i18n";
import { adminCopy } from "./admin-i18n.js";

export function formatAdminStatusLabel(status: string): string {
  return status.replaceAll("_", " ").toUpperCase();
}

export function formatAdminStatusMetadataLabel<
  TStatus extends string,
  TMetadata extends Record<TStatus, StatusMetadata>
>(metadata: TMetadata, status: TStatus): string {
  return adminCopy(metadata[status].labelKey as TranslationKey);
}
