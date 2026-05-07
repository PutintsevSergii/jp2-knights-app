import type { RuntimeMode } from "@jp2/shared-types";
import type { BrotherProfileResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherScreenTheme,
  brotherStateCopy,
  type BrotherScreenAction,
  type BrotherScreenSection,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";

export interface BrotherProfileScreen {
  route: "BrotherProfile";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export function buildBrotherProfileScreen(options: {
  state: MobileScreenState;
  response?: BrotherProfileResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): BrotherProfileScreen {
  if (options.state !== "ready") {
    return stateOnlyBrotherProfile(options.state, options.runtimeMode === "demo");
  }

  if (!options.response) {
    return stateOnlyBrotherProfile("empty", options.runtimeMode === "demo");
  }

  return {
    route: "BrotherProfile",
    state: "ready",
    title: "Brother Profile",
    body: `${options.response.profile.displayName} - ${options.response.profile.email}`,
    sections: buildProfileSections(options.response),
    actions: [
      {
        id: "organization-units",
        label: "My choragiew",
        targetRoute: "MyOrganizationUnits"
      }
    ],
    demoChromeVisible: options.runtimeMode === "demo",
    theme: brotherScreenTheme
  };
}

function buildProfileSections(response: BrotherProfileResponseDto): BrotherScreenSection[] {
  const contact = [
    response.profile.phone ? `Phone: ${response.profile.phone}` : null,
    response.profile.preferredLanguage ? `Language: ${response.profile.preferredLanguage}` : null
  ].filter((item): item is string => Boolean(item));

  return [
    {
      id: "contact",
      title: "Contact",
      body: contact.length > 0 ? contact.join("\n") : "No optional contact details are recorded."
    },
    ...response.profile.memberships.map((membership) => ({
      id: `membership-${membership.id}`,
      title: membership.organizationUnit.name,
      body: membership.currentDegree
        ? `${membership.currentDegree}${membership.joinedAt ? ` - joined ${membership.joinedAt}` : ""}`
        : "Current degree is not recorded yet."
    }))
  ];
}

function stateOnlyBrotherProfile(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherProfileScreen {
  const copy = brotherStateCopy("profile", state);

  return {
    route: "BrotherProfile",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}
