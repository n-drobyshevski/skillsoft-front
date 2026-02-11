"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

interface StudioHeaderState {
  title: string;
  description?: string;
  actions?: ReactNode;
}

interface StudioHeaderContextProps extends StudioHeaderState {
  setHeader: (state: StudioHeaderState) => void;
  resetHeader: () => void;
}

const defaultState: StudioHeaderState = {
  title: "",
  description: undefined,
  actions: undefined,
};

const StudioHeaderContext = createContext<StudioHeaderContextProps | undefined>(
  undefined
);

export function StudioHeaderProvider({ children }: { children: ReactNode }) {
  const [headerState, setHeaderState] = useState<StudioHeaderState>(defaultState);

  const setHeader = useCallback((state: StudioHeaderState) => {
    setHeaderState(state);
  }, []);

  const resetHeader = useCallback(() => {
    setHeaderState(defaultState);
  }, []);

  return (
    <StudioHeaderContext.Provider
      value={{
        ...headerState,
        setHeader,
        resetHeader,
      }}
    >
      {children}
    </StudioHeaderContext.Provider>
  );
}

/**
 * Hook to access and update the studio header
 * Use this in client components to dynamically set the page header
 */
export function useStudioHeader() {
  const context = useContext(StudioHeaderContext);
  if (!context) {
    throw new Error(
      "useStudioHeader must be used within a StudioHeaderProvider"
    );
  }
  return context;
}

/**
 * Component to set the studio header declaratively
 * Use this in pages to set the header content
 * Works with both client and server components (when wrapped properly)
 */
interface SetStudioHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function SetStudioHeader({
  title,
  description,
  actions,
}: SetStudioHeaderProps) {
  const { setHeader, resetHeader } = useStudioHeader();

  useEffect(() => {
    setHeader({ title, description, actions });
    return () => {
      resetHeader();
    };
  }, [title, description, actions, setHeader, resetHeader]);

  return null;
}
