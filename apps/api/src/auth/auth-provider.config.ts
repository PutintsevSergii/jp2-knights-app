import {
  createFirebaseAdminAuthProvider,
  StaticTokenAuthProvider,
  type ExternalAuthProvider
} from "@jp2/auth-provider";

export function createConfiguredExternalAuthProvider(): ExternalAuthProvider {
  const mode = process.env.AUTH_PROVIDER_MODE ?? "fake";

  if (mode === "fake") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_PROVIDER_MODE=fake is not allowed in production.");
    }

    return StaticTokenAuthProvider.fromRecords("firebase", {
      "demo-admin-token": {
        subject: "demo-admin",
        email: "admin@example.test",
        emailVerified: true,
        displayName: "Demo Super Admin"
      },
      "demo-officer-token": {
        subject: "demo-officer",
        email: "officer@example.test",
        emailVerified: true,
        displayName: "Demo Officer"
      }
    });
  }

  if (mode === "firebase") {
    return createFirebaseAdminAuthProvider(
      withoutUndefined({
        projectId: process.env.FIREBASE_PROJECT_ID,
        serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      })
    );
  }

  throw new Error(`Unsupported AUTH_PROVIDER_MODE '${mode}'.`);
}

function withoutUndefined<T extends Record<string, string | undefined>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, propertyValue]) => propertyValue !== undefined)
  ) as { [K in keyof T as T[K] extends string ? K : never]: string };
}
