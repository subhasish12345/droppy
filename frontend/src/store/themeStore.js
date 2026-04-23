import { create } from "zustand";

const THEMES = {
  indigo: {
    "--color-primary": "#4f46e5",
    "--color-primary-hover": "#4338ca",
    "--color-primary-light": "#eef2ff",
    "--color-accent": "#818cf8",
  },
  violet: {
    "--color-primary": "#7c3aed",
    "--color-primary-hover": "#6d28d9",
    "--color-primary-light": "#f5f3ff",
    "--color-accent": "#a78bfa",
  },
  teal: {
    "--color-primary": "#0d9488",
    "--color-primary-hover": "#0f766e",
    "--color-primary-light": "#f0fdfa",
    "--color-accent": "#2dd4bf",
  },
  rose: {
    "--color-primary": "#e11d48",
    "--color-primary-hover": "#be123c",
    "--color-primary-light": "#fff1f2",
    "--color-accent": "#fb7185",
  },
};

const applyTheme = (themeName) => {
  const vars = THEMES[themeName];
  if (!vars) return;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));
};

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem("droppy-theme") || "indigo",
  themes: Object.keys(THEMES),

  init: () => {
    const saved = localStorage.getItem("droppy-theme") || "indigo";
    applyTheme(saved);
    set({ theme: saved });
  },

  setTheme: (name) => {
    applyTheme(name);
    localStorage.setItem("droppy-theme", name);
    set({ theme: name });
  },
}));
