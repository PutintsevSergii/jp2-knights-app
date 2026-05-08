import type { RuntimeMode } from "@jp2/shared-types";
import type { BrotherPrayerListResponseDto, BrotherPrayerSummaryDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  brotherScreenTheme,
  brotherStateCopy,
  type BrotherScreenAction,
  type BrotherScreenSection,
  type BrotherScreenTheme
} from "./brother-screen-contracts.js";

export interface BrotherPrayerCard {
  id: string;
  title: string;
  excerpt: string;
  categoryLabel: string;
  languageLabel: string;
  visibilityLabel: string;
  scopeLabel: string;
}

export interface BrotherPrayerCategoryChip {
  id: string;
  label: string;
}

export interface BrotherPrayersScreen {
  route: "BrotherPrayers";
  state: MobileScreenState;
  title: string;
  body: string;
  prayerCards: BrotherPrayerCard[];
  categoryChips: BrotherPrayerCategoryChip[];
  sections: BrotherScreenSection[];
  actions: BrotherScreenAction[];
  demoChromeVisible: boolean;
  theme: BrotherScreenTheme;
}

export function buildBrotherPrayersScreen(options: {
  state: MobileScreenState;
  response?: BrotherPrayerListResponseDto | undefined;
  runtimeMode: RuntimeMode;
}): BrotherPrayersScreen {
  if (options.state !== "ready") {
    return stateOnlyBrotherPrayers(options.state, options.runtimeMode === "demo");
  }

  if (!options.response || options.response.prayers.length === 0) {
    return stateOnlyBrotherPrayers("empty", options.runtimeMode === "demo");
  }

  return {
    route: "BrotherPrayers",
    state: "ready",
    title: "Brother Prayers",
    body: prayerCountBody(options.response.prayers.length),
    prayerCards: options.response.prayers.map(buildBrotherPrayerCard),
    categoryChips: options.response.categories.map((category) => ({
      id: category.id,
      label: category.title
    })),
    sections: options.response.prayers.map((prayer) => ({
      id: `prayer-${prayer.id}`,
      title: prayer.title,
      body: brotherPrayerBody(prayer)
    })),
    actions: [
      {
        id: "today",
        label: "Brother Today",
        targetRoute: "BrotherToday"
      },
      {
        id: "events",
        label: "Brother Events",
        targetRoute: "BrotherEvents"
      },
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

function stateOnlyBrotherPrayers(
  state: MobileScreenState,
  demoChromeVisible: boolean
): BrotherPrayersScreen {
  const copy = brotherStateCopy("prayers", state);

  return {
    route: "BrotherPrayers",
    state,
    title: copy.title,
    body: copy.body,
    prayerCards: [],
    categoryChips: [],
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: brotherScreenTheme
  };
}

function buildBrotherPrayerCard(prayer: BrotherPrayerSummaryDto): BrotherPrayerCard {
  return {
    id: prayer.id,
    title: prayer.title,
    excerpt: prayer.excerpt,
    categoryLabel: prayer.category?.title ?? "Uncategorized",
    languageLabel: prayer.language.toUpperCase(),
    visibilityLabel: formatPrayerVisibility(prayer.visibility),
    scopeLabel:
      prayer.visibility === "ORGANIZATION_UNIT" && prayer.targetOrganizationUnitId
        ? "Your choragiew"
        : "Shared library"
  };
}

function brotherPrayerBody(prayer: BrotherPrayerSummaryDto): string {
  return [
    prayer.excerpt,
    `Category: ${prayer.category?.title ?? "Uncategorized"}`,
    `Visibility: ${formatPrayerVisibility(prayer.visibility)}`
  ].join("\n");
}

function prayerCountBody(count: number): string {
  return count === 1 ? "1 brother-visible prayer" : `${count} brother-visible prayers`;
}

function formatPrayerVisibility(visibility: BrotherPrayerSummaryDto["visibility"]): string {
  if (visibility === "ORGANIZATION_UNIT") {
    return "Choragiew";
  }

  if (visibility === "FAMILY_OPEN") {
    return "Family open";
  }

  return visibility.charAt(0) + visibility.slice(1).toLowerCase();
}
