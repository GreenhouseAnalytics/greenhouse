import { style } from "@vanilla-extract/css";

export const header = style({
  flex: 0,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  color: "#fff",
  /* background-color: #1b5646, */
  /* background-color: #194f50, */
  gap: "25px",
  padding: "12px 14px 12px 12px",
  // fontFamily: ${({ theme }) => theme.logoFont},

  "& .logo": {
    flex: 0,
    fontSize: "22px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "8px",
  },
});

export const nav = style({
  flex: 1,

  "& ul": {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    display: "flex",
    flexDirection: "row",
    gap: "14px",
    fontSize: "14px",
  },

  "& .account": {
    flex: 1,
    textAlign: "right",
  },
});
