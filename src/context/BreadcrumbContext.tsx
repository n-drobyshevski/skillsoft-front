"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface BreadcrumbContextProps {
  customBreadcrumbs: Record<string, string>;
  setBreadcrumbTitle: (segment: string, title: string) => void;
  clearBreadcrumb: (segment: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextProps | undefined>(undefined);

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState<Record<string, string>>({});

  const setBreadcrumbTitle = useCallback((segment: string, title: string) => {
    setCustomBreadcrumbs(prev => ({ ...prev, [segment]: title }));
  }, []);

  const clearBreadcrumb = useCallback((segment: string) => {
    setCustomBreadcrumbs(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [segment]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return (
    <BreadcrumbContext.Provider
      value={{
        customBreadcrumbs,
        setBreadcrumbTitle,
        clearBreadcrumb,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbContext = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumbContext must be used within a BreadcrumbProvider");
  }
  return context;
};