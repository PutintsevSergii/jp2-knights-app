import type { RuntimeMode } from "@jp2/shared-types";
import { fallbackPublicCandidateRequestResponse } from "./public-candidate-request.js";
import type { MobileLaunchState } from "./navigation.js";
import { useMobilePublicContentController } from "./mobile-public-content-controller.js";
import { useMobilePublicFormController } from "./mobile-public-form-controller.js";
import {
  buildAboutOrderScreen,
  buildIdleApprovalScreen,
  buildJoinRequestConfirmationScreen,
  buildJoinRequestFormScreen,
  buildPublicEventDetailScreen,
  buildPublicEventsListScreen,
  buildPublicHomeScreen,
  buildPublicPrayerDetailScreen,
  buildPublicPrayerCategoriesScreen,
  buildSignInScreen
} from "./public-screens.js";
import type { PublicRoute } from "./public-screens.js";
import { AboutOrderScreen } from "./screens/AboutOrderScreen.js";
import { IdleApprovalScreen } from "./screens/IdleApprovalScreen.js";
import { JoinRequestConfirmationScreen } from "./screens/JoinRequestConfirmationScreen.js";
import { JoinRequestFormScreen } from "./screens/JoinRequestFormScreen.js";
import { PublicContentDetailScreen } from "./screens/PublicContentDetailScreen.js";
import { PublicContentListScreen } from "./screens/PublicContentListScreen.js";
import { PublicHomeScreen } from "./screens/PublicHomeScreen.js";
import { SignInScreen } from "./screens/SignInScreen.js";

export interface MobilePublicSurfaceProps {
  route: PublicRoute;
  runtimeMode: RuntimeMode;
  publicApiBaseUrl: string;
  launchState: MobileLaunchState;
  onRouteChange: (route: PublicRoute) => void;
}

export function MobilePublicSurface({
  route,
  runtimeMode,
  publicApiBaseUrl,
  launchState,
  onRouteChange
}: MobilePublicSurfaceProps) {
  const publicContent = useMobilePublicContentController({
    route,
    runtimeMode,
    publicApiBaseUrl,
    onRouteChange
  });
  const publicForms = useMobilePublicFormController({
    runtimeMode,
    publicApiBaseUrl,
    onRouteChange
  });

  if (route === "AboutOrder") {
    return (
      <AboutOrderScreen
        screen={buildAboutOrderScreen({
          state: publicContent.aboutOrderState,
          page: publicContent.aboutOrderPage,
          runtimeMode
        })}
        onNavigate={publicContent.handlePublicRoute}
      />
    );
  }

  if (route === "PublicPrayerCategories") {
    return (
      <PublicContentListScreen
        screen={buildPublicPrayerCategoriesScreen({
          state: publicContent.publicPrayersState,
          response: publicContent.publicPrayers,
          runtimeMode
        })}
        onNavigate={publicContent.handlePublicRoute}
      />
    );
  }

  if (route === "PublicEventsList") {
    return (
      <PublicContentListScreen
        screen={buildPublicEventsListScreen({
          state: publicContent.publicEventsState,
          response: publicContent.publicEvents,
          runtimeMode
        })}
        onNavigate={publicContent.handlePublicRoute}
      />
    );
  }

  if (route === "PublicPrayerDetail") {
    return (
      <PublicContentDetailScreen
        screen={buildPublicPrayerDetailScreen({
          state: publicContent.publicPrayerDetailState,
          response: publicContent.publicPrayerDetail,
          runtimeMode
        })}
        onNavigate={publicContent.handlePublicRoute}
      />
    );
  }

  if (route === "PublicEventDetail") {
    return (
      <PublicContentDetailScreen
        screen={buildPublicEventDetailScreen({
          state: publicContent.publicEventDetailState,
          response: publicContent.publicEventDetail,
          runtimeMode
        })}
        onNavigate={publicContent.handlePublicRoute}
      />
    );
  }

  if (route === "JoinRequestForm") {
    return (
      <JoinRequestFormScreen
        screen={buildJoinRequestFormScreen({
          state: publicForms.joinRequestState,
          runtimeMode,
          errorMessage: publicForms.joinRequestErrorMessage
        })}
        draft={publicForms.joinRequestDraft}
        consentAccepted={publicForms.joinRequestConsentAccepted}
        onChangeField={publicForms.handleJoinRequestFieldChange}
        onConsentAcceptedChange={publicForms.handleJoinRequestConsentAcceptedChange}
        onSubmit={() => {
          void publicForms.handleJoinRequestSubmit();
        }}
        onNavigate={publicContent.handlePublicRoute}
      />
    );
  }

  if (route === "Login") {
    return (
      <SignInScreen
        screen={buildSignInScreen({
          state: "ready",
          runtimeMode,
          errorMessage: publicForms.signInErrorMessage
        })}
        values={publicForms.signInValues}
        onChangeField={publicForms.handleSignInFieldChange}
        onSubmit={publicForms.handleSignInSubmit}
        onNavigate={publicContent.handlePublicRoute}
      />
    );
  }

  if (route === "IdleApproval") {
    return (
      <IdleApprovalScreen
        screen={buildIdleApprovalScreen({ launchState })}
        onNavigate={publicContent.handlePublicRoute}
      />
    );
  }

  if (route === "JoinRequestConfirmation") {
    return (
      <JoinRequestConfirmationScreen
        screen={buildJoinRequestConfirmationScreen({
          state: "ready",
          response:
            runtimeMode === "demo" && !publicForms.joinRequestResponse
              ? fallbackPublicCandidateRequestResponse
              : publicForms.joinRequestResponse,
          runtimeMode
        })}
        onNavigate={publicContent.handlePublicRoute}
      />
    );
  }

  return (
    <PublicHomeScreen
      screen={buildPublicHomeScreen(launchState)}
      onNavigate={publicContent.handlePublicRoute}
    />
  );
}
