import type { CreateOrganizationUnitRequestDto } from "@jp2/shared-validation";

export type AdminOrganizationUnitRoute =
  | "AdminOrganizationUnitList"
  | "AdminOrganizationUnitEditor";

export interface AdminOrganizationUnitFormField {
  name: keyof CreateOrganizationUnitRequestDto | "status";
  label: string;
  value: string;
  required: boolean;
  readOnly: boolean;
}
