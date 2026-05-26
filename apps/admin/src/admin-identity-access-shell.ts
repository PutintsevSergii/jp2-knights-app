import {
  renderAdminIdentityAccessRoute,
  type RenderAdminIdentityAccessRouteOptions,
  type RenderedAdminIdentityAccessRoute
} from "./admin-identity-access-screen.js";
import type { AdminWebRouteDefinition } from "./admin-web-route-types.js";
import { routeOptions } from "./admin-web-route-types.js";

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

export const adminIdentityAccessRouteDefinition: AdminWebRouteDefinition = {
  matches: (path) => path === "/admin/identity-access-reviews",
  render: async (context) => ({
    title: "Admin Identity Access Reviews",
    ...(await renderAdminIdentityAccessShellRoute(routeOptions(context)))
  })
};

export function renderAdminIdentityAccessShellRoute(
  options: RenderAdminIdentityAccessRouteOptions
): Promise<RenderedAdminIdentityAccessRoute> {
  return renderAdminIdentityAccessRoute(options);
}
