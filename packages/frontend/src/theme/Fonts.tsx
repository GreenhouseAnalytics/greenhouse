import React from "react";
import { Pacifico, Roboto, Montserrat } from "next/font/google";

export const pacificoVar = "--font-pacifico";
export const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
});

export const robotoVar = "--font-roboto";
export const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const montserratVar = "--font-montserrat";
export const montserrat = Montserrat({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});
