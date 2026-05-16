import type { BrotherScreenAction } from "../../brother-screen-contracts.js";
import { MobileBottomNav } from "./MobileBottomNav.js";

export type BrotherBottomNavActiveItem =
  | "dashboard"
  | "events"
  | "prayer"
  | "announcements"
  | "choragiew"
  | "account";

export interface BrotherBottomNavProps {
  active: BrotherBottomNavActiveItem;
  onAction?: ((action: BrotherScreenAction) => void) | undefined;
  eventsAction?: BrotherScreenAction | undefined;
  choragiewAction?: BrotherScreenAction | undefined;
  secondaryItem?: "announcements" | "choragiew" | undefined;
}

export function BrotherBottomNav({
  active,
  onAction,
  eventsAction,
  choragiewAction,
  secondaryItem = "choragiew"
}: BrotherBottomNavProps) {
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
                    id: "today",
                    label: "Dashboard",
                    targetRoute: "BrotherToday"
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
                      targetRoute: "BrotherEvents"
                    })
        },
        {
          id: "prayer",
          label: "Prayer",
          active: active === "prayer",
          onPress:
            active === "prayer"
              ? undefined
              : () =>
                  onAction?.({
                    id: "prayers",
                    label: "Prayer",
                    targetRoute: "BrotherPrayers"
                  })
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
              onPress:
                active === "choragiew" && !choragiewAction
                  ? undefined
                  : choragiewAction
                    ? () => onAction?.(choragiewAction)
                    : () =>
                        onAction?.({
                          id: "organization-units",
                          label: "Choragiew",
                          targetRoute: "MyOrganizationUnits"
                        })
            },
        {
          id: "account",
          label: "Account",
          active: active === "account",
          onPress:
            active === "account"
              ? undefined
              : () =>
                  onAction?.({
                    id: "profile",
                    label: "Account",
                    targetRoute: "BrotherProfile"
                  })
        }
      ]}
    />
  );
}
