import { createContext, useContext } from 'react';

const StartupContext = createContext(false);
export type StartupRoute = 'authenticated' | 'onboarding' | 'login';
export type StartupRoutingState =
  | { status: 'loading' }
  | { status: 'ready'; route: StartupRoute }
  | { status: 'error' };
const StartupRoutingContext = createContext<{
  state: StartupRoutingState;
  retry: () => void;
} | null>(null);

export const StartupProvider = StartupContext.Provider;
export const StartupRoutingProvider = StartupRoutingContext.Provider;

export function useHasSplashCompleted() {
  return useContext(StartupContext);
}

export function useStartupRouting() {
  const routing = useContext(StartupRoutingContext);
  if (!routing) throw new Error('StartupRoutingProvider is missing');
  return routing;
}
