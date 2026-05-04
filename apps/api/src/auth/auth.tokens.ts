import type { ExternalAuthProvider } from "@jp2/auth-provider";

export const EXTERNAL_AUTH_PROVIDER = Symbol("EXTERNAL_AUTH_PROVIDER");

export type ExternalAuthProviderToken = ExternalAuthProvider;
