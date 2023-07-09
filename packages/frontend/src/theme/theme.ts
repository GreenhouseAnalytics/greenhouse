import { Pacifico, Roboto } from "next/font/google";

export const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
});
export const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

export const theme = {
  font: roboto.style.fontFamily,
  logoFont: pacifico.style.fontFamily,

  primary: "var(--primary)",
  onPrimary: "var(--on-primary)",
  primaryContainer: "var(--primary-container)",
  onPrimaryContainer: "var(--on-primary-container)",
  secondary: "var(--secondary)",
  onSecondary: "var(--on-secondary)",
  secondaryContainer: "var(--secondary-container)",
  onSecondaryContainer: "var(--on-secondary-container)",
  tertiary: "var(--tertiary)",
  onTertiary: "var(--on-tertiary)",
  tertiaryContainer: "var(--tertiary-container)",
  onTertiaryContainer: "var(--on-tertiary-container)",
  error: "var(--error)",
  errorContainer: "var(--error-container)",
  onError: "var(--on-error)",
  onErrorContainer: "var(--on-error-container)",
  background: "var(--background)",
  onBackground: "var(--on-background)",
  surface: "var(--surface)",
  onSurface: "var(--on-surface)",
  surfaceVariant: "var(--surface-variant)",
  onSurfaceVariant: "var(--on-surface-variant)",
  outline: "var(--outline)",
  inverseOnSurface: "var(--inverse-on-surface)",
  inverseSurface: "var(--inverse-surface)",
  inversePrimary: "var(--inverse-primary)",
  shadow: "var(--shadow)",
  surfaceTint: "var(--surface-tint)",
  outlineVariant: "var(--outline-variant)",
};
