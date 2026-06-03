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
          icon: "home",
          active: activeRoute === "PublicHome",
          onPress: activeRoute === "PublicHome" ? undefined : () => onNavigate?.("PublicHome")
        },
        {
          id: "learn",
          label: "About",
          icon: "info",
          active: activeRoute === "AboutOrder",
          onPress: activeRoute === "AboutOrder" ? undefined : () => onNavigate?.("AboutOrder")
        },
        {
          id: "pray",
          label: "Prayers",
          icon: "menu_book",
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
          icon: "calendar_month",
          active: activeRoute === "PublicEventsList" || activeRoute === "PublicEventDetail",
          onPress:
            activeRoute === "PublicEventsList" ? undefined : () => onNavigate?.("PublicEventsList")
        }
      ]}
    />
  );
}
