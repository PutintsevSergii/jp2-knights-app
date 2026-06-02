import type { PublicRoute } from "../../public-screens.js";
import { MobileBottomNav } from "./MobileBottomNav.js";

export interface PublicBottomNavProps {
  activeRoute: PublicRoute;
  onNavigate?: ((route: PublicRoute) => void) | undefined;
}

export function PublicBottomNav({ activeRoute, onNavigate }: PublicBottomNavProps) {
  return (
    <MobileBottomNav
      items={[
        {
          id: "home",
          label: "Home",
          active: activeRoute === "PublicHome",
          onPress: activeRoute === "PublicHome" ? undefined : () => onNavigate?.("PublicHome")
        },
        {
          id: "learn",
          label: "About",
          active: activeRoute === "AboutOrder",
          onPress: activeRoute === "AboutOrder" ? undefined : () => onNavigate?.("AboutOrder")
        },
        {
          id: "pray",
          label: "Prayers",
          active:
            activeRoute === "PublicPrayerCategories" ||
            activeRoute === "PublicPrayerDetail" ||
            activeRoute === "PublicSilentPrayer",
          onPress:
            activeRoute === "PublicPrayerCategories"
              ? undefined
              : () => onNavigate?.("PublicPrayerCategories")
        },
        {
          id: "events",
          label: "Events",
          active: activeRoute === "PublicEventsList" || activeRoute === "PublicEventDetail",
          onPress:
            activeRoute === "PublicEventsList" ? undefined : () => onNavigate?.("PublicEventsList")
        },
        {
          id: "join",
          label: "Join",
          active:
            activeRoute === "JoinRequestForm" || activeRoute === "JoinRequestConfirmation",
          onPress:
            activeRoute === "JoinRequestForm" ? undefined : () => onNavigate?.("JoinRequestForm")
        }
      ]}
    />
  );
}
