import type { RuntimeMode } from "@jp2/shared-types";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { MobileProviderSession, MobileProviderSignIn } from "./mobile-provider-sign-in.js";
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
  buildPublicSilentPrayerScreen,
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
import { PublicSilentPrayerScreen } from "./screens/PublicSilentPrayerScreen.js";
import { SignInScreen } from "./screens/SignInScreen.js";
import { PublicBottomNav } from "./screens/shared/PublicBottomNav.js";

export interface MobilePublicSurfaceProps {
  route: PublicRoute;
  runtimeMode: RuntimeMode;
  publicApiBaseUrl: string;
  launchState: MobileLaunchState;
  onRouteChange: (route: PublicRoute) => void;
  signInProvider?: MobileProviderSignIn;
  onProviderSession?: (session: MobileProviderSession) => void;
}

export function MobilePublicSurface({
  route,
  runtimeMode,
  publicApiBaseUrl,
  launchState,
  onRouteChange,
  signInProvider,
  onProviderSession
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
    onRouteChange,
    ...(signInProvider ? { signInProvider } : {}),
    ...(onProviderSession ? { onProviderSession } : {})
  });

  if (route === "AboutOrder") {
    return renderPublicShell(
      <AboutOrderScreen
        screen={buildAboutOrderScreen({
          state: publicContent.aboutOrderState,
          page: publicContent.aboutOrderPage,
          runtimeMode
        })}
        onNavigate={publicContent.handlePublicRoute}
      />,
      route,
      onRouteChange
    );
  }

  if (route === "PublicPrayerCategories") {
    return renderPublicShell(
      <PublicContentListScreen
        screen={buildPublicPrayerCategoriesScreen({
          state: publicContent.publicPrayersState,
          response: publicContent.publicPrayers,
          runtimeMode
        })}
        onNavigate={publicContent.handlePublicRoute}
      />,
      route,
      onRouteChange
    );
  }

  if (route === "PublicEventsList") {
    return renderPublicShell(
      <PublicContentListScreen
        screen={buildPublicEventsListScreen({
          state: publicContent.publicEventsState,
          response: publicContent.publicEvents,
          runtimeMode
        })}
        onNavigate={publicContent.handlePublicRoute}
      />,
      route,
      onRouteChange
    );
  }

  if (route === "PublicSilentPrayer") {
    return renderPublicShell(
      <PublicSilentPrayerScreen
        screen={buildPublicSilentPrayerScreen({
          state: publicContent.publicSilentPrayerState,
          response: publicContent.publicSilentPrayerSessions,
          joined: publicContent.publicSilentPrayerJoin,
          runtimeMode
        })}
        onAction={(action) => {
          void publicContent.handlePublicAction(action);
        }}
      />,
      route,
      onRouteChange
    );
  }

  if (route === "PublicPrayerDetail") {
    return renderPublicShell(
      <PublicContentDetailScreen
        screen={buildPublicPrayerDetailScreen({
          state: publicContent.publicPrayerDetailState,
          response: publicContent.publicPrayerDetail,
          runtimeMode
        })}
        onNavigate={publicContent.handlePublicRoute}
      />,
      route,
      onRouteChange
    );
  }

  if (route === "PublicEventDetail") {
    return renderPublicShell(
      <PublicContentDetailScreen
        screen={buildPublicEventDetailScreen({
          state: publicContent.publicEventDetailState,
          response: publicContent.publicEventDetail,
          runtimeMode
        })}
        onNavigate={publicContent.handlePublicRoute}
      />,
      route,
      onRouteChange
    );
  }

  if (route === "JoinRequestForm") {
    return renderPublicShell(
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
      />,
      route,
      onRouteChange
    );
  }

  if (route === "Login") {
    return renderPublicShell(
      <SignInScreen
        screen={buildSignInScreen({
          state: publicForms.signInState,
          runtimeMode,
          errorMessage: publicForms.signInErrorMessage
        })}
        onSubmit={() => {
          void publicForms.handleSignInSubmit();
        }}
        onNavigate={publicContent.handlePublicRoute}
      />,
      route,
      onRouteChange
    );
  }

  if (route === "IdleApproval") {
    return renderPublicShell(
      <IdleApprovalScreen
        screen={buildIdleApprovalScreen({ launchState })}
        onNavigate={publicContent.handlePublicRoute}
      />,
      route,
      onRouteChange
    );
  }

  if (route === "JoinRequestConfirmation") {
    return renderPublicShell(
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
      />,
      route,
      onRouteChange
    );
  }

  return renderPublicShell(
    <PublicHomeScreen
      screen={buildPublicHomeScreen(launchState)}
      onNavigate={publicContent.handlePublicRoute}
    />,
    route,
    onRouteChange
  );
}

function renderPublicShell(
  screen: ReactNode,
  route: PublicRoute,
  onRouteChange: (route: PublicRoute) => void
) {
  return (
    <View style={styles.publicShell}>
      <View style={styles.publicScreenSlot}>{screen}</View>
      <PublicBottomNav activeRoute={route} onNavigate={onRouteChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  publicShell: {
    flex: 1
  },
  publicScreenSlot: {
    flex: 1,
    paddingBottom: 74
  }
});
