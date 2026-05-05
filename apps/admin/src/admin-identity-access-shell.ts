import {
  renderAdminIdentityAccessRoute,
  type RenderAdminIdentityAccessRouteOptions,
  type RenderedAdminIdentityAccessRoute
} from "./admin-identity-access-screen.js";

export interface AdminIdentityAccessShellRouteMetadata {
  path: "/admin/identity-access-reviews";
  label: "Sign-In Reviews";
  screenRoute: "AdminIdentityAccessReviews";
}

export const adminIdentityAccessShellRoutes: readonly AdminIdentityAccessShellRouteMetadata[] = [
  {
    path: "/admin/identity-access-reviews",
    label: "Sign-In Reviews",
    screenRoute: "AdminIdentityAccessReviews"
  }
];

export function renderAdminIdentityAccessShellRoute(
  options: RenderAdminIdentityAccessRouteOptions
): Promise<RenderedAdminIdentityAccessRoute> {
  return renderAdminIdentityAccessRoute(options);
}
