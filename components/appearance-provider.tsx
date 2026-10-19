"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  getAppearanceStyle,
  parseAppearance,
  type Appearance,
} from "@/lib/appearance";

type AppearanceContextValue = {
  appearance: Appearance;
  applyAppearance: (appearance: Appearance) => void;
};

const AppearanceContext = createContext<AppearanceContextValue>({
  appearance: DEFAULT_APPEARANCE,
  applyAppearance: () => undefined,
});

export function AppearanceProvider({
  initialAppearance,
  persistLocally = false,
  children,
}: {
  initialAppearance: Appearance;
  persistLocally?: boolean;
  children: ReactNode;
}) {
  const [appearance, setAppearance] =
    useState<Appearance>(initialAppearance);

  const applyAppearance = useCallback(
    (next: Appearance) => {
      const root = document.documentElement;
      const style = getAppearanceStyle(next);

      root.dataset.theme = next.theme;

      for (const [name, value] of Object.entries(style)) {
        root.style.setProperty(name, String(value));
      }

      if (persistLocally) {
        window.localStorage.setItem(
          APPEARANCE_STORAGE_KEY,
          JSON.stringify(next),
        );
      }

      setAppearance(next);
    },
    [persistLocally],
  );

  useEffect(() => {
    if (persistLocally) {
      const saved = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);

      if (saved) {
        applyAppearance(parseAppearance(saved));
        return;
      }
    }

    applyAppearance(initialAppearance);
  }, [applyAppearance, initialAppearance, persistLocally]);

  const value = useMemo(
    () => ({ appearance, applyAppearance }),
    [appearance, applyAppearance],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
