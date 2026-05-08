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
  organizationUnitCards: MyOrganizationUnitCard[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export interface MyOrganizationUnitCard {
  id: string;
  title: string;
  typeLabel: string;
  locationLabel: string;
  parishLabel: string;
  body: string;
  detailAction: BrotherScreenAction;
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
    organizationUnitCards: options.response.organizationUnits.map(buildMyOrganizationUnitCard),
    actions: [
      {
        id: "open-first-organization-unit",
        label: "Open choragiew",
        targetRoute: "OrganizationUnitDetail",
        targetId: options.response.organizationUnits[0]!.id
      },
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
    organizationUnitCards: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function organizationUnitCountBody(count: number): string {
  return count === 1 ? "1 active organization unit" : `${count} active organization units`;
}

function buildMyOrganizationUnitCard(
  organizationUnit: MyOrganizationUnitsResponseDto["organizationUnits"][number]
): MyOrganizationUnitCard {
  return {
    id: organizationUnit.id,
    title: organizationUnit.name,
    typeLabel: organizationUnit.type,
    locationLabel: `${organizationUnit.city}, ${organizationUnit.country}`,
    parishLabel: organizationUnit.parish ?? "Parish not recorded",
    body: organizationUnit.publicDescription ?? "No public description is recorded yet.",
    detailAction: {
      id: "open-organization-unit",
      label: "Open choragiew",
      targetRoute: "OrganizationUnitDetail",
      targetId: organizationUnit.id
    }
  };
}
