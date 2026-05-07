import type { BrotherRoute } from "./brother-screens.js";
import type { CandidateRoute } from "./candidate-screens.js";
import type { PublicRoute } from "./public-screens.js";

export type MobileAppRoute = PublicRoute | CandidateRoute | BrotherRoute;

export function isPublicRoute(route: MobileAppRoute): route is PublicRoute {
  return (
    route === "PublicHome" ||
    route === "AboutOrder" ||
    route === "PublicPrayerCategories" ||
    route === "PublicEventsList" ||
    route === "PublicPrayerDetail" ||
    route === "PublicEventDetail" ||
    route === "JoinRequestForm" ||
    route === "JoinRequestConfirmation" ||
    route === "Login" ||
    route === "IdleApproval"
  );
}

export function isCandidateRoute(route: MobileAppRoute): route is CandidateRoute {
  return (
    route === "CandidateDashboard" ||
    route === "CandidateContact" ||
    route === "CandidateRoadmap" ||
    route === "CandidateEvents" ||
    route === "CandidateAnnouncements" ||
    route === "CandidateEventDetail"
  );
}

export function isBrotherRoute(route: MobileAppRoute): route is BrotherRoute {
  return (
    route === "BrotherToday" ||
    route === "BrotherProfile" ||
    route === "MyOrganizationUnits" ||
    route === "BrotherEvents" ||
    route === "BrotherAnnouncements" ||
    route === "BrotherEventDetail" ||
    route === "BrotherPrayers" ||
    route === "SilentPrayer"
  );
}
