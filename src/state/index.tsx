import React, { createContext, useContext, useState } from 'react';

export interface StateContextType {
  error: Error | null;
  setError(error: Error | null): void;
}

export const StateContext = createContext<StateContextType | null>(null);

/*
  TODO: convert this to a simple Zustand global store for errors.

  This is a context provider just for showing a global error as a full-page screen.
*/
export default function AppStateProvider(props: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);

  const contextValue = {
    error,
    setError,
  };

  return <StateContext.Provider value={contextValue}>{props.children}</StateContext.Provider>;
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within the AppStateProvider');
  }
  return context;
}
