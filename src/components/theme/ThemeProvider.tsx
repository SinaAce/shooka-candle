"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

export type Theme = "default" | "dark" | "red" | "blue";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEMES: Theme[] = ["default", "dark", "red", "blue"];

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("shooka-theme", theme);
}

function getSavedTheme(): Theme {
  if (typeof window === "undefined") return "default";
  const saved = localStorage.getItem("shooka-theme") as Theme | null;
  return saved && THEMES.includes(saved) ? saved : "default";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("default");

  useLayoutEffect(() => {
    const saved = getSavedTheme();
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
    setThemeState(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
