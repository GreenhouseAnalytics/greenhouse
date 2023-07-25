import { style } from "@vanilla-extract/css";
import { theme } from "@/theme";

export const popover = style({
  borderRadius: 3,
  border: `1px solid ${theme.colors.border}`,
  padding: 12,
  background: theme.colors.surface,
  color: theme.colors.onSurface,
});

export const comboBox = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
});

export const input = style({
  borderRadius: 3,
  padding: "8px 12px",

  // backgroundColor: "#516469",
  color: theme.colors.onBackground,
  backgroundColor: theme.colors.background,
  // border: "1px solid #112726",
  border: `1px solid ${theme.colors.border}`,
});

export const searchResults = style({
  margin: "5px 0",
  maxHeight: 200,
  minWidth: 300,
  overflow: "auto",
  border: "none",
  background: "transparent",
  fontWeight: "normal",

  "& ul": {
    listStyleType: "none",
    margin: 0,
    padding: 0,
  },
});

export const resultOption = style({
  fontWeight: "normal",
  padding: "8px",

  "&[aria-selected=true]": {
    color: theme.colors.onSecondary,
    background: theme.colors.secondary,
  },
});
