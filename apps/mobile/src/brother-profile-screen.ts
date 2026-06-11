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
  profileSummary?: BrotherProfileSummary | undefined;
  contactRows: BrotherProfileContactRow[];
  membershipCards: BrotherProfileMembershipCard[];
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export interface BrotherProfileSummary {
  displayName: string;
  email: string;
  initials: string;
  currentDegreeLabel: string;
  organizationUnitLabel: string;
}

export interface BrotherProfileContactRow {
  id: "email" | "phone" | "language";
  label: string;
  value: string;
}

export interface BrotherProfileMembershipCard {
  id: string;
  organizationUnitName: string;
  typeLabel: string;
  locationLabel: string;
  parishLabel: string;
  description: string;
  currentDegreeLabel: string;
  joinedLabel: string;
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
    profileSummary: buildProfileSummary(options.response),
    contactRows: buildContactRows(options.response),
    membershipCards: buildMembershipCards(options.response),
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

function buildProfileSummary(response: BrotherProfileResponseDto): BrotherProfileSummary {
  const primaryMembership = response.profile.memberships[0];

  return {
    displayName: response.profile.displayName,
    email: response.profile.email,
    initials: initialsFor(response.profile.displayName),
    currentDegreeLabel: primaryMembership?.currentDegree ?? "Degree pending",
    organizationUnitLabel: primaryMembership?.organizationUnit.name ?? "Choragiew pending"
  };
}

function buildContactRows(response: BrotherProfileResponseDto): BrotherProfileContactRow[] {
  return [
    {
      id: "email",
      label: "Email",
      value: response.profile.email
    },
    {
      id: "phone",
      label: "Phone",
      value: response.profile.phone ?? "Not recorded"
    },
    {
      id: "language",
      label: "Language",
      value: response.profile.preferredLanguage ?? "Not recorded"
    }
  ];
}

function buildMembershipCards(
  response: BrotherProfileResponseDto
): BrotherProfileMembershipCard[] {
  return response.profile.memberships.map((membership) => ({
    id: membership.id,
    organizationUnitName: membership.organizationUnit.name,
    typeLabel: labelFromEnum(membership.organizationUnit.type),
    locationLabel: `${membership.organizationUnit.city}, ${membership.organizationUnit.country}`,
    parishLabel: membership.organizationUnit.parish ?? "Parish not recorded",
    description: membership.organizationUnit.publicDescription ?? "No public description recorded.",
    currentDegreeLabel: membership.currentDegree ?? "Degree pending",
    joinedLabel: membership.joinedAt ? `Joined ${formatDate(membership.joinedAt)}` : "Join date pending"
  }));
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
    contactRows: [],
    membershipCards: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function initialsFor(displayName: string): string {
  return displayName
    .split(/\s+/)
    .map((part) => part[0])
    .filter((part): part is string => Boolean(part))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function labelFromEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00.000Z`));
}
