import type { RuntimeMode } from "@jp2/shared-types";
import type { MyOrganizationUnitsResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherScreenTheme,
  brotherStateCopy,
  buildOrganizationUnitSection,
  type BrotherScreenAction,
  type BrotherScreenSection,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";

export interface MyOrganizationUnitsScreen {
  route: "MyOrganizationUnits";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export function buildMyOrganizationUnitsScreen(options: {
  state: MobileScreenState;
  response?: MyOrganizationUnitsResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): MyOrganizationUnitsScreen {
  if (options.state !== "ready") {
    return stateOnlyMyOrganizationUnits(options.state, options.runtimeMode === "demo");
  }

  if (!options.response || options.response.organizationUnits.length === 0) {
    return stateOnlyMyOrganizationUnits("empty", options.runtimeMode === "demo");
  }

  return {
    route: "MyOrganizationUnits",
    state: "ready",
    title: "My Choragiew",
    body: organizationUnitCountBody(options.response.organizationUnits.length),
    sections: options.response.organizationUnits.map((organizationUnit) =>
      buildOrganizationUnitSection(organizationUnit)
    ),
    actions: [
      {
        id: "today",
        label: "Brother Today",
        targetRoute: "BrotherToday"
      },
      {
        id: "profile",
        label: "Brother Profile",
        targetRoute: "BrotherProfile"
      }
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: brotherScreenTheme
  };
}

function stateOnlyMyOrganizationUnits(
  state: MobileScreenState,
  demoChromeVisible: boolean
): MyOrganizationUnitsScreen {
  const copy = brotherStateCopy("organizationUnits", state);

  return {
    route: "MyOrganizationUnits",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function organizationUnitCountBody(count: number): string {
  return count === 1 ? "1 active organization unit" : `${count} active organization units`;
}
