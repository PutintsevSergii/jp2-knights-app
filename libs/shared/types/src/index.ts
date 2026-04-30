export const ROLES = ["CANDIDATE", "BROTHER", "OFFICER", "SUPER_ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const VISIBILITIES = [
  "PUBLIC",
  "FAMILY_OPEN",
  "CANDIDATE",
  "BROTHER",
  "CHORAGIEW",
  "OFFICER",
  "ADMIN"
] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const RUNTIME_MODES = ["api", "demo", "test"] as const;
export type RuntimeMode = (typeof RUNTIME_MODES)[number];

export interface HealthStatus {
  app: "api" | "admin" | "mobile";
  runtimeMode: RuntimeMode;
  status: "ok";
}
