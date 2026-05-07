import type { MobileLaunchState, MobileScreenState } from "./navigation.js";
import {
  homeAction,
  idleApprovalBody,
  idleApprovalDetailBody,
  idleApprovalTitle,
  publicScreenTheme,
  type PublicScreenAction,
  type PublicScreenSection,
  type PublicScreenTheme
} from "./public-screen-contracts.js";

export interface IdleApprovalScreen {
  route: "IdleApproval";
  state: MobileScreenState;
  title: string;
  body: string;
  sections: PublicScreenSection[];
  actions: PublicScreenAction[];
  demoChromeVisible: boolean;
  theme: PublicScreenTheme;
}

export interface BuildIdleApprovalScreenOptions {
  launchState: MobileLaunchState;
}

export function buildIdleApprovalScreen(options: BuildIdleApprovalScreenOptions): IdleApprovalScreen {
  const approval = options.launchState.idleApproval;
  const state = approval ? "idleApproval" : options.launchState.state;

  return {
    route: "IdleApproval",
    state,
    title: idleApprovalTitle(approval?.state),
    body: idleApprovalBody(options.launchState),
    sections: [
      {
        id: "approval-state",
        title: "Review status",
        body: approval ? idleApprovalDetailBody(approval) : "No approval review is active."
      }
    ],
    actions: [homeAction],
    demoChromeVisible: options.launchState.demoChromeVisible,
    theme: publicScreenTheme
  };
}
