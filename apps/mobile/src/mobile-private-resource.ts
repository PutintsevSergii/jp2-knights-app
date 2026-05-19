import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { RuntimeMode } from "@jp2/shared-types";
import type { MobileScreenState } from "./navigation.js";

export interface UsePrivateRouteResourceOptions<TData, TRoute extends string> {
  route: TRoute;
  activeRoute: TRoute;
  runtimeMode: RuntimeMode;
  authToken: string | undefined;
  initialApiState: MobileScreenState;
  demoData: TData;
  loadKey: string;
  canLoad?: boolean;
  load: () => Promise<TData>;
  failureState: (error: unknown) => MobileScreenState;
}

export interface PrivateRouteResource<TData> {
  state: MobileScreenState;
  data: TData | undefined;
  setState: (state: MobileScreenState) => void;
  setData: Dispatch<SetStateAction<TData | undefined>>;
}

export function usePrivateRouteResource<TData, TRoute extends string>({
  route,
  activeRoute,
  runtimeMode,
  authToken,
  initialApiState,
  demoData,
  loadKey,
  canLoad = true,
  load,
  failureState
}: UsePrivateRouteResourceOptions<TData, TRoute>): PrivateRouteResource<TData> {
  const loadRef = useRef(load);
  const failureStateRef = useRef(failureState);
  const [state, setState] = useState<MobileScreenState>(
    runtimeMode === "demo" ? "ready" : initialApiState
  );
  const [data, setData] = useState<TData | undefined>(() =>
    runtimeMode === "demo" ? demoData : undefined
  );

  useEffect(() => {
    loadRef.current = load;
    failureStateRef.current = failureState;
  }, [failureState, load]);

  useEffect(() => {
    if (runtimeMode === "demo" || route !== activeRoute || !canLoad) {
      return;
    }

    if (!authToken) {
      setState("forbidden");
      return;
    }

    let cancelled = false;
    setState("loading");

    loadRef
      .current()
      .then((response) => {
        if (!cancelled) {
          setData(response);
          setState("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setData(undefined);
          setState(failureStateRef.current(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeRoute, authToken, canLoad, loadKey, route, runtimeMode]);

  return { state, data, setState, setData };
}

export function requirePrivateAuthToken(authToken: string | undefined): string {
  if (!authToken) {
    throw new Error("Private mobile route loader requires an auth token.");
  }

  return authToken;
}
