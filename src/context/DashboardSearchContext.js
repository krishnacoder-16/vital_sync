"use client";

import { createContext, useContext } from "react";

// Context value shape: { query: string, clearSearch: () => void }
export const DashboardSearchContext = createContext({ query: "", clearSearch: () => {} });

export function useDashboardSearch() {
  return useContext(DashboardSearchContext);
}
