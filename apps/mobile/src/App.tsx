import { resolveMobileLaunchState } from "./navigation.js";
import { buildPublicHomeScreen } from "./public-screens.js";
import { PublicHomeScreen } from "./screens/PublicHomeScreen.js";

export function App() {
  const launchState = resolveMobileLaunchState(null, {
    runtimeMode: process.env.APP_RUNTIME_MODE === "demo" ? "demo" : "api"
  });

  return <PublicHomeScreen screen={buildPublicHomeScreen(launchState)} />;
}
