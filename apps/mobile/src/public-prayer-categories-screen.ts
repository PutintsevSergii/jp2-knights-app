import type { RuntimeMode } from "@jp2/shared-types";
import type { PublicPrayerListResponseDto } from "@jp2/shared-validation";
import type { MobileScreenState } from "./navigation.js";
import {
  homeAction,
  isPublicScreenAction,
  publicScreenTheme,
  publicStateCopy,
  type PublicScreenAction,
  type PublicScreenSection,
  type PublicScreenTheme
} from "./public-screen-contracts.js";

export interface PublicPrayerCategoriesScreen {
  route: "PublicPrayerCategories";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface BuildPublicPrayerCategoriesScreenOptions {
  state: MobileScreenState;
  response?: PublicPrayerListResponseDto | undefined;
  runtimeMode: RuntimeMode;
}

export function buildPublicPrayerCategoriesScreen(
  options: BuildPublicPrayerCategoriesScreenOptions
): PublicPrayerCategoriesScreen {
  if (options.state !== "ready") {
    return stateOnlyPublicPrayerCategories(options.state, options.runtimeMode === "demo");
  }

  if (!options.response || options.response.prayers.length === 0) {
    return stateOnlyPublicPrayerCategories("empty", options.runtimeMode === "demo");
  }

  return {
    route: "PublicPrayerCategories",
    state: "ready",
    title: "Public Prayers",
    body: "Published prayers available before login.",
    sections: [
      ...options.response.categories.map((category) => ({
        id: `category-${category.id}`,
        title: category.title,
        body: publicPrayerCategoryBody(category.id, options.response?.prayers ?? [])
      })),
      ...options.response.prayers.map((prayer) => ({
        id: `prayer-${prayer.id}`,
        title: prayer.title,
        body: prayer.excerpt
      }))
    ],
    actions: [openFirstPrayerAction(options.response.prayers[0]?.id), homeAction].filter(
      isPublicScreenAction
    ),
    demoChromeVisible: options.runtimeMode === "demo",
    theme: publicScreenTheme
  };
}

function stateOnlyPublicPrayerCategories(
  state: MobileScreenState,
  demoChromeVisible: boolean
): PublicPrayerCategoriesScreen {
  const copy = publicStateCopy("prayerCategories", state);

  return {
    route: "PublicPrayerCategories",
    state,
    title: copy.title,
    body: copy.body,
    sections: [],
    actions: [],
    demoChromeVisible,
    theme: publicScreenTheme
  };
}

function publicPrayerCategoryBody(
  categoryId: string,
  prayers: PublicPrayerListResponseDto["prayers"]
) {
  const count = prayers.filter((prayer) => prayer.category?.id === categoryId).length;

  return count === 1 ? "1 public prayer" : `${count} public prayers`;
}

function openFirstPrayerAction(id: string | undefined): PublicScreenAction | undefined {
  return id
    ? {
        id: "open-first-prayer",
        label: "Open First Prayer",
        targetRoute: "PublicPrayerDetail",
        targetId: id
      }
    : undefined;
}
