"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ISiteSettings, IUseCase } from "@/lib/models";

type SiteContextValue = {
  settings: ISiteSettings;
  useCases: IUseCase[];
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({
  settings,
  useCases,
  children,
}: {
  settings: ISiteSettings;
  useCases: IUseCase[];
  children: ReactNode;
}) {
  return (
    <SiteContext.Provider value={{ settings, useCases }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx.settings;
}

export function useUseCases() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useUseCases must be used within SiteProvider");
  return ctx.useCases;
}
