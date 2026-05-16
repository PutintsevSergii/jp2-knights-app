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
          label: "Dashboard",
          active: active === "dashboard",
          onPress:
            active === "dashboard"
              ? undefined
              : () =>
                  onAction?.({
                    id: "dashboard",
                    label: "Dashboard",
                    targetRoute: "CandidateDashboard"
                  })
        },
        {
          id: "events",
          label: "Events",
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
          active: active === "prayer",
          disabled: true
        },
        secondaryItem === "announcements"
          ? {
              id: "announcements",
              label: "News",
              active: active === "announcements"
            }
          : {
              id: "choragiew",
              label: "Choragiew",
              active: active === "choragiew",
              disabled: true
            },
        {
          id: "account",
          label: "Account",
          active: active === "account",
          disabled: true
        }
      ]}
    />
  );
}
