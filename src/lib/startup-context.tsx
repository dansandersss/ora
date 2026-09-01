import { createContext, useContext } from 'react';

const StartupContext = createContext(false);

export const StartupProvider = StartupContext.Provider;

export function useHasSplashCompleted() {
  return useContext(StartupContext);
}
