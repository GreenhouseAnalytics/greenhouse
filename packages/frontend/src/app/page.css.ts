import { style } from "@vanilla-extract/css";
import { theme } from "@/theme";

export const body = style({
  display: "flex",
  flex: 1,
  flexDirection: "row",
});

export const toolbox = style({
  width: "300px",
  margin: "15px",
  background: theme.colors.surface,
  color: theme.colors.onSurface,
  borderRadius: "8px",
  padding: 12,
});

export const result = style({
  flex: 1,
});

export const iconHeader = style({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",

  "& h1": {
    margin: 0,
  },
});
