import type { CandidateScreenAction } from "../../candidate-screen-contracts.js";
import { MobileBottomNav } from "./MobileBottomNav.js";

export type CandidateBottomNavActiveItem =
  | "dashboard"
  | "events"
  | "prayer"
  | "announcements"
  | "choragiew"
  | "account";

export interface CandidateBottomNavProps {
  active: CandidateBottomNavActiveItem;
  onAction?: ((action: CandidateScreenAction) => void) | undefined;
  eventsAction?: CandidateScreenAction | undefined;
  secondaryItem?: "announcements" | "choragiew" | undefined;
}

export function CandidateBottomNav({
  active,
  onAction,
  eventsAction,
  secondaryItem = "choragiew"
}: CandidateBottomNavProps) {
  return (
    <MobileBottomNav
      items={[
        {
          id: "dashboard",
          label: "Home",
          icon: "home",
          active: active === "dashboard",
          onPress:
            active === "dashboard"
              ? undefined
              : () =>
                  onAction?.({
                    id: "dashboard",
                    label: "Home",
                    targetRoute: "CandidateDashboard"
                  })
        },
        {
          id: "events",
          label: "Events",
          icon: "calendar_month",
          active: active === "events",
          onPress:
            active === "events" && !eventsAction
              ? undefined
              : eventsAction
                ? () => onAction?.(eventsAction)
                : () =>
                    onAction?.({
                      id: "events",
                      label: "Events",
                      targetRoute: "CandidateEvents"
                    })
        },
        {
          id: "prayer",
          label: "Prayer",
          icon: "auto_stories",
          active: active === "prayer",
          disabled: true
        },
        secondaryItem === "announcements"
          ? {
              id: "announcements",
              label: "News",
              icon: "campaign",
              active: active === "announcements"
            }
          : {
              id: "choragiew",
              label: "Formation",
              icon: "menu_book",
              active: active === "choragiew",
              disabled: true
            },
        {
          id: "account",
          label: "Profile",
          icon: "person",
          active: active === "account",
          disabled: true
        }
      ]}
    />
  );
}
