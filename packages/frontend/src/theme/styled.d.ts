import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    font: string;
    logoFont: string;

    background: string;
    onBackground: string;
    surface: string;
    onSurface: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
    outline: string;
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondary: string;
    onSecondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    tertiary: string;
    onTertiary: string;
    tertiaryContainer: string;
    error: string;
    onError: string;
    errorContainer: string;
    onErrorContainer: string;
    inverseOnSurface: string;
    inverseSurface: string;
    inversePrimary: string;
    shadow: string;
    surfaceTint: string;
    outlineVariant: string;
  }
}
