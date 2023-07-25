import { theme } from "./index.css";
import { globalStyle } from "@vanilla-extract/css";

globalStyle(":root", {
  margin: 0,
  padding: 0,
  fontSize: "16px",
  fontFamily: theme.font,
  color: theme.colors.onBackground,
  backgroundColor: theme.colors.background,
  /* background-color: #11271e; */
  /* background-color: #202324; */
  /* color: var(--on-background); */
  boxSizing: "border-box",

  "& h1": {
    fontSize: "18px",
    margin: "8px 0",
  },
  "& h2": {
    fontSize: "16px",
    margin: "8px 0",
  },
  "& h4, & h5": {
    fontSize: "14px",
    margin: "8px 0",
  },
});
