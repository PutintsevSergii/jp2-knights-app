import type { RuntimeMode } from "@jp2/shared-types";
import type { MyOrganizationUnitsResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherScreenTheme,
  brotherStateCopy,
  type BrotherScreenAction,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";

export interface OrganizationUnitDetailScreen {
  route: "OrganizationUnitDetail";
  state: MobileScreenState;
  title: string;
  body: string;
  description: string;
  detailRows: OrganizationUnitDetailRow[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export interface OrganizationUnitDetailRow {
  id: string;
  label: string;
  value: string;
}

export function buildOrganizationUnitDetailScreen(options: {
  state: MobileScreenState;
  response?: MyOrganizationUnitsResponseDto | undefined;
  selectedOrganizationUnitId?: string | undefined;
  runtimeMode: RuntimeMode;
}): OrganizationUnitDetailScreen {
  if (options.state !== "ready") {
    return stateOnlyOrganizationUnitDetail(options.state, options.runtimeMode === "demo");
  }

  const organizationUnit = selectOrganizationUnit(
    options.response,
    options.selectedOrganizationUnitId
  );

  if (!organizationUnit) {
    return stateOnlyOrganizationUnitDetail("empty", options.runtimeMode === "demo");
  }

  const location = `${organizationUnit.city}, ${organizationUnit.country}`;

  return {
    route: "OrganizationUnitDetail",
    state: "ready",
    title: organizationUnit.name,
    body: `${organizationUnit.type} - ${location}`,
    description: organizationUnit.publicDescription ?? "No public description is recorded yet.",
    detailRows: [
      {
        id: "type",
        label: "Type",
        value: organizationUnit.type
      },
      {
        id: "status",
        label: "Status",
        value: organizationUnit.status
      },
      {
        id: "location",
        label: "Location",
        value: location
      },
      {
        id: "parish",
        label: "Parish",
        value: organizationUnit.parish ?? "Not recorded"
      }
    ],
    actions: [
      {
        id: "organization-units",
        label: "Back to choragiew",
        targetRoute: "MyOrganizationUnits"
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

function selectOrganizationUnit(
  response: MyOrganizationUnitsResponseDto | undefined,
  selectedOrganizationUnitId: string | undefined
): MyOrganizationUnitsResponseDto["organizationUnits"][number] | undefined {
  if (!response || response.organizationUnits.length === 0) {
    return undefined;
  }

  if (!selectedOrganizationUnitId) {
    return response.organizationUnits[0];
  }

  return response.organizationUnits.find(
    (organizationUnit) => organizationUnit.id === selectedOrganizationUnitId
  );
}

function stateOnlyOrganizationUnitDetail(
  state: MobileScreenState,
  demoChromeVisible: boolean
): OrganizationUnitDetailScreen {
  const copy = brotherStateCopy("organizationUnitDetail", state);

  return {
    route: "OrganizationUnitDetail",
    state,
    title: copy.title,
    body: copy.body,
    description: "",
    detailRows: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}
