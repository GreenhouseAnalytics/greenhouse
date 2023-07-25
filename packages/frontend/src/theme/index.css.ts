import { createGlobalTheme, globalStyle } from "@vanilla-extract/css";

export const theme = createGlobalTheme(":root", {
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',

  // Light mode colors
  colors: {
    background: "#fff",
    onBackground: "#333",
    surface: "#dedede",
    onSurface: "#333",
    border: "#333",
    primary: "#6ff7f2",
    onPrimary: "#00201f",
    secondary: "#cce8e6",
    onSecondary: "#051f1e",
  },
});

// Dark mode
globalStyle(":root", {
  "@media": {
    "(prefers-color-scheme: dark)": {
      vars: {
        [theme.colors.background]: "#112726",
        [theme.colors.onBackground]: "#d7d7d7",
        [theme.colors.surface]: "#243737",
        [theme.colors.onSurface]: "#d7d7d7",
        [theme.colors.border]: "#727272",
        [theme.colors.primary]: "#00504e",
        [theme.colors.onPrimary]: "#6ff7f2",
        [theme.colors.secondary]: "#324b4a",
        [theme.colors.onSecondary]: "#d7d7d7",
      },
    },
  },
});
